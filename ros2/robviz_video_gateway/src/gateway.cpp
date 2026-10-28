#include "robviz_video_gateway/gateway.hpp"
#include "robviz_video_gateway/support.hpp"
#include <gst/app/gstappsrc.h>
#include <gst/video/video.h>
#include <gst/webrtc/webrtc.h>
#include <gst/sdp/sdp.h>
#include <opencv2/core.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/imgcodecs.hpp>
#include <rclcpp_components/register_node_macro.hpp>
#include <sensor_msgs/msg/image.hpp>
#include <std_srvs/srv/trigger.hpp>
#include <fcntl.h>
#include <unistd.h>
#include <atomic>
#include <chrono>
#include <future>
#include <map>
#include <mutex>
#include <set>
#include <thread>

namespace robviz_video_gateway {
using Image = sensor_msgs::msg::Image;
using Clock = std::chrono::steady_clock;
using Trigger = std_srvs::srv::Trigger;
namespace {
struct FrameSlot {
  std::mutex mutex;
  Image::ConstSharedPtr frame;
  Clock::time_point received{};
};
struct RawImage {
  cv::Mat pixels;
  std::string format;
};
RawImage validate_image(const Image & image) {
  if (!image.width || !image.height || image.width > 8192 || image.height > 8192 || image.data.size() > 64 * 1024 * 1024 || uint64_t(image.step) * image.height > 64 * 1024 * 1024 || image.data.size() < uint64_t(image.step) * image.height) throw std::runtime_error("Invalid image dimensions or step/data length");
  int channels = 0, type = CV_8U;
  std::string format;
  if (image.encoding == "rgb8") { channels = 3; format = "RGB"; }
  else if (image.encoding == "bgr8") { channels = 3; format = "BGR"; }
  else if (image.encoding == "rgba8") { channels = 4; format = "RGBA"; }
  else if (image.encoding == "bgra8") { channels = 4; format = "BGRA"; }
  else if (image.encoding == "16UC1") { channels = 1; type = CV_16U; format = "DEPTH"; }
  else throw std::runtime_error("Unsupported source encoding: " + image.encoding);
  if (image.step < image.width * channels * (type == CV_16U ? 2 : 1)) throw std::runtime_error("Invalid image row stride");
  return {cv::Mat(image.height, image.width, CV_MAKETYPE(type, channels), const_cast<uint8_t *>(image.data.data()), image.step), format};
}
cv::Mat depth_preview(const Image & image, const cv::Mat & pixels) {
  cv::Mat depth;
  if (image.is_bigendian) {
    depth = pixels.clone();
    for (int y = 0; y < depth.rows; ++y) for (int x = 0; x < depth.cols; ++x) {
      auto & n = depth.at<uint16_t>(y, x); n = (n << 8) | (n >> 8);
    }
  } else depth = pixels;
  cv::Mat valid = depth > 0, normalized = cv::Mat::zeros(depth.size(), CV_8U), bgr;
  if (cv::countNonZero(valid)) {
    double low = 0, high = 0; cv::minMaxLoc(depth, &low, &high, nullptr, nullptr, valid);
    if (high == low) normalized.setTo(128, valid);
    else { depth.convertTo(normalized, CV_8U, 254 / (high - low), 1 - low * 254 / (high - low)); normalized.setTo(0, ~valid); }
  }
  cv::applyColorMap(normalized, bgr, cv::COLORMAP_JET); bgr.setTo(cv::Scalar(), ~valid);
  return bgr;
}
Json save_png(const Image::ConstSharedPtr & frame, const fs::path & root) {
  auto raw = validate_image(*frame);
  cv::Mat bgr;
  if (raw.format == "DEPTH") throw std::runtime_error("Raw PNG capture requires a supported color image");
  if (raw.format == "RGB") cv::cvtColor(raw.pixels, bgr, cv::COLOR_RGB2BGR);
  else if (raw.format == "RGBA") cv::cvtColor(raw.pixels, bgr, cv::COLOR_RGBA2BGR);
  else if (raw.format == "BGRA") cv::cvtColor(raw.pixels, bgr, cv::COLOR_BGRA2BGR);
  else bgr = raw.pixels;
  std::vector<uint8_t> bytes;
  if (!cv::imencode(".png", bgr, bytes, {cv::IMWRITE_PNG_COMPRESSION, 3})) throw std::runtime_error("PNG encoding failed");
  if (!safe_directory(root)) throw std::runtime_error("Capture directory cannot contain symlinks");
  fs::create_directories(root);
  char * uuid = g_uuid_string_random();
  const auto name = std::string("frame_") + uuid + ".png"; g_free(uuid);
  const auto target = root / name, temporary = root / ("." + name + ".tmp");
  int fd = ::open(temporary.c_str(), O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW | O_CLOEXEC, 0600);
  if (fd < 0) throw std::runtime_error("Cannot create capture file");
  try {
    size_t offset = 0;
    while (offset < bytes.size()) {
      const auto n = ::write(fd, bytes.data() + offset, bytes.size() - offset);
      if (n < 0 && errno == EINTR) continue;
      if (n <= 0) throw std::runtime_error("Capture write failed");
      offset += size_t(n);
    }
    if (::fsync(fd)) throw std::runtime_error("Capture fsync failed");
    ::close(fd); fd = -1;
    fs::rename(temporary, target);
  } catch (...) { if (fd >= 0) ::close(fd); fs::remove(temporary); throw; }
  size_t count = 0;
  for (const auto & entry : fs::directory_iterator(root)) if (entry.is_regular_file() && entry.path().extension() == ".png") ++count;
  return {{"filePath", target.string()}, {"fileName", name}, {"width", frame->width}, {"height", frame->height}, {"stampSec", frame->header.stamp.sec}, {"stampNsec", frame->header.stamp.nanosec}, {"totalCount", count}};
}
double number(const Json & data, const char * key, double fallback, double low, double high) {
  if (!data.contains(key) || !data[key].is_number()) return fallback;
  const auto n = data[key].get<double>();
  return std::isfinite(n) ? std::clamp(n, low, high) : fallback;
}
// GStreamer promises may finish after a peer is removed. Do not retain a node or
// invoke queued work after its GLib loop has stopped.
struct Dispatch : std::enable_shared_from_this<Dispatch> {
  GMainContext * context;
  std::atomic<bool> active{true};
  explicit Dispatch(GMainContext * value) : context(g_main_context_ref(value)) {}
  ~Dispatch() { g_main_context_unref(context); }
  void post(std::function<void()> fn) {
    if (!active) return;
    struct Work { std::weak_ptr<Dispatch> dispatch; std::function<void()> fn; };
    g_main_context_invoke_full(context, G_PRIORITY_DEFAULT, [](gpointer p) -> gboolean {
      auto & work = *static_cast<Work *>(p);
      if (auto owner = work.dispatch.lock(); owner && owner->active) work.fn();
      return G_SOURCE_REMOVE;
    }, new Work{weak_from_this(), std::move(fn)}, [](gpointer p) { delete static_cast<Work *>(p); });
  }
};
}  // namespace

struct VideoGateway::Impl {
  VideoGateway & node;
  Settings config;
  EncoderSelection selection;
  Json image_settings;
  GMainContext * context = nullptr;
  GMainLoop * loop = nullptr;
  SoupServer * server = nullptr;
  GSource * timer = nullptr;
  std::thread thread;
  std::shared_ptr<Dispatch> dispatch;
  rclcpp::Service<Trigger>::SharedPtr reload;
  struct Peer {
    double fps = 10, rtt = 0, loss = 0;
    Clock::time_point telemetry{};
    GstElement * webrtc = nullptr, * queue = nullptr, * caps = nullptr;
    GstPad * pad = nullptr;
    bool answered = false;
    std::vector<std::pair<unsigned, std::string>> ice;
    uint64_t generation = 0;
  };
  struct Stream {
    std::string topic, factory, reason, error, spec;
    std::shared_ptr<FrameSlot> slot = std::make_shared<FrameSlot>();
    rclcpp::Subscription<Image>::SharedPtr subscription;
    std::map<SoupWebsocketConnection *, Peer> peers;
    std::set<SoupWebsocketConnection *> captures;
    GstElement * pipeline = nullptr, * src = nullptr, * encoder = nullptr, * tee = nullptr;
    GSource * bus_source = nullptr;
    Clock::time_point pushed{}, stats{}, started{};
    int bitrate = 1000, max_bitrate = 1000, min_bitrate = 150;
    double max_fps = 30;
    bool software_fallback = false, failed = false;
    uint64_t pushed_frames = 0;
    std::shared_ptr<std::atomic<uint64_t>> encoded_frames = std::make_shared<std::atomic<uint64_t>>(0);
    uint64_t generation = 0;
  };
  struct Client { std::string peer, host, origin, capture; };
  std::map<std::string, std::unique_ptr<Stream>> streams;
  std::map<SoupWebsocketConnection *, Client> clients;
  std::future<Json> capture_job;
  SoupWebsocketConnection * capture_client = nullptr;
  Json capture_result;
  uint64_t generation = 0;

  explicit Impl(VideoGateway & owner) : node(owner) {
    const char * env = std::getenv("ROBVIZ_SETTINGS_FILE");
    const auto path = node.declare_parameter<std::string>("config_file", env ? env : "");
    config = load_settings(path);
    config.host = node.declare_parameter("host", config.host);
    config.port = node.declare_parameter("port", config.port);
    const auto overrides = node.get_node_parameters_interface()->get_parameter_overrides();
    const bool legacy_preference = node.declare_parameter("prefer_hardware", config.encoder != "x264");
    if (overrides.count("prefer_hardware") && !overrides.count("encoder")) config.encoder = legacy_preference ? "auto" : "x264";
    config.encoder = node.declare_parameter("encoder", config.encoder);
    config.fps = node.declare_parameter("default_target_fps", config.fps);
    config.min_bitrate = node.declare_parameter("min_bitrate_kbps", config.min_bitrate);
    config.start_bitrate = node.declare_parameter("start_bitrate_kbps", config.start_bitrate);
    config.max_bitrate = node.declare_parameter("max_bitrate_kbps", config.max_bitrate);
    config.capture_topic = node.declare_parameter("capture_topic", config.capture_topic);
    config.capture_output_dir = node.declare_parameter("capture_output_dir", config.capture_output_dir.empty() ? "data/captures" : config.capture_output_dir);
    config.settings_file = node.declare_parameter("settings_file", config.settings_file);
    config.allow_lan = node.declare_parameter("allow_lan", config.allow_lan);
    config.allow_capture = node.declare_parameter("allow_remote_capture", config.allow_capture);
    config.hosts = node.declare_parameter("allowed_hosts", config.hosts);
    config.origins = node.declare_parameter("allowed_origins", config.origins);
    if (!config.allow_lan) config.host = "127.0.0.1";
    if (config.port < 1 || config.port > 65535 || !std::isfinite(config.fps) || config.fps < 1 || config.fps > 60 || config.min_bitrate < 1 || config.max_bitrate > 1000000 || config.min_bitrate > config.start_bitrate || config.start_bitrate > config.max_bitrate || (!config.capture_topic.empty() && !valid_topic(config.capture_topic))) throw std::runtime_error("Invalid gateway parameters");
    config.capture_output_dir = fs::absolute(config.capture_output_dir).lexically_normal();
    gst_init(nullptr, nullptr);
    selection = select_encoder(config.encoder);
    RCLCPP_INFO(node.get_logger(), "Encoder preference=%s actual=%s hardware=%s fallback=%s", config.encoder.c_str(), selection.factory.c_str(), selection.factory == "x264enc" ? "false" : "true", selection.reason.c_str());
    if (!config.settings_file.empty() && fs::exists(config.settings_file)) image_settings = load_image_settings(config.settings_file);
    context = g_main_context_new(); loop = g_main_loop_new(context, false); dispatch = std::make_shared<Dispatch>(context);
    auto ready = std::make_shared<std::promise<void>>(); auto result = ready->get_future();
    thread = std::thread([this, ready] {
      g_main_context_push_thread_default(context);
      try { start_server(); ready->set_value(); g_main_loop_run(loop); }
      catch (...) { ready->set_exception(std::current_exception()); }
      cleanup(); g_main_context_pop_thread_default(context);
    });
    try { result.get(); }
    catch (...) { thread.join(); g_main_loop_unref(loop); g_main_context_unref(context); throw; }
    reload = node.create_service<Trigger>("/robviz/reload_image_settings", [this](const Trigger::Request::SharedPtr, Trigger::Response::SharedPtr response) {
      try {
        const auto value = load_image_settings(config.settings_file);
        auto done = std::make_shared<std::promise<void>>(); auto result = done->get_future();
        post([this, value, done] {
          try { image_settings = value; for (auto & item : streams) { apply_settings(*item.second); } done->set_value(); }
          catch (...) { done->set_exception(std::current_exception()); }
        });
        if (result.wait_for(std::chrono::seconds(5)) != std::future_status::ready) throw std::runtime_error("Image settings reload timed out");
        result.get(); response->success = true; response->message = Json{{"version", value["version"]}, {"session", value["session"]}}.dump();
      } catch (const std::exception & e) { response->success = false; response->message = e.what(); }
    });
  }
  ~Impl() {
    reload.reset();
    post([this] { g_main_loop_quit(loop); });
    if (thread.joinable()) thread.join();
    dispatch.reset();
    g_main_loop_unref(loop); g_main_context_unref(context);
  }
  void post(std::function<void()> fn) {
    dispatch->post(std::move(fn));
  }
  static void send(SoupWebsocketConnection * ws, const Json & value) {
    if (soup_websocket_connection_get_state(ws) == SOUP_WEBSOCKET_STATE_OPEN) soup_websocket_connection_send_text(ws, value.dump().c_str());
  }
  Json encoder_info(const Stream * stream = nullptr) const {
    const auto factory = stream ? stream->factory : selection.factory;
    return {{"preference", config.encoder}, {"actual", factory}, {"hardware", factory != "x264enc"}, {"fallbackReason", stream ? stream->reason : selection.reason}, {"probes", selection.probes}, {"supported", {"auto", "intel", "x264"}}};
  }
  void start_server() {
    server = soup_server_new(SOUP_SERVER_SERVER_HEADER, "RobViz", nullptr);
    soup_server_add_handler(server, "/ws", [](SoupServer *, SoupMessage * msg, const char *, GHashTable *, SoupClientContext * client, gpointer p) {
      auto self = static_cast<Impl *>(p);
      const char * origin = soup_message_headers_get_one(msg->request_headers, "Origin");
      const char * host = soup_message_headers_get_one(msg->request_headers, "Host");
      const char * peer = soup_client_context_get_host(client);
      if (!allowed_request(peer ? peer : "", host ? host : "", origin ? origin : "", self->config)) soup_message_set_status(msg, SOUP_STATUS_FORBIDDEN);
    }, this, nullptr);
    soup_server_add_handler(server, "/", [](SoupServer *, SoupMessage * msg, const char *, GHashTable *, SoupClientContext * client, gpointer p) {
      auto self = static_cast<Impl *>(p);
      const char * origin = soup_message_headers_get_one(msg->request_headers, "Origin");
      const char * host = soup_message_headers_get_one(msg->request_headers, "Host");
      const char * peer = soup_client_context_get_host(client);
      if (!allowed_request(peer ? peer : "", host ? host : "", origin ? origin : "", self->config)) { soup_message_set_status(msg, SOUP_STATUS_FORBIDDEN); return; }
      const auto text = Json{{"protocolVersion", 1}, {"encoder", self->encoder_info()}}.dump();
      soup_message_set_status(msg, SOUP_STATUS_OK); soup_message_set_response(msg, "application/json", SOUP_MEMORY_COPY, text.data(), text.size());
    }, this, nullptr);
    soup_server_add_websocket_handler(server, "/ws", nullptr, nullptr, [](SoupServer *, SoupWebsocketConnection * ws, const char *, SoupClientContext * client, gpointer p) {
      auto self = static_cast<Impl *>(p);
      const auto uri = soup_websocket_connection_get_uri(ws);
      const std::string host = std::string(uri->host).find(':') == std::string::npos ? uri->host : "[" + std::string(uri->host) + "]";
      const char * remote = soup_client_context_get_host(client), * origin = soup_websocket_connection_get_origin(ws);
      self->clients.emplace(ws, Client{remote ? remote : "", host + ":" + std::to_string(uri->port), origin ? origin : "", ""});
      g_object_ref(ws);
      soup_websocket_connection_set_max_incoming_payload_size(ws, 65536);
      soup_websocket_connection_set_keepalive_interval(ws, 15);
      g_signal_connect(ws, "message", G_CALLBACK(+[](SoupWebsocketConnection * connection, SoupWebsocketDataType type, GBytes * bytes, gpointer data) {
        if (type != SOUP_WEBSOCKET_DATA_TEXT) return;
        auto self = static_cast<Impl *>(data);
        try { gsize size = 0; const auto text = static_cast<const char *>(g_bytes_get_data(bytes, &size)); self->command(connection, Json::parse(text, text + size)); }
        catch (const std::exception & e) { send(connection, {{"type", "error"}, {"message", e.what()}}); }
      }), self);
      g_signal_connect(ws, "closed", G_CALLBACK(+[](SoupWebsocketConnection * connection, gpointer data) { static_cast<Impl *>(data)->disconnect(connection); }), self);
    }, this, nullptr);
    GError * error = nullptr;
    GSocketAddress * address = g_inet_socket_address_new_from_string(config.host.c_str(), config.port);
    if (!address) throw std::runtime_error("Video host must be a numeric listening address");
    const bool listening = soup_server_listen(server, address, SoupServerListenOptions(0), &error);
    g_object_unref(address);
    if (!listening) { std::string text = error ? error->message : "Cannot listen"; g_clear_error(&error); throw std::runtime_error(text); }
    timer = g_timeout_source_new(5);
    g_source_set_callback(timer, [](gpointer p) -> gboolean {
      auto self = static_cast<Impl *>(p);
      try { self->tick(); } catch (const std::exception & e) { RCLCPP_ERROR(self->node.get_logger(), "Video tick: %s", e.what()); }
      return G_SOURCE_CONTINUE;
    }, this, nullptr);
    g_source_attach(timer, context);
    RCLCPP_INFO(node.get_logger(), "Video component listening on %s:%d; intra_process=%s", config.host.c_str(), config.port, node.get_node_options().use_intra_process_comms() ? "true" : "false");
  }
  Stream & get_stream(const std::string & topic) {
    auto found = streams.find(topic);
    if (found != streams.end()) return *found->second;
    auto stream = std::make_unique<Stream>(); stream->topic = topic; stream->factory = selection.factory; stream->reason = selection.reason;
    stream->bitrate = config.start_bitrate; stream->min_bitrate = config.min_bitrate; stream->max_bitrate = config.max_bitrate;
    auto slot = stream->slot;
    stream->subscription = node.create_subscription<Image>(topic, rclcpp::SensorDataQoS().keep_last(1), [slot](Image::ConstSharedPtr msg) {
      std::lock_guard<std::mutex> lock(slot->mutex); slot->frame = std::move(msg); slot->received = Clock::now();
    });
    auto & result = *stream; streams.emplace(topic, std::move(stream)); return result;
  }
  Json metadata() {
    Json sources = Json::object();
    for (const auto & item : node.get_topic_names_and_types()) if (valid_topic(item.first) && std::find(item.second.begin(), item.second.end(), "sensor_msgs/msg/Image") != item.second.end()) sources[item.first] = {{"transport", "webrtc"}, {"available", node.count_publishers(item.first) > 0}};
    for (const auto & item : streams) if (sources.contains(item.first)) sources[item.first]["encoder"] = encoder_info(item.second.get());
    return {{"type", "meta"}, {"streams", sources}, {"protocolVersion", 1}, {"encoder", encoder_info()}};
  }
  void prune() {
    for (auto it = streams.begin(); it != streams.end();) {
      if (it->second->peers.empty() && it->second->captures.empty()) { teardown(*it->second); it = streams.erase(it); }
      else ++it;
    }
  }
  void disconnect(SoupWebsocketConnection * ws) {
    if (!clients.count(ws)) return;
    for (auto & item : streams) {
      auto & s = *item.second; detach(s, ws); s.peers.erase(ws); s.captures.erase(ws);
      if (s.peers.empty()) teardown(s);
    }
    clients.erase(ws); prune(); g_signal_handlers_disconnect_by_data(ws, this); g_object_unref(ws);
  }
  void command(SoupWebsocketConnection * ws, const Json & data) {
    if (!data.is_object() || !data.contains("type") || !data["type"].is_string()) return;
    const auto type = data["type"].get<std::string>();
    if (type == "getMeta") { send(ws, metadata()); return; }
    if (type == "getCaptureInfo" || type == "setCaptureTopic" || type == "captureFrame") { capture(ws, data); return; }
    if (type == "unwatchCapture") {
      auto & client = clients.at(ws); auto it = streams.find(client.capture);
      if (it != streams.end()) it->second->captures.erase(ws);
      client.capture.clear(); prune(); return;
    }
    const auto topic = data.value("topic", std::string());
    if (!valid_topic(topic)) throw std::runtime_error("Invalid ROS topic name");
    if (type == "watch") {
      auto & s = get_stream(topic);
      const bool exists = s.peers.count(ws);
      if (s.peers.empty()) { s.failed = false; s.error.clear(); }
      s.peers[ws].fps = number(data, "targetFps", config.fps, 1, 60);
      if (s.failed) { send(ws, {{"type", "error"}, {"topic", topic}, {"message", s.error}}); return; }
      if (!exists && s.pipeline) attach(s, ws);
      return;
    }
    auto it = streams.find(topic);
    if (it == streams.end() || !it->second->peers.count(ws)) return;
    auto & s = *it->second; auto & peer = s.peers.at(ws);
    if (type == "unwatch") { detach(s, ws); s.peers.erase(ws); if (s.peers.empty()) teardown(s); prune(); }
    else if (type == "setFps") peer.fps = number(data, "targetFps", config.fps, 1, 60);
    else if (type == "answer" && peer.webrtc) {
      const auto text = data.value("sdp", std::string());
      if (text.empty() || text.size() > 60000) throw std::runtime_error("Invalid SDP answer");
      GstSDPMessage * sdp = nullptr; gst_sdp_message_new(&sdp);
      if (gst_sdp_message_parse_buffer(reinterpret_cast<const guint8 *>(text.data()), text.size(), sdp) != GST_SDP_OK) { gst_sdp_message_free(sdp); throw std::runtime_error("Invalid SDP answer"); }
      auto answer = gst_webrtc_session_description_new(GST_WEBRTC_SDP_TYPE_ANSWER, sdp);
      auto promise = gst_promise_new(); g_signal_emit_by_name(peer.webrtc, "set-remote-description", answer, promise);
      gst_promise_interrupt(promise); gst_promise_unref(promise); gst_webrtc_session_description_free(answer);
      peer.answered = true;
      for (const auto & ice : peer.ice) g_signal_emit_by_name(peer.webrtc, "add-ice-candidate", ice.first, ice.second.c_str());
      peer.ice.clear();
    } else if (type == "ice" && peer.webrtc) {
      const auto candidate = data.value("candidate", std::string());
      if (!data.contains("sdpMLineIndex") || !data["sdpMLineIndex"].is_number_integer() || data["sdpMLineIndex"] < 0 || data["sdpMLineIndex"] >= 16 || candidate.size() > 4096) throw std::runtime_error("Invalid ICE candidate");
      const unsigned line = data["sdpMLineIndex"];
      if (peer.answered) g_signal_emit_by_name(peer.webrtc, "add-ice-candidate", line, candidate.c_str());
      else if (peer.ice.size() < 256) peer.ice.emplace_back(line, candidate);
    } else if (type == "telemetry") {
      peer.rtt = number(data, "rtt", 0, 0, 100); peer.loss = number(data, "packetLoss", 0, 0, 1); peer.telemetry = Clock::now();
    }
  }
  void capture(SoupWebsocketConnection * ws, const Json & data) {
    const auto type = data["type"].get<std::string>();
    Json result{{"type", type == "captureFrame" ? "captureResult" : type == "setCaptureTopic" ? "captureTopicResult" : "captureInfo"}, {"requestId", data.value("requestId", std::string())}, {"success", false}};
    try {
      auto id = result["requestId"].get<std::string>();
      if (id.empty() || id.size() > 128) throw std::runtime_error("Invalid requestId");
      auto & client = clients.at(ws);
      auto available = metadata()["streams"];
      auto topic = type == "setCaptureTopic" ? data.value("topic", std::string()) : !client.capture.empty() ? client.capture : config.capture_topic;
      if (topic.empty() && !available.empty()) topic = available.begin().key();
      if (!valid_topic(topic) || !available.contains(topic)) throw std::runtime_error("Capture topic is not an available Image source");
      auto & s = get_stream(topic); s.captures.insert(ws);
      if (client.capture != topic) { auto previous = streams.find(client.capture); if (previous != streams.end()) previous->second->captures.erase(ws); client.capture = topic; prune(); }
      result["topic"] = topic;
      if (type == "setCaptureTopic") { result["success"] = true; send(ws, result); return; }
      Image::ConstSharedPtr frame; Clock::time_point received;
      { std::lock_guard<std::mutex> lock(s.slot->mutex); frame = s.slot->frame; received = s.slot->received; }
      bool fresh = frame && Clock::now() - received <= std::chrono::seconds(1);
      if (fresh) { try { fresh = validate_image(*frame).format != "DEPTH"; } catch (...) { fresh = false; } }
      if (type == "getCaptureInfo") {
        Json names = Json::array(); size_t count = 0; std::string last; fs::file_time_type modified{};
        if (safe_directory(config.capture_output_dir) && fs::is_directory(config.capture_output_dir)) for (const auto & entry : fs::directory_iterator(config.capture_output_dir)) if (entry.is_regular_file() && entry.path().extension() == ".png") { ++count; if (last.empty() || entry.last_write_time() > modified) { modified = entry.last_write_time(); last = entry.path().filename(); } }
        for (auto it = available.begin(); it != available.end(); ++it) names.push_back(it.key());
        result.update({{"success", true}, {"availableTopics", names}, {"outputDir", config.capture_output_dir}, {"hasFrame", fresh}, {"totalCount", count}, {"lastFileName", last.empty() ? Json(nullptr) : Json(last)}, {"width", fresh ? frame->width : 0}, {"height", fresh ? frame->height : 0}});
      } else {
        if (!allowed_request(client.peer, client.host, client.origin, config, true)) throw std::runtime_error("Capture write requires an allowed Origin and capture permission");
        if (!fresh) throw std::runtime_error("No fresh supported color frame");
        if (capture_job.valid()) throw std::runtime_error("A capture task is already in progress");
        capture_result = result; capture_client = ws; g_object_ref(ws);
        capture_job = std::async(std::launch::async, [frame, directory = config.capture_output_dir] { return save_png(frame, directory); });
        return;
      }
    } catch (const std::exception & e) { result["error"] = e.what(); }
    send(ws, result);
  }
  void apply_settings(Stream & s) {
    if (image_settings.is_null()) return;
    Image::ConstSharedPtr frame;
    { std::lock_guard<std::mutex> lock(s.slot->mutex); frame = s.slot->frame; }
    const auto & values = image_settings[frame && frame->encoding == "16UC1" ? "depth" : "rgb"];
    s.max_fps = values["max_fps"]; s.max_bitrate = int(values["target_bitrate_mbps"].get<double>() * 1000);
    s.min_bitrate = std::min(config.min_bitrate, s.max_bitrate); s.bitrate = s.max_bitrate;
    if (s.encoder) g_object_set(s.encoder, "bitrate", s.bitrate, nullptr);
  }
  void error(Stream & s, const std::string & message, const std::string & encoding = "") {
    if (s.error == message) return;
    s.error = message; RCLCPP_WARN(node.get_logger(), "[%s] %s", s.topic.c_str(), message.c_str());
    for (auto & peer : s.peers) {
      Json value{{"type", "error"}, {"topic", s.topic}, {"message", message}};
      if (!encoding.empty()) value.update({{"code", "unsupported_encoding"}, {"encoding", encoding}});
      send(peer.first, value);
    }
  }
  void detach(Stream & s, SoupWebsocketConnection * ws) {
    auto it = s.peers.find(ws); if (it == s.peers.end()) return;
    auto & p = it->second;
    if (p.pad && s.tee) {
      auto sink = gst_element_get_static_pad(p.queue, "sink"); gst_pad_unlink(p.pad, sink); gst_object_unref(sink);
      gst_element_release_request_pad(s.tee, p.pad); gst_object_unref(p.pad); p.pad = nullptr;
    }
    for (auto element : {p.webrtc, p.caps, p.queue}) if (element) { gst_element_set_state(element, GST_STATE_NULL); gst_bin_remove(GST_BIN(s.pipeline), element); }
    p.webrtc = p.caps = p.queue = nullptr; p.answered = false; p.ice.clear(); p.generation = ++generation;
  }
  void teardown(Stream & s) {
    for (const auto & peer : s.peers) detach(s, peer.first);
    if (s.bus_source) { g_source_destroy(s.bus_source); g_source_unref(s.bus_source); s.bus_source = nullptr; }
    if (s.pipeline) { gst_element_set_state(s.pipeline, GST_STATE_NULL); gst_object_unref(s.pipeline); }
    s.pipeline = s.src = s.encoder = s.tee = nullptr; s.spec.clear();
  }
  struct Callback { Impl * owner; std::weak_ptr<Dispatch> dispatch; std::string topic; SoupWebsocketConnection * ws; uint64_t generation; };
  bool current(const Callback & cb) {
    auto it = streams.find(cb.topic);
    return it != streams.end() && it->second->peers.count(cb.ws) && it->second->peers.at(cb.ws).generation == cb.generation;
  }
  void attach(Stream & s, SoupWebsocketConnection * ws) {
    auto & p = s.peers.at(ws); if (p.webrtc) return;
    p.queue = gst_element_factory_make("queue", nullptr); p.caps = gst_element_factory_make("capsfilter", nullptr); p.webrtc = gst_element_factory_make("webrtcbin", nullptr);
    if (!p.queue || !p.caps || !p.webrtc) {
      for (auto e : {p.queue, p.caps, p.webrtc}) if (e) gst_object_unref(e);
      p.queue = p.caps = p.webrtc = nullptr; throw std::runtime_error("Missing GStreamer WebRTC plugins");
    }
    g_object_set(p.queue, "max-size-buffers", 128, "max-size-bytes", 65536, "max-size-time", guint64(0), nullptr);
    g_object_set(p.webrtc, "bundle-policy", GST_WEBRTC_BUNDLE_POLICY_MAX_BUNDLE, "latency", 0, nullptr);
    auto caps = gst_caps_from_string("application/x-rtp,media=video,encoding-name=H264,payload=96,clock-rate=90000"); g_object_set(p.caps, "caps", caps, nullptr); gst_caps_unref(caps);
    gst_bin_add_many(GST_BIN(s.pipeline), p.queue, p.caps, p.webrtc, nullptr);
    if (!gst_element_link_many(p.queue, p.caps, p.webrtc, nullptr)) throw std::runtime_error("Cannot link WebRTC peer");
    p.pad = gst_element_request_pad_simple(s.tee, "src_%u"); auto sink = gst_element_get_static_pad(p.queue, "sink");
    const auto linked = p.pad ? gst_pad_link(p.pad, sink) : GST_PAD_LINK_REFUSED; gst_object_unref(sink);
    if (linked != GST_PAD_LINK_OK) throw std::runtime_error("Cannot link shared RTP stream");
    p.generation = ++generation;
    auto cb = new Callback{this, dispatch, s.topic, ws, p.generation};
    g_signal_connect_data(p.webrtc, "on-ice-candidate", G_CALLBACK(+[](GstElement *, guint line, gchar * candidate, gpointer data) {
      const auto cb = *static_cast<Callback *>(data); const std::string text = candidate;
      if (auto target = cb.dispatch.lock()) target->post([cb, line, text] { if (cb.owner->current(cb)) send(cb.ws, {{"type", "ice"}, {"topic", cb.topic}, {"candidate", text}, {"sdpMLineIndex", line}}); });
    }), cb, [](gpointer data, GClosure *) { delete static_cast<Callback *>(data); }, GConnectFlags(0));
    for (auto e : {p.queue, p.caps, p.webrtc}) gst_element_sync_state_with_parent(e);
    auto promise = gst_promise_new_with_change_func([](GstPromise * promise, gpointer data) {
      const auto cb = *static_cast<Callback *>(data);
      const auto reply = gst_promise_wait(promise) == GST_PROMISE_RESULT_REPLIED ? gst_promise_get_reply(promise) : nullptr; GstWebRTCSessionDescription * offer = nullptr;
      if (reply) gst_structure_get(reply, "offer", GST_TYPE_WEBRTC_SESSION_DESCRIPTION, &offer, nullptr);
      if (offer) {
        auto text = gst_sdp_message_as_text(offer->sdp); std::string sdp = text; g_free(text);
        if (auto target = cb.dispatch.lock()) target->post([cb, sdp] {
          if (!cb.owner->current(cb)) return;
          auto & stream = *cb.owner->streams.at(cb.topic); auto webrtc = stream.peers.at(cb.ws).webrtc;
          GstSDPMessage * parsed = nullptr; gst_sdp_message_new(&parsed); gst_sdp_message_parse_buffer(reinterpret_cast<const guint8 *>(sdp.data()), sdp.size(), parsed);
          auto local = gst_webrtc_session_description_new(GST_WEBRTC_SDP_TYPE_OFFER, parsed);
          auto done = gst_promise_new(); g_signal_emit_by_name(webrtc, "set-local-description", local, done); gst_promise_interrupt(done); gst_promise_unref(done); gst_webrtc_session_description_free(local);
          send(cb.ws, {{"type", "offer"}, {"topic", cb.topic}, {"sdp", sdp}, {"encoder", stream.factory}, {"targetFps", cb.owner->fps(stream)}, {"bitrateKbps", stream.bitrate}, {"encoderInfo", cb.owner->encoder_info(&stream)}});
        });
        gst_webrtc_session_description_free(offer);
      } else if (auto target = cb.dispatch.lock()) target->post([cb] { if (cb.owner->current(cb)) cb.owner->error(*cb.owner->streams.at(cb.topic), "Failed to create WebRTC offer"); });
      gst_promise_unref(promise);
    }, new Callback{this, dispatch, s.topic, ws, p.generation}, [](gpointer data) { delete static_cast<Callback *>(data); });
    g_signal_emit_by_name(p.webrtc, "create-offer", nullptr, promise);
  }
  void setup(Stream & s, const Image & frame, const RawImage & raw) {
    auto format = raw.format == "DEPTH" ? "BGR" : raw.format;
    const auto spec = std::to_string(frame.width) + "x" + std::to_string(frame.height) + ":" + frame.encoding;
    if (s.pipeline && s.spec == spec) return;
    teardown(s); apply_settings(s);
    const std::string description = "appsrc name=src is-live=true format=time block=false max-buffers=1 max-bytes=0 max-time=0 leaky-type=downstream ! videoconvert ! video/x-raw,format=NV12 ! " + encoder_chain(s.factory, s.bitrate) + " ! rtph264pay config-interval=1 pt=96 ! tee name=rtptee allow-not-linked=true";
    GError * parse_error = nullptr; s.pipeline = gst_parse_launch(description.c_str(), &parse_error);
    if (parse_error) { const std::string text = parse_error->message; g_clear_error(&parse_error); throw std::runtime_error(text); }
    if (!s.pipeline) throw std::runtime_error("Cannot create encoder pipeline");
    s.src = gst_bin_get_by_name(GST_BIN(s.pipeline), "src"); s.encoder = gst_bin_get_by_name(GST_BIN(s.pipeline), "enc"); s.tee = gst_bin_get_by_name(GST_BIN(s.pipeline), "rtptee");
    // The pipeline retains ownership. Borrow these references until teardown.
    gst_object_unref(s.src); gst_object_unref(s.encoder); gst_object_unref(s.tee);
    auto encoded_pad = gst_element_get_static_pad(s.encoder, "src");
    gst_pad_add_probe(encoded_pad, GST_PAD_PROBE_TYPE_BUFFER, [](GstPad *, GstPadProbeInfo *, gpointer p) -> GstPadProbeReturn {
      ++**static_cast<std::shared_ptr<std::atomic<uint64_t>> *>(p); return GST_PAD_PROBE_OK;
    }, new std::shared_ptr<std::atomic<uint64_t>>(s.encoded_frames), [](gpointer p) { delete static_cast<std::shared_ptr<std::atomic<uint64_t>> *>(p); });
    gst_object_unref(encoded_pad);
    auto caps = gst_caps_new_simple("video/x-raw", "format", G_TYPE_STRING, format.c_str(), "width", G_TYPE_INT, int(frame.width), "height", G_TYPE_INT, int(frame.height), "framerate", GST_TYPE_FRACTION, 30, 1, nullptr);
    gst_app_src_set_caps(GST_APP_SRC(s.src), caps); gst_caps_unref(caps);
    auto bus = gst_element_get_bus(s.pipeline); s.bus_source = gst_bus_create_watch(bus); gst_object_unref(bus);
    struct BusData { Impl * self; std::string topic; };
    g_source_set_callback(s.bus_source, G_SOURCE_FUNC(+[](GstBus *, GstMessage * message, gpointer data) -> gboolean {
      auto cb = static_cast<BusData *>(data); auto it = cb->self->streams.find(cb->topic);
      if (it == cb->self->streams.end() || GST_MESSAGE_TYPE(message) != GST_MESSAGE_ERROR) return G_SOURCE_CONTINUE;
      GError * error = nullptr; gchar * debug = nullptr; gst_message_parse_error(message, &error, &debug);
      const std::string text = error->message; g_clear_error(&error); g_free(debug);
      auto & stream = *it->second;
      for (const auto & peer : stream.peers) {
        auto webrtc = peer.second.webrtc;
        if (webrtc && (GST_MESSAGE_SRC(message) == GST_OBJECT(webrtc) || gst_object_has_as_ancestor(GST_MESSAGE_SRC(message), GST_OBJECT(webrtc)))) {
          send(peer.first, {{"type", "error"}, {"topic", stream.topic}, {"message", "WebRTC peer error: " + text}});
          cb->self->detach(stream, peer.first);
          return G_SOURCE_CONTINUE;
        }
      }
      if (stream.factory != "x264enc" && !stream.software_fallback) {
        stream.software_fallback = true; stream.reason = stream.factory + ": " + text; stream.factory = "x264enc";
        const auto topic = stream.topic;
        cb->self->post([self = cb->self, topic] { auto found = self->streams.find(topic); if (found != self->streams.end()) self->teardown(*found->second); });
      } else { stream.failed = true; cb->self->error(stream, "H.264 pipeline error: " + text); }
      return G_SOURCE_CONTINUE;
    }), new BusData{this, s.topic}, [](gpointer data) { delete static_cast<BusData *>(data); });
    g_source_attach(s.bus_source, context);
    s.started = Clock::now();
    if (gst_element_set_state(s.pipeline, GST_STATE_PLAYING) == GST_STATE_CHANGE_FAILURE) throw std::runtime_error("Encoder pipeline failed to start");
    s.spec = spec;
    for (const auto & peer : s.peers) attach(s, peer.first);
  }
  double fps(const Stream & s) {
    double result = 1; for (const auto & peer : s.peers) result = std::max(result, peer.second.fps);
    return std::min(result, s.max_fps);
  }
  void tick() {
    const auto now = Clock::now();
    if (capture_job.valid() && capture_job.wait_for(std::chrono::seconds(0)) == std::future_status::ready) {
      try { capture_result.update(capture_job.get()); capture_result["success"] = true; }
      catch (const std::exception & e) { capture_result["error"] = e.what(); }
      send(capture_client, capture_result); g_object_unref(capture_client); capture_client = nullptr;
    }
    for (auto & item : streams) {
      auto & s = *item.second;
      if (s.peers.empty()) continue;
      Image::ConstSharedPtr frame; Clock::time_point received;
      { std::lock_guard<std::mutex> lock(s.slot->mutex); frame = s.slot->frame; received = s.slot->received; }
      const bool fresh = frame && now - received <= std::chrono::seconds(1);
      if (now - s.stats >= std::chrono::seconds(1)) {
        s.stats = now;
        double loss = 0, rtt = 0; bool telemetry = false;
        for (const auto & peer : s.peers) if (now - peer.second.telemetry < std::chrono::seconds(5)) { telemetry = true; loss = std::max(loss, peer.second.loss); rtt = std::max(rtt, peer.second.rtt); }
        if (telemetry) {
          const auto previous = s.bitrate;
          if (loss > .02 || rtt > .25) s.bitrate = std::max(s.min_bitrate, int(s.bitrate * .75));
          else if (loss < .005 && rtt < .1) s.bitrate = std::min(s.max_bitrate, s.bitrate + 50);
          if (s.encoder && previous != s.bitrate) g_object_set(s.encoder, "bitrate", s.bitrate, nullptr);
        }
        for (const auto & peer : s.peers) send(peer.first, {{"type", "stats"}, {"topic", s.topic}, {"encoderBitrateKbps", s.bitrate}, {"targetFps", fps(s)}, {"sourceAvailable", fresh}, {"encoder", s.factory}, {"encoderInfo", encoder_info(&s)}, {"pushedFrames", s.pushed_frames}, {"encodedFrames", s.encoded_frames->load()}});
      }
      if (s.failed || !fresh || received <= s.pushed || std::chrono::duration<double>(now - s.pushed).count() < 1.0 / fps(s)) continue;
      RawImage raw;
      try { raw = validate_image(*frame); }
      catch (const std::exception & e) { error(s, e.what(), frame->encoding); s.pushed = received; continue; }
      try {
        setup(s, *frame, raw);
        GstBuffer * buffer = nullptr;
        if (raw.format == "DEPTH") {
          auto owned = new cv::Mat(depth_preview(*frame, raw.pixels));
          buffer = gst_buffer_new_wrapped_full(GST_MEMORY_FLAG_READONLY, owned->data, owned->total() * owned->elemSize(), 0, owned->total() * owned->elemSize(), owned, [](gpointer p) { delete static_cast<cv::Mat *>(p); });
          raw.pixels = *owned;
        } else {
          auto owned = new Image::ConstSharedPtr(frame);
          buffer = gst_buffer_new_wrapped_full(GST_MEMORY_FLAG_READONLY, const_cast<uint8_t *>(frame->data.data()), frame->data.size(), 0, size_t(frame->step) * frame->height, owned, [](gpointer p) { delete static_cast<Image::ConstSharedPtr *>(p); });
        }
        gsize offsets[GST_VIDEO_MAX_PLANES] = {}; gint strides[GST_VIDEO_MAX_PLANES] = {int(raw.pixels.step), 0, 0, 0};
        gst_buffer_add_video_meta_full(buffer, GST_VIDEO_FRAME_FLAG_NONE, gst_video_format_from_string(raw.format == "DEPTH" ? "BGR" : raw.format.c_str()), frame->width, frame->height, 1, offsets, strides);
        GST_BUFFER_PTS(buffer) = std::chrono::duration_cast<std::chrono::nanoseconds>(Clock::now() - s.started).count(); GST_BUFFER_DTS(buffer) = GST_BUFFER_PTS(buffer); GST_BUFFER_DURATION(buffer) = guint64(GST_SECOND / fps(s));
        s.pushed = received; s.error.clear();
        if (gst_app_src_push_buffer(GST_APP_SRC(s.src), buffer) != GST_FLOW_OK) throw std::runtime_error("Encoder rejected input frame");
        ++s.pushed_frames;
      } catch (const std::exception & e) {
        if (s.factory != "x264enc" && !s.software_fallback) { s.reason = s.factory + ": " + e.what(); s.factory = "x264enc"; s.software_fallback = true; teardown(s); }
        else { s.failed = true; teardown(s); error(s, e.what()); }
      }
    }
  }
  void cleanup() {
    dispatch->active = false;
    if (timer) { g_source_destroy(timer); g_source_unref(timer); timer = nullptr; }
    if (capture_job.valid()) { try { capture_job.get(); } catch (const std::exception & e) { RCLCPP_ERROR(node.get_logger(), "Capture shutdown: %s", e.what()); } if (capture_client) { g_object_unref(capture_client); capture_client = nullptr; } }
    for (auto & item : streams) teardown(*item.second);
    streams.clear();
    while (!clients.empty()) {
      auto ws = clients.begin()->first;
      if (soup_websocket_connection_get_state(ws) == SOUP_WEBSOCKET_STATE_OPEN) soup_websocket_connection_close(ws, SOUP_WEBSOCKET_CLOSE_GOING_AWAY, "Component stopping");
      disconnect(ws);
    }
    if (server) { soup_server_disconnect(server); g_object_unref(server); server = nullptr; }
  }
};

VideoGateway::VideoGateway(const rclcpp::NodeOptions & options) : Node("robviz_video_gateway", options), impl_(std::make_unique<Impl>(*this)) {}
VideoGateway::~VideoGateway() = default;
}  // namespace robviz_video_gateway

RCLCPP_COMPONENTS_REGISTER_NODE(robviz_video_gateway::VideoGateway)
