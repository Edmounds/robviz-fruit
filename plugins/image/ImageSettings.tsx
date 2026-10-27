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
  const fields = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    void fetchImageSettings().then((response) => { if (!cancelled) setSettings(response.settings); })
      .catch((error) => { if (!cancelled) setStatus(String(error)); });
    return () => { cancelled = true; };
  }, []);
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
