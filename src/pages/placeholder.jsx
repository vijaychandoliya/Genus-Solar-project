/**
 * Route placeholder.
 *
 * Every nav destination resolves to a real route from day one, so the rail is
 * never a set of dead links. Each states what it will become and which section
 * of the plan specifies it — the empty state says what is happening, not just
 * that nothing is here.
 */
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { WsPage, WsContext, WsSection } from "../components/workspaces.jsx";
import { EmptyState } from "../components/atoms.jsx";
import { useHierarchy } from "../lib/hierarchy.jsx";
import { exInt } from "../lib/format.js";

const SPEC = {
  "/overview": ["dashboard-ia.md §5.1", "Tile deck of Needs attention / On battery / Offline / Healthy over a ranked site list."],
  "/alarms": ["dashboard-ia.md §5.6", "The exception inbox — severity, site, asset, rule, age, assignee, with bulk acknowledge."],
  "/alarms/rules": ["ia-and-screen-plan.md §7.7", "Threshold rules per device class, with dwell and hysteresis."],
  "/sites": ["dashboard-ia.md §5.2", "Site list with health, over a district choropleth and ranked child nodes."],
  "/assets": ["ia-and-screen-plan.md §7.4", "The device registry with nameplate completeness and bulk edit."],
  "/telemetry/bms": ["ia-and-screen-plan.md §7.6", "Cross-fleet battery grid — 20 columns, 8 visible by default."],
  "/telemetry/gti": ["ia-and-screen-plan.md §7.6", "Grid-tie inverter data, info, on-demand and heartbeat."],
  "/telemetry/ups": ["ia-and-screen-plan.md §7.6", "Three-phase UPS telemetry with phase imbalance."],
  "/telemetry/solar": ["ia-and-screen-plan.md §7.6", "PV generation against installed kWp."],
  "/telemetry/meter": ["ia-and-screen-plan.md §7.6", "Three-phase metering, power factor and max demand."],
  "/reports": ["dashboard-ia.md §5.7", "Report output with period-over-period comparison."],
  "/data/import": ["dashboard-ia.md §5.7", "Upload with a dry-run validation report before commit."],
  "/data/history": ["dashboard-ia.md §5.7", "Batch history with rollback by import_batch_id."],
  "/data/health": ["dashboard-ia.md §5.7", "Ingestion lag, parse failure rate, reporting versus expected."],
  "/admin/users": ["ia-and-screen-plan.md §8", "Users and scope, separated from role."],
  "/admin/roles": ["ia-and-screen-plan.md §8", "Five roles including the new read-only Analyst."],
  "/admin/audit": ["ia-and-screen-plan.md §11", "Administrative action log."],
  "/admin/organisation": ["dashboard-ia.md §4", "Hierarchy management on generated ids, not the source Code columns."],
};

export default function Placeholder({ title, to }) {
  const { pathLabel, node, registered } = useHierarchy();
  const [spec, blurb] = SPEC[to] ?? ["—", "Specified in docs/."];

  return (
    <WsPage
      title={title}
      subtitle={blurb}
      breadcrumbs={[{ label: "Genus Solar", href: "/overview" }, { label: title }]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: node.level },
            { label: "Registered", value: `${exInt(registered)} consumers` },
          ]}
        />
      }
      actions={
        <Button component={Link} to="/gallery" size="small" variant="outlined">
          Component gallery
        </Button>
      }
    >
      <WsSection padded={false}>
        <EmptyState
          title="Not built yet"
          body={`This screen is specified in ${spec}. The shell, tokens, table engine and chart layer it needs are in place — only the screen itself is outstanding.`}
          minHeight={280}
        />
      </WsSection>
    </WsPage>
  );
}
