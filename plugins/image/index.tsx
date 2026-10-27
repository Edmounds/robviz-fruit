import type { PluginPanelProps, RobvizPlugin } from "@robviz/core";
import { ImageViewer } from "@robviz/core";
import { ImageSettingsPanel } from "./ImageSettings";

export function ImagePanelPlugin({ ctx, state, onStateChange, onClose }: PluginPanelProps) {
  const imageState = state as
    | { topic?: string; preferRaw?: boolean; useWebRtc?: boolean }
    | undefined;

  return (
    <ImageViewer
      embedded
      active={ctx.active}
      bridge={ctx.bridge}
      topics={ctx.topics}
      initialTopic={imageState?.topic}
      initialPreferRaw={imageState?.preferRaw ?? true}
      initialUseWebRtc={imageState?.useWebRtc !== false}
      mediaUrl={ctx.mediaUrl || ctx.getServiceUrl("video")}
      onTopicChange={(topic: string, preferRaw: boolean, useWebRtc: boolean) =>
        onStateChange({ topic, preferRaw, useWebRtc })
      }
      onClose={onClose}
    />
  );
}

const plugin: RobvizPlugin = {
  id: "image",
  name: "图像 (Image)",
  settings: [{ id: "images", title: (ctx) => ctx.locale === "en" ? "Image settings" : "图像设置", component: ImageSettingsPanel }],
  panels: [
    {
      kind: "image",
      title: (ctx) => (ctx.locale === "en" ? "Image" : "图像面板"),
      component: ImagePanelPlugin,
    },
  ],
  services: [
    {
      id: "video",
      label: "WebRTC 视频网关",
      defaultPort: 8787,
      protocol: "ws",
      description: "实时视频流 (H.264) 与相机数据流",
    },
  ],
};

export default plugin;
