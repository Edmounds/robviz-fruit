import { createHash, randomUUID } from "node:crypto";
import { readFileSync, lstatSync } from "node:fs";
import { open, rename, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument, stringify } from "yaml";
import { projectSettingsSchema, type ProjectSettings } from "../src/core/projectSettings.ts";
import { withPluginLock } from "./file-lock.ts";

export const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
export const SETTINGS_FILE = resolve(process.env.ROBVIZ_SETTINGS_FILE || resolve(PROJECT_ROOT, "setting.yaml"));
export function settingsPath(path: string, file = SETTINGS_FILE): string { return resolve(dirname(file), path); }

export function parseSettings(text: string): ProjectSettings {
  if (Buffer.byteLength(text) > 65536) throw new Error("Settings exceed 64 KiB");
  const document = parseDocument(text, { uniqueKeys: true });
  if (document.errors.length) throw new Error(document.errors[0].message);
  return projectSettingsSchema.parse(document.toJS({ maxAliasCount: 0 }));
}

export function readSettings(file = SETTINGS_FILE) {
  const info = lstatSync(file);
  if (!info.isFile() || info.isSymbolicLink() || info.size > 65536) throw new Error("Settings must be a regular file, at most 64 KiB");
  const text = readFileSync(file, "utf8");
  return { settings: parseSettings(text), version: createHash("sha256").update(text).digest("hex") };
}

export function effectiveSettings(value = readSettings().settings, env = process.env): ProjectSettings {
  const settings = structuredClone(value);
  const override = (record: Record<string, unknown>, prefix: string) => {
    for (const [key, value] of Object.entries(record)) {
      const name = `${prefix}_${key.toUpperCase()}`;
      if (Array.isArray(value)) {
        if (env[name] !== undefined) record[key] = JSON.parse(env[name]!);
      } else if (value && typeof value === "object") override(value as Record<string, unknown>, name);
      else if (env[name] !== undefined) {
        const raw = env[name]!;
        if (typeof value === "boolean") {
          if (!["0", "1", "true", "false"].includes(raw)) throw new Error(`Invalid ${name}`);
          record[key] = raw === "true" || raw === "1";
        } else record[key] = typeof value === "number" ? Number(raw) : raw;
      }
    }
  };
  override(settings as unknown as Record<string, unknown>, "ROBVIZ");
  const boolean = (name: string, fallback: boolean) => {
    const value = env[name];
    if (value === undefined) return fallback;
    if (!["0", "1", "true", "false"].includes(value)) throw new Error(`Invalid ${name}`);
    return value === "1" || value === "true";
  };
  const number = (name: string, fallback: number) => env[name] === undefined ? fallback : Number(env[name]);
  settings.network.allow_lan = boolean("ROBVIZ_ALLOW_LAN", settings.network.allow_lan);
  settings.web.host = env.ROBVIZ_HOST ?? settings.web.host;
  settings.web.port = number("ROBVIZ_PORT", settings.web.port);
  settings.plugins.directory = env.ROBVIZ_PLUGIN_DIR ?? settings.plugins.directory;
  settings.plugins.allow_lan_writes = boolean("ROBVIZ_ALLOW_REMOTE_PLUGIN_MGMT", settings.plugins.allow_lan_writes);
  settings.plugins.repository = env.ROBVIZ_PLUGIN_REPO ?? settings.plugins.repository;
  settings.plugins.ref = env.ROBVIZ_PLUGIN_REF ?? settings.plugins.ref;
  settings.plugins.release = env.ROBVIZ_PLUGIN_RELEASE ?? settings.plugins.release;
  settings.services.terminal.port = number("ROBVIZ_TERMINAL_GATEWAY_PORT", settings.services.terminal.port);
  return projectSettingsSchema.parse(settings);
}

export function listenHost(settings: ProjectSettings, host: string, allowLan = true): string {
  return settings.network.allow_lan && allowLan ? host : "127.0.0.1";
}

let saving = false;
export async function saveSettings(settings: unknown, version: string, file = SETTINGS_FILE) {
  return withPluginLock(dirname(file), async () => saveLockedSettings(settings, version, file));
}

async function saveLockedSettings(settings: unknown, version: string, file: string) {
  if (saving) throw new Error("Settings are being saved; reload before saving");
  saving = true;
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    const value = projectSettingsSchema.parse(settings);
    const previous = readSettings(file);
    if (previous.version !== version) throw new Error("Settings changed; reload before saving");
    const backup = `${file}.${Date.now()}-${randomUUID()}.bak`;
    const original = await open(backup, "wx", 0o600);
    try { await original.writeFile(readFileSync(file)); await original.sync(); } finally { await original.close(); }
    const output = await open(temporary, "wx", 0o600);
    try { await output.writeFile(stringify(value)); await output.sync(); } finally { await output.close(); }
    if (readSettings(file).version !== version) throw new Error("Settings changed; reload before saving");
    await rename(temporary, file);
    const directory = await open(dirname(file), "r");
    try { await directory.sync(); } finally { await directory.close(); }
    return { ...readSettings(file), backup };
  } finally { saving = false; await rm(temporary, { force: true }); }
}
