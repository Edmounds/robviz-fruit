import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { createServer, createConnection } from "node:net";
import { delimiter, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { affectedServices, projectSettingsSchema, type ManagedService, type ProjectSettings } from "../src/core/projectSettings.ts";

const { values } = parseArgs({ options: {
  config: { type: "string" }, host: { type: "string" }, port: { type: "string" }, preview: { type: "boolean", default: false },
} });
if (values.config) process.env.ROBVIZ_SETTINGS_FILE = resolve(values.config);
const { effectiveSettings, readSettings, listenHost, PROJECT_ROOT, SETTINGS_FILE } = await import("./project-settings.ts");
let current = effectiveSettings();
const children = new Map<ManagedService, ChildProcess>();
const status: Partial<Record<ManagedService, { state: string; error?: string }>> = {};
let closing = false;
let reconfiguring = false;
const order: ManagedService[] = ["files", "video", "terminal", "web"];

function configWithArguments(settings: ProjectSettings): ProjectSettings {
  const next = structuredClone(settings);
  if (values.host) next.web.host = values.host;
  if (values.port) {
    const port = Number(values.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid --port");
    if (values.preview) next.web.preview_port = port; else next.web.port = port;
  }
  return projectSettingsSchema.parse(next);
}

function endpoint(name: ManagedService, settings: ProjectSettings): [string, number] {
  if (name === "web") return [listenHost(settings, settings.web.host), values.preview ? settings.web.preview_port : settings.web.port];
  const service = settings.services[name];
  return [listenHost(settings, service.host, name !== "terminal" || settings.services.terminal.allow_lan), service.port];
}

async function available(host: string, port: number) {
  const probe = createServer();
  await new Promise<void>((accept, reject) => { probe.once("error", reject); probe.listen(port, host, () => accept()); });
  await new Promise<void>((accept, reject) => probe.close((error) => error ? reject(error) : accept()));
}

function broadcast() {
  const web = children.get("web");
  if (web?.connected) web.send({ type: "stack-status", status, busy: reconfiguring });
}

async function stop(name: ManagedService) {
  const child = children.get(name);
  if (!child) return;
  children.delete(name);
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, "exit");
  child.kill("SIGINT");
  const timer = setTimeout(() => child.kill("SIGKILL"), 3000);
  try { await exited; } finally { clearTimeout(timer); }
}

async function start(name: ManagedService, settings: ProjectSettings) {
  if (name !== "web" && !settings.services[name].enabled) { status[name] = { state: "disabled" }; return; }
  const [host, port] = endpoint(name, settings);
  await available(host, port); // Never adopt or kill an external listener.
  const env: NodeJS.ProcessEnv = { ...process.env, ROBVIZ_SETTINGS_FILE: SETTINGS_FILE, ROBVIZ_START_TERMINAL: "0", ROBVIZ_STACK_STATUS: JSON.stringify(status), ROBVIZ_STACK_BUSY: reconfiguring ? "1" : "0",
    PYTHONPATH: [join(PROJECT_ROOT, "ros2/robviz_video_gateway"), join(PROJECT_ROOT, "ros2/robviz_web_server"), process.env.PYTHONPATH || ""].join(delimiter) };
  if (values.host) { env.ROBVIZ_HOST = values.host; env.ROBVIZ_WEB_HOST = values.host; }
  if (values.port) {
    if (values.preview) env.ROBVIZ_WEB_PREVIEW_PORT = values.port;
    else { env.ROBVIZ_WEB_PORT = values.port; env.ROBVIZ_PORT = values.port; }
  }
  let command = process.execPath;
  let args: string[];
  if (name === "web") args = [join(PROJECT_ROOT, "node_modules/vite/bin/vite.js"), ...(values.preview ? ["preview"] : []), "--host", host, "--port", String(port), "--strictPort"];
  else if (name === "terminal") args = ["--import", "tsx", join(PROJECT_ROOT, "terminal/server.ts")];
  else if (name === "video") {
    const prefix = execFileSync("ros2", ["pkg", "prefix", "robviz_video_gateway"], { env, encoding: "utf8", timeout: 5000 }).trim();
    command = join(prefix, "lib/robviz_video_gateway/gateway_node");
    args = [];
  } else {
    command = "/usr/bin/python3";
    args = ["-m", "robviz_web_server.web_server_node"];
  }
  status[name] = { state: "starting" };
  const child = spawn(command, args, { cwd: PROJECT_ROOT, env, stdio: ["ignore", "inherit", "inherit", "ipc"] });
  children.set(name, child);
  child.on("error", (error) => { status[name] = { state: "failed", error: error.message }; broadcast(); });
  child.on("exit", (code, signal) => {
    if (children.get(name) !== child) return;
    children.delete(name);
    status[name] = { state: "failed", error: `Exited (${code ?? signal})` };
    console.error(`[stack] ${name}: ${status[name]?.error}`); broadcast();
  });
  if (name === "web") child.on("message", (message) => {
    if (message && typeof message === "object" && "type" in message && message.type === "settings-saved") void reconfigure();
  });
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null || !children.has(name)) throw new Error(`${name} exited before listening`);
    const listening = await new Promise<boolean>((accept) => {
      const socket = createConnection({ host: host === "0.0.0.0" ? "127.0.0.1" : host === "::" ? "::1" : host, port });
      socket.setTimeout(200);
      socket.once("connect", () => { socket.destroy(); accept(true); });
      socket.once("error", () => { socket.destroy(); accept(false); });
      socket.once("timeout", () => { socket.destroy(); accept(false); });
    });
    if (listening) { status[name] = { state: "running" }; console.info(`[stack] ${name} listening on ${host}:${port}`); broadcast(); return; }
    await new Promise((accept) => setTimeout(accept, 100));
  }
  throw new Error(`${name} did not listen within 10 seconds`);
}

async function reconfigure() {
  if (closing || reconfiguring) return;
  reconfiguring = true;
  broadcast();
  try {
    const next = configWithArguments(effectiveSettings(readSettings().settings));
    const affected = affectedServices(current, next);
    current = next; // Keep the new configuration, including when a restart fails.
    for (const name of affected) { status[name] = { state: "restarting" }; await stop(name); }
    for (const name of order.filter((name) => affected.includes(name))) {
      try { await start(name, next); }
      catch (error) {
        await stop(name);
        status[name] = { state: "failed", error: error instanceof Error ? error.message : String(error) };
        console.error(`[stack] ${name} failed; new settings retained: ${status[name]?.error}`);
      }
    }
  } catch (error) { console.error("[stack] Reconfiguration failed:", error); }
  finally { reconfiguring = false; broadcast(); }
}

async function shutdown(code: number) {
  if (closing) return;
  closing = true;
  for (const name of [...order].reverse()) await stop(name);
  process.exit(code);
}
process.once("SIGINT", () => { void shutdown(0); });
process.once("SIGTERM", () => { void shutdown(0); });
try {
  current = configWithArguments(current);
  // Preflight every enabled listener before starting any child.
  for (const name of order) if (name === "web" || current.services[name].enabled) await available(...endpoint(name, current));
  for (const name of order) await start(name, current);
  console.info("[stack] Ready. Ctrl-C stops only these managed services.");
} catch (error) {
  console.error("[stack] Startup failed:", error instanceof Error ? error.message : String(error));
  await shutdown(1);
}
