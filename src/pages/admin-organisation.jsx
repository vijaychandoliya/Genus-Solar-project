/**
 * Administration — Organisation.
 *
 * The full discom hierarchy, flattened — every node from every level, not
 * just the current scope's children the way Overview's table shows. This is
 * the admin reference view: browse or export the whole structure at once.
 * Every row is real, generated from the two source CSVs at build time — see
 * src/lib/hierarchy-data.js's own header for how and from what.
 */
import { useMemo } from "react";
import { WsPage, WsContext, WsTable, wsCols } from "../components/workspaces.jsx";
import { KpiStrip } from "../components/molecules.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { rollupRegistered } from "../lib/hierarchy.jsx";
import { exInt } from "../lib/format.js";

/** Depth-first flatten of the whole tree, each row carrying its own rollup. */
function flatten(node, parentPath = []) {
  const row = {
    id: node.id,
    name: node.name,
    level: node.level,
    parentPath: parentPath.map((n) => n.name).join(" / ") || "—",
    registered: rollupRegistered(node),
    children: node.children?.length ?? 0,
    sourceCode: node.sourceCode ?? null,
  };
  const nextPath = [...parentPath, node];
  return [row, ...(node.children ?? []).flatMap((c) => flatten(c, nextPath))];
}

export default function AdminOrganisation() {
  const { root } = useHierarchy();
  const rows = useMemo(() => flatten(root), [root]);

  const byLevel = useMemo(() => {
    const counts = new Map();
    for (const r of rows) counts.set(r.level, (counts.get(r.level) ?? 0) + 1);
    return counts;
  }, [rows]);

  return (
    <WsPage
      title="Organisation"
      subtitle="The full discom hierarchy — every circle, district, sub-division, section and panchayat, generated from the two source extracts."
      breadcrumbs={[
        { label: "Genus Solar", href: "/overview" },
        { label: "Administration", href: "/admin/users" },
        { label: "Organisation" },
      ]}
      context={
        <WsContext
          items={[{ label: "Total nodes", value: `${exInt(rows.length)} across 6 levels` }]}
        />
      }
    >
      <KpiStrip
        items={[
          { label: "Circles", value: byLevel.get("circle") ?? 0 },
          { label: "Districts", value: byLevel.get("district") ?? 0 },
          { label: "Sub-divisions", value: byLevel.get("subdivision") ?? 0 },
          { label: "Sections", value: byLevel.get("section") ?? 0 },
          { label: "Panchayats", value: byLevel.get("panchayat") ?? 0 },
        ]}
      />

      <WsTable
        title="Hierarchy"
        note="Registered is rolled up from panchayat leaves — an interior node's own figure includes every descendant"
        exportName="admin-organisation"
        cols={wsCols([
          ["name", "Name", { minWidth: 180 }],
          [
            "level",
            "Level",
            { width: 120, renderCell: ({ value }) => LEVEL_LABEL[value] ?? value },
          ],
          ["parentPath", "Parent", { minWidth: 220 }],
          ["registered", "Registered", { width: 120, align: "right", type: "number" }],
          ["children", "Child nodes", { width: 110, align: "right", type: "number" }],
        ])}
        rows={rows}
        getRowId={(r) => r.id}
        pageSize={15}
      />
    </WsPage>
  );
}
