/**
 * Programme Overview — docs/dashboard-ia.md §5.1.
 *
 * The first real screen. Every figure on it is computed from the two source
 * extracts via src/lib/programme-data.js — nothing here is a placeholder
 * number. Where a figure genuinely cannot be computed (coverage %, when the
 * registered count for a node is zero), it renders as `unknown`, not a guess.
 */
import { useMemo } from "react";
import { Typography, Tooltip } from "@mui/material";
import { WsPage, WsContext, WsSection, WsSplit, WsTable, wsCols } from "../components/workspaces.jsx";
import { KpiStrip } from "../components/molecules.jsx";
import { EChartCard, rankedBarOption, funnelOption } from "../components/charts.jsx";
import { BandedValue, NotConfigured } from "../components/atoms.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import {
  pipelineStages,
  exceptionsFor,
  submissionsByDay,
  childRollups,
  coverageInfo,
} from "../lib/programme-data.js";
import { bandFor } from "../lib/bands.js";
import { exInt, toDmy } from "../lib/format.js";

function CoverageCell({ node }) {
  const { pct, reason } = coverageInfo(node);
  if (pct === null) {
    return (
      <Tooltip title={reason}>
        <span>
          <NotConfigured hint={reason} />
        </span>
      </Tooltip>
    );
  }
  return <BandedValue value={pct} unit="%" dp={pct < 1 ? 1 : 0} band={bandFor("coverage_pct", pct)} />;
}

export default function Overview() {
  const { node, select, pathLabel, registered } = useHierarchy();

  const stages = useMemo(() => pipelineStages(node), [node]);
  const exceptions = useMemo(() => exceptionsFor(node), [node]);
  const byDay = useMemo(() => submissionsByDay(node), [node]);
  const children = useMemo(() => childRollups(node), [node]);

  const surveyed = stages.find((s) => s.id === "surveyed")?.value ?? 0;
  const conditions = exceptions.filter((e) => e.type === "Contradictory survey").length;
  const withConditions = surveyed - conditions; // every surveyed row here is either clean-conditions or a contradiction
  const coverage = coverageInfo(node);

  const rows = [...children].sort((a, b) => b.registered - a.registered);

  return (
    <WsPage
      title="Overview"
      subtitle="Pipeline health for the current scope, computed from the consumer master and site survey extracts."
      breadcrumbs={[{ label: "Genus Solar", href: "/overview" }, { label: "Overview" }]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Registered", value: `${exInt(registered)} consumers` },
            { label: "Surveyed", value: `${exInt(surveyed)} in scope` },
          ]}
        />
      }
    >
      <KpiStrip
        items={[
          { label: "Registered", value: registered, note: "Consumer master, this scope" },
          { label: "Surveyed", value: surveyed, note: "Site survey extract, this scope" },
          {
            label: "Coverage",
            value: coverage.pct,
            unit: coverage.pct === null ? undefined : "%",
            dp: coverage.pct !== null && coverage.pct < 1 ? 1 : 0,
            metricId: "coverage_pct",
            note: coverage.reason ?? "Surveyed ÷ registered",
          },
          {
            label: "With conditions",
            value: withConditions,
            note: surveyed ? `of ${exInt(surveyed)} surveyed feasible` : "No surveys in scope",
          },
          {
            label: "Needs revisit",
            value: conditions,
            note: "Rooftop = No, but roof evidence recorded",
          },
          { label: "Open exceptions", value: exceptions.length, note: "Unmatched, contradictory, outlier" },
        ]}
      />

      <WsSection title="Pipeline" note="Nine stage gates — most are unstarted for this scope" padded={false}>
        <EChartCard
          option={funnelOption({ stages })}
          height={300}
          ariaLabel="Consumers by pipeline stage"
        />
      </WsSection>

      <WsSplit>
        <EChartCard
          title="Registered by area"
          note={`Children of ${node.name}`}
          height={260}
          empty={
            rows.length === 0
              ? { title: "No child areas", body: `${node.name} is a leaf node in the hierarchy.` }
              : undefined
          }
          option={
            rows.length
              ? rankedBarOption({ data: rows.map((r) => ({ name: r.name, value: r.registered })) })
              : undefined
          }
        />
        <EChartCard
          title="Survey submissions by day"
          note="Both capture days in the extract"
          height={260}
          empty={
            byDay.length === 0
              ? { title: "No surveys in scope", body: "No submissions fall under this node." }
              : undefined
          }
          option={
            byDay.length
              ? rankedBarOption({ data: byDay.map(([date, count]) => ({ name: toDmy(date), value: count })) })
              : undefined
          }
        />
      </WsSplit>

      <WsTable
        title="Areas in scope"
        note="Ranked by registered population. Click a row to change scope."
        exportName="overview-areas"
        cols={wsCols([
          ["name", "Area", { minWidth: 160 }],
          [
            "level",
            "Level",
            { width: 110, renderCell: ({ value }) => LEVEL_LABEL[value] ?? value },
          ],
          ["registered", "Registered", { width: 120, align: "right", type: "number" }],
          ["surveyed", "Surveyed", { width: 110, align: "right", type: "number" }],
          [
            "coverage",
            "Coverage",
            {
              width: 130,
              sortable: false,
              renderCell: ({ row }) => <CoverageCell node={row} />,
            },
          ],
        ])}
        rows={rows}
        onRowClick={({ row }) => select(row.id)}
        pageSize={10}
        emptyOverlay={
          <Typography variant="body2" sx={{ color: "text.secondary", p: 2 }}>
            {node.name} has no child areas to rank.
          </Typography>
        }
      />
    </WsPage>
  );
}
