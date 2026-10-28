#include "robviz_video_gateway/support.hpp"
#include <rclcpp/rclcpp.hpp>

int main(int argc, char ** argv) {
  rclcpp::init(argc, argv);
  auto logger = rclcpp::get_logger("video_protocol_check");
  try {
    using namespace robviz_video_gateway;
    auto require = [](bool condition, const char * message) { if (!condition) throw std::runtime_error(message); };
    Settings config;
    for (const auto * peer : {"127.0.0.2", "::1", "10.0.0.1", "172.16.0.1", "192.168.1.2", "169.254.1.1", "fd00::1", "fe90::1", "::ffff:192.168.1.2"}) require(allowed_request(peer, "192.168.1.3:8787", "http://192.168.1.3:5173", config), "Private peer rejected");
    for (const auto * peer : {"8.8.8.8", "172.32.0.1", "198.18.0.1", "192.0.2.1", "2001:4860::1"}) require(!allowed_request(peer, "192.168.1.3:8787", "http://192.168.1.3:5173", config), "Public peer accepted");
    for (const auto * host : {"user@127.0.0.1", "127.0.0.1/", "127.0.0.1?x", "127.0.0.1\\evil", "evil.example"}) require(!allowed_request("127.0.0.1", host, "", config), "Invalid Host accepted");
    for (const auto * origin : {"http://evil.example", "http://127.0.0.1:5173/", "http://user@127.0.0.1:5173", "http://127.0.0.1:9999", "null"}) require(!allowed_request("127.0.0.1", "127.0.0.1:8787", origin, config), "Invalid Origin accepted");
    require(!allowed_request("127.0.0.1", "127.0.0.1:8787", "", config, true), "Origin-free write accepted");
    config.allow_capture = false;
    require(!allowed_request("192.168.1.2", "192.168.1.3:8787", "http://192.168.1.3:5173", config, true), "Remote write permission bypassed");
    config.allow_lan = false;
    require(!allowed_request("192.168.1.2", "192.168.1.3:8787", "", config), "LAN restriction bypassed");
    require(valid_topic("/camera/image_raw") && !valid_topic("/camera/../secret") && !valid_topic("/camera//image"), "Topic validation failed");
    RCLCPP_INFO(logger, "Native network and topic protocol checks passed");
  } catch (const std::exception & e) { RCLCPP_ERROR(logger, "%s", e.what()); rclcpp::shutdown(); return 1; }
  rclcpp::shutdown(); return 0;
}
