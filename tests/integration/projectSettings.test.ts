import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer, type Server } from "node:net";
import { networkInterfaces, tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { stringify } from "yaml";
import { WebSocket } from "ws";
import { readSettings } from "../../scripts/project-settings";
import { isPrivateAddress } from "../../scripts/network-policy";

let child: ChildProcess | undefined;
let root: string | undefined;
let blocker: Server | undefined;

async function port() {
  const server = createServer();
  await new Promise<void>((accept) => server.listen(0, "127.0.0.1", accept));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No test port");
  await new Promise<void>((accept) => server.close(() => accept()));
  return address.port;
}

async function waitFor<T>(read: () => Promise<T>, accept: (value: T) => boolean): Promise<T> {
  const deadline = Date.now() + 10000;
  let last: unknown;
  while (Date.now() < deadline) {
    try { const value = await read(); if (accept(value)) return value; } catch (error) { last = error; }
    await new Promise((accept) => setTimeout(accept, 100));
  }
  throw new Error(`Protocol condition timed out: ${String(last)}`);
}

afterEach(async () => {
  if (child && child.exitCode === null && child.signalCode === null) {
    const exit = once(child, "exit"); child.kill("SIGTERM");
    const timer = setTimeout(() => child?.kill("SIGKILL"), 10000);
    try { await exit; } finally { clearTimeout(timer); }
  }
  if (blocker) await new Promise<void>((accept) => blocker!.close(() => accept()));
  if (root) await rm(root, { recursive: true, force: true });
  child = undefined; root = undefined; blocker = undefined;
});

it("saves the configuration protocol, restarts affected owned services, and retains failed new settings", async () => {
  root = await mkdtemp(join(tmpdir(), "robviz-stack-"));
  const config = readSettings().settings;
  config.web.host = "0.0.0.0";
  config.web.port = await port();
  config.services.files.port = await port();
  config.services.terminal.host = "0.0.0.0";
  config.services.terminal.port = await port();
  config.services.video.enabled = false; // This check never starts ROS, a camera, or a robot connection.
  config.plugins.directory = join(process.cwd(), "plugins");
  const file = join(root, "setting.yaml");
  await writeFile(file, stringify(config));
  let output = "";
  child = spawn(process.execPath, ["--import", "tsx", "scripts/start-stack.ts", "--config", file], {
    env: { ...process.env }, stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout!.on("data", (value) => { output += value.toString(); });
  child.stderr!.on("data", (value) => { output += value.toString(); });
  let base = `http://127.0.0.1:${config.web.port}`;
  const snapshot = async () => {
    const response = await fetch(base + "/project-settings/", { signal: AbortSignal.timeout(1000) });
    if (!response.ok) throw new Error(`${response.status}: ${output}`);
    return response.json();
  };
  const started = await waitFor(snapshot, (value) => value.status?.web?.state === "running");
  expect(started.managed).toBe(true);
  expect(started.status.video.state).toBe("disabled");
  const forbidden = await fetch(base + "/project-settings/", { headers: { Origin: "https://evil.example" } });
  expect(forbidden.status).toBe(403);
  expect((await fetch(base + "/setting.yaml")).status).toBe(403);
  expect((await (await fetch(base + "/plugin-management/")).json()).writable).toBe(true);
  const lan = Object.values(networkInterfaces()).flat().find((value) => value && !value.internal && value.family === "IPv4" && isPrivateAddress(value.address))?.address;
  if (lan) {
    const lanBase = `http://${lan}:${config.web.port}`;
    expect((await (await fetch(lanBase + "/plugin-management/")).json()).writable).toBe(true);
    const settings = (await (await fetch(lanBase + "/api/image-settings")).json()).settings;
    expect((await fetch(lanBase + "/api/image-settings", { method: "PUT", headers: { "Content-Type": "application/json", Origin: lanBase }, body: JSON.stringify(settings) })).status).toBe(200);
    const ws = new WebSocket(`ws://${lan}:${config.services.terminal.port}`, { origin: lanBase });
    await once(ws, "open");
    const pong = once(ws, "pong"); ws.ping(); await pong; // No open command: never starts SSH.
    const closed = once(ws, "close"); ws.close(); await closed;
  }

  const image = await (await fetch(base + "/api/image-settings")).json();
  const next = structuredClone(started.settings);
  next.services.files.data_dir = "data/new-waypoints";
  next.services.files.allow_lan_writes = false;
  const post = (path: string, payload: object) => fetch(base + "/project-settings/" + path, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: base }, body: JSON.stringify(payload),
  });
  const preview = await (await post("preview", { settings: next, version: started.version })).json();
  expect(preview.affected).toEqual(["files", "video"]);
  expect((await post("save", { settings: next, version: started.version })).status).toBe(400);
  const result = await post("save", { settings: next, version: started.version, confirmed: true });
  expect(result.status).toBe(200);
  expect((await result.json()).restarting).toBe(true);
  const saved = await waitFor(snapshot, (value) => !value.pending && value.status.files.state === "running" && value.settings.services.files.data_dir === "data/new-waypoints");
  const imageAfter = await (await fetch(base + "/api/image-settings")).json();
  expect(imageAfter.settings.session).not.toBe(image.settings.session);
  if (lan) {
    const lanBase = `http://${lan}:${config.web.port}`;
    for (const route of ["/api/image-settings", "/api%2fimage-settings"]) {
      expect((await fetch(lanBase + route, { method: "PUT", headers: { "Content-Type": "application/json", Origin: lanBase }, body: JSON.stringify(imageAfter.settings) })).status).toBe(403);
    }
  }
  expect((await post("save", { settings: next, version: started.version, confirmed: true })).status).toBe(409);

  const occupied = await port();
  blocker = createServer();
  await new Promise<void>((accept) => blocker!.listen(occupied, "127.0.0.1", accept));
  const failed = structuredClone(saved.settings); failed.services.terminal.port = occupied;
  expect((await post("save", { settings: failed, version: saved.version, confirmed: true })).status).toBe(200);
  const failure = await waitFor(snapshot, (value) => !value.pending && value.status.terminal.state === "failed");
  expect(failure.status.web.state).toBe("running");
  expect(failure.status.files.state).toBe("running");
  expect(failure.settings.services.terminal.port).toBe(occupied);
  expect(readSettings(file).settings.services.terminal.port).toBe(occupied);
  expect(await readFile(file, "utf8")).toContain(String(occupied));
  expect(blocker.listening).toBe(true);
  await new Promise<void>((accept) => blocker!.close(() => accept())); blocker = undefined;
  const moved = structuredClone(failure.settings); moved.web.port = await port();
  expect((await post("save", { settings: moved, version: failure.version, confirmed: true })).status).toBe(200);
  base = `http://127.0.0.1:${moved.web.port}`;
  const restarted = await waitFor(snapshot, (value) => !value.pending && value.status.web.state === "running");
  expect(restarted.status.terminal.state).toBe("running");
  expect(restarted.settings.web.port).toBe(moved.web.port);
  expect((await (await fetch(base + "/project-settings/runtime")).json()).terminal.port).toBe(occupied);
}, 25000);

it("fails on an external port conflict without adopting or stopping that listener", async () => {
  root = await mkdtemp(join(tmpdir(), "robviz-stack-conflict-"));
  const config = readSettings().settings;
  const occupied = await port();
  config.web.port = occupied;
  config.web.host = "127.0.0.1";
  for (const service of Object.values(config.services)) service.enabled = false;
  const file = join(root, "setting.yaml"); await writeFile(file, stringify(config));
  blocker = createServer(); await new Promise<void>((accept) => blocker!.listen(occupied, "127.0.0.1", accept));
  child = spawn(process.execPath, ["--import", "tsx", "scripts/start-stack.ts", "--config", file], { stdio: "ignore" });
  const [code] = await once(child, "exit");
  expect(code).toBe(1);
  expect(blocker.listening).toBe(true);
}, 10000);
