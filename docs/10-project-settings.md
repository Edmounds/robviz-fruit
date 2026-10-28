# 项目运行设置与一键启动

项目运行设置保存在仓库根目录的 `setting.yaml`。
相对路径以配置文件所在目录为基准，不依赖启动时的工作目录。
浏览器工作区仍自动保存在 localStorage，显式导入/导出仍使用 `robviz.json`。
不要在 YAML 或导出文件中保存 SSH 凭据。

## 默认访问范围

- 网页默认监听 `0.0.0.0:5173`，预览端口为 `4173`。
- `network.allow_lan` 控制私网访问，默认开启。
- `plugins.allow_lan_writes` 默认开启，允许私网安装、升级、卸载和扫描外部插件。
- 视频网关默认允许私网播放和截图请求。
- 终端网关默认允许私网页面连接。
- 文件服务默认仅监听 `127.0.0.1:8000`，网页通过受保护的 `/api` 代理读写文件。

私网校验使用实际 TCP 来源，不信任客户端填写的转发地址。
公网来源即使伪造私网 Host 或 Origin，也不会被授权。
浏览器默认只能同源访问，配套 WebSocket 允许同一主机的网页端口。
额外可信域名使用 `network.allowed_hosts`，额外可信页面使用精确的 `network.allowed_origins`。
这些清单不接受通配符，也不会授权公网来源。
不要把这些服务通过公开反向代理暴露到互联网。

允许私网写入意味着信任该网络上的设备。
插件代码不在沙箱内运行，终端可以发起 SSH 连接。
普通 HTTP/WS 不加密，请仅用于可信网络。

## 启动

网页单独启动，不自动启动机器人或配套服务：

```bash
npm run dev
```

显式启动网页、文件、视频和终端服务：

```bash
# 先构建视频组件并加载自己的 ROS 2 环境。视频服务使用 C++、ROS 和 GStreamer。
npm run stack
```

`services.<name>.enabled` 控制一键启动时是否启动该服务。
没有 ROS 环境时，可以在 YAML 中关闭视频服务。
这个命令不会启动 Foxglove、相机、雷达、底盘或机械臂。
外部脚本已经启动视频网关时，先在 YAML 中关闭对应服务，或继续分别启动服务。
不要让一键命令与已运行的外部脚本争用同一端口。
视频组件与相机同容器时，关闭 stack 的视频启动，由用户自己的 launch 加载组件。
具体方式见 [视频组件部署](11-video-component.md)。

所有启用端口会先检查占用情况。
冲突时明确报错，并停止本次命令已启动的子进程。
不会自动换端口、杀死外部进程或把外部监听器当作兼容服务。
Ctrl-C 只停止本次命令管理的服务。

生产预览需要先构建：

```bash
npm run build
npm run stack -- --preview
```

纯静态部署仍只需 `dist/`，但不提供项目配置 API、插件管理或进程重启。
构建不会把 `setting.yaml`、配置备份或服务端数据复制到 `dist/`。

## 配置优先级

显式启动参数优先于环境变量，环境变量优先于 YAML。

```bash
npm run stack -- --config /path/to/setting.yaml --host 0.0.0.0 --port 5173
ROBVIZ_SETTINGS_FILE=/path/to/setting.yaml npm run dev
```

每个 YAML 字段均可使用大写路径环境变量覆盖，例如：

```bash
ROBVIZ_NETWORK_ALLOW_LAN=0 npm run dev
ROBVIZ_SERVICES_VIDEO_CAPTURE_OUTPUT_DIR=/path/to/captures npm run stack
```

布尔值只能使用 `0`、`1`、`true` 或 `false`。
清单类环境变量使用 JSON 数组。
继续支持既有的 `ROBVIZ_ALLOW_LAN`、`ROBVIZ_HOST`、`ROBVIZ_PORT`、
`ROBVIZ_PLUGIN_DIR`、`ROBVIZ_PLUGIN_REPO`、`ROBVIZ_PLUGIN_REF`、
`ROBVIZ_PLUGIN_RELEASE`、`ROBVIZ_ALLOW_REMOTE_PLUGIN_MGMT` 和 `ROBVIZ_TERMINAL_GATEWAY_PORT`。
同一字段同时设置新旧名称时，既有名称优先。

关闭私网访问会同时收紧服务的监听与请求校验。
单独关闭插件写入、文件写入、截图或终端私网权限时，相关本机操作仍可使用。

## 网页修改与自动重启

打开“设置 → 通用 → 项目运行设置”。
编辑结构化 JSON，服务端会校验并保存成 YAML。
未知字段、非法端口、重复启用端口、错误类型和无效码率会拒绝保存。
配置文件只使用固定路径，不提供任意文本或任意文件路径写入接口。

保存前显示受影响服务，并确认连接可能中断。
确认后先备份原配置，再使用版本校验、进程间锁、fsync 和原子替换保存。
另一页面或进程已修改文件时，重新读取配置后再保存。
保存会规范化 YAML 格式，不保留原有注释。

通过一键命令启动时，只重启受影响且由该命令管理的服务。
修改视频截图目录不会重启终端或文件服务。
修改网页端口会同步更新配套 WebSocket 的可信页面端口。
修改文件数据目录会重启文件服务和依赖其图像配置的视频服务。
新的网页端口生效后，需要使用新地址重新打开页面。

保存成功不代表服务已应用成功。
使用“检查服务状态”查看各服务的启动、运行、禁用或失败状态。
应用失败时保留新配置，停止失败服务并显示错误。
其他未受影响服务继续运行，不自动回滚或重复重试。
网页服务自身无法启动时，需要从终端修正 YAML，再重新启动。

分别启动的服务没有公共进程管理者。
这种情况下网页会明确提示手动重启，不接管外部进程。
图像带宽等运行设置仍使用图像插件的显式应用与 ROS 重载确认协议。

## 文件与截图边界

`services.files.data_dir` 只授权该目录内服务支持的业务文件。
现有航点 YAML、对应背景图和图像设置可以修改。
接口仍使用文档 ID，拒绝越界路径、符号链接和不支持的数据格式。
它不提供整机文件浏览或任意内容覆盖。
原有备份、文档版本冲突检测和大小限制保持有效。

`services.video.capture_output_dir` 配置截图目录。
浏览器只发送截图请求，视频网关验证原始帧后写入 PNG。
截图保存在视频网关所在机器，不是浏览器所在机器。
截图请求不接受客户端指定的保存路径，也不会在断线后自动重发。

已构建并安装 ROS 包后，独立运行的服务也可读取配置：

```bash
ROBVIZ_SETTINGS_FILE=/path/to/setting.yaml ros2 run robviz_video_gateway gateway_node
ROBVIZ_SETTINGS_FILE=/path/to/setting.yaml npm run terminal
```

ROS 参数、文件服务启动参数等显式参数仍可覆盖对应默认值。
安装到其他 ROS 工作区后，请明确设置 `ROBVIZ_SETTINGS_FILE`。
