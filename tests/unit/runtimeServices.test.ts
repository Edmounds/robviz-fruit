import { afterEach, expect, it, vi } from "vitest";
import { configureRuntimeServices, CORE_NETWORK_SERVICES, createDefaultSession, getDefaultMediaUrl, resolveServiceUrl } from "../../src/core/appConfig";

afterEach(() => vi.unstubAllGlobals());

it("resolves managed services on the web host while retaining explicit machine overrides", () => {
  vi.stubGlobal("window", { location: { hostname: "dashboard.local", origin: "http://dashboard.local:5173" } });
  configureRuntimeServices({
    terminal: { host: "10.1.2.3", port: 9877, allow_lan: true },
    video: { host: "0.0.0.0", port: 9878 }, files: { port: 9879, proxy: true },
  });
  const session = createDefaultSession("test", "Test"); session.url = "ws://robot.local:8765";
  const service = (id: string) => CORE_NETWORK_SERVICES.find((value) => value.id === id)!;
  expect(resolveServiceUrl(service("terminal"), session)).toBe("ws://10.1.2.3:9877");
  expect(resolveServiceUrl(service("video"), session)).toBe("ws://dashboard.local:9878");
  expect(resolveServiceUrl(service("web"), session)).toBe("http://dashboard.local:5173");
  expect(getDefaultMediaUrl(session.url)).toBe("ws://dashboard.local:9878/ws");
  session.networkOverrides.video = { host: "camera.local", port: 9988 };
  expect(resolveServiceUrl(service("video"), session)).toBe("ws://camera.local:9988");
  session.networkOverrides.terminal = { url: "wss://terminal.local/socket" };
  expect(resolveServiceUrl(service("terminal"), session)).toBe("wss://terminal.local/socket");
});

it("formats a configured IPv6 video gateway, including without a usable bridge URL", () => {
  vi.stubGlobal("window", { location: { hostname: "dashboard.local", origin: "http://dashboard.local:5173" } });
  configureRuntimeServices({
    terminal: { host: "::1", port: 9877, allow_lan: false },
    video: { host: "fd00::2", port: 9878 }, files: { port: 9879, proxy: true },
  });
  expect(getDefaultMediaUrl("not a URL")).toBe("ws://[fd00::2]:9878/ws");
  const session = createDefaultSession("test", "Test");
  expect(resolveServiceUrl(CORE_NETWORK_SERVICES.find((value) => value.id === "video")!, session)).toBe("ws://[fd00::2]:9878");
});
