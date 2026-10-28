import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer, PreviewServer } from "vite";
import { affectedServices, projectSettingsSchema } from "../src/core/projectSettings.ts";
import { allowedRequest } from "./network-policy.ts";
import { effectiveSettings, listenHost, readSettings, saveSettings } from "./project-settings.ts";

export function projectSettingsPlugin(): Plugin {
  const managed = !!process.send && process.env.ROBVIZ_STACK_STATUS !== undefined;
  let status: unknown = JSON.parse(process.env.ROBVIZ_STACK_STATUS || "null");
  let pending = process.env.ROBVIZ_STACK_BUSY === "1";
  const message = (value: unknown) => {
    if (value && typeof value === "object" && "type" in value && value.type === "stack-status" && "status" in value) {
      status = value.status;
      pending = "busy" in value && value.busy === true;
    }
  };
  process.on("message", message);

  const handle = async (req: IncomingMessage, res: ServerResponse) => {
    const send = (code: number, value: unknown) => {
      res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      res.end(JSON.stringify(value));
    };
    try {
      const current = readSettings();
      const effective = effectiveSettings(current.settings);
      if (!allowedRequest(req, effective.network.allow_lan, undefined, effective.network.allowed_hosts, effective.network.allowed_origins)) return send(403, { error: "Private-network, same-origin access required" });
      const path = new URL(req.url || "/", "http://localhost").pathname;
      if (req.method === "GET" && path === "/runtime") return send(200, {
        terminal: {
          host: listenHost(effective, effective.services.terminal.host, effective.services.terminal.allow_lan),
          port: effective.services.terminal.port, allow_lan: effective.network.allow_lan && effective.services.terminal.allow_lan,
        },
        video: { host: listenHost(effective, effective.services.video.host), port: effective.services.video.port }, files: { port: effective.services.files.port, proxy: true },
      });
      if (req.method === "GET" && path === "/") return send(200, { ...current, effective, status, pending, managed });
      if (req.method !== "POST" || !["/preview", "/save"].includes(path)) return send(405, { error: "Expected GET or JSON POST" });
      if (req.headers["content-type"] !== "application/json" || req.headers["transfer-encoding"]) return send(415, { error: "Expected bounded application/json" });
      if (pending) return send(409, { error: "Services are restarting; reload before saving" });
      req.setTimeout(10_000, () => req.destroy());
      let text = "";
      for await (const chunk of req) {
        text += chunk.toString();
        if (Buffer.byteLength(text) > 65536) return send(413, { error: "Settings exceed 64 KiB" });
      }
      const body = JSON.parse(text);
      if (body.version !== current.version) return send(409, { error: "Settings changed; reload before saving" });
      // effectiveSettings validates the complete schema and active environment overrides.
      const next = effectiveSettings(projectSettingsSchema.parse(body.settings));
      const affected = affectedServices(effective, next);
      if (path === "/preview") return send(200, { affected, managed });
      if (body.confirmed !== true) return send(400, { error: "Confirm affected service restarts before saving" });
      const saved = await saveSettings(body.settings, body.version);
      if (managed && affected.length) {
        pending = true;
        res.once("finish", () => process.send?.({ type: "settings-saved" }));
      }
      send(200, { ...saved, effective: next, affected, restarting: managed && affected.length > 0,
        message: !affected.length ? "Saved. No effective service changes." : managed ? "Saved. Managed affected services will restart." : "Saved. Restart the affected standalone services manually." });
    } catch (error) { send(400, { error: error instanceof Error ? error.message : String(error) }); }
  };
  const configure = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
      try {
        const settings = effectiveSettings();
        const write = !["GET", "HEAD", "OPTIONS"].includes(req.method || "");
        const path = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
        const api = path === `${server.config.base}api` || path.startsWith(`${server.config.base}api/`);
        const allowLan = settings.network.allow_lan && (!api || !write || settings.services.files.allow_lan_writes);
        if (!allowedRequest(req, allowLan, undefined, settings.network.allowed_hosts, settings.network.allowed_origins)) { res.writeHead(403); res.end("Private-network, same-origin access required"); return; }
        next();
      } catch (error) {
        res.writeHead(error instanceof URIError ? 400 : 503);
        res.end(error instanceof URIError ? "Invalid request path" : "Invalid project settings. Correct setting.yaml and restart.");
      }
    });
    server.middlewares.use(`${server.config.base}project-settings`, (req: IncomingMessage, res: ServerResponse) => { void handle(req, res); });
  };
  return {
    name: "robviz-project-settings",
    configureServer: configure,
    configurePreviewServer: configure,
    closeBundle() { process.off("message", message); },
  };
}
