/**
 * Meter telemetry — the `MS-*` body of every gateway Data message.
 *
 * This screen exists because of what the payloads turned out to contain. The
 * source DMS labels this stream "GTI Data" and shows five envelope columns —
 * Msg ID, Max Index, Index, Load, Timestamp — then discards the sixty-odd meter
 * fields underneath: voltage, frequency, power factor, import and export energy,
 * max demand, billing registers, tamper status, and the meter's own nameplate.
 *
 * Import AND export registers on a Genus single-phase C3 meter is net metering.
 * That is the rooftop's revenue meter, and it is the most consequential data in
 * the whole payload — it is what the consumer is paid on.
 *
 * Three columns here have no equivalent anywhere in the source system:
 *
 * · METER CLOCK SKEW — the meter's own RTC against the message that carried it.
 *   One sample gateway is 25 days behind, the other 72 days ahead, and each
 *   one's billing stamps agree with its own wrong clock. Nothing else on the row
 *   looks wrong, which is exactly why this needs a column.
 *
 * · INGESTION LAG — filename UTC minus payload IST, 4–5 s in the sample.
 *
 * · A withheld POWER FACTOR. At zero current PF is a register default, not a
 *   measurement, so it resolves unknown rather than to a false green.
 */
import { useMemo, useState } from "react";
import { Button } from "@mui/material";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import { WsPage, WsContext, WsTable, wsCols, resultNote } from "../components/workspaces.jsx";
import { FilterBar, JsonPayloadDialog, MetricInfo, WsDateRange } from "../components/molecules.jsx";
import { BandedValue, EmptyState, FreshnessChip, StatusChip, WsTag } from "../components/atoms.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { METER_READINGS, readingsFor, SAMPLE_SCOPE } from "../lib/device-data.js";
import { bandDetail, bandFor, bandWithFreshness } from "../lib/bands.js";
import { exInt, exNum, toDmyTime, ageFrom } from "../lib/format.js";

/** A banded cell that always carries the reason when it comes back unknown. */
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

export default function TelemetryMeter() {
  const { node, pathLabel } = useHierarchy();
  const [range, setRange] = useState({ start: null, end: null });
  const [payloadRow, setPayloadRow] = useState(null);

  const all = useMemo(() => readingsFor(METER_READINGS, node.id), [node]);
  const rows = useMemo(() => readingsFor(METER_READINGS, node.id, range), [node, range]);

  const failed = rows.filter((r) => r.readFailed).length;
  const skewed = rows.filter((r) => r.meterClockSkewDays != null && Math.abs(r.meterClockSkewDays) > 1).length;

  const cols = wsCols([
    ["deviceNo", "Device no.", { minWidth: 175 }],
    [
      "timestamp",
      "Timestamp",
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
      "readFailed",
      "Read",
      {
        width: 120,
        renderCell: ({ value }) =>
          value ? (
            <StatusChip label="No response" tone="warning" />
          ) : (
            <StatusChip label="OK" tone="neutral" />
          ),
      },
    ],
    [
      "voltage",
      "Voltage",
      {
        width: 120,
        align: "right",
        renderCell: ({ row }) => <Cell metric="grid_voltage" value={row.voltage} row={row} unit="V" dp={2} />,
      },
    ],
    [
      "frequency",
      "Frequency",
      {
        width: 125,
        align: "right",
        renderCell: ({ row }) => <Cell metric="grid_frequency" value={row.frequency} row={row} unit="Hz" dp={3} />,
      },
    ],
    [
      "powerFactor",
      "Power factor",
      {
        width: 140,
        align: "right",
        renderCell: ({ row }) =>
          row.powerFactorWithheld ? (
            <BandedValue
              value={null}
              band="unknown"
              info={
                <MetricInfo
                  metricId="power_factor"
                  body="Withheld — the meter is drawing under 0.05 A, so its 1.000 reading is a register default rather than a measurement."
                />
              }
            />
          ) : (
            <Cell metric="power_factor" value={row.powerFactor} row={row} dp={3} />
          ),
      },
    ],
    [
      "meterClockSkewDays",
      "Clock skew",
      {
        width: 130,
        align: "right",
        renderCell: ({ row }) =>
          row.meterClockSkewDays == null ? (
            <BandedValue
              value={null}
              band="unknown"
              info={<MetricInfo metricId="meter_clock_skew" body="The meter did not report its clock." />}
            />
          ) : (
            // NOT freshness-gated, unlike the measurements. A skew is a property
            // of the message, not a live reading — one computed from a
            // seventeen-hour-old frame is exactly as true as it was on arrival,
            // and suppressing it would hide the most consequential defect on
            // the row precisely when the device stops reporting.
            <BandedValue
              value={Math.abs(row.meterClockSkewDays)}
              unit="d"
              dp={1}
              band={bandFor("meter_clock_skew", Math.abs(row.meterClockSkewDays))}
              info={
                <MetricInfo
                  metricId="meter_clock_skew"
                  body={`Meter clock reads ${toDmyTime(row.meterClock)} against a message stamped ${toDmyTime(row.timestamp)} — ${row.meterClockSkewDays > 0 ? "ahead" : "behind"} by ${Math.abs(row.meterClockSkewDays).toFixed(1)} days.`}
                />
              }
            />
          ),
      },
    ],
    /* ── beyond the default set — through the Columns menu ─────────────────── */
    [
      "energyImport",
      "Import",
      {
        width: 115,
        align: "right",
        renderCell: ({ value }) => (value == null ? "—" : `${exNum(value, 2)} kWh`),
      },
    ],
    [
      "energyExport",
      "Export",
      {
        width: 115,
        align: "right",
        renderCell: ({ value }) => (value == null ? "—" : `${exNum(value, 2)} kWh`),
      },
    ],
    [
      "energyNet",
      "Net",
      {
        width: 115,
        align: "right",
        renderCell: ({ value }) => (value == null ? "—" : `${exNum(value, 2)} kWh`),
      },
    ],
    [
      "current",
      "Current",
      { width: 110, align: "right", renderCell: ({ value }) => (value == null ? "—" : `${exNum(value, 3)} A`) },
    ],
    [
      "activePower",
      "Active power",
      { width: 130, align: "right", renderCell: ({ value }) => (value == null ? "—" : `${exNum(value, 3)} kW`) },
    ],
    [
      "previousMd",
      "Previous MD",
      { width: 130, align: "right", renderCell: ({ value }) => (value == null ? "—" : `${exNum(value, 2)} kW`) },
    ],
    [
      "tamper",
      "Tamper",
      {
        width: 130,
        sortable: false,
        renderCell: ({ row }) =>
          row.tamper?.any ? (
            <StatusChip label={`Bits ${row.tamper.bits.join(",")}`} tone="danger" />
          ) : (
            <span>—</span>
          ),
      },
    ],
    [
      "meterClock",
      "Meter clock",
      { width: 155, sortable: false, renderCell: ({ value }) => (value ? toDmyTime(value) : "—") },
    ],
    [
      "ingestLagSec",
      "Ingest lag",
      {
        width: 115,
        align: "right",
        renderCell: ({ value }) => (value == null ? "—" : `${exNum(value, 0)} s`),
      },
    ],
    [
      "msgSeq",
      "Msg seq",
      { width: 100, align: "right", type: "number" },
    ],
    [
      "payload",
      "Payload",
      {
        width: 90,
        sortable: false,
        align: "center",
        renderCell: ({ row }) => (
          <Button
            size="small"
            variant="text"
            onClick={(e) => {
              e.stopPropagation();
              setPayloadRow(row);
            }}
          >
            JSON
          </Button>
        ),
      },
    ],
  ]);

  return (
    <WsPage
      title="Meter"
      subtitle="Net metering from the rooftop revenue meter, carried in the gateway's Data messages. Import and export registers on a single-phase C3 meter — this is what the consumer is paid on."
      breadcrumbs={[
        { label: "Genus Solar", href: "/overview" },
        { label: "Telemetry", href: "/telemetry/meter" },
        { label: "Meter" },
      ]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Readings", value: `${exInt(all.length)} in scope` },
          ]}
          chips={[
            SAMPLE_SCOPE.isSample && (
              <WsTag key="sample" label={`Sample · ${SAMPLE_SCOPE.devices} gateways, ${SAMPLE_SCOPE.messages} messages`} />
            ),
            skewed > 0 && <WsTag key="skew" label={`${skewed} with a skewed meter clock`} />,
            failed > 0 && <WsTag key="failed" label={`${failed} failed read`} />,
          ].filter(Boolean)}
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
        title="Meter readings"
        note="Eight columns by default; energy registers, demand, tamper, the meter's own clock and the ingestion lag are in the Columns menu."
        exportName="telemetry-meter"
        cols={cols}
        rows={rows}
        lockFirstColumn
        pageSize={10}
        emptyOverlay={
          <EmptyState
            icon={<SpeedOutlinedIcon />}
            title="No meter readings in scope"
            body="The sample gateways carry no geography, so they answer to the discom root and disappear under a circle. Select SBPDCL to see them."
            minHeight={200}
          />
        }
      />

      <JsonPayloadDialog
        open={Boolean(payloadRow)}
        onClose={() => setPayloadRow(null)}
        title="Meter payload"
        subtitle={
          payloadRow
            ? `Device ${payloadRow.deviceNo} · ${toDmyTime(payloadRow.timestamp)} · object ${payloadRow.objectId}`
            : undefined
        }
        payload={payloadRow?.raw}
      />
    </WsPage>
  );
}
