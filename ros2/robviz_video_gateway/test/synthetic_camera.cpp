// Isolated test graph. Publishes synthetic images, never opens a camera device.
#include "robviz_video_gateway/gateway.hpp"
#include <sensor_msgs/msg/image.hpp>
#include <std_srvs/srv/trigger.hpp>

class SyntheticCamera : public rclcpp::Node {
 public:
  explicit SyntheticCamera(const rclcpp::NodeOptions & options) : Node("robviz_test_camera", options) {
    color_ = create_publisher<sensor_msgs::msg::Image>("/robviz_test/color", rclcpp::SensorDataQoS().keep_last(1));
    depth_ = create_publisher<sensor_msgs::msg::Image>("/robviz_test/depth", rclcpp::SensorDataQoS().keep_last(1));
    toggle_ = create_service<std_srvs::srv::Trigger>("/robviz_test/toggle", [this](std_srvs::srv::Trigger::Request::SharedPtr, std_srvs::srv::Trigger::Response::SharedPtr response) {
      paused_ = !paused_; response->success = true; response->message = paused_ ? "paused" : "publishing";
    });
    layout_ = create_service<std_srvs::srv::Trigger>("/robviz_test/layout", [this](std_srvs::srv::Trigger::Request::SharedPtr, std_srvs::srv::Trigger::Response::SharedPtr response) {
      padded_ = !padded_; response->success = true; response->message = padded_ ? "padded" : "tight";
    });
    timer_ = create_wall_timer(std::chrono::microseconds(33333), [this] {
      if (paused_) return;
      if (color_->get_subscription_count()) {
        auto frame = std::make_unique<sensor_msgs::msg::Image>();
        frame->header.stamp = now(); frame->width = padded_ ? 642 : 1280; frame->height = 720;
        frame->encoding = "rgb8"; frame->step = frame->width * 3 + (padded_ ? 10 : 0); frame->data.resize(frame->step * frame->height);
        for (unsigned y = 0; y < frame->height; ++y) for (unsigned x = 0; x < frame->width; ++x) {
          const auto i = size_t(y) * frame->step + x * 3;
          frame->data[i] = 255; frame->data[i + 1] = uint8_t(x + frame_number_); frame->data[i + 2] = uint8_t(y);
        }
        color_->publish(std::move(frame));
      }
      if (depth_->get_subscription_count()) {
        auto frame = std::make_unique<sensor_msgs::msg::Image>();
        frame->header.stamp = now(); frame->width = 640; frame->height = 480;
        frame->encoding = "16UC1"; frame->step = 1280; frame->data.resize(1280 * 480);
        for (size_t i = 0; i < frame->data.size(); i += 2) { unsigned value = 100 + (i / 2 + frame_number_) % 3000; frame->data[i] = value & 255; frame->data[i + 1] = value >> 8; }
        depth_->publish(std::move(frame));
      }
      ++frame_number_;
    });
    report_ = create_wall_timer(std::chrono::seconds(2), [this] {
      RCLCPP_INFO(get_logger(), "Synthetic subscribers total=%zu intra_process=%zu", color_->get_subscription_count(), color_->get_intra_process_subscription_count());
    });
  }
 private:
  bool paused_ = false, padded_ = false;
  unsigned frame_number_ = 0;
  rclcpp::Publisher<sensor_msgs::msg::Image>::SharedPtr color_, depth_;
  rclcpp::Service<std_srvs::srv::Trigger>::SharedPtr toggle_, layout_;
  rclcpp::TimerBase::SharedPtr timer_, report_;
};

int main(int argc, char ** argv) {
  rclcpp::init(argc, argv);
  rclcpp::NodeOptions options; options.use_intra_process_comms(true);
  auto camera = std::make_shared<SyntheticCamera>(options);
  auto gateway = std::make_shared<robviz_video_gateway::VideoGateway>(options);
  rclcpp::executors::MultiThreadedExecutor executor(rclcpp::ExecutorOptions(), 2);
  executor.add_node(camera); executor.add_node(gateway); executor.spin();
  executor.remove_node(gateway); gateway.reset(); executor.remove_node(camera); camera.reset();
  rclcpp::shutdown(); return 0;
}
