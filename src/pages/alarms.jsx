/**
 * Alarms — the exceptions inbox. docs/dashboard-ia.md §5.6.
 *
 * Every row is a real defect found in the source extracts (§7): a survey
 * whose consumer has no match in the registered master, a survey that
 * contradicts itself (no rooftop, yet roof evidence was captured), or a
 * measurement recorded far outside the fleet's normal range. Nothing here is
 * synthetic — this is what src/lib/programme-data.js's exceptionsFor()
 * actually finds when it walks the 9 real survey rows against the rules.
 *
 * No separate FilterBar band: per AGENTS.md §3, page-level table controls are
 * a rule violation once the table already has its own per-column funnels —
 * severity and type both facet natively since neither has more than a
 * handful of distinct values.
 */
import { useMemo } from "react";
import { WsPage, WsContext, WsTable, wsCols } from "../components/workspaces.jsx";
import { KpiStrip } from "../components/molecules.jsx";
import { StatusChip, EmptyState } from "../components/atoms.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { exceptionsFor } from "../lib/programme-data.js";
import { ageFrom, exInt } from "../lib/format.js";

const SEVERITY_TONE = { critical: "danger", warning: "warning" };
const SEVERITY_LABEL = { critical: "Critical", warning: "Warning" };

export default function Alarms() {
  const { node, pathLabel } = useHierarchy();
  const exceptions = useMemo(() => exceptionsFor(node), [node]);

  const critical = exceptions.filter((e) => e.severity === "critical").length;
  const warning = exceptions.filter((e) => e.severity === "warning").length;

  return (
    <WsPage
      title="Alarms"
      subtitle="Every defect the two source extracts actually contain — unmatched consumers, contradictory surveys, measurement outliers."
      breadcrumbs={[{ label: "Genus Solar", href: "/overview" }, { label: "Alarms" }]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Open", value: `${exInt(exceptions.length)} exceptions` },
          ]}
        />
      }
    >
      <KpiStrip
        items={[
          { label: "Open exceptions", value: exceptions.length, note: "This scope" },
          { label: "Critical", value: critical, note: "Data contradictions" },
          { label: "Warning", value: warning, note: "Unmatched or out of range" },
        ]}
      />

      <WsTable
        title="Exceptions"
        note="Derived from the two source extracts on every load — nothing here is stored state"
        exportName="alarms-exceptions"
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
                <StatusChip label={SEVERITY_LABEL[value] ?? value} tone={SEVERITY_TONE[value] ?? "neutral"} />
              ),
            },
          ],
          ["detail", "Detail", { minWidth: 320, sortable: false }],
          [
            "age",
            "Reported",
            {
              width: 130,
              type: "number",
              valueGetter: (raw, row) => row.age?.getTime() ?? 0,
              renderCell: ({ row }) => (row.age ? ageFrom(row.age) : "—"),
            },
          ],
        ])}
        rows={exceptions}
        pageSize={10}
        emptyOverlay={
          <EmptyState
            title="No open exceptions"
            body="Nothing in this scope failed the unmatched-consumer, contradiction or outlier checks."
            minHeight={140}
          />
        }
      />
    </WsPage>
  );
}
