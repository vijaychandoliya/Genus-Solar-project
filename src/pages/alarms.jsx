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
import { deviceExceptionsFor } from "../lib/device-data.js";
import { ageFrom, exInt } from "../lib/format.js";

const SEVERITY_TONE = { critical: "danger", warning: "warning" };
const SEVERITY_LABEL = { critical: "Critical", warning: "Warning" };

export default function Alarms() {
  const { node, pathLabel } = useHierarchy();

  /* Two sources, one queue. The programme exceptions come from the survey
     extract; the device exceptions come from the gateway payloads. §7 of
     ia-and-screen-plan.md is explicit that the queue is programme-wide rather
     than telemetry-only, so they belong in one inbox — an engineer working down
     a backlog does not care which file a defect was found in.

     `source` distinguishes them for faceting, and the device rows carry a device
     number where the survey rows carry a consumer. Neither has both. */
  const exceptions = useMemo(() => {
    const programme = exceptionsFor(node).map((e) => ({ ...e, source: "Programme" }));
    const devices = deviceExceptionsFor(node.id).map((e) => ({ ...e, source: "Device" }));
    return [...programme, ...devices].sort((a, b) => (b.age?.getTime() ?? 0) - (a.age?.getTime() ?? 0));
  }, [node]);

  const critical = exceptions.filter((e) => e.severity === "critical").length;
  const warning = exceptions.filter((e) => e.severity === "warning").length;
  const fromDevices = exceptions.filter((e) => e.source === "Device").length;

  return (
    <WsPage
      title="Alarms"
      subtitle="Every defect the source data actually contains — unmatched consumers and contradictory surveys from the extracts, skewed meter clocks and failed reads from the gateway payloads."
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
          { label: "Critical", value: critical, note: "Contradictions and tamper" },
          { label: "Warning", value: warning, note: "Unmatched, skewed or out of range" },
          { label: "From devices", value: fromDevices, note: "Gateway payloads" },
        ]}
      />

      <WsTable
        title="Exceptions"
        note="Recomputed from the survey extracts and the gateway payloads on every load — nothing here is stored state"
        exportName="alarms-exceptions"
        cols={wsCols([
          ["type", "Type", { minWidth: 180 }],
          ["source", "Source", { width: 120 }],
          // A device exception has a device number and no consumer; a programme
          // exception has the reverse. Neither column is padded with the other's
          // value — an em dash is the honest cell.
          [
            "subject",
            "Subject",
            {
              minWidth: 175,
              valueGetter: (raw, row) => row.consumer ?? row.deviceNo ?? null,
              renderCell: ({ row }) => row.consumer ?? row.deviceNo ?? "—",
            },
          ],
          ["panchayat", "Panchayat", { width: 130, renderCell: ({ value }) => value ?? "—" }],
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
