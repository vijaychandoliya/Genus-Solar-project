/**
 * Component gallery.
 *
 * Every component in every state, on one page, so light/dark and LTR/RTL can be
 * verified by looking rather than by reasoning about JSX. There is no test
 * suite; this page is the substitute and it is expected to stay current.
 */
import { Box, Typography, Stack, Divider, Button, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useSettings } from "../lib/settings.jsx";
import {
  StatusChip,
  BandChip,
  BandedValue,
  BandDot,
  FreshnessChip,
  IconTile,
  WsTag,
  Numeral,
  SectionLabel,
  EmptyState,
  GridEmptyOverlay,
  NotConfigured,
  CodeValue,
} from "../components/atoms.jsx";
import {
  KpiStrip,
  TileDeck,
  TilePane,
  MetricInfo,
  FilterBar,
  Delta,
  JsonPayloadDialog,
  WsDateRange,
} from "../components/molecules.jsx";
import { WsTable, wsCols, WsSplit, resultNote } from "../components/workspaces.jsx";
import { EChartCard, rankedBarOption, trendOption, funnelOption } from "../components/charts.jsx";
import { GenusMark, GenusWordmark, GenusLockup, brandColors } from "../components/brand.jsx";
import { primitives, semantic, type } from "../lib/tokens.js";
import { METRICS, bandFor, BAND_ORDER } from "../lib/bands.js";
import { SURVEY_ROWS as SURVEY_ROWS_REAL } from "../lib/programme-data.js";
import { panelBorder } from "../lib/theme.js";
import { useState } from "react";

/** A 48 V-class 15S LFP pack — enough nameplate to unlock the battery bands. */
const NAMEPLATE = { chemistry: "LFP", series_count: 15, rated_capacity_ah: 100 };

/**
 * The 9 real survey rows, one source of truth shared with the Overview page.
 * Earlier drafts of this gallery hand-typed verdicts and got 5 of 9 wrong —
 * marking rows "Feasible" that fail the shadow-free test in the rule. Now
 * imported, so the gallery can never drift from what the app actually computes.
 */
const SURVEY_ROWS = SURVEY_ROWS_REAL.map((r, i) => ({
  id: i + 1,
  consumer: r.consumerName,
  number: r.consumerNumber,
  panchayat: r.panchayatName,
  roof: r.roofTopStatus ?? "—",
  orientation: r.orientation ?? "—",
  verdict: r.verdict,
  photos: r.photos,
  accuracy: r.geo.accuracy,
}));

function DeckDemo() {
  const [tile, setTile] = useState("attention");
  const items = [
    { id: "attention", label: "Needs attention", value: 3, tone: "error", note: "Ranked by age" },
    { id: "battery", label: "On battery", value: 0, tone: "warning", note: "No telemetry yet" },
    { id: "offline", label: "Offline", value: 0, tone: "warning", note: "No telemetry yet" },
    { id: "healthy", label: "Healthy", value: 6, tone: "success", note: "Surveyed and feasible" },
  ];
  const label = items.find((i) => i.id === tile)?.label;
  return (
    <>
      <TileDeck items={items} value={tile} onChange={setTile} idPrefix="gallery" />
      <TilePane deckId="gallery" value={tile} sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          The category pane for <strong>{label}</strong>. In the real Overview this is a full-width
          table of the sites behind the figure — clicking a number opens the section that explains
          it, which is exactly why this is a deck and not a strip.
        </Typography>
      </TilePane>
    </>
  );
}

function Section({ title, note, children }) {
  return (
    <Box component="section" sx={{ mb: 5 }}>
      <SectionLabel>{title}</SectionLabel>
      {note && (
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5, maxWidth: 720 }}>
          {note}
        </Typography>
      )}
      <Box
        sx={(t) => ({
          border: `1px solid ${panelBorder(t)}`,
          borderRadius: `${t.shape.borderRadius}px`,
          backgroundColor: t.palette.surface.raised,
          p: 2.5,
        })}
      >
        {children}
      </Box>
    </Box>
  );
}

function Swatch({ name, hex }) {
  return (
    <Box sx={{ width: 108 }}>
      <Box
        sx={(t) => ({
          height: 44,
          borderRadius: `${t.shape.borderRadius / 2}px`,
          backgroundColor: hex,
          border: `1px solid ${t.palette.border.subtle}`,
        })}
      />
      <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "text.secondary" }}>
        {name}
      </Typography>
      <Typography
        variant="caption"
        dir="ltr"
        sx={{
          display: "block",
          color: "text.tertiary",
          fontVariantNumeric: "tabular-nums",
          unicodeBidi: "isolate",
        }}
      >
        {hex}
      </Typography>
    </Box>
  );
}

export default function Gallery() {
  const { mode, resolvedMode, direction, set } = useSettings();
  const sem = semantic[resolvedMode];
  const [galleryRange, setGalleryRange] = useState({ start: "2026-08-03", end: "2026-08-17" });
  const [jsonDemo, setJsonDemo] = useState(null);

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", gap: 2, mb: 1 }}
      >
        <Box>
          <Typography variant="h4">Genus Solar — component gallery</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Every value on this page resolves through the theme, which is generated from the Figma
            export. No literals.
          </Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 1 }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={mode}
            onChange={(_, v) => v && set({ mode: v })}
            aria-label="Theme mode"
          >
            <ToggleButton value="light">Light</ToggleButton>
            <ToggleButton value="dark">Dark</ToggleButton>
            <ToggleButton value="system">System</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={direction}
            onChange={(_, v) => v && set({ direction: v })}
            aria-label="Text direction"
          >
            <ToggleButton value="ltr">LTR</ToggleButton>
            <ToggleButton value="rtl">RTL</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
      <Divider sx={{ mb: 4 }} />

      <Section
        title="Brand"
        note="The marks read from the blue and orange PRIMITIVES, never from action/primary — a colour scheme changes the product's brand hue, it must not repaint the company logo. Switch to Forest above and these stay Genus blue. In dark mode both step up one stop: blue-500 measures 2.16:1 on surface/raised and is not legible there."
      >
        <Stack direction="row" sx={{ gap: 4, flexWrap: "wrap", alignItems: "center", mb: 3 }}>
          <Box>
            <SectionLabel sx={{ mb: 1 }}>Mark</SectionLabel>
            <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
              <GenusMark size={44} />
              <GenusMark size={28} />
              <GenusMark size={20} />
            </Stack>
          </Box>
          <Box>
            <SectionLabel sx={{ mb: 1 }}>Mark, plated</SectionLabel>
            <GenusMark size={44} plate />
          </Box>
          <Box>
            <SectionLabel sx={{ mb: 1 }}>Wordmark</SectionLabel>
            <GenusWordmark height={26} />
          </Box>
        </Stack>
        <SectionLabel sx={{ mb: 1 }}>Shell lockup</SectionLabel>
        <Stack direction="row" sx={{ gap: 4, alignItems: "center", flexWrap: "wrap", mb: 3 }}>
          <GenusLockup product="Solar" subtitle="SBPDCL rooftop programme" />
          <GenusLockup product="Solar" compact />
        </Stack>
        <SectionLabel sx={{ mb: 1 }}>On every surface</SectionLabel>
        <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap" }}>
          {["canvas", "base", "raised", "subtle"].map((surface) => (
            <Box
              key={surface}
              sx={(t) => ({
                p: 1.5,
                minWidth: 150,
                borderRadius: `${t.shape.borderRadius / 2}px`,
                backgroundColor: t.palette.surface[surface],
                border: `1px solid ${panelBorder(t)}`,
              })}
            >
              <GenusWordmark height={18} />
              <Typography variant="caption" sx={{ color: "text.tertiary", display: "block", mt: 1 }}>
                surface/{surface}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Section>

      <Section
        title="Primitives"
        note="Mode-independent palette steps straight from the Figma variable collection."
      >
        {["blue", "orange", "neutral"].map((family) => (
          <Box key={family} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
              {family}
            </Typography>
            <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
              {Object.entries(primitives[family]).map(([step, hex]) => (
                <Swatch key={step} name={`${family}-${step}`} hex={hex} />
              ))}
            </Stack>
          </Box>
        ))}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
            status ramps
          </Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
            {["success", "warning", "danger", "info"].flatMap((fam) =>
              Object.entries(primitives[fam]).map(([step, hex]) => (
                <Swatch key={`${fam}-${step}`} name={`${fam}-${step}`} hex={hex} />
              )),
            )}
          </Stack>
        </Box>
      </Section>

      <Section
        title={`Semantic roles — resolved for ${resolvedMode}`}
        note="These are the tokens components actually consume. Each one aliases to a different primitive per mode, which is why switching the toggle above changes the hexes and not just the rendering."
      >
        <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
          {Object.entries(sem).map(([name, hex]) => (
            <Swatch key={name} name={name.replace(/\//g, " / ")} hex={hex} />
          ))}
        </Stack>
      </Section>

      <Section
        title="Type ramp"
        note="Inter. 10/12/14/16/18/20/28/32/56 at weights 400/500/600/700. Sizes 24 and 40 exist in the older WFM ramp and are deliberately absent — a heading that wants 24 uses 20 or 28."
      >
        <Stack sx={{ gap: 1.5 }}>
          {Object.entries(type.styles).map(([key, s]) => (
            <Stack key={key} direction="row" sx={{ alignItems: "baseline", gap: 2 }}>
              <Typography
                variant="caption"
                sx={{ color: "text.tertiary", width: 96, flexShrink: 0 }}
              >
                {key}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.tertiary",
                  width: 128,
                  flexShrink: 0,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {s.size}/{s.weight} · {s.lineHeight}px
              </Typography>
              <Box
                sx={{
                  fontSize: s.size,
                  fontWeight: s.weight,
                  lineHeight: `${s.lineHeight}px`,
                  letterSpacing: `${s.tracking}px`,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Kaimur — 3,14,897 surveys
              </Box>
            </Stack>
          ))}
        </Stack>
      </Section>

      <Section
        title="Bands"
        note="normal renders no colour at all. Emphasis is zero-sum — a grid where every cell is tinted has no exceptions left to notice. Green is reserved for a question the reader actually asked, never for an in-range number."
      >
        <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap", mb: 3 }}>
          {BAND_ORDER.map((b) => (
            <BandChip key={b} band={b} />
          ))}
          <BandChip band="good" />
        </Stack>
        <SectionLabel sx={{ mb: 1 }}>Resolved from the registry</SectionLabel>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5, maxWidth: 720 }}>
          The last row has no nameplate, so cell voltage resolves to <em>No data</em> rather than a
          confident-looking Normal. A pack voltage cannot be judged until the chemistry and series
          count are known, and guessing is worse than abstaining.
        </Typography>
        <Stack sx={{ gap: 1 }}>
          {[
            ["cell_voltage", 3.21, NAMEPLATE],
            ["cell_voltage", 3.58, NAMEPLATE],
            ["cell_voltage", 2.4, NAMEPLATE],
            ["cell_delta", 35],
            ["cell_delta", 140],
            ["soh", 92],
            ["soh", 78],
            ["coverage_pct", 41],
            ["coverage_pct", 88],
            ["geo_accuracy", 3.04],
            ["geo_accuracy", 14],
            ["power_factor", 0.88],
            ["days_in_stage", 19],
            ["cell_voltage", 3.21, null],
          ].map(([id, v, np], i) => {
            const band = bandFor(id, v, np);
            const m = METRICS[id];
            return (
              <Stack key={i} direction="row" sx={{ alignItems: "center", gap: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "text.tertiary", width: 150, flexShrink: 0 }}
                >
                  {m.label}
                </Typography>
                <Box sx={{ width: 130, flexShrink: 0 }}>
                  <BandedValue value={v} unit={m.unit} band={band} dp={m.precision} />
                </Box>
                <BandChip band={band} />
              </Stack>
            );
          })}
        </Stack>
      </Section>

      <Section
        title="Status, freshness and tags"
        note="Tone is always passed explicitly — never inferred from the label. Colour is never the only signal: every chip carries its word."
      >
        <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap", mb: 2 }}>
          <StatusChip label="Surveyed" tone="good" />
          <StatusChip label="Assigned" tone="info" />
          <StatusChip label="Awaiting MCO" tone="warning" />
          <StatusChip label="Payload failed" tone="danger" />
          <StatusChip label="Not started" tone="neutral" />
        </Stack>
        <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap", mb: 2 }}>
          <FreshnessChip freshness="live" age="2 min" />
          <FreshnessChip freshness="late" age="18 min" />
          <FreshnessChip freshness="stale" age="4 h" />
          <FreshnessChip freshness="offline" age="6 d" />
        </Stack>
        <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <WsTag label="RCC Roof" />
          <WsTag label="East-West" />
          <WsTag label="MERAQUI VENTURES PVT LTD" />
          <NotConfigured hint="Sanctioned Load is empty in all 9,673 master rows." />
        </Stack>
      </Section>

      <Section
        title="CodeValue"
        note="A raw device status code rendered as the word it means, with the code kept beside it. Three states, because they are three different problems."
      >
        <Stack sx={{ gap: 2 }}>
          <Box>
            <SectionLabel>Verified enum — the meaning is documented</SectionLabel>
            <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap", mt: 0.5, alignItems: "center" }}>
              <CodeValue set="gti_msg_type" value="telemetry" showRaw={false} />
              <CodeValue set="device_class" value="bms" showRaw={false} />
              <CodeValue set="system_type" value="non solar" showRaw={false} />
            </Stack>
          </Box>
          <Box>
            <SectionLabel>
              Unverified enum — dotted underline; our reading of an undocumented code
            </SectionLabel>
            <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap", mt: 0.5, alignItems: "center" }}>
              <CodeValue set="backup_status" value={1} />
              <CodeValue set="backup_status" value={0} />
              <CodeValue set="inverter_status" value={0} />
              <CodeValue set="mains_present" value={0} />
            </Stack>
          </Box>
          <Box>
            <SectionLabel>Undocumented code, and absent — never rendered as health</SectionLabel>
            <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap", mt: 0.5, alignItems: "center" }}>
              <CodeValue set="inverter_mode" value={7} />
              <CodeValue set="backup_status" value={null} />
            </Stack>
          </Box>
        </Stack>
      </Section>

      <Section
        title="Sensor-fault plausibility"
        note="The same metric, fed a real reading and a sentinel. -58 °C is a thermistor open circuit, not a temperature — it must resolve to unknown, never to a confident critical."
      >
        <Stack direction="row" sx={{ gap: 4, flexWrap: "wrap" }}>
          {[27, 47, 58, -58, 0].map((v) => (
            <Box key={v}>
              <SectionLabel>{`pack_temp = ${v}`}</SectionLabel>
              <BandedValue value={v} unit="°C" dp={1} band={bandFor("pack_temp", v)} />
            </Box>
          ))}
        </Stack>
        <Stack direction="row" sx={{ gap: 4, flexWrap: "wrap", mt: 2 }}>
          {[228.7, 195, 0].map((v) => (
            <Box key={v}>
              <SectionLabel>{`grid_voltage = ${v}`}</SectionLabel>
              <BandedValue value={v} unit="V" dp={1} band={bandFor("grid_voltage", v)} />
            </Box>
          ))}
        </Stack>
      </Section>

      <Section
        title="WsDateRange"
        note="Native date inputs — keyboard-accessible and OS-localised. A reversed range states itself rather than being silently swapped."
      >
        <Stack sx={{ gap: 2 }}>
          <WsDateRange start={galleryRange.start} end={galleryRange.end} onChange={setGalleryRange} />
          <Box>
            <SectionLabel>Reversed — the error is stated, not corrected</SectionLabel>
            <WsDateRange start="2026-08-17" end="2026-08-03" onChange={() => {}} />
          </Box>
          <Box>
            <SectionLabel>Disabled</SectionLabel>
            <WsDateRange start="2026-08-03" end="2026-08-17" disabled onChange={() => {}} />
          </Box>
        </Stack>
      </Section>

      <Section
        title="JsonPayloadDialog"
        note="The raw message behind a decoded row. Rendered as text, never reformatted — a pretty-printer that reorders keys destroys the thing this dialog exists to show."
      >
        <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap" }}>
          <Button variant="outlined" size="small" onClick={() => setJsonDemo("payload")}>
            Open with a payload
          </Button>
          <Button variant="outlined" size="small" onClick={() => setJsonDemo("empty")}>
            Open with none
          </Button>
        </Stack>
        <JsonPayloadDialog
          open={jsonDemo !== null}
          onClose={() => setJsonDemo(null)}
          title="GTI Data payload"
          subtitle="Device 357108850179110 · 09-06-2026 10:51"
          payload={
            jsonDemo === "payload"
              ? {
                  device_no: "357108850179110",
                  msg_id: 987456,
                  msg_type: "telemetry",
                  timestamp: "2026-06-09T10:51:23Z",
                  max_index: 72,
                  index: 72,
                  load: 0,
                  note: "Shape illustrative — the real payloads have not been extracted yet.",
                }
              : null
          }
        />
      </Section>

      <Section title="Numerals" note="en-IN grouping, tabular figures, lakh and crore — never K and M.">
        <Stack direction="row" sx={{ gap: 4, flexWrap: "wrap" }}>
          <Box>
            <SectionLabel>Count</SectionLabel>
            <Numeral value={314897} variant="h4" />
          </Box>
          <Box>
            <SectionLabel>With unit</SectionLabel>
            <Numeral value={9673} unit="consumers" variant="h4" />
          </Box>
          <Box>
            <SectionLabel>Decimal</SectionLabel>
            <Numeral value={83.7253975} dp={4} variant="h4" />
          </Box>
        </Stack>
      </Section>

      <Section title="Icon tiles">
        <Stack direction="row" sx={{ gap: 2 }}>
          {["primary", "secondary", "success", "warning", "error", "info"].map((tone) => (
            <IconTile key={tone} tone={tone}>
              <Box sx={{ width: 18, height: 18, borderRadius: 0.5, bgcolor: "currentColor" }} />
            </IconTile>
          ))}
        </Stack>
      </Section>

      <Section
        title="Empty states"
        note="Four different nothings need four different sentences. A bare 'No data' is never one of them."
      >
        <Stack sx={{ gap: 2 }}>
          <Box sx={(t) => ({ border: `1px dashed ${t.palette.border.default}`, borderRadius: 1 })}>
            <GridEmptyOverlay actionLabel="Clear filters" onAction={() => {}} />
          </Box>
          <Box sx={(t) => ({ border: `1px dashed ${t.palette.border.default}`, borderRadius: 1 })}>
            <EmptyState
              title="No surveys in Kaimur yet"
              body="Surveys appear here within minutes of a surveyor submitting from the field app."
              minHeight={140}
            />
          </Box>
        </Stack>
      </Section>

      <Section
        title="KpiStrip"
        note="One reading of N measures, on a single outlined surface divided by inset hairlines. Passive — these are figures to read, not a menu. The hairline only works in a single row, which is why a deck is a different component."
      >
        <KpiStrip
          items={[
            { label: "Registered", value: 9673, note: "Jamui circle, 7 upload batches" },
            { label: "Surveyed", value: 9, delta: 12.5, note: "Kaimur district" },
            { label: "Coverage", value: 0, unit: "%", metricId: "coverage_pct", note: "Master and survey do not join" },
            { label: "Feasible", value: 7, note: "of 9 surveyed" },
            { label: "Open exceptions", value: 12, delta: 40, deltaGood: false },
          ]}
        />
      </Section>

      <Section
        title="TileDeck"
        note="Navigation, so it is a real tablist — one tab stop for the whole deck, arrows to move, Home/End to jump, and the pane labelled by its tile. Under RTL the arrows follow reading order, not screen geometry."
      >
        <DeckDemo />
      </Section>

      <Section
        title="WsTable"
        note="Search, per-column filters, multi-sort with shift-click, freeze, resize, density, hide, CSV export and full screen — all from the table's own toolbar, never the page header. Preferences persist per table."
      >
        <WsTable
          title="Survey submissions"
          note="Click a header's funnel to filter, shift-click to add a sort level"
          exportName="gallery-surveys"
          cols={wsCols([
            ["consumer", "Consumer", { minWidth: 160 }],
            ["number", "Consumer number", { width: 150 }],
            ["panchayat", "Panchayat", { width: 130 }],
            ["roof", "Roof", { width: 110 }],
            ["orientation", "Orientation", { width: 130 }],
            ["verdict", "Verdict", { width: 150, chip: "good" }],
            ["photos", "Photos", { width: 100, align: "right", type: "number" }],
            ["accuracy", "GPS (m)", { width: 100, align: "right", type: "number" }],
          ])}
          rows={SURVEY_ROWS}
          pageSize={5}
        />
      </Section>

      <Section
        title="Charts"
        note="Two charts may sit side by side. A table never may — a 40-character consumer name has nowhere to go in half a page."
      >
        <WsSplit>
          <EChartCard
            title="Registered by section"
            note="Jamui circle"
            option={rankedBarOption({
              data: [
                { name: "SONO", value: 1887 },
                { name: "JAMUI(R)", value: 1287 },
                { name: "LAXMIPUR", value: 1226 },
                { name: "GIDDHAUR", value: 1168 },
                { name: "BARHAT", value: 1135 },
                { name: "JHAJHA", value: 950 },
                { name: "SIKANDRA", value: 706 },
              ],
            })}
            height={260}
          />
          <EChartCard
            title="Pipeline"
            note="Nine stage gates; seven are unstarted"
            option={funnelOption({
              stages: [
                { name: "Registered", value: 9673 },
                { name: "Assigned", value: 0 },
                { name: "Surveyed", value: 9 },
                { name: "Validated", value: 0 },
                { name: "MCO raised", value: 0 },
                { name: "Meter/MDM", value: 0 },
              ],
            })}
            height={260}
          />
        </WsSplit>
      </Section>

      <Section title="Buttons and controls">
        <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="contained">Primary</Button>
          <Button variant="contained" color="secondary">
            Accent
          </Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button variant="contained" disabled>
            Disabled
          </Button>
          <Button size="small" variant="contained">
            Small
          </Button>
        </Stack>
      </Section>
    </Box>
  );
}
