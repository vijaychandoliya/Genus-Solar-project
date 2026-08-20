/**
 * GTI telemetry — docs/ia-and-screen-plan.md §7.6, four streams.
 *
 * The four tabs match the source DMS exactly (Data · Heartbeat · Info ·
 * On-demand), but they are ROUTE SEGMENTS, not component state — plan §7.5,
 * "tab state is addressable". A link to a specific stream has to survive being
 * pasted into a ticket, and the source's in-component tabs cannot do that.
 *
 * The Info tab is a VIEW of the device registry's nameplate, not a separate
 * store. Firmware / hardware / manufacturer / model is the record plan §2.2
 * calls the prerequisite for banding anything — it belongs on the device, and
 * the registry's completeness column depends on it living there.
 */
import { useMemo, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Tabs, Tab, Button } from "@mui/material";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import { WsPage, WsContext, WsTable, wsCols, resultNote } from "../components/workspaces.jsx";
import { FilterBar, JsonPayloadDialog, WsDateRange } from "../components/molecules.jsx";
import {
  BandedValue,
  CodeValue,
  EmptyState,
  FreshnessChip,
  NotConfigured,
  StatusChip,
  WsTag,
} from "../components/atoms.jsx";
import { MetricInfo } from "../components/molecules.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { GTI_STREAMS, readingsFor, SAMPLE_SCOPE } from "../lib/device-data.js";
import { GATEWAY_ERRORS } from "../lib/gti-parse.js";
import { bandWithFreshness } from "../lib/bands.js";
import { exInt, exNum, toDmyTime, ageFrom } from "../lib/format.js";

const TABS = [
  { id: "data", label: "Data" },
  { id: "heartbeat", label: "Heartbeat" },
  { id: "info", label: "Info" },
  { id: "on-demand", label: "On demand" },
];

/** Per-stream columns. Transcribed from the DMS, plus freshness and a payload. */
function colsFor(tab, openPayload) {
  const jsonCol = [
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
            openPayload(row);
          }}
        >
          JSON
        </Button>
      ),
    },
  ];

  const deviceCol = ["deviceNo", "Device no.", { minWidth: 190 }];
  const msgTypeCol = [
    "msgType",
    "Message type",
    { width: 150, renderCell: ({ value }) => <CodeValue set="gti_msg_type" value={value} showRaw={false} /> },
  ];
  const stampCol = [
    "timestamp",
    "Timestamp",
    { width: 160, renderCell: ({ value }) => (value ? toDmyTime(value) : "—") },
  ];
  const freshnessCol = [
    "freshness",
    "Reporting",
    {
      width: 150,
      sortable: false,
      renderCell: ({ row }) => (
        <FreshnessChip freshness={row.freshness} age={row.timestamp ? ageFrom(row.timestamp) : undefined} />
      ),
    },
  ];
  // `insertedOn` is kept apart from `timestamp` on purpose — the gap between
  // them IS ingestion lag, and collapsing them throws it away.
  const insertedCol = [
    "insertedOn",
    "Ingested",
    { width: 160, sortable: false, renderCell: ({ value }) => (value ? toDmyTime(value) : "—") },
  ];

  const lagCol = [
    "ingestLagSec",
    "Ingest lag",
    {
      width: 115,
      align: "right",
      renderCell: ({ value }) => (value == null ? "—" : `${exNum(value, 0)} s`),
    },
  ];

  if (tab === "data") {
    return wsCols([
      deviceCol,
      // `MSGID` is a per-device SEQUENCE, not an id — so a gap here is a lost
      // message. Labelled accordingly rather than as "Msg ID".
      ["msgSeq", "Msg seq", { width: 105, align: "right", type: "number" }],
      stampCol,
      ["intervalMin", "Interval", { width: 105, align: "right", renderCell: ({ value }) => (value == null ? "—" : `${value} min`) }],
      freshnessCol,
      lagCol,
      ["asn", "ASN", { width: 110, renderCell: ({ value }) => value ?? "—" }],
      ["maxIndex", "Max index", { width: 110, align: "right", type: "number" }],
      ["index", "Index", { width: 100, align: "right", type: "number" }],
      ["load", "Load", { width: 100, align: "right", type: "number" }],
      insertedCol,
      jsonCol,
    ]);
  }
  if (tab === "heartbeat") {
    // The source DMS shows three columns here and throws away thirty. Signal
    // quality, the error flags and the board thermistor are the whole point of
    // a heartbeat — without them "the device is alive" is all it says.
    return wsCols([
      deviceCol,
      stampCol,
      freshnessCol,
      [
        "rsrp",
        "Signal",
        {
          width: 130,
          align: "right",
          renderCell: ({ row }) => (
            <BandedValue
              value={row.rsrp}
              unit="dBm"
              band={bandWithFreshness("gateway_rsrp", row.rsrp, row.freshness)}
              info={<MetricInfo metricId="gateway_rsrp" />}
            />
          ),
        },
      ],
      [
        "boardTemp",
        "Board temp",
        {
          width: 130,
          align: "right",
          renderCell: ({ row }) => (
            <BandedValue
              value={row.boardTemp}
              unit="°C"
              dp={1}
              band={bandWithFreshness("board_temp", row.boardTemp, row.freshness)}
              info={
                row.boardTempAbsent ? (
                  <MetricInfo
                    metricId="board_temp"
                    body="-127 °C is the 1-wire bus reply for 'no sensor present'. The value was transmitted, but the probe is missing and the board has no usable thermal reading."
                  />
                ) : undefined
              }
            />
          ),
        },
      ],
      [
        "errors",
        "Errors",
        {
          width: 150,
          sortable: false,
          renderCell: ({ row }) => {
            const set = Object.entries(GATEWAY_ERRORS).filter(([k]) => Number(row.errors?.[k]) === 1);
            return set.length ? (
              <StatusChip label={set.map(([, label]) => label).join(", ")} tone="danger" />
            ) : (
              <StatusChip label="None" tone="neutral" />
            );
          },
        },
      ],
      [
        "link",
        "Link",
        {
          width: 130,
          sortable: false,
          // (rawValue, row) — see the note in devices.jsx.
          valueGetter: (raw, row) => (Number(row.flags?.ONLINE) === 1 ? "Online" : "Offline"),
          renderCell: ({ row }) => (
            <StatusChip
              label={Number(row.flags?.ONLINE) === 1 ? "Online" : "Offline"}
              tone={Number(row.flags?.ONLINE) === 1 ? "good" : "danger"}
            />
          ),
        },
      ],
      [
        "geo",
        "Coordinates",
        {
          width: 160,
          sortable: false,
          renderCell: ({ row }) =>
            row.geoAbsent ? (
              <NotConfigured hint="Latitude and longitude are exactly (0, 0) — Null Island. The gateway cannot be mapped." />
            ) : (
              `${exNum(row.lat, 4)}, ${exNum(row.lon, 4)}`
            ),
        },
      ],
      [
        "modem",
        "Modem firmware",
        {
          minWidth: 200,
          sortable: false,
          valueGetter: (raw, row) => row.nameplate?.modem_firmware ?? null,
          renderCell: ({ row }) =>
            row.nameplate?.modem_firmware ? (
              <>
                {row.modemFirmwareIsBeta ? <StatusChip label="Beta" tone="warning" /> : null}{" "}
                <span>{row.nameplate.modem_firmware}</span>
              </>
            ) : (
              "—"
            ),
        },
      ],
      ["rsrq", "RSRQ", { width: 95, align: "right", type: "number" }],
      ["sinr", "SINR", { width: 95, align: "right", type: "number" }],
      ["rssi", "RSSI", { width: 95, align: "right", type: "number" }],
      lagCol,
      jsonCol,
    ]);
  }
  if (tab === "info") {
    return wsCols([
      deviceCol,
      msgTypeCol,
      ["firmware", "Firmware", { width: 110 }],
      ["hardware", "Hardware", { width: 110 }],
      ["manufacturer", "Manufacturer", { minWidth: 150 }],
      ["model", "Model", { minWidth: 160 }],
      insertedCol,
      jsonCol,
    ]);
  }
  return wsCols([
    deviceCol,
    ["type", "Type", { width: 120 }],
    ["cmKey", "CM key", { width: 110, renderCell: ({ value }) => value ?? "—" }],
    ["pmKey", "PM key", { width: 110, renderCell: ({ value }) => value ?? "—" }],
    ["cmd", "Command", { width: 120 }],
    stampCol,
    jsonCol,
  ]);
}

const NOTE = {
  // The Data envelope only. Its meter body is a different subject and has its
  // own screen — see /telemetry/meter and the note there.
  data: "The message envelope: sequence, declared interval and ingestion lag. The meter readings each frame carries are on the Meter screen.",
  heartbeat:
    "Signal quality, link and error flags, and the board thermistor. A heartbeat that reports only its own existence answers nothing.",
  info: "Gateway handshake records. This is nameplate data: it feeds the registry's completeness column rather than living only here.",
  "on-demand": "Commands issued to the gateway and their responses.",
};

export default function TelemetryGti() {
  const { tab = "data" } = useParams();
  const navigate = useNavigate();
  const { node, pathLabel } = useHierarchy();
  const [range, setRange] = useState({ start: null, end: null });
  const [deviceNo, setDeviceNo] = useState("");
  const [payloadRow, setPayloadRow] = useState(null);

  // An unknown segment falls back for the purposes of the hooks below, then
  // redirects underneath them. Returning <Navigate> before the useMemos would
  // make the hook count depend on the URL, which React will not forgive.
  const stream = GTI_STREAMS[tab] ?? GTI_STREAMS.data;

  const all = useMemo(() => readingsFor(stream.rows, node.id), [stream, node]);
  const rows = useMemo(
    () => readingsFor(stream.rows, node.id, { ...range, deviceNo }),
    [stream, node, range, deviceNo],
  );

  if (!GTI_STREAMS[tab]) return <Navigate to="/telemetry/gti/data" replace />;

  const cols = colsFor(tab, setPayloadRow);

  return (
    <WsPage
      title="GTI"
      subtitle="Rooftop gateways across four message streams. Each stream is its own URL, so a link to one survives being pasted into a ticket."
      breadcrumbs={[
        { label: "Genus Solar", href: "/overview" },
        { label: "Telemetry", href: "/telemetry/gti/data" },
        { label: `GTI — ${TABS.find((t) => t.id === tab)?.label}` },
      ]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Rows", value: `${exInt(all.length)} in scope` },
          ]}
          chips={
            SAMPLE_SCOPE.isSample
              ? [
                  <WsTag
                    key="sample"
                    label={`Sample · ${SAMPLE_SCOPE.devices} gateways, ${SAMPLE_SCOPE.messages} messages`}
                  />,
                ]
              : []
          }
        />
      }
    >
      <Tabs
        value={tab}
        onChange={(_, v) => navigate(`/telemetry/gti/${v}`)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="GTI message stream"
      >
        {TABS.map((t) => (
          <Tab key={t.id} value={t.id} label={t.label} />
        ))}
      </Tabs>

      <FilterBar
        resultNote={resultNote(rows.length, all.length, "rows")}
        onClear={
          range.start || range.end || deviceNo
            ? () => { setRange({ start: null, end: null }); setDeviceNo(""); }
            : undefined
        }
      >
        <WsDateRange start={range.start} end={range.end} onChange={setRange} />
      </FilterBar>

      <WsTable
        title={`GTI ${stream.label}`}
        note={NOTE[tab]}
        exportName={`telemetry-gti-${tab}`}
        cols={cols}
        rows={rows}
        lockFirstColumn
        pageSize={10}
        emptyOverlay={
          <EmptyState
            icon={<BoltOutlinedIcon />}
            title={stream.pending ? "Stream not in the sample" : "No rows in scope"}
            body={
              stream.pending?.detail ??
              "The sample gateways carry no geography, so they answer to the discom root and disappear under a circle. Select SBPDCL to see them."
            }
            minHeight={200}
          />
        }
      />

      <JsonPayloadDialog
        open={Boolean(payloadRow)}
        onClose={() => setPayloadRow(null)}
        title={`GTI ${stream.label} payload`}
        subtitle={payloadRow ? `Device ${payloadRow.deviceNo} · ${toDmyTime(payloadRow.timestamp)}` : undefined}
        payload={payloadRow?.payload ?? payloadRow}
      />
    </WsPage>
  );
}
