/**
 * Alarms — Rules.
 *
 * This screen has no fixtures. It is a view of `src/lib/bands.js`, which is
 * the live registry every `<BandedValue>` in the product already resolves
 * through — so what is shown here IS what the platform enforces, and the two
 * cannot drift.
 *
 * ── Editing here changes the product, immediately ───────────────────────
 * Unlike the roles matrix, which governs nothing until an auth layer exists,
 * these thresholds are load-bearing today. Every `bandFor` call reads the
 * registry at call time, so moving a bound repaints Alarms, Overview and every
 * telemetry grid on the next render. That is the reason to make it editable —
 * it is the only way to see what a threshold change actually costs before
 * committing to it — and it is why the banner says so rather than letting
 * someone discover it.
 *
 * ── A ladder can be incoherent in a way a permission grant cannot ───────
 * `warningHigh: 40` beneath `watchHigh: 45` leaves the watch band unreachable:
 * 42 is already `warning`, so the band configured to fire first never fires.
 * Nothing throws — the metric quietly stops meaning what its author intended.
 * So `ladderProblem()` validates the WHOLE ladder on every write and the cell
 * refuses the change with the reason, rather than accepting it and producing a
 * dead band.
 *
 * Three columns exist because of specific, already-paid-for bugs:
 *   · Plausibility — the -58 °C thermistor sentinel that banded as `critical`.
 *   · Requires     — a metric with unmet prerequisites is `unknown`, never
 *                    `normal`, and an operator needs to see which ones are
 *                    gated before wondering why a column is grey.
 *   · Seeded       — thresholds marked [seed] in the source are domain
 *                    defaults, not derived from this fleet.
 */
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { WsPage, WsContext, WsSection, WsTable, wsCols } from "../components/workspaces.jsx";
import { BandChip, StatusChip, SectionLabel } from "../components/atoms.jsx";
import { MetricInfo, TileDeck, TilePane } from "../components/molecules.jsx";
import {
  BAND_LABEL,
  BAND_ORDER,
  METRICS,
  METRIC_GROUPS,
  GROUP_OF,
  THRESHOLD_BAND,
  THRESHOLD_LABEL,
  bandDetail,
  metricIsModified,
  resetMetric,
  resetRules,
  rulesDiff,
  rulesVersionSnapshot,
  setPlausible,
  setStateBand,
  setThreshold,
  subscribeRules,
} from "../lib/bands.js";
import { announce } from "../components/organisms/shell.jsx";
import { exInt } from "../lib/format.js";

const POLARITY_LABEL = {
  htb: "Higher is better",
  ltb: "Lower is better",
  band: "In-range is better",
  enum: "Named states",
};

/** Metric ids whose thresholds the registry marks as domain seeds, not derived. */
const SEEDED = new Set([
  "cell_voltage",
  "cell_delta",
  "pack_temp",
  "temp_spread",
  "charge_cycles",
  "soh",
  "soc",
  "capacity_ratio",
  "grid_voltage",
  "ups_load",
  "grid_frequency",
  "power_factor",
]);

/* Low side and high side are separate cells rather than one scale.
   Most metrics are one-sided — "higher is better" declares only low bounds —
   so a single column was mostly empty for two thirds of the registry and
   wrapped to six lines for the five `band`-polarity metrics that use both.
   Split, the polarity is legible from the shape of the row before reading a
   word of it, and no cell exceeds three fields.

   All of these are module level, never declared inside a render body: a
   component redefined per render is a new type each time, so React remounts it
   and the input loses focus on the first keystroke (AGENTS.md §5). */

const LOW_KEYS = ["criticalLow", "warningLow", "watchLow"];
const HIGH_KEYS = ["watchHigh", "warningHigh", "criticalHigh"];

/** One threshold bound. Blank clears it — a one-sided metric needs only its own. */
function BoundField({ metricId, boundKey, unit, onReject }) {
  const m = METRICS[metricId];
  const stored = m.thresholds?.[boundKey];
  const [draft, setDraft] = useState(stored ?? "");
  const [local, setLocal] = useState(null);

  // The store is the source of truth; a reset elsewhere has to win over a
  // stale local draft.
  const shown = local !== null ? local : (stored ?? "");

  const commit = (raw) => {
    const result = setThreshold(metricId, boundKey, raw);
    if (result.ok) {
      setLocal(null);
      onReject(null);
    } else {
      setLocal(raw);
      onReject(result.reason);
    }
  };

  return (
    <Stack direction="row" sx={{ gap: 0.5, alignItems: "center" }}>
      <BandChip band={THRESHOLD_BAND[boundKey]} label={BAND_LABEL[THRESHOLD_BAND[boundKey]]} />
      <TextField
        size="small"
        type="number"
        value={shown}
        placeholder="—"
        // MUI v9: a bare aria-label lands on the FormControl root, not the
        // input, leaving the field with no accessible name (AGENTS.md §4).
        slotProps={{ htmlInput: { "aria-label": `${THRESHOLD_LABEL[boundKey]} for ${m.label}` } }}
        onChange={(e) => {
          setDraft(e.target.value);
          commit(e.target.value);
        }}
        sx={{
          width: 82,
          "& .MuiInputBase-input": {
            py: 0.25,
            fontSize: 12,
            fontVariantNumeric: "tabular-nums",
            textAlign: "right",
          },
        }}
      />
      {unit && (
        <Typography variant="caption" sx={{ color: "text.tertiary" }}>
          {unit}
        </Typography>
      )}
    </Stack>
  );
}

function BoundList({ metricId, side, onReject }) {
  const m = METRICS[metricId];

  // An enum has no sides. Its states are the whole rule, so each state gets a
  // band picker in the low cell and the high cell says there is nothing there.
  if (m.polarity === "enum") {
    if (side === "high") return <Dash />;
    return (
      <Stack sx={{ gap: 0.5, py: 0.5 }}>
        {Object.entries(m.states).map(([key, st]) => (
          <Stack key={key} direction="row" sx={{ gap: 0.5, alignItems: "center" }}>
            <Typography variant="caption" sx={{ minWidth: 74, color: "text.secondary" }}>
              {st.label}
            </Typography>
            <TextField
              select
              size="small"
              value={st.band}
              slotProps={{ htmlInput: { "aria-label": `Band for ${m.label} state ${st.label}` } }}
              onChange={(e) => {
                const r = setStateBand(metricId, key, e.target.value);
                onReject(r.ok ? null : r.reason);
              }}
              sx={{ minWidth: 116, "& .MuiSelect-select": { py: 0.25, fontSize: 11.5 } }}
            >
              {BAND_ORDER.map((b) => (
                <MenuItem key={b} value={b} dense>
                  {BAND_LABEL[b]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        ))}
      </Stack>
    );
  }

  const keys = side === "low" ? LOW_KEYS : HIGH_KEYS;
  return (
    <Stack sx={{ gap: 0.5, py: 0.5 }}>
      {keys.map((k) => (
        <BoundField key={k} metricId={metricId} boundKey={k} unit={m.unit} onReject={onReject} />
      ))}
    </Stack>
  );
}

/** Plausibility min/max. The floor runs before the thresholds, so widening it
    can re-enable exactly the sensor-fault bug the floor exists to stop. */
function PlausibleEditor({ metricId, onReject }) {
  const m = METRICS[metricId];
  const p = m.plausible;

  const field = (key, label) => (
    <Stack direction="row" sx={{ gap: 0.5, alignItems: "center" }}>
      <Typography variant="caption" sx={{ minWidth: 26, color: "text.tertiary" }}>
        {label}
      </Typography>
      <TextField
        size="small"
        type="number"
        value={p?.[key] ?? ""}
        placeholder="—"
        slotProps={{ htmlInput: { "aria-label": `Plausible ${key} for ${m.label}` } }}
        onChange={(e) => {
          const r = setPlausible(metricId, key, e.target.value);
          onReject(r.ok ? null : r.reason);
        }}
        sx={{
          width: 84,
          "& .MuiInputBase-input": {
            py: 0.25,
            fontSize: 12,
            fontVariantNumeric: "tabular-nums",
            textAlign: "right",
          },
        }}
      />
    </Stack>
  );

  return (
    <Stack sx={{ gap: 0.5, py: 0.5 }}>
      {field("min", "Min")}
      {field("max", "Max")}
      {p?.sentinel?.length > 0 && (
        <Typography variant="caption" sx={{ color: "text.tertiary" }} dir="ltr">
          sentinels {p.sentinel.join(", ")}
        </Typography>
      )}
    </Stack>
  );
}

function Dash() {
  return (
    <Typography variant="body2" sx={{ color: "text.tertiary" }}>
      —
    </Typography>
  );
}

/* Type a value, see the band the LIVE registry gives it, with the reason.
   This is what makes the editor usable: "what happens at 47?" is the question
   you actually have while moving a bound, and guessing at it from six numbers
   in a row is how thresholds get set wrong. */
function BandTester({ metricId, onMetric }) {
  const [value, setValue] = useState("");
  const m = METRICS[metricId];
  const parsed = value === "" ? null : Number(value);
  const detail =
    parsed === null || Number.isNaN(parsed) ? null : bandDetail(metricId, parsed, null);

  return (
    <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 2, alignItems: { sm: "flex-start" } }}>
      <TextField
        select
        size="small"
        label="Metric"
        value={metricId}
        onChange={(e) => onMetric(e.target.value)}
        sx={{ minWidth: 240 }}
      >
        {Object.entries(METRICS).map(([id, mm]) => (
          <MenuItem key={id} value={id} dense>
            {mm.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        size="small"
        type="number"
        label="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        helperText={m.unit ? `In ${m.unit}` : "Unitless"}
        sx={{ width: 150 }}
      />

      <Box sx={{ pt: 0.5, minWidth: 0, flex: 1 }}>
        {detail ? (
          <Stack sx={{ gap: 0.75 }}>
            <Stack direction="row" sx={{ gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Resolves to
              </Typography>
              {detail.band === "normal" ? (
                <StatusChip label="Normal — no colour in a grid" tone="neutral" />
              ) : (
                <BandChip band={detail.band} label={BAND_LABEL[detail.band]} />
              )}
            </Stack>
            {detail.reason && (
              <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                {detail.reason}
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: "text.tertiary" }}>
            Enter a value to see how the current thresholds judge it.
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function plausibilityText(m) {
  if (!m.plausible) return null;
  const { min, max, sentinel } = m.plausible;
  const range =
    min !== undefined && max !== undefined
      ? `${min} … ${max}${m.unit ? ` ${m.unit}` : ""}`
      : min !== undefined
        ? `≥ ${min}`
        : `≤ ${max}`;
  return sentinel?.length ? `${range} · sentinels ${sentinel.join(", ")}` : range;
}

export default function AlarmsRules() {
  const [group, setGroup] = useState("all");
  const [reject, setReject] = useState(null);
  const [testMetric, setTestMetric] = useState("pack_temp");

  // A version counter, not the registry: the registry is mutated in place so
  // every existing METRICS[id] reader keeps working untouched.
  const version = useSyncExternalStore(subscribeRules, rulesVersionSnapshot);

  const onReject = useCallback((reason) => setReject(reason), []);

  const rows = useMemo(
    () =>
      Object.entries(METRICS).map(([id, m]) => ({
        id,
        // Kept alongside the per-column render keys: the plausibility editor
        // and the per-row reset both need the metric id, and reading it off a
        // column field that happens to hold it is how it went missing before.
        metricId: id,
        lowSide: id,
        highSide: id,
        definition: id,
        label: m.label,
        group: GROUP_OF[id].label,
        groupId: GROUP_OF[id].id,
        unit: m.unit || "—",
        polarity: POLARITY_LABEL[m.polarity] ?? m.polarity,
        plausible: plausibilityText(m),
        requires: m.requires?.join(", ") ?? null,
        seeded: SEEDED.has(id),
        modified: metricIsModified(id),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const diff = useMemo(() => rulesDiff(), [version]);

  const shown = group === "all" ? rows : rows.filter((r) => r.groupId === group);

  const withFloor = rows.filter((r) => r.plausible).length;
  const gated = rows.filter((r) => r.requires).length;
  const seeded = rows.filter((r) => r.seeded).length;
  const modified = rows.filter((r) => r.modified).length;

  const tiles = [
    { id: "all", label: "All metrics", value: exInt(rows.length) },
    ...METRIC_GROUPS.map((g) => ({
      id: g.id,
      label: g.label,
      value: exInt(g.metrics.length),
    })),
  ];

  const cols = wsCols([
    ["label", "Metric", { width: 190 }],
    ["group", "Group", { width: 180 }],
    [
      "lowSide",
      "Low side",
      {
        width: 250,
        sortable: false,
        renderCell: ({ value }) => <BoundList metricId={value} side="low" onReject={onReject} />,
      },
    ],
    [
      "highSide",
      "High side",
      {
        width: 250,
        sortable: false,
        renderCell: ({ value }) => <BoundList metricId={value} side="high" onReject={onReject} />,
      },
    ],
    ["unit", "Unit", { width: 80 }],
    ["polarity", "Direction", { width: 150 }],
    [
      "plausible",
      "Plausible range",
      {
        width: 200,
        renderCell: ({ row }) => <PlausibleEditor metricId={row.metricId} onReject={onReject} />,
      },
    ],
    [
      "requires",
      "Gated on",
      {
        width: 190,
        renderCell: ({ value }) => (value ? <StatusChip label={value} tone="warning" /> : <Dash />),
      },
    ],
    [
      "seeded",
      "Source",
      {
        width: 130,
        valueGetter: (v) => (v ? "Seed default" : "Derived"),
        renderCell: ({ row }) =>
          row.seeded ? (
            <StatusChip label="Seed default" tone="warning" />
          ) : (
            <StatusChip label="Derived" tone="neutral" />
          ),
      },
    ],
    [
      "modified",
      "Changed",
      {
        width: 130,
        valueGetter: (v) => (v ? "Changed" : "As shipped"),
        renderCell: ({ row }) =>
          row.modified ? (
            <Stack direction="row" sx={{ gap: 0.5, alignItems: "center" }}>
              <StatusChip label="Changed" tone="warning" />
              <Tooltip title={`Reset ${row.label} to the shipped values`}>
                <IconButton
                  size="small"
                  aria-label={`Reset ${row.label}`}
                  onClick={() => {
                    resetMetric(row.metricId);
                    setReject(null);
                    announce(`${row.label} reset to the shipped thresholds.`);
                  }}
                >
                  <RestartAltIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: "text.tertiary" }}>
              As shipped
            </Typography>
          ),
      },
    ],
    [
      "definition",
      "Definition",
      {
        width: 100,
        align: "center",
        sortable: false,
        renderCell: ({ value }) => (
          <MetricInfo
            metricId={value}
            title={METRICS[value].label}
            body={METRICS[value].hint}
            caveat={METRICS[value].caveat}
          />
        ),
      },
    ],
  ]);

  return (
    <WsPage
      title="Alarm rules"
      subtitle="The live band registry every value in this product resolves through. Edit any bound and the change applies across the product immediately — the shipped values are kept underneath, so every deviation stays listed and exportable."
      breadcrumbs={[
        { label: "Genus Solar", href: "/overview" },
        { label: "Alarms", href: "/alarms" },
        { label: "Rules" },
      ]}
      context={
        <WsContext
          items={[
            { label: "Metrics", value: `${exInt(rows.length)} in registry` },
            { label: "With a plausibility floor", value: `${exInt(withFloor)} of ${exInt(rows.length)}` },
            { label: "Gated on nameplate", value: exInt(gated) },
            { label: "On seed thresholds", value: `${exInt(seeded)} unverified` },
            {
              label: "Changed from shipped",
              value: modified ? `${exInt(modified)} metric${modified === 1 ? "" : "s"}` : "None",
            },
          ]}
        />
      }
      actions={
        <Button
          size="small"
          variant="outlined"
          startIcon={<RestartAltIcon />}
          disabled={diff.length === 0}
          onClick={() => {
            resetRules();
            setReject(null);
            announce("All thresholds reset to the shipped registry.");
          }}
        >
          Reset all
        </Button>
      }
    >
      <Alert severity="warning" variant="outlined">
        <strong>These edits are live across the whole product.</strong> Unlike the roles matrix,
        thresholds are load-bearing today — moving a bound repaints Alarms, Overview and every
        telemetry grid on the next render. Nothing persists, so a reload restores the shipped
        registry. An incoherent ladder is refused rather than accepted, because a threshold set that
        leaves a band unreachable fails silently.
      </Alert>

      {reject && (
        <Alert severity="error" variant="outlined" onClose={() => setReject(null)}>
          <strong>Change refused.</strong> {reject}
        </Alert>
      )}

      <WsSection
        title="Try a value"
        note="Resolved through the same bandDetail() the product uses — including the plausibility floor"
      >
        <BandTester metricId={testMetric} onMetric={setTestMetric} />
      </WsSection>

      <WsSection padded={false}>
        <Box sx={{ p: 2, pb: 0 }}>
          <SectionLabel>Filter by group</SectionLabel>
        </Box>
        <Box sx={{ p: 2, pt: 1 }}>
          <TileDeck items={tiles} value={group} onChange={setGroup} idPrefix="rulegroup" />
          <TilePane deckId="rulegroup" value={group}>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
              {group === "all"
                ? "Every metric the band registry knows about, across all device classes and the programme pipeline."
                : METRIC_GROUPS.find((g) => g.id === group)?.note}
            </Typography>
          </TilePane>
        </Box>
      </WsSection>

      <WsTable
        title="Band registry"
        note="Thresholds, plausibility floors and prerequisites, read live from bands.js"
        exportName="alarm-rules"
        cols={cols}
        rows={shown}
        pageSize={25}
        lockFirstColumn
      />

      {diff.length > 0 && (
        <WsTable
          title="Changed from the shipped registry"
          note="Every deviation from bands.js, exportable — this is the artefact to hand back"
          exportName="alarm-rule-deviations"
          search={false}
          pageSize={25}
          cols={wsCols([
            ["metric", "Metric", { width: 210 }],
            ["field", "Bound", { width: 180 }],
            ["from", "Shipped", { width: 150 }],
            ["to", "Now", { width: 150 }],
          ])}
          rows={diff}
        />
      )}

      <WsSection title="How a value resolves" note="The order matters — it is why a broken sensor does not raise an alarm">
        <Stack component="ol" sx={{ gap: 1.25, pl: 2.5, m: 0 }}>
          <Typography component="li" variant="body2" sx={{ color: "text.secondary" }}>
            <strong>Plausibility first.</strong> A value outside its metric&apos;s declared range, or
            matching a known sentinel, returns <em>unknown</em> with the reason — never the nearest
            extreme. A pack thermistor reading −58&nbsp;°C is an open circuit, not a cold battery.
          </Typography>
          <Typography component="li" variant="body2" sx={{ color: "text.secondary" }}>
            <strong>Prerequisites next.</strong> A metric whose <code>requires</code> are unmet
            returns <em>unknown</em>, never <em>normal</em>. A pack voltage cannot be judged before
            chemistry and series count are known.
          </Typography>
          <Typography component="li" variant="body2" sx={{ color: "text.secondary" }}>
            <strong>Then the thresholds</strong>, worst-matching bound wins.
          </Typography>
          <Typography component="li" variant="body2" sx={{ color: "text.secondary" }}>
            <strong>Freshness last.</strong> A stale or offline reading gets no band at all — the
            value stays visible and de-emphasised, because a four-hour-old number painted green is a
            lie about the present.
          </Typography>
        </Stack>
      </WsSection>
    </WsPage>
  );
}
