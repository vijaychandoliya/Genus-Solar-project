/**
 * Administration — Users.
 *
 * No auth backend exists, so there is no real RBAC user table to show. What
 * IS real: the "Created By" / "Employee ID" values stamped on every row of
 * both extracts — one bulk-import account, two field-survey accounts. This
 * is a real, if small, account list — not the same claim as "registered
 * platform users" (see programme-data.js's own note on SYSTEM_ACCOUNTS).
 */
import { useMemo } from "react";
import { WsPage, WsContext, WsTable, wsCols } from "../components/workspaces.jsx";
import { StatusChip } from "../components/atoms.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { accountsFor } from "../lib/programme-data.js";
import { exInt } from "../lib/format.js";

const ROLE_TONE = { "Bulk import": "info", "Field surveyor": "good" };

export default function AdminUsers() {
  const { node, pathLabel } = useHierarchy();
  const accounts = useMemo(() => accountsFor(node.id), [node]);

  return (
    <WsPage
      title="Users"
      subtitle="The accounts that have actually touched this data — not a registered-user count, which this platform does not have an auth backend to produce yet."
      breadcrumbs={[
        { label: "Genus Solar", href: "/overview" },
        { label: "Administration", href: "/admin/users" },
        { label: "Users" },
      ]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Accounts", value: `${exInt(accounts.length)} on file` },
          ]}
        />
      }
    >
      <WsTable
        title="System accounts"
        note="Admin + field surveyors, from the two source extracts"
        exportName="admin-users"
        cols={wsCols([
          ["name", "Account", { minWidth: 200 }],
          [
            "role",
            "Role",
            {
              width: 160,
              renderCell: ({ value }) => <StatusChip label={value} tone={ROLE_TONE[value] ?? "neutral"} />,
            },
          ],
          ["source", "Source extract", { width: 170 }],
          ["surveysInScope", "Surveys in scope", { width: 150, align: "right", type: "number" }],
        ])}
        rows={accounts}
        pageSize={10}
      />
    </WsPage>
  );
}
