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
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutlineOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import DevicesOtherOutlinedIcon from "@mui/icons-material/DevicesOtherOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import BatteryChargingFullOutlinedIcon from "@mui/icons-material/BatteryChargingFullOutlined";
import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";
import { WsPage, WsContext, WsSection, WsSplit, WsTable, wsCols } from "../components/workspaces.jsx";
import { KpiDeck, KpiTile } from "../components/molecules.jsx";
import { EChartCard, rankedBarOption, funnelOption } from "../components/charts.jsx";
import { BandedValue, NotConfigured } from "../components/atoms.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import {
  pipelineStages,
  exceptionsFor,
  submissionsByDay,
  childRollups,
  coverageInfo,
  latestSubmission,
  SYSTEM_ACCOUNTS,
  MASTER_UPLOADED_AT,
} from "../lib/programme-data.js";
import { fleetCounts } from "../lib/device-data.js";
import { bandFor } from "../lib/bands.js";
import { exInt, toDmy, ageFrom } from "../lib/format.js";

/** Band → KpiTile tone. Bands are for dense grid cells; a hero KPI card can
 *  carry colour freely, so "normal" maps to a real green here, not to none. */
const BAND_TO_TONE = { normal: "good", watch: "warning", warning: "warning", critical: "warning" };

/** The four fleet tiles. One list, so the labels and icons cannot drift from
 *  `fleetCounts()`'s keys. */
const DEVICE_TILES = [
  { id: "devices", label: "Devices", icon: <DevicesOtherOutlinedIcon /> },
  { id: "gti", label: "GTI system", icon: <BoltOutlinedIcon /> },
  { id: "bms", label: "BMS devices", icon: <BatteryChargingFullOutlinedIcon /> },
  { id: "ups", label: "UPS devices", icon: <PowerOutlinedIcon /> },
];

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
  const fleet = useMemo(() => fleetCounts(node.id), [node]);

  const surveyed = stages.find((s) => s.id === "surveyed")?.value ?? 0;
  const conditions = exceptions.filter((e) => e.type === "Contradictory survey").length;
  const withConditions = surveyed - conditions; // every surveyed row here is either clean-conditions or a contradiction
  const coverage = coverageInfo(node);

  const rows = [...children].sort((a, b) => b.registered - a.registered);

  const lastSubmission = latestSubmission(node);
  const submissionFreshness = lastSubmission
    ? `Latest submission ${ageFrom(lastSubmission)}`
    : "No surveys in scope";
  const masterFreshness = `Snapshot · master uploaded ${toDmy(MASTER_UPLOADED_AT)}`;

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
      <WsSection title="Programme" note="Every figure computed from the two source extracts" padded={false}>
        <KpiDeck sx={{ p: 2 }}>
          <KpiTile
            label="Registered"
            value={registered}
            icon={<PeopleOutlineIcon />}
            tone="info"
            freshness={masterFreshness}
          />
          <KpiTile
            label="Surveyed"
            value={surveyed}
            icon={<FactCheckOutlinedIcon />}
            tone="info"
            freshness={submissionFreshness}
          />
          <KpiTile
            label="Coverage"
            value={coverage.pct}
            unit={coverage.pct === null ? undefined : "%"}
            dp={coverage.pct !== null && coverage.pct < 1 ? 1 : 0}
            icon={<DonutLargeIcon />}
            tone={BAND_TO_TONE[bandFor("coverage_pct", coverage.pct)] ?? "info"}
            notConfigured={coverage.pct === null}
            freshness={coverage.reason ?? "Surveyed ÷ registered, this scope"}
          />
          <KpiTile
            label="With conditions"
            value={withConditions}
            icon={<BuildCircleOutlinedIcon />}
            tone={withConditions > 0 ? "warning" : "good"}
            freshness={submissionFreshness}
          />
          <KpiTile
            label="Needs revisit"
            value={conditions}
            icon={<ReportProblemOutlinedIcon />}
            tone={conditions > 0 ? "warning" : "good"}
            freshness={submissionFreshness}
          />
          <KpiTile
            label="Open exceptions"
            value={exceptions.length}
            icon={<ErrorOutlineIcon />}
            tone={exceptions.length > 0 ? "warning" : "good"}
            freshness="Derived from the two source extracts"
          />
        </KpiDeck>
      </WsSection>

      <WsSection
        title="Users & devices"
        note="Total Users is real — the accounts that touched this data. Each device tile states which population it counts, because a count with no stated population is how a dashboard ends up disagreeing with its own table."
        padded={false}
      >
        <KpiDeck sx={{ p: 2 }}>
          <KpiTile
            label="Total users"
            value={SYSTEM_ACCOUNTS.length}
            icon={<GroupsIcon />}
            tone="info"
            freshness="Admin + 2 field surveyors, from the extracts"
          />
          {DEVICE_TILES.map((t) => {
            const c = fleet[t.id];
            return (
              <KpiTile
                key={t.id}
                label={t.label}
                icon={t.icon}
                tone="info"
                value={c.pending ? undefined : c.registered}
                notConfigured={c.pending}
                // The freshness slot states the POPULATION, not just the age.
                // The source DMS's cards say 146 / 63 / 76 while its own tables
                // hold 151 / 44 / 42, and the gap is unexplainable because
                // neither number says what it counts.
                freshness={
                  c.pending
                    ? c.reason
                    : `Registered in this scope · ${exInt(c.reporting)} reporting within one interval`
                }
              />
            );
          })}
        </KpiDeck>
      </WsSection>

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
