import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { IncomingMessage } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { stringify } from "yaml";
import { affectedServices } from "../../src/core/projectSettings";
import { allowedRequest, isPrivateAddress } from "../../scripts/network-policy";
import { effectiveSettings, parseSettings, readSettings, saveSettings, settingsPath } from "../../scripts/project-settings";

const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true }))); });
function request(peer: string, host: string, origin?: string): IncomingMessage {
  return { socket: { remoteAddress: peer }, headers: { host, origin } } as IncomingMessage;
}

describe("private-network protocol boundary", () => {
  it("accepts only loopback and real private IPv4/IPv6 addresses", () => {
    for (const address of ["127.0.0.2", "::1", "10.0.0.1", "172.16.0.1", "192.168.1.3", "169.254.1.1", "::ffff:192.168.1.3", "fd00::1", "fe90::1"]) expect(isPrivateAddress(address), address).toBe(true);
    for (const address of ["8.8.8.8", "172.32.0.1", "198.18.0.1", "192.0.2.1", "2001:4860::1", "localhost", "garbage"]) expect(isPrivateAddress(address), address).toBe(false);
  });
  it("checks the peer even when Host and Origin look private", () => {
    expect(allowedRequest(request("192.168.1.5", "192.168.1.2:5173", "http://192.168.1.2:5173"), true)).toBe(true);
    expect(allowedRequest(request("8.8.8.8", "192.168.1.2:5173", "http://192.168.1.2:5173"), true)).toBe(false);
    expect(allowedRequest(request("192.168.1.5", "192.168.1.2:5173"), false)).toBe(false);
    expect(allowedRequest(request("127.0.0.1", "localhost:5173", "https://evil.example"), true)).toBe(false);
    expect(allowedRequest(request("192.168.1.5", "192.168.1.2:5173", "http://192.168.1.9:5173"), true)).toBe(false);
  });
  it("allows a companion websocket only from configured page ports on the same host", () => {
    const req = request("192.168.1.5", "192.168.1.2:8767", "http://192.168.1.2:5173");
    expect(allowedRequest(req, true, [5173])).toBe(true);
    expect(allowedRequest(req, true, [4173])).toBe(false);
  });
  it("accepts a canonical default HTTP port and rejects malformed authorities", () => {
    expect(allowedRequest(request("127.0.0.1", "localhost:80", "http://localhost"), false)).toBe(true);
    for (const host of ["user@127.0.0.1", "127.0.0.1/", "127.0.0.1?x", "127.0.0.1\\evil"]) {
      expect(allowedRequest(request("127.0.0.1", host), true), host).toBe(false);
    }
    expect(allowedRequest(request("8.8.8.8", "robot.example", "https://trusted.example"), true, undefined, ["robot.example"], ["https://trusted.example"])).toBe(false);
  });
});

describe("project settings document protocol", () => {
  it("validates encoder choices and migrates legacy hardware preference", () => {
    const base = readSettings().settings;
    expect(base.services.video.encoder).toBe("auto");
    expect(effectiveSettings(base, { ROBVIZ_SERVICES_VIDEO_ENCODER: "intel" }).services.video.encoder).toBe("intel");
    expect(() => effectiveSettings(base, { ROBVIZ_SERVICES_VIDEO_ENCODER: "nvidia" })).toThrow();
    const legacy = JSON.parse(JSON.stringify(base));
    delete legacy.services.video.encoder;
    legacy.services.video.prefer_hardware = false;
    expect(parseSettings(stringify(legacy)).services.video.encoder).toBe("x264");
    legacy.services.video.prefer_hardware = true;
    expect(parseSettings(stringify(legacy)).services.video.encoder).toBe("auto");
    legacy.services.video.prefer_hardware = "false";
    expect(() => parseSettings(stringify(legacy))).toThrow();
    const invalid = structuredClone(base);
    (invalid.services.video as Record<string, unknown>).encoder = null;
    expect(() => parseSettings(stringify(invalid))).toThrow();
  });
  it("uses YAML defaults and validated environment overrides", () => {
    const base = readSettings().settings;
    expect(base.network.allow_lan).toBe(true);
    expect(effectiveSettings(base, { ROBVIZ_SERVICES_VIDEO_PORT: "9876", ROBVIZ_ALLOW_REMOTE_PLUGIN_MGMT: "0" }).services.video.port).toBe(9876);
    expect(effectiveSettings(base, { ROBVIZ_ALLOW_REMOTE_PLUGIN_MGMT: "0" }).plugins.allow_lan_writes).toBe(false);
    expect(() => effectiveSettings(base, { ROBVIZ_SERVICES_VIDEO_PORT: "NaN" })).toThrow();
    expect(() => effectiveSettings(base, { ROBVIZ_ALLOW_LAN: "yes" })).toThrow();
    expect(settingsPath("data/captures", "/tmp/deploy/setting.yaml")).toBe("/tmp/deploy/data/captures");
  });
  it("rejects unknown keys, duplicate YAML keys, aliases, duplicate ports and invalid bitrate ordering", () => {
    const base = readSettings().settings;
    expect(() => parseSettings(stringify({ ...base, password: "not-permitted" }))).toThrow();
    expect(() => parseSettings(stringify(base) + "version: 1\n")).toThrow();
    expect(() => parseSettings("version: 1\nx: &x []\ny: *x")).toThrow();
    const invalid = structuredClone(base);
    invalid.services.video.port = invalid.services.files.port;
    expect(() => parseSettings(stringify(invalid))).toThrow();
    invalid.services.video.port = 9876;
    invalid.services.video.min_bitrate_kbps = 2000;
    expect(() => parseSettings(stringify(invalid))).toThrow();
  });
  it("identifies dependent service restarts without restarting unrelated services", () => {
    const before = readSettings().settings;
    const next = structuredClone(before);
    next.services.video.capture_output_dir = "data/new-captures";
    expect(affectedServices(before, next)).toEqual(["video"]);
    next.services.files.data_dir = "data/new-files";
    expect(affectedServices(before, next)).toEqual(["files", "video"]);
  });
  it("backs up and saves atomically, rejects stale versions and symlink settings", async () => {
    const root = await mkdtemp(join(tmpdir(), "robviz-settings-")); directories.push(root);
    const file = join(root, "setting.yaml");
    const original = stringify(readSettings().settings);
    await writeFile(file, original);
    const before = readSettings(file);
    const next = structuredClone(before.settings); next.plugins.allow_lan_writes = false;
    const saved = await saveSettings(next, before.version, file);
    expect(await readFile(saved.backup, "utf8")).toBe(original);
    expect(saved.settings.plugins.allow_lan_writes).toBe(false);
    await expect(saveSettings(before.settings, before.version, file)).rejects.toThrow("Settings changed");
    expect(readSettings(file).version).toBe(saved.version);
    const link = join(root, "link.yaml"); await symlink(file, link);
    expect(() => readSettings(link)).toThrow("regular file");
  });
});
