/**
 * Data — Batch history.
 *
 * Three ingests have actually happened and this screen lists those three. It
 * does not simulate a longer history: a batch list padded to look busy is the
 * one thing this screen must never do, because its whole purpose is to be the
 * record you check when a number looks wrong.
 *
 * ── Rollback is the honest gap ──────────────────────────────────────────
 * dashboard-ia.md §5.7 specifies "batch history with rollback by
 * `import_batch_id`". No source row carries a batch id — the consumer master's
 * only provenance is a `Created On` stamp, and the surveys carry a submission
 * time per row and nothing tying them into a load. So rollback has no key to
 * operate on, and the column states that rather than offering a disabled
 * button that implies the feature exists and is merely switched off.
 *
 * The consumer master is the interesting case: its own `Created On` values say
 * it arrived in EIGHT batches on one day, of which we hold the last stamp. So
 * the row is one logical extract made of eight physical loads we cannot
 * separate — shown as such, not silently flattened to one.
 */
import { useMemo } from "react";
import { Alert, Stack, Typography } from "@mui/material";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { WsPage, WsContext, WsTable, wsCols } from "../components/workspaces.jsx";
import { StatusChip } from "../components/atoms.jsx";
import { KpiDeck, KpiTile } from "../components/molecules.jsx";
import { useHierarchy, LEVEL_LABEL, rollupRegistered } from "../lib/hierarchy.jsx";
import { SURVEY_ROWS, MASTER_UPLOADED_AT } from "../lib/programme-data.js";
import { GTI_DATA, GTI_HEARTBEAT } from "../lib/device-data.js";
import { SAMPLE_SCOPE } from "../lib/device-samples.js";
import { exInt, toDmyTime, ageFrom } from "../lib/format.js";

export default function DataHistory() {
  const { node, pathLabel, root } = useHierarchy();

  const batches = useMemo(() => {
    const surveyStamps = SURVEY_ROWS.map((r) => r.submittedOn?.getTime()).filter(Boolean);
    const messages = [...GTI_DATA, ...GTI_HEARTBEAT];
    const messageStamps = messages.map((r) => r.insertedOn?.getTime()).filter(Boolean);

    return [
      {
        id: "consumer-master",
        source: "Consumer master",
        file: "Consumer master extract (CSV)",
        kind: "Registry",
        rows: rollupRegistered(root),
        // The extract's own Created On values span eight loads on one day. We
        // hold the last stamp only, so the count is stated and the individual
        // loads are not invented.
        loads: 8,
        arrived: MASTER_UPLOADED_AT,
        by: "Admin - 11111",
        batchId: null,
        note: "Arrived as 8 loads on one day; only the last Created On stamp survives in the extract, so the eight cannot be separated here.",
      },
      {
        id: "site-survey",
        source: "Site survey",
        file: "Solar PV Site Survey (CSV)",
        kind: "Field submissions",
        rows: SURVEY_ROWS.length,
        loads: SURVEY_ROWS.length,
        // Per-row submissions, not a load — the newest is the ingest time.
        arrived: surveyStamps.length ? new Date(Math.max(...surveyStamps)) : null,
        by: "Deepak Kumar - 11126, Aditya Raj Tiwari - 11125",
        batchId: null,
        note: "Submitted per row by two surveyors rather than loaded as a batch. Each row carries its own submission stamp; there is no load to roll back.",
      },
      {
        id: "gateway-capture",
        source: "Gateway payloads",
        file: "rtsg-1 / Ongridrooftop pub-sub capture",
        kind: "Telemetry sample",
        rows: messages.length,
        loads: messages.length,
        arrived: messageStamps.length ? new Date(Math.max(...messageStamps)) : null,
        by: "Message broker",
        batchId: null,
        note: `${SAMPLE_SCOPE.note} Each message is its own arrival; the filename carries the UTC ingest stamp.`,
      },
    ];
  }, [root]);

  const totalRows = batches.reduce((a, b) => a + b.rows, 0);
  const latest = batches.reduce(
    (max, b) => (b.arrived && (!max || b.arrived > max) ? b.arrived : max),
    null,
  );

  return (
    <WsPage
      title="Batch history"
      subtitle="Every ingest this platform has on record. Three, because three have happened — the list is not padded, since this is the screen you check when a figure looks wrong."
      breadcrumbs={[
        { label: "Genus Solar", href: "/overview" },
        { label: "Data", href: "/data/history" },
        { label: "Batch history" },
      ]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Ingests on record", value: exInt(batches.length) },
            { label: "Rows across all", value: exInt(totalRows) },
          ]}
        />
      }
    >
      <Alert severity="warning" variant="outlined">
        <strong>Rollback is unavailable, and not because it is switched off.</strong> The spec keys
        it on <code>import_batch_id</code> (dashboard-ia.md §5.7) and no source row carries one — the
        consumer master has only a <code>Created On</code> stamp and the surveys carry per-row
        submission times. There is no key to roll back by, so no rollback control is shown.
      </Alert>

      <KpiDeck>
        <KpiTile
          label="Ingests on record"
          value={batches.length}
          tone="info"
          icon={<HistoryOutlinedIcon />}
          freshness="Consumer master, site survey, gateway capture"
        />
        <KpiTile
          label="Rows ingested"
          value={totalRows}
          tone="info"
          icon={<TableRowsOutlinedIcon />}
          freshness="Registry rows + survey submissions + telemetry messages"
        />
        <KpiTile
          label="Most recent arrival"
          value={latest ? toDmyTime(latest) : null}
          tone="info"
          icon={<ScheduleOutlinedIcon />}
          freshness={latest ? ageFrom(latest) : "Nothing has arrived"}
          notConfigured={!latest}
        />
        <KpiTile
          label="Rollback"
          value={null}
          tone="neutral"
          icon={<UndoOutlinedIcon />}
          notConfigured
          freshness="No source row carries an import_batch_id to roll back by"
        />
      </KpiDeck>

      <WsTable
        title="Ingests"
        note="What arrived, when, from whom, and whether it can be reversed"
        exportName="batch-history"
        search={false}
        pageSize={10}
        cols={wsCols([
          ["source", "Source", { width: 170 }],
          ["kind", "Kind", { width: 160 }],
          ["file", "File or stream", { width: 300 }],
          ["rows", "Rows", { width: 110, align: "right", type: "number" }],
          [
            "loads",
            "Physical loads",
            {
              width: 140,
              align: "right",
              type: "number",
              renderCell: ({ row }) => (
                <Typography
                  variant="body2"
                  dir="ltr"
                  sx={{ fontVariantNumeric: "tabular-nums", unicodeBidi: "isolate" }}
                >
                  {exInt(row.loads)}
                </Typography>
              ),
            },
          ],
          [
            "arrived",
            "Arrived",
            { width: 180, valueGetter: (v) => (v ? toDmyTime(v) : "—") },
          ],
          ["by", "Ingested by", { width: 300 }],
          [
            "batchId",
            "Batch id",
            {
              width: 170,
              valueGetter: (v) => v ?? "Not carried",
              renderCell: ({ row }) =>
                row.batchId ? (
                  <Typography variant="body2" dir="ltr" sx={{ unicodeBidi: "isolate" }}>
                    {row.batchId}
                  </Typography>
                ) : (
                  <StatusChip label="Not carried" tone="warning" />
                ),
            },
          ],
          [
            "note",
            "Provenance",
            {
              width: 480,
              renderCell: ({ value }) => (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {value}
                </Typography>
              ),
            },
          ],
        ])}
        rows={batches}
        lockFirstColumn
      />

      <Stack sx={{ gap: 0.5 }}>
        <Typography variant="caption" sx={{ color: "text.tertiary" }}>
          What would make this screen do its job: an <code>import_batch_id</code> stamped on every
          row at load time, a dry-run report retained per batch, and a reversal that deletes by that
          id. The first is a schema change on the source side, not something the client can derive.
        </Typography>
      </Stack>
    </WsPage>
  );
}
