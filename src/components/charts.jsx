/**
 * ECharts wrapper and chart theme.
 *
 * Every guard here exists because something broke once:
 *   · A chart initialised at 0×0 threw and unmounted the tree — init is deferred
 *     until the container reports real dimensions.
 *   · A chart kept a stale half-width after a two-column grid became one — the
 *     ResizeObserver is persistent, not a one-shot.
 *   · Charts kept the previous theme after a dark-mode switch — ECharts fixes
 *     its theme at init, so mode is a dependency of the init effect and the
 *     instance is rebuilt rather than updated.
 *   · A malformed frame threw inside setOption — it is wrapped, and a bad frame
 *     is skipped rather than blanking the panel.
 */
import { useEffect, useRef, useMemo } from "react";
import { Box, useTheme } from "@mui/material";
import * as echarts from "echarts";
import { Panel } from "./molecules.jsx";
import { EmptyState } from "./atoms.jsx";
import { truncateName, exInt } from "../lib/format.js";

/**
 * Ten entries, and it must stay ten. hashColor() indexes this modulo its
 * length, which is what keeps one entity's colour stable product-wide — the
 * same contractor is the same colour on every screen.
 */
export const CATEGORICAL = [
  "#0467b2", // blue-500     brand
  "#ee7304", // orange-500   accent
  "#107c10", // success-500
  "#8a3707", // warning-700
  "#d13438", // danger-500
  "#5598d0", // blue-400
  "#f28e36", // orange-400
  "#00517d", // blue-700
  "#ad5600", // orange-700
  "#616161", // neutral-600
];

/** Stable colour for an entity name, independent of its position in a series. */
export function hashColor(name) {
  const s = String(name ?? "");
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return CATEGORICAL[h % CATEGORICAL.length];
}

/** Chart theme derived from the MUI theme, which is derived from Figma. */
function chartTheme(t) {
  return {
    color: CATEGORICAL,
    backgroundColor: "transparent",
    textStyle: { fontFamily: t.typography.fontFamily, color: t.palette.text.secondary },
    title: { textStyle: { color: t.palette.text.primary } },
    grid: { left: 8, right: 12, top: 24, bottom: 8, containLabel: true },
    categoryAxis: {
      axisLine: { lineStyle: { color: t.palette.border.default } },
      axisTick: { show: false },
      axisLabel: { color: t.palette.text.tertiary, fontSize: 11 },
      splitLine: { show: false },
    },
    valueAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: t.palette.text.tertiary, fontSize: 11 },
      splitLine: { lineStyle: { color: t.palette.border.subtle } },
    },
    legend: { textStyle: { color: t.palette.text.secondary } },
    tooltip: {
      backgroundColor: t.palette.surface.overlay,
      borderColor: t.palette.border.default,
      textStyle: { color: t.palette.text.primary, fontSize: 12 },
    },
  };
}

let themeSeq = 0;

export function EChart({ option, height = 260, ariaLabel, onEvents }) {
  const t = useTheme();
  const boxRef = useRef(null);
  const instRef = useRef(null);

  // A new registered theme name per (mode, direction) so ECharts genuinely
  // rebuilds rather than reusing a cached theme.
  const themeName = useMemo(() => {
    const name = `genus-${t.palette.mode}-${(themeSeq += 1)}`;
    echarts.registerTheme(name, chartTheme(t));
    return name;
  }, [t]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;

    let disposed = false;

    const ensure = () => {
      if (disposed) return;
      const { width, height: h } = el.getBoundingClientRect();
      // Geo layouts divide by width. Initialising at 0×0 throws and takes the
      // whole tree down with it.
      if (width < 1 || h < 1) return;
      if (!instRef.current) {
        instRef.current = echarts.init(el, themeName, { renderer: "canvas" });
        if (onEvents) {
          Object.entries(onEvents).forEach(([evt, fn]) => instRef.current.on(evt, fn));
        }
      }
      instRef.current.resize();
    };

    // Persistent, not one-shot — a grid going from two columns to one resizes
    // the container without resizing the window.
    const ro = new ResizeObserver(ensure);
    ro.observe(el);
    ensure();

    return () => {
      disposed = true;
      ro.disconnect();
      instRef.current?.dispose();
      instRef.current = null;
    };
  }, [themeName, onEvents]);

  useEffect(() => {
    const inst = instRef.current;
    if (!inst || !option) return;
    try {
      inst.setOption(option, { notMerge: true });
    } catch (err) {
      // A bad frame is skipped, never allowed to blank the panel.
      console.warn("EChart setOption skipped a malformed frame", err);
    }
  }, [option]);

  return (
    <Box
      ref={boxRef}
      role="img"
      aria-label={ariaLabel}
      sx={{ width: "100%", height, minWidth: 0, minHeight: 0 }}
    />
  );
}

/** A chart in a panel. Two of these may sit side by side; a table never may. */
export function EChartCard({ title, note, action, option, height, ariaLabel, empty, onEvents, sx }) {
  return (
    <Panel title={title} note={note} action={action} sx={{ minWidth: 0, ...sx }}>
      <Box sx={{ p: 2, minWidth: 0 }}>
        {empty ? (
          <EmptyState title={empty.title} body={empty.body} minHeight={height ?? 260} />
        ) : (
          <EChart option={option} height={height} ariaLabel={ariaLabel ?? title} onEvents={onEvents} />
        )}
      </Box>
    </Panel>
  );
}

/* ── option builders ─────────────────────────────────────────────────────── */

/** Ranked horizontal bars — the honest answer where boundaries do not exist. */
export function rankedBarOption({ data, valueName = "Value", max }) {
  const sorted = [...data].sort((a, b) => a.value - b.value);
  return {
    grid: { left: 8, right: 48, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "value", max },
    yAxis: {
      type: "category",
      data: sorted.map((d) => truncateName(d.name, 22)),
    },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    series: [
      {
        type: "bar",
        name: valueName,
        data: sorted.map((d) => ({ value: d.value, itemStyle: { color: d.color ?? hashColor(d.name) } })),
        barMaxWidth: 18,
        label: { show: true, position: "right", formatter: (p) => exInt(p.value), fontSize: 11 },
      },
    ],
  };
}

/** A time series with an optional threshold line drawn on it. */
export function trendOption({ dates, series, threshold }) {
  return {
    tooltip: { trigger: "axis" },
    legend: series.length > 1 ? { bottom: 0 } : undefined,
    grid: { left: 8, right: 12, top: 16, bottom: series.length > 1 ? 32 : 8, containLabel: true },
    xAxis: { type: "category", data: dates, boundaryGap: false },
    yAxis: { type: "value" },
    series: series.map((s, i) => ({
      type: "line",
      name: s.name,
      data: s.data,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2 },
      itemStyle: { color: s.color ?? CATEGORICAL[i % CATEGORICAL.length] },
      areaStyle: s.area ? { opacity: 0.12 } : undefined,
      ...(threshold && i === 0
        ? {
            markLine: {
              silent: true,
              symbol: "none",
              data: [{ yAxis: threshold.value, label: { formatter: threshold.label, fontSize: 10 } }],
              lineStyle: { type: "dashed", color: CATEGORICAL[4] },
            },
          }
        : {}),
    })),
  };
}

/** The pipeline funnel — stage counts with conversion between them. */
export function funnelOption({ stages }) {
  return {
    tooltip: {
      trigger: "item",
      formatter: (p) => `${p.name}<br/>${exInt(p.value)} records`,
    },
    grid: { left: 8, right: 12, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "category", data: stages.map((s) => truncateName(s.name, 14)), axisLabel: { interval: 0, rotate: 30 } },
    yAxis: { type: "value" },
    series: [
      {
        type: "bar",
        data: stages.map((s, i) => ({
          value: s.value,
          itemStyle: { color: s.color ?? CATEGORICAL[i % CATEGORICAL.length] },
        })),
        barMaxWidth: 46,
        label: { show: true, position: "top", formatter: (p) => exInt(p.value), fontSize: 11 },
      },
    ],
  };
}
