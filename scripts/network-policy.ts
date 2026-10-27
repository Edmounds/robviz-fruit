import { isIP } from "node:net";
import type { IncomingMessage } from "node:http";

export function isLoopback(address: string): boolean {
  const value = address.replace(/^::ffff:/i, "").replace(/^\[|\]$/g, "");
  return value === "::1" || (isIP(value) === 4 && value.split(".")[0] === "127");
}

export function isPrivateAddress(address: string): boolean {
  const value = address.replace(/^::ffff:/i, "").replace(/^\[|\]$/g, "").toLowerCase();
  if (isLoopback(value)) return true;
  if (isIP(value) === 4) {
    const [a, b] = value.split(".").map(Number);
    return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254);
  }
  return isIP(value) === 6 && (/^f[cd]/.test(value) || /^fe[89ab]/.test(value));
}

/** Check the TCP peer, Host, and browser Origin. Never trust forwarded client headers. */
export function allowedRequest(req: IncomingMessage, allowLan: boolean, pagePorts?: number[], allowedHosts: string[] = [], allowedOrigins: string[] = []): boolean {
  const peer = req.socket.remoteAddress ?? "";
  if (!isLoopback(peer) && !(allowLan && isPrivateAddress(peer))) return false;
  try {
    const host = req.headers.host ?? "";
    if (!host || /[\\/\s@?#]/.test(host)) return false;
    const target = new URL(`http://${host}`);
    const hostname = target.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    if (target.username || target.password || (hostname !== "localhost" && !isPrivateAddress(hostname) && !hostname.endsWith(".local") && !allowedHosts.includes(hostname) && !allowedHosts.includes(req.headers.host || ""))) return false;
    const origin = req.headers.origin;
    if (!origin) return true;
    const parsed = new URL(origin);
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== origin) return false;
    if (allowedOrigins.includes(origin)) return true;
    if (parsed.host === target.host) return true;
    return !!pagePorts && parsed.hostname === target.hostname && pagePorts.includes(Number(parsed.port || (parsed.protocol === "https:" ? 443 : 80)));
  } catch { return false; }
}
