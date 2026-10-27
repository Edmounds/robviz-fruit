import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SquareTerminal } from "lucide-react";
import { IconButton, type PluginToolProps } from "@robviz/core";
import { TerminalPanel } from "./TerminalPanel";

export function ToolbarTool({ ctx, bridgeUrl, fontScale, outlet }: PluginToolProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [height, setHeight] = useState(() => {
    const stored = Number(localStorage.getItem("robviz.terminal.height"));
    return Math.min(Math.max(160, Math.floor(window.innerHeight * .6)), Number.isFinite(stored) && stored >= 160 ? stored : 280);
  });
  const toggle = useCallback(() => { setMounted(true); setVisible((value) => !value); }, []);
  useEffect(() => {
    if (!ctx.active) { setVisible(false); setMounted(false); return; }
    const key = (event: KeyboardEvent) => {
      if (event.ctrlKey && !event.metaKey && !event.altKey && event.code === "Backquote") {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", key, { capture: true });
    return () => window.removeEventListener("keydown", key, { capture: true });
  }, [ctx.active, toggle]);
  useEffect(() => { localStorage.setItem("robviz.terminal.height", String(height)); }, [height]);
  const label = ctx.locale === "en" ? "Terminal" : "终端";
  return <>
    <IconButton label={label} aria-pressed={visible} onClick={toggle}><SquareTerminal /></IconButton>
    {mounted && outlet && createPortal(<TerminalPanel ctx={ctx} bridgeUrl={bridgeUrl} visible={visible}
      fontScale={fontScale} height={height} onHeightChange={setHeight} onHide={() => setVisible(false)} />, outlet)}
  </>;
}
