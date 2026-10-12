import { useEffect, useId, useState, useSyncExternalStore } from "react";
import type { ComponentType, CSSProperties } from "react";
import { Box, Button, IconButton, Stack, Typography, useMediaQuery } from "@mui/material";
import { alpha } from "@mui/material/styles";
import PauseRounded from "@mui/icons-material/PauseRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import WbSunnyOutlined from "@mui/icons-material/WbSunnyOutlined";
import BoltOutlined from "@mui/icons-material/BoltOutlined";
import WaterDropOutlined from "@mui/icons-material/WaterDropOutlined";
import LocalFireDepartmentOutlined from "@mui/icons-material/LocalFireDepartmentOutlined";
import { useTokens } from "../lib/token-store.jsx";
import { exNum } from "../lib/format.js";
import type * as Tokens from "../lib/tokens.js";

/**
 * The login illustration, shared by every Genus metering product.
 *
 * One home, four supplies, four meters, each counting: the solar meter counts
 * what the rooftop generates, the electricity meter what the home uses, the
 * water meter litres, the gas meter cubic metres. The readings are SAMPLES, and
 * they are hidden from assistive tech, which gets one
 * sentence describing the scene instead of numbers changing four times a second.
 *
 * Readings are HTML tags laid over the SVG, not SVG text: the scene renders at
 * ~0.7 scale on a 1000px screen, where text drawn inside it would be ~6px.
 * Each tag is pinned to a viewBox point and joined to its meter by a leader.
 *
 * Interactive: hovering a supply, its tag or its chip spotlights it by dimming
 * the other three; clicking a chip pins that spotlight. Each supply has its own
 * icon and line texture as well as its own colour, because gold and orange sit
 * close enough that colour alone would not separate them.
 */
type Utility = "solar" | "electricity" | "water" | "gas";

const UTILITIES: { id: Utility; label: string; note: string; Icon: ComponentType<{ fontSize?: "small" | "inherit" }> }[] = [
  { id: "solar", label: "Solar", note: "Counts what the rooftop panels generate.", Icon: WbSunnyOutlined },
  { id: "electricity", label: "Electricity", note: "Counts the electricity the home uses; surplus solar goes to the grid.", Icon: BoltOutlined },
  { id: "water", label: "Water", note: "Counts every litre, from supply to tap.", Icon: WaterDropOutlined },
  { id: "gas", label: "Gas", note: "Counts piped-gas use in cubic metres.", Icon: LocalFireDepartmentOutlined },
];
const ICON_OF = Object.fromEntries(UTILITIES.map((u) => [u.id, u.Icon])) as Record<Utility, (typeof UTILITIES)[number]["Icon"]>;

/** Sample readings: where each counter starts and how fast it climbs, per second. */
type Reading = { name?: string; start: number; perSecond: number; dp: number };
const READOUTS: { u: Utility; title: string; unit: string; rows: Reading[]; leader: string; at: CSSProperties }[] = [
  { u: "solar", title: "Solar", unit: "kWh", leader: "M388 300 V348",
    rows: [{ name: "Generated", start: 4271.36, perSecond: .024, dp: 2 }],
    at: { left: pct(372, 600), top: pct(348, 390) } },
  { u: "electricity", title: "Electricity", unit: "kWh", leader: "M440 269 L480 118",
    rows: [{ name: "Used", start: 3108.02, perSecond: .014, dp: 2 }],
    at: { right: 0, top: pct(118, 390), transform: "translateY(-100%)" } },
  { u: "water", title: "Water", unit: "L", leader: "M95 265 V112",
    rows: [{ start: 12480.4, perSecond: .32, dp: 1 }],
    at: { left: pct(12, 600), top: pct(112, 390), transform: "translateY(-100%)" } },
  { u: "gas", title: "Gas", unit: "m³", leader: "M290 304 L266 338",
    rows: [{ start: 318.426, perSecond: .0011, dp: 3 }],
    at: { right: pct(600 - 272, 600), top: pct(338, 390) } },
];
const TICK_MS = 250;

/* Meter icons, centred on 0,0 inside the meter display. The sun is a disc ringed by eight dots. */
const SUN = "M0 -2.8A2.8 2.8 0 1 1 0 2.8A2.8 2.8 0 1 1 0 -2.8Z" + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
  const a = (i * Math.PI) / 4, x = 4.8 * Math.sin(a), y = -4.8 * Math.cos(a) - .9;
  return `M${x.toFixed(2)} ${y.toFixed(2)}a.9 .9 0 1 0 0 1.8a.9 .9 0 1 0 0 -1.8Z`;
}).join("");
const ICON: Record<Utility, string> = {
  solar: SUN,
  electricity: "M1 -5.5 -3.5 1 H-.5 L-1.5 5.5 3.5 -1 H.5Z",
  water: "M0 -5.5C2.5 -2.5 4 -.5 4 1.6A4 4 0 0 1 -4 1.6C-4 -.5 -2.5 -2.5 0 -5.5Z",
  gas: "M.5 -5.5C3.5 -2.5 4.5 0 3.8 2.4A4 4 0 0 1 -3.8 2C-4.2 -.4 -2.6 -1.8 -1.6 -3.4C-1.2 -1.8 -.4 -1 .4 -.8C.9 -2.4 1 -4 .5 -5.5Z",
};
/* Dash period divides 48, the animated offset, so every loop is seamless. */
const DASH: Record<Utility, string> = { solar: "6 10", electricity: "16 8", water: ".1 7.9", gas: "12 4" };

export function UtilityHero() {
  const id = useId().replace(/:/g, "");
  const { bundle } = useTokens() as unknown as { bundle: typeof Tokens };
  const p = bundle.primitives;
  const [pinned, setPinned] = useState<Utility | null>(null);
  const [hovered, setHovered] = useState<Utility | null>(null);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // A background tab counts for nobody; stop the clocks until it is seen again.
  const visible = useSyncExternalStore(onVisibility, () => document.visibilityState !== "hidden", () => true);
  const focus = hovered ?? pinned;

  const ink = p.blue[900];
  const text = p.blue[100];
  const color: Record<Utility, string> = { solar: p.warning[500], electricity: p.success[100], water: p.blue[300], gas: p.orange[400] };
  const hover = (u: Utility) => ({ onPointerEnter: () => setHovered(u), onPointerLeave: () => setHovered(null) });

  const flow = (u: Utility, d: string) => <g key={d}>
    <path d={d} stroke={color[u]} strokeOpacity=".15" />
    <path className="flow" d={d} stroke={color[u]} strokeDasharray={DASH[u]} />
  </g>;
  const meter = (u: Utility, x: number, y: number, skew: number) =>
    <g transform={`translate(${x} ${y}) skewY(${skew})`}>
      <rect width="22" height="28" rx="2" fill={p.blue[50]} stroke={p.blue[200]} />
      <rect x="3" y="3" width="16" height="13" rx="1" fill={p.blue[950]} />
      <path d={ICON[u]} fill={color[u]} transform="translate(11 9.5)" />
      <circle className="led" cx="6" cy="22" r="1.6" fill={color[u]} />
    </g>;

  return <Stack component="section" aria-label="Genus metering for solar, electricity, water and gas"
    sx={{ minWidth: 0, minHeight: 0, position: "relative", overflow: "hidden", justifyContent: "center", p: { xs: 3, md: 6, lg: 8 }, color: text, bgcolor: ink, backgroundImage: `radial-gradient(ellipse at 70% 55%, ${alpha(p.blue[600], .25)}, transparent 65%)`, gap: { xs: 1.5, md: 3 } }}>
    <IconButton aria-label={paused ? "Play animation" : "Pause animation"} onClick={() => setPaused(!paused)}
      sx={(t) => ({ position: "absolute", top: t.spacing(2), right: t.spacing(2), minWidth: t.spacing(5.5), minHeight: t.spacing(5.5), color: text, ...ring(p.white),
        "@media (prefers-reduced-motion: reduce)": { display: "none" } })}>
      {paused ? <PlayArrowRounded /> : <PauseRounded />}
    </IconButton>

    {/* The bottom margin leaves room for the lower tags, which hang below the scene at small widths. */}
    <Box sx={{ position: "relative", minWidth: 0, mb: 2 }}>
      <Box component="svg" viewBox="0 0 600 390" role="img" data-focus={focus ?? "all"} data-paused={paused}
        aria-label="A home with rooftop solar panels, a grid connection, a water supply and a gas supply, each passing through its own smart meter. The solar meter counts energy generated, the electricity meter energy used, the water meter litres and the gas meter cubic metres. Readings are samples."
        sx={(t) => ({ display: "block", width: "100%", overflow: "visible",
          "& .u": { transition: t.transitions.create("opacity", { duration: bundle.motion.slow }) },
          [UTILITIES.map(({ id: u }) => `&[data-focus=${u}] .u:not(.u-${u})`).join(", ")]: { opacity: .2 },
          [UTILITIES.map(({ id: u }) => `&[data-focus=${u}] .u-${u} .flow`).join(", ")]: { strokeWidth: 4 },
          "& .flow": { animation: `${id}-flow ${t.transitions.duration.standard * 12}ms linear infinite` },
          "& .led": { animation: `${id}-blink ${t.transitions.duration.standard * 8}ms ${t.transitions.easing.easeInOut} infinite alternate` },
          "& .sun-rise": { animation: `${id}-sunrise ${t.transitions.duration.standard * 40}ms ${t.transitions.easing.easeInOut} infinite alternate` },
          "&[data-paused=true] *": { animationPlayState: "paused" },
          [`@keyframes ${id}-flow`]: { to: { strokeDashoffset: -48 } },
          [`@keyframes ${id}-blink`]: { from: { opacity: .35 } },
          [`@keyframes ${id}-sunrise`]: { from: { transform: `translateY(${t.spacing(2)})` }, to: { transform: `translateY(-${t.spacing(1)})` } },
          "@media (prefers-reduced-motion: reduce)": { "& .flow, & .led, & .sun-rise": { animation: "none" } },
        })}>
        <defs>
          <radialGradient id={`${id}-sun`}><stop stopColor={color.solar} stopOpacity=".32" /><stop offset="1" stopColor={color.solar} stopOpacity="0" /></radialGradient>
          <linearGradient id={`${id}-roof`} x2="1" y2="1"><stop stopColor={p.blue[400]} /><stop offset="1" stopColor={p.blue[700]} /></linearGradient>
          <linearGradient id={`${id}-wall`} x2="0" y2="1"><stop stopColor={p.blue[50]} /><stop offset="1" stopColor={p.blue[200]} /></linearGradient>
          <linearGradient id={`${id}-tank`}><stop stopColor={p.blue[300]} /><stop offset="1" stopColor={p.blue[700]} /></linearGradient>
        </defs>

        <g className="u u-solar" {...hover("solar")}>
          <g className="sun-rise">
            <circle cx="340" cy="150" r="145" fill={`url(#${id}-sun)`} />
            <circle cx="340" cy="150" r="65" fill={color.solar} />
            <circle cx="340" cy="150" r="90" fill="none" stroke={color.solar} strokeOpacity=".12" />
            <circle cx="340" cy="150" r="116" fill="none" stroke={color.solar} strokeOpacity=".08" />
          </g>
        </g>

        <path d="M10 237 Q130 182 250 220 T590 210 L600 390 H0Z" fill={p.blue[800]} />
        <path d="M0 300 Q180 240 350 295 T600 280 V390 H0Z" fill={p.blue[950]} fillOpacity=".6" />
        <path d="M95 312 290 239 486 307 285 382Z" fill={p.blue[950]} />
        <g fill={p.success[700]}><path d="M572 300 V252" stroke={p.success[100]} strokeWidth="3" /><ellipse cx="572" cy="246" rx="16" ry="28" /></g>

        {/* Water tower on the hill. */}
        <g className="u u-water" {...hover("water")}>
          <path d="M38 228 46 186 M66 228 58 186 M41 214 H63 M43 200 H61 M41 214 61 200 M63 214 43 200" stroke={p.blue[300]} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M32 160 V186 A20 5 0 0 0 72 186 V160Z" fill={`url(#${id}-tank)`} />
          <ellipse cx="52" cy="160" rx="20" ry="5" fill={p.blue[100]} />
        </g>

        {/* The home. */}
        <path d="M149 201 284 249 V338 L149 288Z" fill={p.blue[300]} />
        <path d="M284 249 419 200 V288 L284 338Z" fill={`url(#${id}-wall)`} />
        <path d="M133 203 264 139 434 197 284 254Z" fill={p.blue[100]} />
        <path d="M133 203 264 139 285 150 154 213Z" fill={p.blue[400]} />
        <path d="M162 192 267 151 402 197 286 239Z" fill={`url(#${id}-roof)`} stroke={p.blue[200]} strokeWidth="2" />
        <path d="M185 183 312 229 M210 173 340 219 M236 163 371 208 M186 202 293 161 M213 211 321 171 M242 222 349 181 M268 232 376 190" fill="none" stroke={p.blue[100]} strokeOpacity=".65" />
        <path d="M175 227 218 243 V286 L175 270Z" fill={ink} />
        <path d="M179 232 214 245 V281 L179 268Z" fill={p.warning[100]} fillOpacity=".9" />
        <path d="M197 238 V275 M177 250 216 265" stroke={p.blue[500]} strokeWidth="3" />
        <path d="M311 258 345 246 V308 L311 320Z" fill={p.blue[800]} />
        <path d="M360 239 393 228 V263 L360 275Z" fill={p.blue[600]} />
        <path d="M363 242 390 233 V260 L363 270Z" fill={p.warning[100]} />
        <path d="M377 237 V265" stroke={p.blue[500]} strokeWidth="3" />

        <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <g className="u u-water" {...hover("water")}>{flow("water", "M52 190 V265 L233 329 V312")}</g>
          <g className="u u-gas" {...hover("gas")}>{flow("gas", "M360 396 L297 374 V302")}</g>
          <g className="u u-solar" {...hover("solar")}>{flow("solar", "M357 217 V270 L380 279")}</g>
          <g className="u u-electricity" {...hover("electricity")}>{flow("electricity", "M460 318 L520 297 V282")}</g>
        </g>

        {/* Meters: water on its supply line, gas and solar on the front wall, electricity in the grid cabinet. */}
        <g className="u u-water" {...hover("water")}>{meter("water", 84, 262, 19.5)}</g>
        <g className="u u-gas" {...hover("gas")}>{meter("gas", 286, 277, -19.95)}</g>
        <g className="u u-solar" {...hover("solar")}>{meter("solar", 377, 276, -19.95)}</g>
        <g className="u u-electricity" {...hover("electricity")}>
          <path d="M404 281 440 269 460 279 423 292Z" fill={p.blue[100]} />
          <path d="M404 281 423 292 V345 L404 334Z" fill={p.blue[400]} />
          <path d="M423 292 460 279 V333 L423 345Z" fill={p.blue[200]} />
          {meter("electricity", 430, 297, -19.4)}
          <g stroke={p.blue[200]} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M520 148 489 285 M520 148 551 285 M508 196 H532 M499 239 H541 M507 196 540 239 M532 196 499 239 M500 173 H540 M493 188 H548 M487 285 H553" />
            <path d="M500 173 Q551 189 600 162 M493 188 Q550 206 600 178" strokeWidth="1" />
          </g>
        </g>

        {/* Leaders from each meter to its reading. */}
        {READOUTS.map((r) => <g key={r.u} className={`u u-${r.u}`} fill="none" stroke={color[r.u]} strokeOpacity=".7">
          <path d={r.leader} strokeDasharray="2 3" />
        </g>)}
      </Box>

      {READOUTS.map((r) => <Readout key={r.u} {...r} accent={color[r.u]} text={text} panel={p.blue[950]} font={bundle.font}
        running={!paused && !reducedMotion && visible} dim={focus !== null && focus !== r.u} tickName={`${id}-tick`} hover={hover(r.u)} />)}
    </Box>

    <Stack sx={{ alignItems: "center", gap: 1.5, flexShrink: 0 }}>
      {/* Two by two until the panel can hold all four in a row, so a wrap never strands one chip. */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, auto)", lg: "repeat(4, auto)" }, justifyContent: "center", gap: 1 }}>
        {UTILITIES.map(({ id: u, label, Icon }) => <Button key={u} color="inherit" aria-pressed={pinned === u} startIcon={<Icon fontSize="small" />}
          onClick={() => setPinned(pinned === u ? null : u)} onMouseEnter={() => setHovered(u)} onMouseLeave={() => setHovered(null)}
          sx={(t) => ({ minHeight: t.spacing(5.5), px: 2, borderRadius: `${bundle.radius.pill}px`, color: text, border: 1,
            borderColor: pinned === u ? color[u] : alpha(text, .28), bgcolor: pinned === u ? alpha(color[u], .16) : "transparent",
            "& .MuiButton-startIcon": { color: color[u] }, "&:hover": { bgcolor: alpha(p.white, .06) }, ...ring(p.white) })}>
          {label}
        </Button>)}
      </Box>
      <Typography variant="body2" sx={{ textAlign: "center", color: text, minHeight: (t) => t.spacing(2.5) }}>
        {/* Empty until a supply is spotlit; the line keeps its height so the note never shifts the layout. */}
        {focus && UTILITIES.find((u) => u.id === focus)?.note}
      </Typography>
    </Stack>
  </Stack>;
}

/**
 * One meter's reading, styled as its display. Owns its own clock so the
 * counting re-renders a few text nodes, never the scene.
 */
function Readout({ u, title, unit, rows, at, accent, text, panel, font, running, dim, tickName, hover }: {
  u: Utility; title: string; unit: string; rows: Reading[]; at: CSSProperties; accent: string; text: string; panel: string;
  font: typeof Tokens.font; running: boolean; dim: boolean; tickName: string; hover: Record<string, () => void>;
}) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((s) => s + TICK_MS / 1000), TICK_MS);
    return () => clearInterval(timer);
  }, [running]);
  const Icon = ICON_OF[u];

  return <Box aria-hidden="true" {...hover} data-readout={u}
    sx={(t) => ({ position: "absolute", ...at, px: 1.25, py: 0.75, bgcolor: alpha(panel, .92), color: text, whiteSpace: "nowrap",
      border: 1, borderColor: alpha(accent, .45), borderRadius: 1, boxShadow: t.shadows[4], opacity: dim ? .2 : 1,
      transition: t.transitions.create("opacity", { duration: t.transitions.duration.complex }),
      /* A slide, not a fade: the water digit changes every ~300ms, so a fade would leave it dim most of the time. */
      "& .tick": { display: "inline-block", animation: `${tickName} ${t.transitions.duration.shortest}ms ${t.transitions.easing.easeOut}` },
      [`@keyframes ${tickName}`]: { from: { transform: `translateY(-${t.spacing(0.5)})` } },
      "@media (prefers-reduced-motion: reduce)": { "& .tick": { animation: "none" } } })}>
    <Stack direction="row" sx={{ alignItems: "center", gap: 0.5, ...font["label/s"], color: alpha(text, .8) }}>
      <Box component="span" sx={{ display: "flex", color: accent, fontSize: font["label/m"]?.fontSize }}><Icon fontSize="inherit" /></Box>
      {title} meter · {unit}
    </Stack>
    <Box sx={{ display: "grid", gridTemplateColumns: rows.some((r) => r.name) ? "auto auto" : "auto", columnGap: 1, alignItems: "baseline" }}>
      {rows.map((r) => {
        const value = exNum(r.start + r.perSecond * seconds, r.dp);
        return <Box key={r.name ?? u} sx={{ display: "contents" }}>
          {r.name && <Box component="span" sx={{ ...font["label/s"], color: alpha(text, .7) }}>{r.name}</Box>}
          <Box component="span" sx={{ ...font["label/l"], fontVariantNumeric: "tabular-nums", textAlign: "right", color: accent }}>
            {value.slice(0, -1)}<span key={value} className="tick">{value.slice(-1)}</span>
          </Box>
        </Box>;
      })}
    </Box>
  </Box>;
}

function onVisibility(change: () => void) {
  document.addEventListener("visibilitychange", change);
  return () => document.removeEventListener("visibilitychange", change);
}

function pct(n: number, of: number) {
  return `${(n / of) * 100}%`;
}

/** The theme's focus ring is drawn for light and dark surfaces, not for this fixed ink panel. */
function ring(color: string) {
  return { "&.Mui-focusVisible, &:focus-visible": { outline: `2px solid ${color}`, outlineOffset: 2 } };
}
