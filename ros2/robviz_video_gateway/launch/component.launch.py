"""Start only the video component, or load it into a user-owned camera container."""
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition, UnlessCondition
from launch.substitutions import EnvironmentVariable, LaunchConfiguration, PythonExpression
from launch_ros.actions import ComposableNodeContainer, LoadComposableNodes
from launch_ros.descriptions import ComposableNode


def generate_launch_description():
    target = LaunchConfiguration("container")
    external = PythonExpression(["'", target, "' != ''"])
    component = ComposableNode(
        package="robviz_video_gateway",
        plugin="robviz_video_gateway::VideoGateway",
        name="robviz_video_gateway",
        parameters=[{"config_file": LaunchConfiguration("config_file")}],
        extra_arguments=[{"use_intra_process_comms": True}],
    )
    return LaunchDescription([
        DeclareLaunchArgument("container", default_value="", description="Existing camera component container. Empty starts a video-only container."),
        DeclareLaunchArgument("config_file", default_value=EnvironmentVariable("ROBVIZ_SETTINGS_FILE", default_value=""), description="Absolute project setting.yaml path, or use ROS parameter defaults."),
        ComposableNodeContainer(
            condition=UnlessCondition(external), name="robviz_video_container", namespace="",
            package="rclcpp_components", executable="component_container_mt",
            composable_node_descriptions=[component], output="screen"),
        LoadComposableNodes(condition=IfCondition(external), target_container=target,
                            composable_node_descriptions=[component]),
    ])
