/**
 * Assets — physical rooftop condition, docs/dashboard-ia.md §5.4 (Feasibility
 * & Design), reframed under the "Assets" nav label.
 *
 * Deliberately built from the same 9 real survey records as Sites, but never
 * from the consumer master's 9,673 individual rows. That master carries real
 * names and phone numbers; a browsable per-consumer registry would mean
 * bundling that PII into a public client build for a demo table, which is
 * not a trade worth making. Sites and Assets both read the site-level survey
 * data that is already safely committed — Sites is the record browser,
 * Assets is the aggregate condition picture (age, orientation, structure and
 * earthing runs) that a design/procurement team actually needs.
 */
import { useMemo } from "react";
import { WsPage, WsContext, WsTable, wsCols, WsSplit } from "../components/workspaces.jsx";
import { KpiStrip } from "../components/molecules.jsx";
import { StatusChip } from "../components/atoms.jsx";
import { EChartCard, rankedBarOption } from "../components/charts.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { surveysFor, feasibilityMix, orientationMix, meanOf } from "../lib/programme-data.js";
import { exInt, exNum } from "../lib/format.js";

const VERDICT_TONE = {
  Feasible: "good",
  "Feasible with conditions": "warning",
  "Ground-mount candidate": "info",
  "Not feasible": "danger",
  "Needs revisit": "danger",
};

export default function Assets() {
  const { node, pathLabel } = useHierarchy();

  const sites = useMemo(() => surveysFor(node.id), [node]);
  const mix = useMemo(() => feasibilityMix(node.id), [node]);
  const orientations = useMemo(() => orientationMix(node.id), [node]);
  const meanCable = useMemo(() => meanOf(node.id, "distStructure"), [node]);
  const meanEarthing = useMemo(() => meanOf(node.id, "distEarthing"), [node]);
  const meanRoofAge = useMemo(() => meanOf(node.id, "roofAgeYears"), [node]);

  const feasiblePct = sites.length
    ? ((mix.find((m) => m.name === "Feasible")?.value ?? 0) / sites.length) * 100
    : null;

  return (
    <WsPage
      title="Assets"
      subtitle="Physical rooftop condition across surveyed sites — age, orientation, and the structure and earthing runs a build actually needs."
      breadcrumbs={[{ label: "Genus Solar", href: "/overview" }, { label: "Assets" }]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Assessed", value: `${exInt(sites.length)} rooftops` },
          ]}
        />
      }
    >
      <KpiStrip
        items={[
          {
            label: "Unconditionally feasible",
            value: feasiblePct,
            unit: feasiblePct === null ? undefined : "%",
            dp: 0,
            note: sites.length ? `of ${exInt(sites.length)} assessed` : "No rooftops in scope",
          },
          {
            label: "Mean roof age",
            value: meanRoofAge,
            unit: meanRoofAge === null ? undefined : "yrs",
            dp: 1,
            note: "Where rooftop was surveyed",
          },
          {
            label: "Mean structure run",
            value: meanCable === null ? null : Math.round(meanCable),
            unit: meanCable === null ? undefined : "m",
            note: "Cable run estimate",
          },
          {
            label: "Mean earthing run",
            value: meanEarthing === null ? null : Math.round(meanEarthing),
            unit: meanEarthing === null ? undefined : "m",
            note: "Includes the 109 m outlier — see Alarms",
          },
        ]}
      />

      <WsSplit>
        <EChartCard
          title="Feasibility mix"
          note="By verdict, this scope"
          height={240}
          empty={mix.length === 0 ? { title: "No rooftops assessed", body: "No surveys fall under this node." } : undefined}
          option={mix.length ? rankedBarOption({ data: mix }) : undefined}
        />
        <EChartCard
          title="Orientation mix"
          note="Roof-facing direction, this scope"
          height={240}
          empty={orientations.length === 0 ? { title: "No orientation data", body: "No rooftop was surveyed in this scope." } : undefined}
          option={orientations.length ? rankedBarOption({ data: orientations }) : undefined}
        />
      </WsSplit>

      <WsTable
        title="Structural detail"
        note="Every rooftop assessed in scope"
        exportName="assets-structural"
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
          [
            "verdict",
            "Verdict",
            {
              width: 190,
              renderCell: ({ value }) => <StatusChip label={value} tone={VERDICT_TONE[value] ?? "neutral"} />,
            },
          ],
        ])}
        rows={sites}
        pageSize={10}
      />
    </WsPage>
  );
}
