import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Field, Notice, NumberInput, TextInput, Toolbar, validateInputs, type PluginSectionProps } from "@robviz/core";
import { applyImageSettings, fetchImageSettings, saveImageSettingsDefaults, type ImageSettings, type ImageStreamSettings } from "./settingsApi";

export function ImageSettingsPanel({ ctx }: PluginSectionProps) {
  const isEn = ctx.locale === "en";
  const state = ctx.pluginStates.image as { reloadService?: string } | undefined;
  const reloadService = typeof state?.reloadService === "string" ? state.reloadService : "/robviz/reload_image_settings";
  const [settings, setSettings] = useState<ImageSettings>();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [encoder, setEncoder] = useState<{ preference: string; actual: string; hardware: boolean; fallbackReason: string }>();
  const [encoderError, setEncoderError] = useState("");
  const [streamEncoders, setStreamEncoders] = useState<Array<{ topic: string; actual: string; fallbackReason: string }>>([]);
  const videoUrl = ctx.mediaUrl || ctx.getServiceUrl("video");
  const fields = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    void fetchImageSettings().then((response) => { if (!cancelled) setSettings(response.settings); })
      .catch((error) => { if (!cancelled) setStatus(String(error)); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    let socket: WebSocket;
    try {
      const url = new URL(videoUrl);
      url.protocol = ["https:", "wss:"].includes(url.protocol) ? "wss:" : "ws:";
      if (!url.pathname || url.pathname === "/") url.pathname = "/ws";
      socket = new WebSocket(url);
    } catch { setEncoderError(isEn ? "Video gateway unavailable" : "视频网关不可用"); return; }
    socket.onopen = () => socket.send(JSON.stringify({ type: "getMeta" }));
    socket.onmessage = (event) => {
      try {
        const value = JSON.parse(event.data);
        if (value.type === "meta" && value.encoder && typeof value.encoder.actual === "string") {
          setEncoder(value.encoder); setEncoderError("");
          setStreamEncoders(Object.entries(value.streams || {}).flatMap(([topic, raw]) => {
            const stream = raw as { encoder?: { actual?: string; fallbackReason?: string } };
            return typeof stream?.encoder?.actual === "string" ? [{ topic, actual: stream.encoder.actual, fallbackReason: stream.encoder.fallbackReason || "" }] : [];
          }));
        }
      }
      catch { setEncoderError(isEn ? "Invalid gateway status" : "网关状态无效"); }
    };
    socket.onerror = () => setEncoderError(isEn ? "Video gateway unavailable" : "视频网关不可用");
    const poll = setInterval(() => { if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: "getMeta" })); }, 3000);
    return () => { clearInterval(poll); socket.onmessage = socket.onerror = null; socket.close(); };
  }, [videoUrl, isEn]);
  const save = useCallback(async (defaults: boolean) => {
    if (!settings || busy || !validateInputs(fields.current)) return;
    setBusy(true);
    setStatus("");
    try {
      if (!/^\/(?:[A-Za-z_][A-Za-z0-9_]*)(?:\/[A-Za-z_][A-Za-z0-9_]*)*$/.test(reloadService)) throw new Error("Invalid ROS service name");
      if (ctx.connectionState !== "open") throw new Error(isEn ? "Connect to ROS before applying settings" : "应用配置前请先连接 ROS");
      const response = await (defaults ? saveImageSettingsDefaults(settings) : applyImageSettings(settings));
      setSettings(response.settings);
      const result = await ctx.bridge.callService(reloadService, {}) as { success?: boolean; message?: string };
      if (result.success !== true) throw new Error(result.message || "ROS reload failed");
      const confirmed = JSON.parse(result.message || "{}");
      if (confirmed.version !== response.version || confirmed.session !== response.settings.session) throw new Error("ROS reload confirmed an unexpected version/session");
      setStatus(isEn ? "Applied and confirmed" : "已生效并确认版本");
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
    finally { setBusy(false); }
  }, [settings, busy, reloadService, ctx, isEn]);
  const update = (stream: "rgb" | "depth", field: keyof ImageStreamSettings, value: number) => {
    setSettings((current) => current && ({ ...current, [stream]: { ...current[stream], [field]: value } }));
  };
  return <div ref={fields}>
    <section className="settings-section">
      <h2>{isEn ? "Video encoder" : "视频编码器"}</h2>
      <p>{isEn ? "Choose Automatic, Intel VA-API or software x264 in General → Project runtime settings." : "在“通用 → 项目运行设置”中选择自动、Intel VA-API 或软件 x264。"}</p>
      {encoder && <p>{isEn ? "Startup probe" : "启动探测"}: {encoder.preference} → {encoder.actual} · {encoder.hardware ? (isEn ? "Hardware encoding" : "硬件编码") : (isEn ? "CPU software encoding" : "CPU 软件编码")}</p>}
      {encoder?.fallbackReason && <Notice>{encoder.fallbackReason}</Notice>}
      {streamEncoders.map((stream) => <p key={stream.topic}>{stream.topic}: {stream.actual}{stream.fallbackReason ? ` · ${stream.fallbackReason}` : ""}</p>)}
      {encoderError && <Notice>{encoderError}</Notice>}
    </section>
    <p>{isEn ? "Settings require a confirmed ROS reload. Missing backends do not affect the host." : "配置只有在 ROS 重载并确认版本后才算生效。缺少后端不影响宿主。"}</p>
    <Field label={isEn ? "ROS reload service" : "ROS 重载服务"}>
      <TextInput value={reloadService} onChange={(event) => ctx.onPluginStateChange("image", { ...state, reloadService: event.target.value })} />
    </Field>
    {settings && (["rgb", "depth"] as const).map((stream) => <section className="settings-section" key={stream}>
      <h2>{stream === "rgb" ? "RGB" : "Native Depth"}</h2>
      <p>WebRTC (H.264)</p>
      <Field label={isEn ? "Bandwidth budget (Mbps)" : "带宽预算 (Mbps)"}>
        <NumberInput min={.1} max={1000} step="any" value={settings[stream].bandwidth_mbps}
          onValueChange={(value) => { if (value !== undefined) update(stream, "bandwidth_mbps", value); }} />
      </Field>
      <Field label={isEn ? "Max frame rate" : "帧率上限"}>
        <NumberInput min={1} max={60} step={1} value={settings[stream].max_fps}
          onValueChange={(value) => { if (value !== undefined) update(stream, "max_fps", value); }} />
      </Field>
      <Field label={isEn ? "Target bitrate (Mbps)" : "目标码率 (Mbps)"}>
        <NumberInput min={.1} max={settings[stream].bandwidth_mbps} step={.1} value={settings[stream].target_bitrate_mbps}
          onValueChange={(value) => { if (value !== undefined) update(stream, "target_bitrate_mbps", value); }} />
      </Field>
    </section>)}
    <Toolbar>
      <Button disabled={!settings || busy} onClick={() => void save(false)}>{isEn ? "Apply" : "应用"}</Button>
      <Button disabled={!settings || busy} onClick={() => void save(true)}>{isEn ? "Save as default" : "保存为默认"}</Button>
      {settings && <span>v{settings.version} · {ctx.connectionState}</span>}
    </Toolbar>
    {status && <Notice>{status}</Notice>}
  </div>;
}
