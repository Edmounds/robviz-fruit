export interface ImageStreamSettings {
  transport: "webrtc" | "jpeg";
  bandwidth_mbps: number;
  max_fps: number;
  target_bitrate_mbps: number;
  quality: number;
  min_quality: number;
  auto_quality: boolean;
}
export interface ImageSettings {
  version: number;
  session: string;
  rgb: ImageStreamSettings;
  depth: ImageStreamSettings;
}
async function request<T>(path: string, method = "GET", settings?: ImageSettings): Promise<T> {
  const response = await fetch(path, { method, signal: AbortSignal.timeout(10_000),
    headers: settings ? { "Content-Type": "application/json" } : {}, body: settings ? JSON.stringify(settings) : undefined });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
  return payload;
}
export function fetchImageSettings() {
  return request<{ settings: ImageSettings; version: number }>("/api/image-settings");
}
export function applyImageSettings(settings: ImageSettings) {
  return request<{ applied: boolean; status: string; settings: ImageSettings; version: number }>("/api/image-settings", "PUT", settings);
}
export function saveImageSettingsDefaults(settings: ImageSettings) {
  return request<{ saved: boolean; status: string; backup: string | null; settings: ImageSettings; version: number }>("/api/image-settings/defaults", "POST", settings);
}
