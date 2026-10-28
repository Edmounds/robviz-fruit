#pragma once

#include <gst/gst.h>
#include <libsoup/soup.h>
#include <nlohmann/json.hpp>
#include <yaml-cpp/yaml.h>
#include <filesystem>
#include <string>
#include <vector>

namespace robviz_video_gateway {
using Json = nlohmann::json;
namespace fs = std::filesystem;
struct Settings {
  std::string host = "0.0.0.0", encoder = "auto", capture_topic, capture_output_dir, settings_file;
  int port = 8787, min_bitrate = 150, start_bitrate = 1000, max_bitrate = 1000;
  double fps = 10;
  bool allow_lan = true, allow_capture = true;
  std::vector<std::string> hosts, origins;
  std::vector<int> page_ports{5173, 4173};
};
Settings load_settings(const fs::path & file);
bool allowed_request(const std::string & peer, const std::string & host,
                     const std::string & origin, const Settings & settings, bool write = false);
bool valid_topic(const std::string & topic);
std::string encoder_chain(const std::string & factory, int bitrate);
struct EncoderSelection { std::string factory, reason; Json probes = Json::array(); };
EncoderSelection select_encoder(const std::string & preference);
Json load_image_settings(const fs::path & path);
void validate_image_settings(const Json & value);
bool safe_directory(const fs::path & path);
}  // namespace robviz_video_gateway
