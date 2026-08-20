/**
 * BMS telemetry — docs/ia-and-screen-plan.md §7.6.
 *
 * "Wide by design — the BMS grid carries ~20 columns and that is legitimate for
 * an analyst comparing across the fleet. Ship a default visible set of 8, with
 * the rest available through the Columns menu." That is chunking, not capping:
 * hiding columns an analyst needs would be simplification into uselessness.
 *
 * Three columns exist here that the source DMS does not have, and they are the
 * point of rebuilding it:
 *
 * · TEMP SPREAD — plan §5.4's derived diagnostic. Spread matters as much as the
 *   maximum: it points at uneven cooling, a hot cell or a bad connection, none
 *   of which show up in a max-temperature column.
 *
 * · FAULTY PROBES — how many of the four thermistors returned a sentinel. The
 *   source table prints -58.0 as if it were a temperature; three of its rows
 *   carry one. Naming the fault is the difference between dispatching an
 *   engineer to a broken sensor and dispatching one to a thermal runaway.
 *
 * · REPORTING — freshness. A pack at 0% SOC with 0 cycles has almost certainly
 *   never reported, and painting that critical-red is a lie about the present.
 */
import { useMemo, useState } from "react";
import BatteryChargingFullOutlinedIcon from "@mui/icons-material/BatteryChargingFullOutlined";
import { WsPage, WsContext, WsTable, wsCols, resultNote } from "../components/workspaces.jsx";
import { FilterBar, MetricInfo, WsDateRange } from "../components/molecules.jsx";
import { BandedValue, EmptyState, FreshnessChip, WsTag } from "../components/atoms.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { BMS_READINGS, readingsFor, PENDING } from "../lib/device-data.js";
import { bandDetail, bandWithFreshness } from "../lib/bands.js";
import { exInt, toDmyTime, ageFrom } from "../lib/format.js";

/**
 * One banded telemetry cell.
 *
 * `bandWithFreshness`, never `bandFor` — a stale reading gets no band at all
 * (AGENTS.md §2). And when the band comes back `unknown`, the REASON is
 * attached, so the reader learns whether the value is missing, implausible, or
 * simply unjudgeable without a nameplate.
 */
function Cell({ metric, value, row, dp = 0, unit }) {
  const band = bandWithFreshness(metric, value, row.freshness, row.nameplate);
  const { reason } = bandDetail(metric, value, row.nameplate);
  return (
    <BandedValue
      value={value}
      unit={unit}
      dp={dp}
      band={band}
      info={band === "unknown" && reason ? <MetricInfo metricId={metric} body={reason} /> : undefined}
    />
  );
}

export default function TelemetryBms() {
  const { node, pathLabel } = useHierarchy();
  const [range, setRange] = useState({ start: null, end: null });

  const all = useMemo(() => readingsFor(BMS_READINGS, node.id), [node]);
  const rows = useMemo(() => readingsFor(BMS_READINGS, node.id, range), [node, range]);

  const faultyProbeRows = rows.filter((r) => r.faultyProbes > 0).length;

  const cols = wsCols([
    ["deviceNo", "Device no.", { minWidth: 190 }],
    [
      "timestamp",
      "Date time",
      { width: 160, renderCell: ({ value }) => (value ? toDmyTime(value) : "—") },
    ],
    [
      "freshness",
      "Reporting",
      {
        width: 150,
        sortable: false,
        renderCell: ({ row }) => (
          <FreshnessChip freshness={row.freshness} age={row.timestamp ? ageFrom(row.timestamp) : undefined} />
        ),
      },
    ],
    [
      "soc",
      "SOC",
      {
        width: 110,
        align: "right",
        renderCell: ({ row }) => <Cell metric="soc" value={row.soc} row={row} unit="%" dp={1} />,
      },
    ],
    [
      "packTemp",
      "Pack temp",
      {
        width: 120,
        align: "right",
        renderCell: ({ row }) => <Cell metric="pack_temp" value={row.packTemp} row={row} unit="°C" dp={1} />,
      },
    ],
    [
      "tempSpread",
      "Temp spread",
      {
        width: 130,
        align: "right",
        renderCell: ({ row }) =>
          row.tempSpread == null ? (
            <BandedValue
              value={null}
              band="unknown"
              info={<MetricInfo metricId="temp_spread" body={row.tempSpreadReason ?? undefined} />}
            />
          ) : (
            <Cell metric="temp_spread" value={row.tempSpread} row={row} unit="°C" dp={1} />
          ),
      },
    ],
    [
      "faultyProbes",
      "Faulty probes",
      {
        width: 130,
        align: "right",
        renderCell: ({ value }) =>
          value > 0 ? <WsTag label={`${value} of 4`} /> : <span>—</span>,
      },
    ],
    [
      "cycles",
      "Cycles",
      {
        width: 110,
        align: "right",
        renderCell: ({ row }) => <Cell metric="charge_cycles" value={row.cycles} row={row} />,
      },
    ],
    /* ── beyond the default 8 — available through the Columns menu ───────── */
    ["temp1", "Temp 1", { width: 100, align: "right", type: "number" }],
    ["temp2", "Temp 2", { width: 100, align: "right", type: "number" }],
    ["temp3", "Temp 3", { width: 100, align: "right", type: "number" }],
    ["temp4", "Temp 4", { width: 100, align: "right", type: "number" }],
    ["cells", "Cells", { width: 90, align: "right", type: "number" }],
    ["capacity", "Capacity", { width: 110, align: "right", type: "number" }],
    [
      "capacityRatio",
      "Capacity vs rated",
      {
        width: 150,
        align: "right",
        renderCell: ({ row }) => <Cell metric="capacity_ratio" value={row.capacityRatio} row={row} unit="%" />,
      },
    ],
  ]);

  return (
    <WsPage
      title="BMS"
      subtitle="Battery packs across the fleet. Pack temperature and spread are derived from the four thermistors, counting only the ones returning a plausible value."
      breadcrumbs={[
        { label: "Genus Solar", href: "/overview" },
        { label: "Telemetry", href: "/telemetry/bms" },
        { label: "BMS" },
      ]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Readings", value: `${exInt(all.length)} in scope` },
          ]}
          chips={
            faultyProbeRows > 0
              ? [<WsTag key="probes" label={`${faultyProbeRows} rows with a faulty thermistor`} />]
              : []
          }
        />
      }
    >
      <FilterBar
        resultNote={resultNote(rows.length, all.length, "readings")}
        onClear={range.start || range.end ? () => setRange({ start: null, end: null }) : undefined}
      >
        <WsDateRange start={range.start} end={range.end} onChange={setRange} />
      </FilterBar>

      <WsTable
        title="Pack readings"
        note="Eight columns by default; the four raw thermistors, cell count and capacity are in the Columns menu."
        exportName="telemetry-bms"
        cols={cols}
        rows={rows}
        lockFirstColumn
        pageSize={10}
        emptyOverlay={
          <EmptyState
            icon={<BatteryChargingFullOutlinedIcon />}
            title="Readings not yet ingested"
            body={PENDING.bms.detail}
            minHeight={200}
          />
        }
      />
    </WsPage>
  );
}
