/**
 * The ECharts engine, assembled once — 🟩 PRODUCTION.
 *
 * This module exists to be `import()`ed, and its shape is the whole point.
 *
 * ── why a separate file ───────────────────────────────────────────────────
 * `charts.jsx` needs the engine lazily, and the obvious way to write that is
 * `await import("echarts/charts")` inside the component. That was measured and
 * it is a trap: a dynamic import of a BARREL hands back the whole namespace, so
 * nothing can be shaken out of it. It shipped 1,072 kB across eight chunks —
 * geo-JSON parsing and keyframe animation included, for three bar charts — and
 * pulling `echarts` wholesale had only ever cost 544 kB.
 *
 * Named imports in a statically-analysable module fix that, and one dynamic
 * import OF THIS FILE keeps it off the critical path: the bundler shakes the
 * unused half of ECharts out at build time, then emits what is left as a chunk
 * fetched when a chart first mounts. Both properties, no trade.
 *
 * ── the registration list is a contract ───────────────────────────────────
 * The three option builders in `charts.jsx` are the ONLY source of chart
 * options in the codebase — no page hand-rolls a `series` — so this list is
 * complete by construction rather than by hope:
 *
 *   bar       rankedBarOption, funnelOption
 *   line      trendOption
 *   markLine  trendOption's threshold
 *   grid / xAxis / yAxis · tooltip · legend · title
 *
 * ONE RULE: a new series type, or a new top-level option key, must be added
 * here as well. ECharts does not throw on an unregistered feature — it logs a
 * console warning and draws nothing, which reads as "no data" on a screen whose
 * whole job is to show that there is some.
 */
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  TooltipComponent,
  // Canvas only. `EChart` initialises with `renderer: "canvas"`, so registering
  // the SVG renderer as well would ship a second renderer nothing calls.
  CanvasRenderer,
]);

export default echarts;
