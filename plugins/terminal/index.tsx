import type { RobvizPlugin } from "@robviz/core";
import { TerminalPanel } from "./TerminalPanel";
import { ToolbarTool } from "./ToolbarTool";

const plugin: RobvizPlugin = {
  id: "terminal",
  name: "终端 (Terminal)",
  toolbarTools: [{ id: "terminal", component: ToolbarTool }],
  panels: [
    {
      kind: "terminal",
      title: (ctx) => (ctx.locale === "en" ? "Terminal" : "终端"),
      component: TerminalPanel,
    },
  ],
  services: [
    {
      id: "terminal",
      label: "Web 终端服务",
      defaultPort: 8767,
      protocol: "ws",
      description: "浏览器在线远程 Shell 终端",
    },
  ],
};

export default plugin;
export { TerminalPanel };
