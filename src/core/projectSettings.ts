import { z } from "zod";

const port = z.number().int().min(1).max(65535);
const path = z.string().min(1).max(4096).refine((value) => [...value].every((char) => char.charCodeAt(0) >= 32), "Invalid path");
const host = z.string().min(1).max(253).regex(/^[a-zA-Z0-9.:-]+$/);
const service = { enabled: z.boolean(), host, port };

export const projectSettingsSchema = z.object({
  version: z.literal(1),
  network: z.object({
    allow_lan: z.boolean(),
    allowed_hosts: z.array(z.string().min(1).max(253).regex(/^[a-zA-Z0-9.:[\]-]+$/)).max(64),
    allowed_origins: z.array(z.string().url().refine((value) => {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && url.origin === value;
    }, "Expected an exact HTTP(S) Origin")).max(64),
  }).strict(),
  web: z.object({ host, port, preview_port: port }).strict(),
  plugins: z.object({
    directory: path,
    allow_lan_writes: z.boolean(),
    repository: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),
    ref: z.string().regex(/^(?:[a-f0-9]{40})?$/),
    release: z.string().regex(/^[A-Za-z0-9_.-]{0,80}$/),
  }).strict(),
  services: z.object({
    files: z.object({ ...service, data_dir: path, allow_lan_writes: z.boolean() }).strict(),
    video: z.object({
      ...service,
      capture_topic: z.string().max(255).regex(/^(?:\/(?:[A-Za-z_][A-Za-z0-9_]*)(?:\/[A-Za-z_][A-Za-z0-9_]*)*)?$/),
      capture_output_dir: path,
      allow_lan_capture: z.boolean(),
      prefer_hardware: z.boolean(),
      default_target_fps: z.number().min(1).max(60),
      min_bitrate_kbps: z.number().int().min(1).max(1000000),
      start_bitrate_kbps: z.number().int().min(1).max(1000000),
      max_bitrate_kbps: z.number().int().min(1).max(1000000),
    }).strict(),
    terminal: z.object({ ...service, allow_lan: z.boolean() }).strict(),
  }).strict(),
}).strict().superRefine((settings, ctx) => {
  const video = settings.services.video;
  if (video.min_bitrate_kbps > video.start_bitrate_kbps || video.start_bitrate_kbps > video.max_bitrate_kbps) {
    ctx.addIssue({ code: "custom", path: ["services", "video", "start_bitrate_kbps"], message: "Require min <= start <= max bitrate" });
  }
  const ports = [settings.web.port, ...Object.values(settings.services).filter((value) => value.enabled).map((value) => value.port)];
  if (new Set(ports).size !== ports.length) {
    ctx.addIssue({ code: "custom", path: ["services"], message: "Enabled services must use distinct ports" });
  }
});

export type ProjectSettings = z.infer<typeof projectSettingsSchema>;
export type ManagedService = "web" | "files" | "video" | "terminal";

export function affectedServices(before: ProjectSettings, after: ProjectSettings): ManagedService[] {
  const changed = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b);
  const networkChanged = changed(before.network, after.network);
  const pagePortsChanged = before.web.port !== after.web.port || before.web.preview_port !== after.web.preview_port;
  const result: ManagedService[] = [];
  if (networkChanged || changed(before.web, after.web) || changed(before.plugins, after.plugins)
    || before.services.files.port !== after.services.files.port || before.services.files.host !== after.services.files.host) result.push("web");
  if (networkChanged || changed(before.services.files, after.services.files)) result.push("files");
  if (networkChanged || pagePortsChanged || changed(before.services.video, after.services.video)
    || before.services.files.data_dir !== after.services.files.data_dir) result.push("video");
  if (networkChanged || pagePortsChanged || changed(before.services.terminal, after.services.terminal)) result.push("terminal");
  return result;
}
