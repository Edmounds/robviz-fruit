import { Eye, EyeOff, Pause, Play, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Select, TextInput, Toolbar, type PluginPanelProps, type RobvizPlugin } from "@robviz/core";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import "./plot.css";

import {
  computeRangeInWindow,
  computeSharedRange,
  panTimeWindow,
  relativeArrivalSec,
  seriesKey,
  zoomTimeWindow,
} from "./plotMath";

const WINDOW_SEC = 60;
const MAX_POINTS = 3000;
const PALETTE = ["#4ea1ff", "#ffb347", "#5ad469", "#ff6b81", "#c792ea", "#6be7dd"];

interface Series {
  id: number;
  topic: string;
  field: string;
  color: string;
  visible: boolean;
  ts: number[];
  vs: number[];
  latest?: number;
  status: "waiting" | "ok" | "invalid";
}

function getPath(obj: unknown, path: string): unknown {
  let current = obj;
  for (const key of path.split(".")) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

const FIELD_HINTS: Record<string, string[]> = {
  "nav_msgs/msg/Odometry": [
    "twist.twist.linear.x",
    "twist.twist.angular.z",
    "pose.pose.position.x",
    "pose.pose.position.y",
  ],
  "std_msgs/msg/Float32": ["data"],
  "sensor_msgs/msg/JointState": ["position.0", "position.1"],
};

export interface PlotSeriesConfig {
  topic: string;
  field: string;
  visible?: boolean;
}

const TEXTS = {
  "zh-CN": {
    chooseTopic: "选择话题...",
    fieldPath: "字段路径，如 twist.linear.x",
    add: "添加",
    resume: "继续实时",
    pause: "暂停",
    reset: "复位视角",
    clearAll: "清空",
    invalidField: "无效数值",
    waitingData: "等待数据...",
    hide: "隐藏",
    show: "显示",
    remove: "删除",
  },
  en: {
    chooseTopic: "Choose topic...",
    fieldPath: "Field path, e.g. twist.linear.x",
    add: "Add",
    resume: "Resume",
    pause: "Pause",
    reset: "Reset view",
    clearAll: "Clear all",
    invalidField: "Invalid number",
    waitingData: "Waiting for data...",
    hide: "Hide",
    show: "Show",
    remove: "Remove",
  },
};

export function PlotPanel({ ctx, state, onStateChange }: PluginPanelProps) {
  const { bridge, topics, theme = "dark", locale = "zh-CN" } = ctx;
  const isEn = locale === "en";
  const t = (key: keyof typeof TEXTS["zh-CN"]) => (isEn ? TEXTS.en[key] : TEXTS["zh-CN"][key]);

  const plotRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  const uplotRef = useRef<uPlot>(null);
  const seriesRef = useRef<Series[]>([]);
  const subscriptionsRef = useRef(new Map<string, () => void>());
  const startedAtRef = useRef(performance.now());
  const pausedRef = useRef(false);
  const themeRef = useRef(theme);
  const onStateChangeRef = useRef(onStateChange);
  const nextId = useRef(1);
  const manualWindowRef = useRef<[number, number] | null>(null);
  themeRef.current = theme;
  onStateChangeRef.current = onStateChange;

  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [newField, setNewField] = useState("");
  const [paused, setPaused] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [, setStatusTick] = useState(0);

  const commitSeries = useCallback((next: Series[]) => {
    seriesRef.current = next;
    setSeriesList(next);
  }, []);

  const ensureSubscription = useCallback(
    (topic: string) => {
      if (subscriptionsRef.current.has(topic)) return;
      const unsubscribe = bridge.subscribe(topic, (payload) => {
        if (payload.kind !== "raw") return;
        const now = relativeArrivalSec(performance.now(), startedAtRef.current);
        for (const series of seriesRef.current) {
          if (series.topic !== topic) continue;
          const raw = getPath(payload.message, series.field);
          if (typeof raw !== "number" && typeof raw !== "bigint") {
            series.status = "invalid";
            continue;
          }
          const value = Number(raw);
          if (!Number.isFinite(value)) {
            series.status = "invalid";
            continue;
          }
          series.status = "ok";
          series.latest = value;
          series.ts.push(now);
          series.vs.push(value);
          const cutoff = now - WINDOW_SEC;
          while (series.ts.length > MAX_POINTS || (series.ts[0] ?? now) < cutoff) {
            series.ts.shift();
            series.vs.shift();
          }
        }
      });
      subscriptionsRef.current.set(topic, unsubscribe);
    },
    [bridge],
  );

  const rebuild = useCallback(() => {
    uplotRef.current?.destroy();
    uplotRef.current = null;
    const element = plotRef.current;
    const current = seriesRef.current;
    if (!element || current.length === 0) return;
    const dark = themeRef.current === "dark";
    const axis = {
      stroke: dark ? "rgba(245,245,245,0.74)" : "rgba(10,10,10,0.74)",
      grid: { stroke: dark ? "rgba(245,245,245,0.14)" : "rgba(10,10,10,0.14)", width: 1 },
      ticks: { stroke: dark ? "rgba(245,245,245,0.36)" : "rgba(10,10,10,0.36)", width: 1 },
      font: "11px system-ui, -apple-system, sans-serif",
    };
    uplotRef.current = new uPlot(
      {
        width: element.clientWidth,
        height: Math.max(100, element.clientHeight - 4),
        series: [
          {},
          ...current.map((series) => ({
            label: `${series.topic}.${series.field}`,
            stroke: series.color,
            show: series.visible,
            width: 2,
            points: { show: false },
          })),
        ],
        axes: [axis, { ...axis }],
        legend: { show: true },
        cursor: { drag: { x: false, y: false } },
        scales: { x: { time: false, auto: false }, y: { auto: false } },
      },
      [[], ...current.map(() => [])] as uPlot.AlignedData,
      element,
    );
  }, []);

  const addEntry = useCallback(
    (config: PlotSeriesConfig) => {
      const topic = config.topic.trim();
      const field = config.field.trim();
      if (!topic || !field) return false;
      if (seriesRef.current.some((item) => seriesKey(item.topic, item.field) === seriesKey(topic, field))) {
        return false;
      }
      const id = nextId.current++;
      const next = [
        ...seriesRef.current,
        {
          id,
          topic,
          field,
          color: PALETTE[(id - 1) % PALETTE.length],
          visible: config.visible ?? true,
          ts: [],
          vs: [],
          status: "waiting" as const,
        },
      ];
      commitSeries(next);
      ensureSubscription(topic);
      queueMicrotask(rebuild);
      return true;
    },
    [commitSeries, ensureSubscription, rebuild],
  );

  useEffect(() => {
    const saved = state as { series?: PlotSeriesConfig[] } | undefined;
    for (const series of saved?.series ?? []) addEntry(series);
    // Initial state is intentionally restored once per panel instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onStateChangeRef.current?.({
      series: seriesList.map(({ topic, field, visible }) => ({
        topic,
        field,
        ...(visible ? {} : { visible }),
      })),
    });
  }, [seriesList]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      const plot = uplotRef.current;
      const current = seriesRef.current;
      if (!plot || current.length === 0) return;
      const joined = uPlot.join(current.map((s) => [s.ts, s.vs] as uPlot.AlignedData)) as uPlot.AlignedData;
      plot.setData(joined);

      const latest = current.reduce((max, series) => Math.max(max, series.ts.at(-1) ?? 0), 0);

      if (manualWindowRef.current !== null) {
        const [wMin, wMax] = manualWindowRef.current;
        plot.setScale("x", { min: wMin, max: wMax });
        const [min, max] = computeRangeInWindow(current, manualWindowRef.current);
        plot.setScale("y", { min, max });
      } else {
        plot.setScale("x", { min: Math.max(0, latest - WINDOW_SEC), max: Math.max(WINDOW_SEC, latest) });
        const visibleValues = current
          .filter((series) => series.visible)
          .map((series) => series.vs.filter((_, index) => (series.ts[index] ?? 0) >= latest - WINDOW_SEC));
        const [min, max] = computeSharedRange(visibleValues);
        plot.setScale("y", { min, max });
      }

      setStatusTick((value) => value + 1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const resetToRealtime = useCallback(() => {
    manualWindowRef.current = null;
    setIsManualMode(false);
    const plot = uplotRef.current;
    const current = seriesRef.current;
    if (plot && current.length > 0) {
      const latest = current.reduce((max, series) => Math.max(max, series.ts.at(-1) ?? 0), 0);
      plot.setScale("x", { min: Math.max(0, latest - WINDOW_SEC), max: Math.max(WINDOW_SEC, latest) });
    }
  }, []);

  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;

    const handleNativeWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const plot = uplotRef.current;
      if (!plot) return;

      const overRect = plot.over.getBoundingClientRect();
      const cursorPxX = event.clientX - overRect.left;
      const cursorTimeSec = plot.posToVal(cursorPxX, "x");
      if (!Number.isFinite(cursorTimeSec)) return;

      const currentXScale = plot.scales.x;
      const currentMin = currentXScale.min ?? 0;
      const currentMax = currentXScale.max ?? WINDOW_SEC;
      const currentWindow: [number, number] = manualWindowRef.current ?? [currentMin, currentMax];

      if (event.ctrlKey) {
        const factor = Math.exp(-event.deltaY * 0.01);
        const next = zoomTimeWindow(currentWindow, cursorTimeSec, factor);
        manualWindowRef.current = next;
        setIsManualMode(true);
        plot.setScale("x", { min: next[0], max: next[1] });
      } else if (event.deltaMode === 0 && Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        const span = currentWindow[1] - currentWindow[0];
        const secPerPx = span / Math.max(10, overRect.width);
        const next = panTimeWindow(currentWindow, event.deltaX * secPerPx);
        manualWindowRef.current = next;
        setIsManualMode(true);
        plot.setScale("x", { min: next[0], max: next[1] });
      } else {
        const factor = event.deltaY < 0 ? 0.85 : 1 / 0.85;
        const next = zoomTimeWindow(currentWindow, cursorTimeSec, factor);
        manualWindowRef.current = next;
        setIsManualMode(true);
        plot.setScale("x", { min: next[0], max: next[1] });
      }
    };

    el.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleNativeWheel);
  }, []);

  useEffect(() => {
    const element = plotRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      uplotRef.current?.setSize({
        width: element.clientWidth,
        height: Math.max(100, element.clientHeight - 4),
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    rebuild();
  }, [theme, rebuild]);

  useEffect(() => {
    const subscriptions = subscriptionsRef.current;
    return () => {
      for (const unsubscribe of subscriptions.values()) unsubscribe();
      subscriptions.clear();
      uplotRef.current?.destroy();
    };
  }, []);

  const removeSeries = useCallback(
    (id: number) => {
      const removed = seriesRef.current.find((series) => series.id === id);
      if (!removed) return;
      const next = seriesRef.current.filter((series) => series.id !== id);
      commitSeries(next);
      if (!next.some((series) => series.topic === removed.topic)) {
        subscriptionsRef.current.get(removed.topic)?.();
        subscriptionsRef.current.delete(removed.topic);
      }
      queueMicrotask(rebuild);
    },
    [commitSeries, rebuild],
  );

  const clearSeries = useCallback(() => {
    for (const unsubscribe of subscriptionsRef.current.values()) unsubscribe();
    subscriptionsRef.current.clear();
    commitSeries([]);
    uplotRef.current?.destroy();
    uplotRef.current = null;
  }, [commitSeries]);

  const toggleSeries = useCallback(
    (id: number) => {
      commitSeries(
        seriesRef.current.map((series) =>
          series.id === id ? { ...series, visible: !series.visible } : series,
        ),
      );
      queueMicrotask(rebuild);
    },
    [commitSeries, rebuild],
  );

  const plotTopics = topics.filter(
    (topic) => !["sensor_msgs/msg/Image", "sensor_msgs/msg/CompressedImage"].includes(topic.schemaName),
  );
  const hints = FIELD_HINTS[topics.find((topic) => topic.topic === newTopic)?.schemaName ?? ""] ?? [];
  const duplicate = seriesList.some(
    (series) => seriesKey(series.topic, series.field) === seriesKey(newTopic, newField.trim()),
  );

  return (
    <div className="plot-panel">
      <Toolbar className="plot-toolbar">
        <Select aria-label={t("chooseTopic")} value={newTopic} onChange={(event) => setNewTopic(event.target.value)}>
          <option value="">{t("chooseTopic")}</option>
          {plotTopics.map((topic) => (
            <option key={topic.topic} value={topic.topic}>{topic.topic}</option>
          ))}
        </Select>
        <TextInput
          ref={fieldRef}
          required
          className="field-input"
          placeholder={t("fieldPath")}
          value={newField}
          onChange={(event) => setNewField(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && addEntry({ topic: newTopic, field: newField })) setNewField("");
          }}
          list="plot-field-hints"
        />
        <datalist id="plot-field-hints">
          {hints.map((hint) => <option key={hint} value={hint} />)}
        </datalist>
        <Button
          onClick={() => {
            if (!fieldRef.current?.checkValidity()) return;
            if (addEntry({ topic: newTopic, field: newField })) setNewField("");
          }}
          disabled={!newTopic || duplicate}
        >
          {t("add")}
        </Button>
        <Button
          className="icon-action"
          onClick={() => {
            pausedRef.current = !pausedRef.current;
            setPaused(pausedRef.current);
          }}
          title={paused ? t("resume") : t("pause")}
          aria-label={paused ? t("resume") : t("pause")}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </Button>
        {isManualMode && (
          <Button
            className="icon-action"
            onClick={resetToRealtime}
            title={t("reset")}
            aria-label={t("reset")}
          >
            <RotateCcw size={14} />
          </Button>
        )}
        {seriesList.length > 0 && (
          <Button className="icon-action" onClick={clearSeries} title={t("clearAll")} aria-label={t("clearAll")}>
            <Trash2 size={14} />
          </Button>
        )}
      </Toolbar>
      <div className="plot-content">
        {seriesList.length > 0 && (
          <div className="series-list">
            {seriesList.map((series) => (
              <div key={series.id} className={`series-row ${series.visible ? "" : "muted"}`}>
                <i style={{ background: series.color }} />
                <span className="series-name">{series.topic}.{series.field}</span>
                <span className={`series-value ${series.status}`}>
                  {series.status === "ok" ? series.latest?.toPrecision(6) : series.status === "invalid" ? t("invalidField") : t("waitingData")}
                </span>
                <Button onClick={() => toggleSeries(series.id)} title={series.visible ? t("hide") : t("show")} aria-label={series.visible ? t("hide") : t("show")}>
                  {series.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </Button>
                <Button onClick={() => removeSeries(series.id)} title={t("remove")} aria-label={t("remove")}>
                  <Trash2 size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}
        <div ref={plotRef} className="plot-body" />
      </div>
    </div>
  );
}

const plugin: RobvizPlugin = {
  id: "plot",
  name: "曲线 (Plot)",
  panels: [
    {
      kind: "plot",
      title: (ctx) => (ctx.locale === "en" ? "Plot" : "曲线面板"),
      component: PlotPanel,
    },
  ],
};

export default plugin;
