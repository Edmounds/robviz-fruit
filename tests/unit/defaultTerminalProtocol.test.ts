import { describe, expect, it } from "vitest";
import { parseTerminalTarget, terminalClientMessageSchema, validateTerminalUsername } from "../../plugins/terminal/protocol";

describe("default terminal plugin protocol", () => {
  it("extracts SSH hosts from WebSocket URLs", () => {
    expect(parseTerminalTarget("ws://192.168.1.42:8765")).toBe("192.168.1.42");
    expect(parseTerminalTarget("wss://robot.local/bridge")).toBe("robot.local");
    expect(parseTerminalTarget("ws://[2001:db8::42]:8765")).toBe("[2001:db8::42]");
  });
  it("rejects non-WebSocket bridge URLs", () => {
    for (const url of ["http://robot.local", "not-a-url", "ftp://robot.local"]) {
      expect(() => parseTerminalTarget(url)).toThrow("Foxglove WebSocket URL");
    }
  });
  it("rejects argument-like SSH usernames", () => {
    expect(validateTerminalUsername("robot-user_1")).toBe("robot-user_1");
    expect(() => validateTerminalUsername("-oProxyCommand=sh")).toThrow("SSH username");
    expect(() => validateTerminalUsername("robot@example.com")).toThrow("SSH username");
  });
  it("bounds terminal dimensions, input, and password messages", () => {
    const open = { type: "open", bridgeUrl: "ws://robot.local:8765", username: "robot", password: "secret", cols: 120, rows: 32 };
    expect(terminalClientMessageSchema.safeParse(open).success).toBe(true);
    expect(terminalClientMessageSchema.safeParse({ type: "resize", cols: 10_000, rows: 32 }).success).toBe(false);
    expect(terminalClientMessageSchema.safeParse({ type: "input", data: "x".repeat(65_537) }).success).toBe(false);
    expect(terminalClientMessageSchema.safeParse({ ...open, password: "line\nbreak" }).success).toBe(false);
  });
});
