# C++ 视频组件与编码选择

`robviz_video_gateway` 是 ROS 2 C++ Component，插件名为
`robviz_video_gateway::VideoGateway`。浏览器仍使用原来的 `/ws` WebRTC 协议。
组件只接收 `sensor_msgs/msg/Image`，不管理相机驱动。

## 构建

在 ROS 2 Humble 环境安装构建和运行依赖：

```bash
sudo apt install libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev \
  libgstreamer-plugins-bad1.0-dev libsoup2.4-dev libopencv-dev \
  libyaml-cpp-dev nlohmann-json3-dev gstreamer1.0-plugins-good \
  gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-nice gstreamer1.0-vaapi
# Intel 平台：安装与核显匹配、支持硬件码率控制的驱动。
sudo apt install intel-media-va-driver-non-free
```

将 `ros2/robviz_video_gateway` 放入自己的 ROS 工作区，或在仓库中构建：

```bash
source /opt/ros/humble/setup.bash
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
colcon build --base-paths ros2 --packages-select robviz_video_gateway \
  --cmake-args -DCMAKE_BUILD_TYPE=Release -DBUILD_TESTING=OFF
source install/setup.bash
```

使用系统 OpenCV，避免混入 `/usr/local` 的其他 ABI。
旧的 Python 视频网关已移除，升级后需要重新构建并 source 新的安装环境。
文件设置服务仍为独立 Python 包。

## 与相机驱动共用容器

**性能部署需要同一个进程，且相机和视频组件双方均启用进程内通信。**
只放在同一工作区、同一 launch 文件或同一 ROS domain 中，不能达到该效果。
不需要把 RobViz 源码编进相机驱动。

在用户自己的相机 launch 中，将以下组件加入相机容器：

```python
from launch_ros.descriptions import ComposableNode

video = ComposableNode(
    package="robviz_video_gateway",
    plugin="robviz_video_gateway::VideoGateway",
    name="robviz_video_gateway",
    parameters=[{"config_file": "/absolute/path/to/robviz/setting.yaml"}],
    extra_arguments=[{"use_intra_process_comms": True}],
)
# 把 video 加入已有相机容器的 composable_node_descriptions。
# 相机 ComposableNode 也需设置 use_intra_process_comms=True。
```

也可以显式加载到用户已启动的相机容器：

```bash
ros2 launch robviz_video_gateway component.launch.py \
  container:=/your_camera_container config_file:=/absolute/path/to/setting.yaml
```

该命令只加载视频组件，不创建、重启或停止相机驱动。
容器由用户管理。组件共享进程，因此原生进程崩溃仍会影响同一容器中的其他组件。
进程内通信减少 ROS 图像序列化和复制，不等于相机到显卡全链路零复制。

## 独立运行与 stack

```bash
ROBVIZ_SETTINGS_FILE=/absolute/path/to/setting.yaml \
  ros2 run robviz_video_gateway gateway_node
```

独立运行只启动视频网关，不启动相机。也可使用 `component.launch.py` 创建视频专用容器。
默认 `npm run stack` 从 ROS 安装环境定位并直接管理独立视频网关，启动前必须 source 已构建的 ROS 包。
如视频组件已加载到相机容器，在 YAML 中设置 `services.video.enabled: false`，
让 stack 只管理其他服务，避免重复监听。该字段只控制 stack 启动，不禁止手动加载组件。
stack 不接管或重启外部容器。

## 编码与状态

`services.video.encoder` 支持 `auto`、`intel`、`x264`，默认 `auto`。
旧 `prefer_hardware` 在读取时迁移：`false` 对应 `x264`，`true` 对应 `auto`。
显式 ROS 参数覆盖环境变量，环境变量覆盖 YAML。
支持 `-p encoder:=intel` 和 `ROBVIZ_SERVICES_VIDEO_ENCODER=intel`。

自动和 Intel 模式分别探测 `vah264enc`、`vaapih264enc`，最后尝试 `x264enc`。
每次探测实际编码 720p 合成图像，并要求产生 H.264 输出。
缺少插件、设备权限、驱动能力或格式协商失败会记录具体原因。
运行中的硬编码管线失败时，该话题只回退一次至 x264，不反复切换或探测。
回退保留用户设定的码率与帧率。两类编码器均不可用时明确报错。
NVIDIA 后端尚未实现，界面不允许选择，也不宣称已经验证。

“通用 → 项目运行设置”选择编码方式，保存前确认受影响服务。
stack 管理的独立网关会重启。外部容器中的组件需手动卸载并重新加载。
“图像”设置显示启动探测结果。视频流统计携带该话题的实际编码器和回退原因。
FPS 和目标码率继续通过 `/robviz/reload_image_settings` 更新，校验 session/version 后确认。

没有观看者或截图客户端时不订阅图像，不启动话题编码器。
同一话题的观看者共享一个编码器，每个观看者使用独立 WebRTC peer。
只保存最新图像引用，输入队列丢弃旧帧。截图使用原始颜色图像，不从有损 H.264 解码。
`16UC1` 深度伪彩色只用于预览，不改变 ROS 原始深度消息。

## 本地模拟摄像头验证

测试程序在同一进程创建合成相机和视频组件，不访问真实摄像头。
RGB 为 1280×720、30fps；深度为 640×480。
测试检查网络边界、无损 PNG、设置重载和正常退出。
浏览器检查还会验证 H.264 解码、断流恢复和带行填充的分辨率切换。

```bash
colcon build --base-paths ros2 --packages-select robviz_video_gateway \
  --cmake-args -DCMAKE_BUILD_TYPE=Release -DBUILD_TESTING=ON
source install/setup.bash
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp ROS_LOCALHOST_ONLY=1 ROS_DOMAIN_ID=218
export ROBVIZ_SYNTHETIC_CAMERA="$PWD/install/robviz_video_gateway/lib/robviz_video_gateway/synthetic_camera_graph"
PYTHONPATH="$PWD/ros2/robviz_web_server:$PYTHONPATH" \
  /usr/bin/python3 -m unittest discover -s ros2/robviz_video_gateway/test -p test_capture_protocol.py
```

可选的浏览器测试使用 Playwright。在隔离的临时目录安装，不加入产品依赖：

```bash
npm install --prefix /tmp/robviz-video-browser playwright
/tmp/robviz-video-browser/node_modules/.bin/playwright install chromium
export ROBVIZ_PLAYWRIGHT_MODULE=/tmp/robviz-video-browser/node_modules/playwright/index.mjs
# 再执行上面的 unittest 命令，自动加入浏览器解码检查。
```

设置 `ROBVIZ_TEST_ENCODER=intel` 或 `x264` 可验证显式选择。
设置 `ROBVIZ_EXPECT_ENCODER=vaapih264enc` 等值可要求特定探测结果。
测试日志会报告探测结果、实际编码器、解码帧数及进程内订阅数量。
测试结果只对应所测机器及驱动，不作为 CPU 占用或推理性能的跨平台保证。

## 本机验证记录

本次 i5-1135G7 验证使用临时目录中的 Intel non-free 驱动，未替换系统驱动。
系统当前驱动未通过 CBR 协商，自动模式会报告原因并回退至 `x264enc`。
测试同时传输 RGB 1280×720@30 和深度预览 640×480@10，采样 12 秒，并启用 GStreamer latency tracer。

| 实测项 | Intel `vaapih264enc` | 软件 `x264enc` |
| --- | --- | --- |
| 合成发布器与网关合计 CPU，100% 为一个逻辑核心 | 28.5% | 48.2% |
| RGB 编码器元素耗时均值 / P95，稳定阶段 300 帧 | 2.48 / 2.73 ms | 1.83 / 2.66 ms |
| RGB 推入 / 编码计数增量 | 361 / 361 | 361 / 361 |
| 深度推入 / 编码计数增量 | 121 / 121 | 121 / 121 |

浏览器持续解码两路视频，并通过断流恢复、行填充和分辨率切换检查。
编码器元素耗时不包含 ROS 传输、浏览器解码或显示延迟。CPU 包含合成图像生成和深度着色。
合成画面复杂度较低，以上数据仅代表本机测试条件。

设置 `ROBVIZ_BENCHMARK_SECONDS=12` 可延长浏览器采样。
设置 `GST_TRACERS='latency(flags=pipeline+element)'`、`GST_DEBUG=GST_TRACER:7` 和 `GST_DEBUG_FILE` 可记录元素耗时。
上述编码器耗时取稳定阶段第 2 至第 12 秒的 `element=(string)enc` 记录。
使用以下命令检查原生协议及真实组件加载、卸载和端口释放：

```bash
ctest --test-dir build/robviz_video_gateway --output-on-failure
/usr/bin/python3 -m unittest discover -s ros2/robviz_video_gateway/test -p test_component_lifecycle.py
```
