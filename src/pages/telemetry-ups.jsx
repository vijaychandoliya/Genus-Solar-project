/**
 * UPS telemetry — docs/ia-and-screen-plan.md §7.6.
 *
 * The source DMS shows Device No., Date Time, Voltage and Load. Two things are
 * added here and one is corrected:
 *
 * · MODE is added, and it leads. Plan §5.3: "UPS mode = Bypass is the
 *   highest-severity state in the fleet and is a band, not a status string —
 *   bypass removes protection entirely while reporting no fault at all." The
 *   source screen omits mode entirely, which means the single most dangerous
 *   state a UPS can be in is invisible in the product that monitors it. If the
 *   extract turns out not to carry the field, the column says so rather than
 *   disappearing — an absent field and a healthy field must not look alike.
 *
 * · LOAD is shown as reported AND as a percentage of rated VA, which is the
 *   form that answers "is this unit about to trip". The percentage is
 *   uncomputable until the registry carries `rated_va`, so it renders unknown
 *   with that reason attached rather than as a bare number that looks like a
 *   percentage but is not one.
 *
 * · VOLTAGE of 0.00 is corrected from a measurement to silence. 41 of the
 *   source's 42 rows carry it; `grid_voltage`'s plausibility floor resolves it
 *   to unknown, so the fleet reads as un-reporting rather than as a fleet-wide
 *   brownout.
 */
import { useMemo, useState } from "react";
import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";
import { WsPage, WsContext, WsTable, wsCols, resultNote } from "../components/workspaces.jsx";
import { FilterBar, MetricInfo, WsDateRange } from "../components/molecules.jsx";
import { BandChip, BandedValue, EmptyState, FreshnessChip, NotConfigured } from "../components/atoms.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { UPS_READINGS, readingsFor, PENDING } from "../lib/device-data.js";
import { bandDetail, bandWithFreshness, stateLabel } from "../lib/bands.js";
import { exInt, exNum, toDmyTime, ageFrom } from "../lib/format.js";

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

export default function TelemetryUps() {
  const { node, pathLabel } = useHierarchy();
  const [range, setRange] = useState({ start: null, end: null });

  const all = useMemo(() => readingsFor(UPS_READINGS, node.id), [node]);
  const rows = useMemo(() => readingsFor(UPS_READINGS, node.id, range), [node, range]);

  const cols = wsCols([
    ["deviceNo", "Device no.", { minWidth: 190 }],
    [
      "timestamp",
      "Date time",
      { width: 160, renderCell: ({ value }) => (value ? toDmyTime(value) : "—") },
    ],
    [
      "mode",
      "Mode",
      {
        width: 150,
        renderCell: ({ row }) => {
          // A field the source may not carry at all. "Not reported" is a
          // different fact from "Line", and must not render as one.
          if (row.mode === undefined) {
            return <NotConfigured hint="This extract does not carry a UPS mode field. Bypass — the fleet's highest-severity state — cannot be detected without it." />;
          }
          const band = bandWithFreshness("ups_mode", row.mode, row.freshness, row.nameplate);
          return <BandChip band={band} label={stateLabel("ups_mode", row.mode)} />;
        },
      },
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
      "voltage",
      "Voltage",
      {
        width: 130,
        align: "right",
        renderCell: ({ row }) => <Cell metric="grid_voltage" value={row.voltage} row={row} unit="V" dp={1} />,
      },
    ],
    [
      "load",
      "Load (reported)",
      {
        width: 140,
        align: "right",
        renderCell: ({ value }) => (value == null ? "—" : exNum(value, 2)),
      },
    ],
    [
      "loadPct",
      "Load vs rated",
      {
        width: 140,
        align: "right",
        renderCell: ({ row }) => <Cell metric="ups_load" value={row.loadPct} row={row} unit="%" dp={1} />,
      },
    ],
  ]);

  return (
    <WsPage
      title="UPS"
      subtitle="Uninterruptible supplies across the fleet. Mode leads, because bypass removes protection entirely while reporting no fault at all."
      breadcrumbs={[
        { label: "Genus Solar", href: "/overview" },
        { label: "Telemetry", href: "/telemetry/ups" },
        { label: "UPS" },
      ]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Readings", value: `${exInt(all.length)} in scope` },
          ]}
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
        title="UPS readings"
        note="A voltage of 0.00 in the source extract is silence, not a blackout — it resolves to no reading, with the reason on the cell."
        exportName="telemetry-ups"
        cols={cols}
        rows={rows}
        lockFirstColumn
        pageSize={10}
        emptyOverlay={
          <EmptyState
            icon={<PowerOutlinedIcon />}
            title="Readings not yet ingested"
            body={PENDING.ups.detail}
            minHeight={200}
          />
        }
      />
    </WsPage>
  );
}
