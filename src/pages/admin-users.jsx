/**
 * Administration — Users.
 *
 * Two populations, one table. See src/lib/rbac.js for why they must stay
 * distinguishable:
 *
 *   · OBSERVED accounts are read back off the two extracts. Their "role" is a
 *     descriptor of what they did, not a grant, and their survey count is real.
 *   · PROVISIONED accounts are created here, carry one of the five RBAC roles
 *     and a hierarchy scope, and have done nothing yet — so their survey count
 *     is a true 0, not a missing value.
 *
 * There is no auth backend (dms-parity-plan.md Phase 6), so a provisioned
 * account reaches no server and does not survive a reload. The screen says so
 * in three places — the subtitle, the dialog, and the row's own origin chip —
 * because a form that silently discards its submit is worse than no form.
 */
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { Alert, Button, MenuItem, TextField, Typography } from "@mui/material";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import { WsPage, WsContext, WsTable, wsCols } from "../components/workspaces.jsx";
import { StatusChip } from "../components/atoms.jsx";
import { FormDialog } from "../components/molecules.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { surveysFor } from "../lib/programme-data.js";
import {
  accountsSnapshot,
  addAccount,
  rolesSnapshot,
  subscribeAccounts,
  subscribeRbac,
  validateAccount,
} from "../lib/rbac.js";
import { announce } from "../components/organisms/shell.jsx";
import { exInt } from "../lib/format.js";

const ROLE_TONE = {
  "Bulk import": "info",
  "Field surveyor": "good",
  // Set when a provisioned account's role was removed underneath it. Warning,
  // not neutral: an account with no grant is a state somebody has to resolve.
  "No role": "warning",
};

const EMPTY_DRAFT = { name: "", employeeId: "", roleId: "", scopeId: "" };

/** Every hierarchy node, flattened, so scope can be any level of the tree. */
function flattenNodes(root, depth = 0, out = []) {
  out.push({ id: root.id, name: root.name, level: root.level, depth });
  (root.children ?? []).forEach((c) => flattenNodes(c, depth + 1, out));
  return out;
}

export default function AdminUsers() {
  const { node, pathLabel, root, index } = useHierarchy();
  const stored = useSyncExternalStore(subscribeAccounts, accountsSnapshot);
  // Read from the live store, not a frozen constant: a role added on
  // /admin/roles must be selectable here, or the two screens disagree about
  // what roles exist.
  const roles = useSyncExternalStore(subscribeRbac, rolesSnapshot);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [errors, setErrors] = useState({});

  const scopeOptions = useMemo(() => flattenNodes(root), [root]);

  /* Observed accounts get their real in-scope survey count; provisioned ones
     have genuinely done nothing, which is a 0 rather than an absence. */
  const accounts = useMemo(() => {
    const rows = surveysFor(node.id);
    return stored.map((a) =>
      a.origin === "observed"
        ? { ...a, surveysInScope: rows.filter((r) => r.employee === a.name).length }
        : a,
    );
  }, [stored, node]);

  const provisionedCount = accounts.filter((a) => a.origin === "provisioned").length;

  const set = useCallback((field) => (e) => {
    const { value } = e.target;
    setDraft((d) => ({ ...d, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setDraft(EMPTY_DRAFT);
    setErrors({});
  }, []);

  const submit = useCallback(() => {
    const found = validateAccount(draft);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    const scope = index.get(draft.scopeId);
    const created = addAccount({
      ...draft,
      scopeLabel: scope ? scope.path.map((n) => n.name).join(" / ") : draft.scopeId,
    });
    announce(`Account ${created.name} added for this session.`);
    close();
  }, [draft, index, close]);

  return (
    <WsPage
      title="Users"
      subtitle="Accounts that have touched this data, plus any provisioned here. There is no auth backend yet, so this is not a registered-user count and a provisioned account does not survive a reload."
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
            {
              label: "Provisioned",
              value: provisionedCount ? `${exInt(provisionedCount)} this session` : "None",
            },
          ]}
        />
      }
      actions={
        <Button
          size="small"
          variant="contained"
          startIcon={<PersonAddAltOutlinedIcon />}
          onClick={() => setOpen(true)}
        >
          Add user
        </Button>
      }
    >
      <WsTable
        title="System accounts"
        note="Observed in the two source extracts, plus accounts provisioned in this session"
        exportName="admin-users"
        cols={wsCols([
          ["name", "Account", { minWidth: 200 }],
          [
            "role",
            "Role",
            {
              width: 170,
              renderCell: ({ value }) => (
                <StatusChip label={value} tone={ROLE_TONE[value] ?? "neutral"} />
              ),
            },
          ],
          [
            "origin",
            "Origin",
            {
              width: 150,
              valueGetter: (v) => (v === "provisioned" ? "Provisioned" : "From extract"),
              renderCell: ({ row }) => (
                <StatusChip
                  label={row.origin === "provisioned" ? "Provisioned" : "From extract"}
                  tone={row.origin === "provisioned" ? "warning" : "neutral"}
                />
              ),
            },
          ],
          [
            "scopeLabel",
            "Scope",
            {
              minWidth: 180,
              // An observed account was never granted a scope — it acted
              // wherever its rows happen to sit. Printing the current picker
              // scope here would invent an assignment nobody made.
              valueGetter: (v, row) => v ?? (row.origin === "observed" ? "Not assigned" : "—"),
            },
          ],
          ["source", "Source", { width: 180 }],
          ["surveysInScope", "Surveys in scope", { width: 150, align: "right", type: "number" }],
        ])}
        rows={accounts}
        pageSize={10}
      />

      <FormDialog
        open={open}
        onClose={close}
        onSubmit={submit}
        title="Add user"
        submitLabel="Add for this session"
        maxWidth="sm"
      >
        <Alert severity="info" variant="outlined">
          No auth backend exists yet, so this account is held in memory for this browser session
          only. It reaches no server and is gone on reload — see dms-parity-plan.md Phase&nbsp;6.
        </Alert>

        <TextField
          label="Name"
          value={draft.name}
          onChange={set("name")}
          error={Boolean(errors.name)}
          helperText={errors.name}
          size="small"
          fullWidth
          autoFocus
        />

        <TextField
          label="Employee ID"
          value={draft.employeeId}
          onChange={set("employeeId")}
          error={Boolean(errors.employeeId)}
          helperText={errors.employeeId ?? "Digits only — the format the extracts stamp, e.g. 11126."}
          size="small"
          fullWidth
        />

        <TextField
          select
          label="Role"
          value={draft.roleId}
          onChange={set("roleId")}
          error={Boolean(errors.roleId)}
          helperText={
            errors.roleId ??
            (draft.roleId
              ? roles.find((r) => r.id === draft.roleId)?.note
              : "What the account may do.")
          }
          size="small"
          fullWidth
        >
          {roles.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.label}
              {r.isNew && (
                <Typography component="span" variant="caption" sx={{ ml: 1, color: "text.tertiary" }}>
                  new
                </Typography>
              )}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Scope"
          value={draft.scopeId}
          onChange={set("scopeId")}
          error={Boolean(errors.scopeId)}
          helperText={errors.scopeId ?? "What the account may do it to. Separate from role, on purpose."}
          size="small"
          fullWidth
        >
          {scopeOptions.map((o) => (
            <MenuItem key={o.id} value={o.id} sx={{ pl: 2 + o.depth * 1.5 }}>
              {o.name}
              <Typography component="span" variant="caption" sx={{ ml: 1, color: "text.tertiary" }}>
                {LEVEL_LABEL[o.level]}
              </Typography>
            </MenuItem>
          ))}
        </TextField>
      </FormDialog>
    </WsPage>
  );
}
