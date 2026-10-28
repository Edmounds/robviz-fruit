#include "robviz_video_gateway/support.hpp"
#include <arpa/inet.h>
#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <fstream>
#include <regex>
#include <set>
#include <stdexcept>
#include <sstream>
#include <yaml-cpp/eventhandler.h>
#include <type_traits>

namespace robviz_video_gateway {
namespace {
bool loopback(const std::string & text, bool private_allowed) {
  std::string ip = text;
  if (ip.size() > 2 && ip.front() == '[' && ip.back() == ']') ip = ip.substr(1, ip.size() - 2);
  ip = ip.substr(0, ip.find('%'));
  in_addr v4{};
  in6_addr v6{};
  if (inet_pton(AF_INET6, ip.c_str(), &v6) == 1) {
    if (IN6_IS_ADDR_V4MAPPED(&v6)) std::copy(v6.s6_addr + 12, v6.s6_addr + 16, reinterpret_cast<unsigned char *>(&v4));
    else return IN6_IS_ADDR_LOOPBACK(&v6) || (private_allowed && ((v6.s6_addr[0] & 0xfe) == 0xfc || IN6_IS_ADDR_LINKLOCAL(&v6)));
  } else if (inet_pton(AF_INET, ip.c_str(), &v4) != 1) return false;
  const auto n = ntohl(v4.s_addr);
  return (n >> 24) == 127 || (private_allowed && ((n >> 24) == 10 || (n >> 20) == 0xac1 || (n >> 16) == 0xc0a8 || (n >> 16) == 0xa9fe));
}
template<typename T> T env_value(const YAML::Node & section, const char * key, const char * prefix, T fallback) {
  std::string name = std::string(prefix) + key;
  std::transform(name.begin(), name.end(), name.begin(), ::toupper);
  if (auto text = std::getenv(name.c_str())) {
    if constexpr (std::is_same_v<T, bool>) {
      const std::string value = text;
      if (value != "0" && value != "1" && value != "true" && value != "false") throw std::runtime_error("Invalid " + name);
      return value == "1" || value == "true";
    } else return YAML::Load(text).as<T>();
  }
  return section[key] ? section[key].as<T>() : fallback;
}
std::string read_file(const fs::path & path, size_t limit) {
  if (!fs::is_regular_file(path) || fs::is_symlink(path) || fs::file_size(path) > limit) throw std::runtime_error("Expected a bounded regular configuration file: " + path.string());
  std::ifstream input(path);
  if (!input) throw std::runtime_error("Cannot read " + path.string());
  return std::string(std::istreambuf_iterator<char>(input), {});
}
struct NoAliases : YAML::EventHandler {
  void OnDocumentStart(const YAML::Mark &) override {}
  void OnDocumentEnd() override {}
  void OnNull(const YAML::Mark &, YAML::anchor_t) override {}
  void OnAlias(const YAML::Mark &, YAML::anchor_t) override { throw std::runtime_error("Settings aliases are not allowed"); }
  void OnScalar(const YAML::Mark &, const std::string &, YAML::anchor_t, const std::string &) override {}
  void OnSequenceStart(const YAML::Mark &, const std::string &, YAML::anchor_t, YAML::EmitterStyle::value) override {}
  void OnSequenceEnd() override {}
  void OnMapStart(const YAML::Mark &, const std::string &, YAML::anchor_t, YAML::EmitterStyle::value) override {}
  void OnMapEnd() override {}
};
void check_yaml(const YAML::Node & node, int depth = 0) {
  if (depth > 20) throw std::runtime_error("Settings nesting exceeds limit");
  if (node.IsMap()) {
    std::set<std::string> keys;
    for (const auto & item : node) {
      if (!item.first.IsScalar() || !keys.insert(item.first.as<std::string>()).second) throw std::runtime_error("Duplicate or invalid settings key");
      check_yaml(item.second, depth + 1);
    }
  } else if (node.IsSequence()) for (const auto & item : node) check_yaml(item, depth + 1);
}
bool contains(const std::vector<std::string> & values, const std::string & item) {
  return std::find(values.begin(), values.end(), item) != values.end();
}
}  // namespace

Settings load_settings(const fs::path & file) {
  Settings s;
  if (file.empty()) return s;  // ROS-only installations may configure everything through parameters.
  const auto text = read_file(file, 65536);
  std::istringstream input(text); YAML::Parser parser(input); NoAliases events;
  parser.HandleNextDocument(events);
  if (parser.HandleNextDocument(events)) throw std::runtime_error("Expected one settings document");
  YAML::Node root = YAML::Load(text);
  check_yaml(root);
  if (root["version"].as<int>() != 1) throw std::runtime_error("Invalid settings version");
  auto video = root["services"]["video"];
  s.host = env_value<std::string>(video, "host", "ROBVIZ_SERVICES_VIDEO_", s.host);
  s.port = env_value<int>(video, "port", "ROBVIZ_SERVICES_VIDEO_", s.port);
  s.encoder = env_value<std::string>(video, "encoder", "ROBVIZ_SERVICES_VIDEO_", video["prefer_hardware"] && !video["prefer_hardware"].as<bool>() ? "x264" : "auto");
  s.fps = env_value<double>(video, "default_target_fps", "ROBVIZ_SERVICES_VIDEO_", s.fps);
  s.min_bitrate = env_value<int>(video, "min_bitrate_kbps", "ROBVIZ_SERVICES_VIDEO_", s.min_bitrate);
  s.start_bitrate = env_value<int>(video, "start_bitrate_kbps", "ROBVIZ_SERVICES_VIDEO_", s.start_bitrate);
  s.max_bitrate = env_value<int>(video, "max_bitrate_kbps", "ROBVIZ_SERVICES_VIDEO_", s.max_bitrate);
  s.allow_capture = env_value<bool>(video, "allow_lan_capture", "ROBVIZ_SERVICES_VIDEO_", true);
  s.capture_topic = env_value<std::string>(video, "capture_topic", "ROBVIZ_SERVICES_VIDEO_", "");
  auto base = fs::absolute(file).parent_path();
  s.capture_output_dir = fs::absolute(base / env_value<std::string>(video, "capture_output_dir", "ROBVIZ_SERVICES_VIDEO_", "data/captures")).lexically_normal();
  s.settings_file = fs::absolute(base / env_value<std::string>(root["services"]["files"], "data_dir", "ROBVIZ_SERVICES_FILES_", "data/waypoints") / "image-settings.json").lexically_normal();
  s.allow_lan = env_value<bool>(root["network"], "allow_lan", "ROBVIZ_NETWORK_", true);
  if (auto v = std::getenv("ROBVIZ_ALLOW_LAN")) {
    const std::string value = v;
    if (value != "0" && value != "1" && value != "true" && value != "false") throw std::runtime_error("Invalid ROBVIZ_ALLOW_LAN");
    s.allow_lan = value == "1" || value == "true";
  }
  for (const auto * name : {"allowed_hosts", "allowed_origins"}) {
    auto values = root["network"][name].as<std::vector<std::string>>();
    std::string env = std::string("ROBVIZ_NETWORK_") + name;
    std::transform(env.begin(), env.end(), env.begin(), ::toupper);
    if (auto v = std::getenv(env.c_str())) values = Json::parse(v).get<std::vector<std::string>>();
    if (values.size() > 64) throw std::runtime_error("Too many network allowlist entries");
    for (const auto & v : values) if (v.empty() || v.find('*') != std::string::npos) throw std::runtime_error("Invalid network allowlist");
    (std::string(name) == "allowed_hosts" ? s.hosts : s.origins) = values;
  }
  s.page_ports = {env_value<int>(root["web"], "port", "ROBVIZ_WEB_", 5173), env_value<int>(root["web"], "preview_port", "ROBVIZ_WEB_", 4173)};
  if (auto v = std::getenv("ROBVIZ_PORT")) s.page_ports[0] = std::stoi(v);
  return s;
}

bool allowed_request(const std::string & peer, const std::string & host, const std::string & origin, const Settings & s, bool write) {
  if (!loopback(peer, s.allow_lan && (!write || s.allow_capture))) return false;
  if (host.empty() || host.find_first_of("/@?#\\ \t\r\n") != std::string::npos) return false;
  SoupURI * target = soup_uri_new(("http://" + host).c_str());
  if (!target) return false;
  const std::string hostname = target->host ? target->host : "";
  const bool host_ok = !target->user && !target->password && (hostname == "localhost" || loopback(hostname, true) ||
    (hostname.size() > 6 && hostname.compare(hostname.size() - 6, 6, ".local") == 0) || contains(s.hosts, host) || contains(s.hosts, hostname));
  soup_uri_free(target);
  if (!host_ok) return false;
  if (origin.empty()) return !write;
  SoupURI * parsed = soup_uri_new(origin.c_str());
  if (!parsed) return false;
  char * canonical = soup_uri_to_string(parsed, false);
  std::string exact = canonical ? canonical : "";
  g_free(canonical);
  // Soup canonicalizes an empty HTTP path to '/'. Origins must have no path, query or credentials.
  if (!exact.empty() && exact.back() == '/') exact.pop_back();
  bool ok = (std::string(parsed->scheme) == "http" || std::string(parsed->scheme) == "https") && !parsed->user && !parsed->password &&
    !parsed->query && !parsed->fragment && exact == origin && (std::string(parsed->path ? parsed->path : "") == "/" || !parsed->path || !*parsed->path);
  const auto authority = origin.substr(origin.find("://") + 3);
  ok = ok && (authority == host || contains(s.origins, origin) || (parsed->host && hostname == parsed->host && std::find(s.page_ports.begin(), s.page_ports.end(), int(parsed->port)) != s.page_ports.end()));
  soup_uri_free(parsed);
  return ok;
}

bool valid_topic(const std::string & topic) {
  static const std::regex pattern("/(?:[A-Za-z_][A-Za-z0-9_]*)(?:/[A-Za-z_][A-Za-z0-9_]*)*");
  return topic.size() <= 255 && std::regex_match(topic, pattern);
}

std::string encoder_chain(const std::string & factory, int bitrate) {
  std::string result = factory + " name=enc bitrate=" + std::to_string(bitrate);
  if (factory == "vaapih264enc") result += " keyframe-period=30 rate-control=cbr";
  else if (factory == "vah264enc") result += " key-int-max=30";
  else result += " tune=zerolatency speed-preset=ultrafast key-int-max=30 bframes=0";
  return result + " ! video/x-h264,profile=constrained-baseline ! h264parse config-interval=1";
}

EncoderSelection select_encoder(const std::string & preference) {
  if (preference != "auto" && preference != "intel" && preference != "x264") throw std::runtime_error("encoder must be auto, intel or x264; NVIDIA is not implemented in this release");
  EncoderSelection selected;
  const auto candidates = preference == "x264" ? std::vector<std::string>{"x264enc"} : std::vector<std::string>{"vah264enc", "vaapih264enc", "x264enc"};
  for (const auto & factory : candidates) {
    GstElementFactory * found = gst_element_factory_find(factory.c_str());
    std::string error;
    if (!found) error = "plugin not installed";
    else {
      gst_object_unref(found);
      GError * parse_error = nullptr;
      auto pipeline = gst_parse_launch(("videotestsrc num-buffers=3 ! video/x-raw,format=NV12,width=1280,height=720,framerate=30/1 ! " + encoder_chain(factory, 1000) + " ! fakesink sync=false").c_str(), &parse_error);
      if (parse_error) { error = parse_error->message; g_error_free(parse_error); }
      if (pipeline && error.empty()) {
        gst_element_set_state(pipeline, GST_STATE_PLAYING);
        auto bus = gst_element_get_bus(pipeline);
        auto message = gst_bus_timed_pop_filtered(bus, 3 * GST_SECOND, GstMessageType(GST_MESSAGE_EOS | GST_MESSAGE_ERROR));
        if (!message) error = "encoding probe timed out";
        else if (GST_MESSAGE_TYPE(message) == GST_MESSAGE_ERROR) {
          GError * e = nullptr; gchar * debug = nullptr;
          gst_message_parse_error(message, &e, &debug); error = e->message;
          if (debug) error += std::string(" (") + debug + ")";
          g_clear_error(&e); g_free(debug);
        }
        if (message) gst_message_unref(message);
        gst_object_unref(bus);
      }
      if (pipeline) { gst_element_set_state(pipeline, GST_STATE_NULL); gst_object_unref(pipeline); }
    }
    selected.probes.push_back({{"factory", factory}, {"available", error.empty()}, {"error", error}});
    if (error.empty()) { selected.factory = factory; if (factory != "x264enc") selected.reason.clear(); return selected; }
    if (!selected.reason.empty()) selected.reason += "; ";
    selected.reason += factory + ": " + error;
  }
  throw std::runtime_error("No usable H.264 encoder: " + selected.reason);
}

void validate_image_settings(const Json & value) {
  if (!value.is_object() || !value.contains("version") || !value["version"].is_number_integer() || value["version"] < 1 || value["version"] >= 2147483648LL) throw std::runtime_error("Invalid image settings version");
  if (!value.contains("session") || !value["session"].is_string() || !std::regex_match(value["session"].get<std::string>(), std::regex("[a-f0-9]{32}"))) throw std::runtime_error("Invalid image settings session");
  for (const auto * stream : {"rgb", "depth"}) {
    const auto & item = value.at(stream);
    if (item.at("transport") != "webrtc") throw std::runtime_error("Image settings require WebRTC");
    for (const auto * field : {"bandwidth_mbps", "target_bitrate_mbps", "max_fps", "quality", "min_quality"}) {
      const auto & v = item.at(field);
      if (!v.is_number() || !std::isfinite(v.get<double>())) throw std::runtime_error("Invalid image setting number");
    }
    const double bw = item.at("bandwidth_mbps"), bitrate = item.at("target_bitrate_mbps"), fps = item.at("max_fps");
    if (bw < .01 || bw > 1000 || bitrate < .01 || bitrate > bw || fps < 1 || fps > 60 || !item.at("auto_quality").is_boolean() ||
      !item.at("quality").is_number_integer() || !item.at("min_quality").is_number_integer() || item.at("min_quality") < 30 || item.at("quality") > 95 || item.at("quality") < item.at("min_quality")) throw std::runtime_error("Image settings outside supported range");
  }
}
Json load_image_settings(const fs::path & path) {
  auto value = Json::parse(read_file(path, 4 * 1024 * 1024));
  validate_image_settings(value);
  return value;
}
bool safe_directory(const fs::path & path) {
  auto absolute = fs::absolute(path);
  for (auto p = absolute; !p.empty(); p = p.parent_path()) {
    if (fs::is_symlink(p)) return false;
    if (p == p.root_path()) break;
  }
  return true;
}
}  // namespace robviz_video_gateway
