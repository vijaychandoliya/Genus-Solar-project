/**
 * Data — Ingestion health.
 *
 * Everything here is measured, not configured. The four real gateway payloads
 * carry two independent clocks — the filename is UTC, the payload `TIMESTAMP`
 * is IST — and the gap between them IS the ingestion lag. That is why
 * `timestamp` and `insertedOn` are separate fields on every parsed row rather
 * than one normalised stamp (AGENTS.md §3c-3).
 *
 * The screen answers three questions and refuses to answer a fourth:
 *
 *   1. Is data arriving?          — per stream, with the reason where it is not.
 *   2. How late is it?            — measured lag, against the device's own
 *                                   declared `STINTERVAL`, not a constant.
 *   3. Did it parse cleanly?      — failed reads and sentinels, counted.
 *   4. Is the FLEET healthy?      — refused. Four messages from two gateways is
 *                                   a sample (`SAMPLE_SCOPE`), and a parse-rate
 *                                   percentage over n=4 would read as a fleet
 *                                   statistic. The banner says so.
 */
import { useMemo } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import RouterOutlinedIcon from "@mui/icons-material/RouterOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { WsPage, WsContext, WsSection, WsTable, wsCols } from "../components/workspaces.jsx";
import { StatusChip, FreshnessChip, BandChip } from "../components/atoms.jsx";
import { KpiDeck, KpiTile } from "../components/molecules.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { freshnessOf } from "../lib/bands.js";
import {
  GTI_DATA,
  GTI_HEARTBEAT,
  GTI_INFO,
  GTI_ONDEMAND,
  BMS_READINGS,
  UPS_READINGS,
  PENDING,
  readingsFor,
} from "../lib/device-data.js";
import { ingestLagSeconds } from "../lib/gti-parse.js";
import { SAMPLE_SCOPE } from "../lib/device-samples.js";
import { exInt, exNum, toDmyTime, ageFrom } from "../lib/format.js";

/* Every stream the platform expects, whether or not it is delivering. A stream
   omitted because it is empty is a stream nobody notices is missing. */
const STREAMS = [
  { id: "gti_data", label: "GTI Data", rows: GTI_DATA, pending: PENDING.gti, carries: "Net meter registers + gateway nameplate" },
  { id: "gti_heartbeat", label: "GTI Heartbeat", rows: GTI_HEARTBEAT, pending: PENDING.gti, carries: "Gateway flags, signal, board temperature" },
  { id: "gti_info", label: "GTI Info", rows: GTI_INFO, pending: PENDING.gtiInfo, carries: "Gateway handshake nameplate" },
  { id: "gti_ondemand", label: "GTI On-demand", rows: GTI_ONDEMAND, pending: PENDING.gtiOndemand, carries: "Command and response" },
  { id: "bms", label: "BMS", rows: BMS_READINGS, pending: PENDING.bms, carries: "Pack SOC, cycles, thermistors" },
  { id: "ups", label: "UPS", rows: UPS_READINGS, pending: PENDING.ups, carries: "Voltage, load, mode" },
];

/** Median, not mean — one 40-second outlier should not move the headline. */
function median(values) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function lagBand(seconds) {
  if (seconds == null) return "unknown";
  if (seconds < 0) return "critical"; // arrived before it was sent — a clock problem
  if (seconds <= 30) return "normal";
  if (seconds <= 300) return "watch";
  if (seconds <= 900) return "warning";
  return "critical";
}

const LAG_LABEL = {
  normal: "On time",
  watch: "Slow",
  warning: "Late",
  critical: "Clock error",
  unknown: "Unknown",
};

export default function DataHealth() {
  const { node, pathLabel } = useHierarchy();

  /* One row per message actually ingested, across the streams that carry a
     timestamp pair. The lag is measured, never assumed. */
  const messages = useMemo(() => {
    const out = [];
    const add = (rows, stream) => {
      readingsFor(rows, node.id).forEach((r) => {
        const lag = ingestLagSeconds(r);
        const intervalMs = r.intervalMin ? r.intervalMin * 60 * 1000 : null;
        out.push({
          id: `${stream}-${r.id}`,
          stream,
          deviceNo: r.deviceNo,
          msgSeq: r.msgSeq,
          timestamp: r.timestamp,
          insertedOn: r.insertedOn,
          lagSeconds: lag,
          intervalMin: r.intervalMin,
          freshness: intervalMs ? freshnessOf(r.timestamp, intervalMs) : "offline",
          outcome: r.readFailed ? "Meter did not respond" : "Parsed",
        });
      });
    };
    add(GTI_DATA, "GTI Data");
    add(GTI_HEARTBEAT, "GTI Heartbeat");
    return out.sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0));
  }, [node]);

  const lags = messages.map((m) => m.lagSeconds).filter((v) => v != null);
  const medianLag = median(lags);
  const devicesSeen = new Set(messages.map((m) => m.deviceNo)).size;
  const failedReads = messages.filter((m) => m.outcome !== "Parsed").length;

  const streamRows = useMemo(
    () =>
      STREAMS.map((s) => {
        const rows = readingsFor(s.rows, node.id);
        const stamps = rows.map((r) => r.timestamp?.getTime()).filter(Boolean);
        const streamLags = rows.map((r) => ingestLagSeconds(r)).filter((v) => v != null);
        const intervals = [...new Set(rows.map((r) => r.intervalMin).filter(Boolean))];
        return {
          id: s.id,
          label: s.label,
          carries: s.carries,
          rowCount: rows.length,
          delivering: rows.length > 0,
          reason: rows.length ? null : (s.pending?.reason ?? "No rows in scope"),
          oldest: stamps.length ? new Date(Math.min(...stamps)) : null,
          newest: stamps.length ? new Date(Math.max(...stamps)) : null,
          interval: intervals.length ? intervals.map((i) => `${i} min`).join(" / ") : null,
          medianLag: median(streamLags),
        };
      }),
    [node],
  );

  const delivering = streamRows.filter((s) => s.delivering).length;

  /* MSGID is a per-device SEQUENCE, so a hole in it is a message that never
     arrived. Counted per device across every stream, because the sequence is
     the device's, not the stream's. */
  const sequenceGaps = useMemo(() => {
    const byDevice = new Map();
    messages.forEach((m) => {
      if (m.msgSeq == null) return;
      if (!byDevice.has(m.deviceNo)) byDevice.set(m.deviceNo, []);
      byDevice.get(m.deviceNo).push(Number(m.msgSeq));
    });
    return [...byDevice.entries()].map(([deviceNo, seqs]) => {
      const sorted = [...new Set(seqs)].sort((a, b) => a - b);
      const span = sorted[sorted.length - 1] - sorted[0] + 1;
      return {
        id: deviceNo,
        deviceNo,
        seen: sorted.length,
        span,
        first: sorted[0],
        last: sorted[sorted.length - 1],
        missing: span - sorted.length,
      };
    });
  }, [messages]);

  const totalMissing = sequenceGaps.reduce((a, g) => a + g.missing, 0);

  return (
    <WsPage
      title="Ingestion health"
      subtitle="Measured from the payloads themselves — the filename is UTC, the payload timestamp is IST, and the gap between them is the lag. Cadence is compared against each device's own declared interval, not a constant."
      breadcrumbs={[
        { label: "Genus Solar", href: "/overview" },
        { label: "Data", href: "/data/health" },
        { label: "Ingestion health" },
      ]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Streams delivering", value: `${exInt(delivering)} of ${exInt(STREAMS.length)}` },
            { label: "Messages in scope", value: exInt(messages.length) },
          ]}
        />
      }
    >
      {SAMPLE_SCOPE.isSample && (
        <Alert severity="info" variant="outlined">
          <strong>This is a sample, not the fleet.</strong> {SAMPLE_SCOPE.note} Captured{" "}
          {SAMPLE_SCOPE.capturedFrom} → {SAMPLE_SCOPE.capturedTo}. Rates and medians below describe{" "}
          {exInt(SAMPLE_SCOPE.messages)} messages from {exInt(SAMPLE_SCOPE.devices)} gateways — they are
          a parser check, not a fleet statistic.
        </Alert>
      )}

      <KpiDeck>
        <KpiTile
          label="Messages ingested"
          value={messages.length}
          tone="info"
          icon={<InboxOutlinedIcon />}
          freshness={
            messages.length
              ? `Newest ${ageFrom(messages[0].timestamp)}`
              : "No messages in this scope"
          }
          notConfigured={messages.length === 0}
        />
        <KpiTile
          label="Median ingest lag"
          value={medianLag}
          unit="s"
          dp={1}
          tone={medianLag != null && medianLag <= 30 ? "good" : "warning"}
          icon={<SpeedOutlinedIcon />}
          freshness={
            lags.length
              ? `Across ${exInt(lags.length)} messages carrying both stamps`
              : "No message carries both a payload and an ingest stamp"
          }
          notConfigured={medianLag == null}
        />
        <KpiTile
          label="Gateways seen"
          value={devicesSeen}
          tone="info"
          icon={<RouterOutlinedIcon />}
          freshness="Distinct device numbers in the traffic, this scope"
          notConfigured={devicesSeen === 0}
        />
        <KpiTile
          label="Failed reads"
          value={failedReads}
          tone={failedReads ? "warning" : "good"}
          icon={<ReportProblemOutlinedIcon />}
          freshness="Frames whose registers all returned zero with meter RTC 000000"
        />
      </KpiDeck>

      <WsTable
        title="Streams"
        note="Every stream the platform expects, including the ones delivering nothing"
        exportName="ingestion-streams"
        search={false}
        pageSize={10}
        cols={wsCols([
          ["label", "Stream", { width: 160 }],
          [
            "delivering",
            "Status",
            {
              width: 150,
              valueGetter: (v) => (v ? "Delivering" : "Nothing arriving"),
              renderCell: ({ row }) =>
                row.delivering ? (
                  <StatusChip label="Delivering" tone="good" />
                ) : (
                  <StatusChip label="Nothing arriving" tone="warning" />
                ),
            },
          ],
          ["rowCount", "Rows", { width: 90, align: "right", type: "number" }],
          ["carries", "Carries", { width: 290 }],
          [
            "interval",
            "Declared cadence",
            {
              width: 150,
              valueGetter: (v) => v ?? "Not declared",
            },
          ],
          [
            "medianLag",
            "Median lag",
            {
              width: 130,
              align: "right",
              type: "number",
              renderCell: ({ value }) =>
                value == null ? (
                  <Typography variant="body2" sx={{ color: "text.tertiary" }}>
                    —
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    dir="ltr"
                    sx={{ fontVariantNumeric: "tabular-nums", unicodeBidi: "isolate" }}
                  >
                    {exNum(value, 1)} s
                  </Typography>
                ),
            },
          ],
          [
            "newest",
            "Newest message",
            {
              width: 170,
              valueGetter: (v) => (v ? toDmyTime(v) : "—"),
            },
          ],
          [
            "reason",
            "Why not",
            {
              width: 330,
              valueGetter: (v) => v ?? "—",
              renderCell: ({ value }) =>
                value ? (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {value}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: "text.tertiary" }}>
                    —
                  </Typography>
                ),
            },
          ],
        ])}
        rows={streamRows}
        lockFirstColumn
      />

      <WsTable
        title="Messages"
        note="Both clocks kept separate on purpose — normalising them would erase the lag this screen measures"
        exportName="ingestion-messages"
        pageSize={15}
        cols={wsCols([
          ["deviceNo", "Device no.", { width: 170 }],
          ["stream", "Stream", { width: 150 }],
          ["msgSeq", "Msg seq", { width: 100, align: "right", type: "number" }],
          [
            "timestamp",
            "Payload time (IST)",
            { width: 180, valueGetter: (v) => (v ? toDmyTime(v) : "—") },
          ],
          [
            "insertedOn",
            "Ingested (UTC)",
            { width: 180, valueGetter: (v) => (v ? toDmyTime(v) : "—") },
          ],
          [
            "lagSeconds",
            "Lag",
            {
              width: 150,
              align: "right",
              type: "number",
              renderCell: ({ value }) => (
                <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", justifyContent: "flex-end" }}>
                  <Typography
                    variant="body2"
                    dir="ltr"
                    sx={{ fontVariantNumeric: "tabular-nums", unicodeBidi: "isolate" }}
                  >
                    {value == null ? "—" : `${exNum(value, 1)} s`}
                  </Typography>
                  <BandChip band={lagBand(value)} label={LAG_LABEL[lagBand(value)]} />
                </Stack>
              ),
            },
          ],
          [
            "intervalMin",
            "Declared interval",
            {
              width: 150,
              align: "right",
              valueGetter: (v) => (v ? `${v} min` : "Not declared"),
            },
          ],
          [
            "freshness",
            "Freshness",
            {
              width: 170,
              renderCell: ({ row }) => (
                <FreshnessChip
                  freshness={row.freshness}
                  age={row.timestamp ? ageFrom(row.timestamp) : undefined}
                />
              ),
            },
          ],
          [
            "outcome",
            "Parse outcome",
            {
              width: 210,
              renderCell: ({ value }) => (
                <StatusChip label={value} tone={value === "Parsed" ? "good" : "warning"} />
              ),
            },
          ],
        ])}
        rows={messages}
        lockFirstColumn
      />

      <WsSection
        title="Message sequence"
        note="MSGID is a per-device counter, not an identifier — so a hole in it is a message that never arrived"
      >
        {sequenceGaps.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No message in this scope carries a sequence number.
          </Typography>
        ) : (
          <Stack sx={{ gap: 1.5 }}>
            {sequenceGaps.map((g) => (
              <Box
                key={g.id}
                sx={(t) => ({
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: t.palette.surface.subtle,
                })}
              >
                <Typography variant="body2" dir="ltr" sx={{ unicodeBidi: "isolate" }}>
                  <strong>{g.deviceNo}</strong> — seq {g.first} … {g.last}, {exInt(g.seen)} of{" "}
                  {exInt(g.span)} present
                </Typography>
                {g.missing > 0 ? (
                  <StatusChip label={`${exInt(g.missing)} missing`} tone="warning" />
                ) : (
                  <StatusChip label="Contiguous" tone="good" />
                )}
              </Box>
            ))}
            <Typography variant="caption" sx={{ color: "text.tertiary" }}>
              {totalMissing > 0
                ? `${exInt(totalMissing)} sequence numbers absent across ${exInt(sequenceGaps.length)} devices. Over a 2-minute capture this is expected — the counter runs continuously and the sample is a window onto it, not the whole run.`
                : "Every sequence number in the captured range is accounted for."}
            </Typography>
          </Stack>
        )}
      </WsSection>
    </WsPage>
  );
}
