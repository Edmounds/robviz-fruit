#pragma once

#include <memory>
#include <rclcpp/rclcpp.hpp>

namespace robviz_video_gateway {
class VideoGateway : public rclcpp::Node {
 public:
  explicit VideoGateway(const rclcpp::NodeOptions & options);
  ~VideoGateway() override;
 private:
  struct Impl;
  std::unique_ptr<Impl> impl_;
};
}  // namespace robviz_video_gateway
