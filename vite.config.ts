/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { runtimeInputs, sharedRuntimePlugin } from "./scripts/shared-runtime.ts";
import { pluginFilesPlugin } from "./scripts/plugin-files.ts";
import { effectiveSettings, listenHost } from "./scripts/project-settings.ts";
import { projectSettingsPlugin } from "./scripts/project-settings-api.ts";

import { startTerminalGateway, type TerminalGatewayHandle } from "./terminal/server.ts";

const settings = effectiveSettings();
const terminal = settings.services.terminal;
const fileHost = listenHost(settings, settings.services.files.host);
const fileTarget = fileHost === "0.0.0.0" ? "127.0.0.1" : fileHost === "::" ? "::1" : fileHost;
const apiTarget = `http://${fileTarget.includes(":") ? `[${fileTarget}]` : fileTarget}:${settings.services.files.port}`;
export function terminalGatewayPlugin(): Plugin {
  let gateway: TerminalGatewayHandle | undefined;

  const closeGateway = async (): Promise<void> => {
    const current = gateway;
    gateway = undefined;
    await current?.close();
  };

  return {
    name: "robviz-terminal-gateway",
    apply: "serve",
    async configureServer(server) {
      gateway = await startTerminalGateway({
        port: terminal.port, host: listenHost(settings, terminal.host, terminal.allow_lan),
        allowLan: settings.network.allow_lan && terminal.allow_lan,
        pagePorts: [settings.web.port, settings.web.preview_port],
        allowedHosts: settings.network.allowed_hosts, allowedOrigins: settings.network.allowed_origins,
      });
      server.config.logger.info(`RobViz terminal gateway listening on ${gateway.url}`);

      server.httpServer?.once("close", () => {
        void closeGateway();
      });
    },
    async closeBundle() {
      await closeGateway();
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/.worktrees/**", "dist/**"],
  },
  resolve: {
    alias: { "@robviz/core": new URL("./src/sdk/index.ts", import.meta.url).pathname },
  },
  plugins: [projectSettingsPlugin(), react(), process.env.ROBVIZ_START_TERMINAL === "1" && terminalGatewayPlugin(), sharedRuntimePlugin(), pluginFilesPlugin()],
  build: {
    rolldownOptions: {
      input: { app: "index.html", ...(process.env.ROBVIZ_RUNTIME_CHECK === "1" ? { "runtime-check": "runtime.html" } : {}), ...runtimeInputs },
      preserveEntrySignatures: "strict",
    },
  },
  server: {
    host: listenHost(settings, settings.web.host),
    port: settings.web.port,
    strictPort: true,
    allowedHosts: [".local", ...settings.network.allowed_hosts],
    fs: { deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/setting.yaml", "**/setting.yaml.*"] },
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: false,
      },
    },
  },
  preview: {
    host: listenHost(settings, settings.web.host),
    port: settings.web.preview_port,
    strictPort: true,
    allowedHosts: [".local", ...settings.network.allowed_hosts],
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: false,
      },
    },
  },
});
