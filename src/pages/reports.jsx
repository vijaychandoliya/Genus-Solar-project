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
import { WsPage, WsContext, WsTable, wsCols } from "../components/workspaces.jsx";
import { TileDeck, TilePane } from "../components/molecules.jsx";
import { StatusChip } from "../components/atoms.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { pipelineStages, exceptionsFor, surveysFor } from "../lib/programme-data.js";
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

  const stages = useMemo(() => pipelineStages(node), [node]);
  const exceptions = useMemo(() => exceptionsFor(node), [node]);
  const sites = useMemo(() => surveysFor(node.id), [node]);

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
      </TilePane>
    </WsPage>
  );
}
