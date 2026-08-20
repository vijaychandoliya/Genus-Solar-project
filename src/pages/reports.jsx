/**
 * Reports — docs/dashboard-ia.md §5.7.
 *
 * "The report module produces data extracts, not reports... a report answers
 * a question; an extract requires the reader to do the work." This is
 * honestly still closer to the extract end: it is a picker over real,
 * already-computed views with export, not period-over-period comparison —
 * there is exactly one snapshot of this data, so a trend line would have to
 * be invented. No comparison is offered rather than a fabricated one.
 *
 * Every dataset here reuses the same functions the live dashboards call —
 * Reports and the dashboards can never quietly disagree with each other,
 * because they are the same computation.
 */
import { useMemo, useState } from "react";
import { Button, TextField, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { WsPage, WsContext, WsTable, wsCols, resultNote } from "../components/workspaces.jsx";
import { TileDeck, TilePane, FilterBar, WsDateRange } from "../components/molecules.jsx";
import { CodeValue, EmptyState, StatusChip } from "../components/atoms.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { pipelineStages, exceptionsFor, surveysFor } from "../lib/programme-data.js";
import { UPS_READINGS, readingsFor, PENDING } from "../lib/device-data.js";
import { exNum, toDmyTime } from "../lib/format.js";

const SEVERITY_TONE = { critical: "danger", warning: "warning" };
const VERDICT_TONE = {
  Feasible: "good",
  "Feasible with conditions": "warning",
  "Ground-mount candidate": "info",
  "Not feasible": "danger",
  "Needs revisit": "danger",
};

export default function Reports() {
  const { node, registered, pathLabel } = useHierarchy();
  const [report, setReport] = useState("programme");

  /* ── Device Report state ────────────────────────────────────────────────
     This report has an explicit GENERATE step, unlike the four programme
     reports, and the difference is real rather than decorative: the programme
     reports are a picker over views already computed for the dashboards, so
     they are instant and always current. A device report is a range query over
     a reading series — it has parameters that can be half-entered, and running
     it on every keystroke would fire a query against an incomplete range.

     `params` is what the user is editing; `ran` is what produced the table on
     screen. Keeping them apart is what lets the button say "the table below is
     not what your filters currently describe".                              */
  const [params, setParams] = useState({ start: null, end: null, deviceNo: "" });
  const [ran, setRan] = useState(null);

  const stages = useMemo(() => pipelineStages(node), [node]);
  const exceptions = useMemo(() => exceptionsFor(node), [node]);
  const sites = useMemo(() => surveysFor(node.id), [node]);

  const deviceRows = useMemo(
    () => (ran ? readingsFor(UPS_READINGS, node.id, ran) : []),
    [ran, node],
  );
  const deviceTotal = useMemo(() => readingsFor(UPS_READINGS, node.id), [node]);

  const dirty =
    ran !== null &&
    (ran.start !== params.start || ran.end !== params.end || ran.deviceNo !== params.deviceNo);

  const stageRows = useMemo(
    () =>
      stages.map((s) => ({
        ...s,
        pctOfRegistered: registered > 0 ? (s.value / registered) * 100 : null,
      })),
    [stages, registered],
  );

  const tiles = [
    { id: "programme", label: "Programme summary", value: stages.length, note: "Pipeline stages" },
    { id: "exceptions", label: "Exceptions", value: exceptions.length, note: "Open, this scope" },
    { id: "sites", label: "Site records", value: sites.length, note: "Surveyed, this scope" },
    { id: "assets", label: "Asset condition", value: sites.length, note: "Rooftops assessed" },
    { id: "device", label: "Device report", value: deviceTotal.length, note: "Readings available" },
  ];

  return (
    <WsPage
      title="Reports"
      subtitle="A picker over the same computed views the dashboards use — export only, no period-over-period comparison, because there is one snapshot of this data, not several."
      breadcrumbs={[{ label: "Genus Solar", href: "/overview" }, { label: "Reports" }]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
          ]}
        />
      }
    >
      <TileDeck items={tiles} value={report} onChange={setReport} idPrefix="reports" />

      <TilePane deckId="reports" value={report}>

      {report === "programme" && (
        <WsTable
          title="Programme summary"
          note="Nine pipeline stage gates, this scope"
          exportName="report-programme-summary"
          cols={wsCols([
            ["name", "Stage", { minWidth: 180 }],
            ["value", "Consumers", { width: 130, align: "right", type: "number" }],
            [
              "pctOfRegistered",
              "% of registered",
              {
                width: 150,
                align: "right",
                sortable: false,
                renderCell: ({ value }) => (value == null ? "—" : `${exNum(value, 1)}%`),
              },
            ],
          ])}
          rows={stageRows}
          pageSize={10}
        />
      )}

      {report === "exceptions" && (
        <WsTable
          title="Exceptions"
          note="Every open exception, this scope"
          exportName="report-exceptions"
          cols={wsCols([
            ["type", "Type", { minWidth: 180 }],
            ["consumer", "Consumer", { minWidth: 160 }],
            ["panchayat", "Panchayat", { width: 130 }],
            [
              "severity",
              "Severity",
              {
                width: 110,
                renderCell: ({ value }) => (
                  <StatusChip label={value === "critical" ? "Critical" : "Warning"} tone={SEVERITY_TONE[value]} />
                ),
              },
            ],
            ["detail", "Detail", { minWidth: 320, sortable: false }],
            [
              "age",
              "Reported",
              {
                width: 150,
                sortable: false,
                renderCell: ({ row }) => (row.age ? toDmyTime(row.age) : "—"),
              },
            ],
          ])}
          rows={exceptions}
          pageSize={10}
        />
      )}

      {report === "sites" && (
        <WsTable
          title="Site records"
          note="Every surveyed site, this scope"
          exportName="report-site-records"
          cols={wsCols([
            ["consumerName", "Consumer", { minWidth: 160 }],
            ["consumerNumber", "Consumer number", { width: 150 }],
            ["panchayatName", "Panchayat", { width: 120 }],
            ["roofTopStatus", "Roof", { width: 110 }],
            ["orientation", "Orientation", { width: 120 }],
            [
              "verdict",
              "Verdict",
              {
                width: 190,
                renderCell: ({ value }) => <StatusChip label={value} tone={VERDICT_TONE[value] ?? "neutral"} />,
              },
            ],
            [
              "submittedOn",
              "Submitted",
              { width: 150, sortable: false, renderCell: ({ value }) => (value ? toDmyTime(value) : "—") },
            ],
          ])}
          rows={sites}
          pageSize={10}
        />
      )}

      {report === "assets" && (
        <WsTable
          title="Asset condition"
          note="Structural detail for every rooftop assessed, this scope"
          exportName="report-asset-condition"
          cols={wsCols([
            ["consumerName", "Consumer", { minWidth: 160 }],
            ["panchayatName", "Panchayat", { width: 120 }],
            [
              "roofAgeYears",
              "Roof age",
              {
                width: 100,
                align: "right",
                type: "number",
                renderCell: ({ value }) => (value == null ? "—" : `${exNum(value, 1)} yrs`),
              },
            ],
            ["floors", "Floors", { width: 90, align: "right", type: "number" }],
            ["distStructure", "Structure run", { width: 120, align: "right", type: "number" }],
            ["distEarthing", "Earthing run", { width: 120, align: "right", type: "number" }],
          ])}
          rows={sites}
          pageSize={10}
        />
      )}

      {report === "device" && (
        <>
          <FilterBar
            resultNote={ran ? resultNote(deviceRows.length, deviceTotal.length, "readings") : "Not run yet"}
            onClear={ran ? () => { setRan(null); setParams({ start: null, end: null, deviceNo: "" }); } : undefined}
          >
            <WsDateRange
              start={params.start}
              end={params.end}
              onChange={({ start, end }) => setParams((p) => ({ ...p, start, end }))}
            />
            <TextField
              size="small"
              label="Device no."
              value={params.deviceNo}
              onChange={(e) => setParams((p) => ({ ...p, deviceNo: e.target.value }))}
              sx={{ minWidth: 220 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => setRan({ ...params })}
              disabled={Boolean(params.start && params.end && params.start > params.end)}
            >
              Generate
            </Button>
          </FilterBar>

          {dirty && (
            <Typography variant="body2" sx={{ color: "band.warning.fg", px: 0.5 }}>
              The filters have changed since this report was generated — the table below still shows the
              previous run. Generate again to apply them.
            </Typography>
          )}

          <WsTable
            title="Device report"
            note="Status fields are raw device codes, shown with the meaning we believe they carry. Those meanings are undocumented — see docs/dms-parity-plan.md Q4."
            exportName="report-device"
            cols={wsCols([
              ["deviceNo", "Device no.", { minWidth: 190 }],
              [
                "deviceClass",
                "Device type",
                { width: 120, renderCell: ({ value }) => <CodeValue set="device_class" value={value} showRaw={false} /> },
              ],
              [
                "timestamp",
                "Timestamp",
                { width: 160, renderCell: ({ value }) => (value ? toDmyTime(value) : "—") },
              ],
              [
                "backupStatus",
                "Backup status",
                { width: 160, renderCell: ({ value }) => <CodeValue set="backup_status" value={value} /> },
              ],
              [
                "inverterMode",
                "Inverter mode",
                { width: 160, renderCell: ({ value }) => <CodeValue set="inverter_mode" value={value} /> },
              ],
              // Renamed from the source's "Mains Voltage", which carries 0/1
              // and is a flag, not volts. See device-codes.js.
              [
                "mainsPresent",
                "Mains present",
                { width: 160, renderCell: ({ value }) => <CodeValue set="mains_present" value={value} /> },
              ],
              [
                "inverterStatus",
                "Inverter status",
                { width: 160, renderCell: ({ value }) => <CodeValue set="inverter_status" value={value} /> },
              ],
            ])}
            rows={deviceRows}
            lockFirstColumn
            pageSize={10}
            emptyOverlay={
              <EmptyState
                icon={<DescriptionOutlinedIcon />}
                title={ran ? "Readings not yet ingested" : "Set a range, then Generate"}
                body={
                  ran
                    ? PENDING.ups.detail
                    : "A device report is a range query over a reading series, so it runs when you ask it to rather than on every keystroke."
                }
                minHeight={200}
              />
            }
          />
        </>
      )}
      </TilePane>
    </WsPage>
  );
}
