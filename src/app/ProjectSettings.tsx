import { useEffect, useState } from "react";
import { Button, Field, Notice, Select, Toolbar } from "../ui";
import { useI18n } from "./i18n";

export function ProjectSettings() {
  const { locale } = useI18n();
  const en = locale === "en";
  const [draft, setDraft] = useState("");
  const [version, setVersion] = useState("");
  const [status, setStatus] = useState<unknown>();
  const [effective, setEffective] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const request = async (path = "", payload?: object) => {
    const response = await fetch(new URL(`./project-settings/${path}`, document.baseURI), {
      method: payload ? "POST" : "GET", headers: payload ? { "Content-Type": "application/json" } : {},
      body: payload ? JSON.stringify(payload) : undefined, signal: AbortSignal.timeout(10000),
    });
    const value = await response.json();
    if (!response.ok) throw new Error(value.error || `HTTP ${response.status}`);
    return value;
  };
  useEffect(() => {
    let cancelled = false;
    void request().then((value) => {
      if (cancelled) return;
      setDraft(JSON.stringify(value.settings, null, 2)); setVersion(value.version); setStatus(value.status); setEffective(value.effective);
    }).catch(() => { if (!cancelled) setError("项目运行设置需要 RobViz 服务 / Project settings require the RobViz server."); });
    return () => { cancelled = true; };
  }, []);
  const save = async () => {
    setBusy(true); setError(""); setMessage("");
    try {
      const settings = JSON.parse(draft);
      const preview = await request("preview", { settings, version });
      const services = preview.affected.join(", ") || (en ? "none" : "无");
      if (!window.confirm(en
        ? `Save setting.yaml? Affected services: ${services}. ${preview.managed ? "Managed services restart automatically and connections may close." : "Standalone services require manual restart."}`
        : `保存 setting.yaml？受影响服务：${services}。${preview.managed ? "自动重启本次管理的服务，相关网页、视频或 SSH 连接可能中断。" : "独立启动的服务需手动重启。"}`)) return;
      const result = await request("save", { settings, version, confirmed: true });
      setVersion(result.version); setDraft(JSON.stringify(result.settings, null, 2));
      setEffective(result.effective);
      setMessage(en ? `${result.message} Refresh the page after restart; use the new address if ports changed.` : (!result.affected.length ? "配置已保存，当前生效参数无需重启。可查看下方包含环境变量覆盖的实际配置。" : result.restarting ? "配置已保存，正在重启受影响服务。重启后刷新网页，端口变化后请使用新地址。检查服务状态确认结果。" : "配置已保存。请手动重启受影响的独立服务，然后刷新网页。"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setBusy(false); }
  };
  return <section className="settings-section">
    <h2>{en ? "Project runtime settings" : "项目运行设置"}</h2>
    <p className="settings-hint">{en ? "Edit validated JSON below. The server saves setting.yaml with a backup. Environment variables and startup arguments can override these values." : "以 JSON 编辑合法配置，服务端保存为 setting.yaml 并备份。环境变量及启动参数可覆盖这里的值。"}</p>
    {version && <>
      <Field label={en ? "Video encoder" : "视频编码器"}>
        <Select value={(() => { try { return JSON.parse(draft).services.video.encoder; } catch { return ""; } })()}
          disabled={busy} onChange={(event) => {
            try { const value = JSON.parse(draft); value.services.video.encoder = event.target.value; setDraft(JSON.stringify(value, null, 2)); }
            catch { setError(en ? "Correct the JSON before selecting an encoder." : "请先修正 JSON，再选择编码器。"); }
          }}>
          <option value="auto">{en ? "Automatic (hardware, then x264)" : "自动（优先硬编码，失败回退 x264）"}</option>
          <option value="intel">Intel VA-API</option>
          <option value="x264">{en ? "Software (x264)" : "软件编码（x264）"}</option>
          <option value="nvidia" disabled>{en ? "NVIDIA (not supported yet)" : "NVIDIA（暂未支持）"}</option>
        </Select>
      </Field>
      <p className="settings-hint">{en ? "Intel mode also falls back to x264. Save to apply; externally loaded components require manual reload. Image settings show the actual encoder." : "Intel 模式失败时也会回退 x264。保存后应用；外部容器中的组件需手动重载。实际编码器及回退原因可在图像设置中查看。"}</p>
      <label><span>{en ? "Runtime configuration (JSON)" : "运行配置（JSON）"}</span>
        <textarea className="rv-textarea" aria-label={en ? "Runtime configuration (JSON)" : "运行配置（JSON）"} value={draft} onChange={(event) => setDraft(event.target.value)} rows={24} spellCheck={false}
          style={{ width: "100%", fontFamily: "var(--mono)", fontSize: "var(--fs-ui)" }} />
      </label>
      <Toolbar><Button disabled={busy} onClick={() => void save()}>{en ? "Save and apply" : "保存并应用"}</Button>
        <Button disabled={busy} onClick={() => void request().then((value) => setStatus(value.status)).catch((cause) => setError(String(cause)))}>{en ? "Check service status" : "检查服务状态"}</Button>
        <Button disabled={busy} onClick={() => {
          if (window.confirm(en ? "Discard edits and reload settings?" : "丢弃未保存的修改并重新读取配置？")) void request().then((value) => {
            setDraft(JSON.stringify(value.settings, null, 2)); setVersion(value.version); setStatus(value.status); setEffective(value.effective); setError("");
          }).catch((cause) => setError(String(cause)));
        }}>{en ? "Reload" : "重新读取"}</Button></Toolbar>
    </>}
    {message && <Notice>{message}</Notice>}
    {error && <Notice tone="error">{error}</Notice>}
    {!!status && <pre aria-live="polite">{JSON.stringify(status, null, 2)}</pre>}
    {!!effective && <details><summary>{en ? "Effective configuration (environment overrides applied)" : "实际生效配置（含环境变量覆盖）"}</summary><pre>{JSON.stringify(effective, null, 2)}</pre></details>}
  </section>;
}
