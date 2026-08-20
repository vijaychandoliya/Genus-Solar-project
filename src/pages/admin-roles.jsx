/**
 * Administration — Roles.
 *
 * An editable access matrix over the five roles the screen plan specifies
 * (docs/ia-and-screen-plan.md §8), plus any role added here.
 *
 * ── Editable, with the baseline kept ────────────────────────────────────
 * The plan's own table is frozen in `rbac.js` as `ROLE_BASELINE` /
 * `MATRIX_BASELINE` and is never written to. Every edit lands on a copy, so
 * `rbacDiff()` can answer "what did we change" exactly — which is the artefact
 * worth having after an access workshop. A session where someone toggles
 * fifteen cells is useless if nobody can reconstruct which fifteen.
 *
 * ── Nothing is enforced, and nothing persists ───────────────────────────
 * There is no auth layer (dms-parity-plan.md Phase 6), so these grants govern
 * nothing today and are gone on reload. Stated in the banner rather than
 * implied, because a matrix that looked authoritative would be read as policy.
 *
 * ── Why the qualifier is a separate control ─────────────────────────────
 * Plan §8 distinguishes "✅", "✅ own", "✅ assigned", "✅ read" and
 * "✅ scoped". Collapsing those into one tick would let a store operator's
 * own-site access read as fleet-wide — the exact confusion that separating
 * scope from role exists to prevent. So level and qualifier are two controls,
 * and revoking a grant clears its qualifier rather than leaving "none · own".
 */
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Link as RouterLink } from "react-router-dom";
import { WsPage, WsContext, WsSection, WsTable, wsCols } from "../components/workspaces.jsx";
import { StatusChip } from "../components/atoms.jsx";
import { FormDialog } from "../components/molecules.jsx";
import { announce } from "../components/organisms/shell.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import {
  PERMISSION_NODES,
  QUALIFIERS,
  GRANT_LEVELS,
  accountsSnapshot,
  addRole,
  grantFor,
  matrixSnapshot,
  rbacDiff,
  reachableNodeCount,
  removeRole,
  resetRbac,
  rolesSnapshot,
  setGrant,
  setRoleColumn,
  subscribeAccounts,
  subscribeRbac,
  updateRole,
  validateRole,
} from "../lib/rbac.js";
import { exInt } from "../lib/format.js";

const EMPTY_ROLE = { label: "", scope: "", note: "" };

const LEVEL_TONE = { full: "good", partial: "warning", none: "neutral" };

/* Module level, never declared inside a render body — a component redefined
   per render is a new type every time, so React remounts it and the control
   loses focus mid-interaction (AGENTS.md §5). */
function GrantEditor({ nodeId, role, grant, onChange }) {
  const granted = grant.level !== "none";
  return (
    <Stack sx={{ gap: 0.75, py: 0.5, minWidth: 0 }}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={grant.level}
        aria-label={`${role.label} access to ${nodeId}`}
        onChange={(_, next) => {
          // Exclusive groups emit null when the active button is re-clicked.
          // Ignoring it keeps the cell from falling into an unset state that
          // the matrix has no meaning for.
          if (next !== null) onChange({ level: next });
        }}
        sx={{
          "& .MuiToggleButton-root": {
            px: 1,
            py: 0.25,
            fontSize: 11,
            lineHeight: 1.6,
            textTransform: "none",
            fontWeight: 600,
          },
        }}
      >
        {GRANT_LEVELS.map((l) => (
          <ToggleButton key={l.value} value={l.value} aria-label={l.label}>
            {l.short}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {granted && (
        <Select
          size="small"
          value={grant.qualifier ?? ""}
          onChange={(e) => onChange({ qualifier: e.target.value || null })}
          displayEmpty
          aria-label={`Qualifier for ${role.label} on ${nodeId}`}
          renderValue={(v) =>
            v ? (
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                · {v}
              </Typography>
            ) : (
              <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                No qualifier
              </Typography>
            )
          }
          sx={{ "& .MuiSelect-select": { py: 0.25, fontSize: 11.5 } }}
        >
          {QUALIFIERS.map((q) => (
            <MenuItem key={q.value || "none"} value={q.value} dense>
              {q.label}
            </MenuItem>
          ))}
        </Select>
      )}
    </Stack>
  );
}

export default function AdminRoles() {
  const { node, pathLabel } = useHierarchy();

  const roles = useSyncExternalStore(subscribeRbac, rolesSnapshot);
  const matrix = useSyncExternalStore(subscribeRbac, matrixSnapshot);
  const accounts = useSyncExternalStore(subscribeAccounts, accountsSnapshot);

  const [dialog, setDialog] = useState(null); // { mode: "add" | "edit", id? }
  const [draft, setDraft] = useState(EMPTY_ROLE);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);

  const holders = useMemo(() => {
    const counts = Object.fromEntries(roles.map((r) => [r.id, 0]));
    accounts.forEach((a) => {
      if (a.roleId && counts[a.roleId] !== undefined) counts[a.roleId] += 1;
    });
    return counts;
  }, [roles, accounts]);

  const unassigned = accounts.filter((a) => !a.roleId).length;

  // `matrix` is read so this recomputes on every cell toggle; grantFor reads
  // the same live store.
  const diff = useMemo(() => rbacDiff(), [roles, matrix]);

  const roleRows = roles.map((r) => ({
    ...r,
    reach: reachableNodeCount(r.id),
    holders: holders[r.id] ?? 0,
  }));

  const matrixRows = PERMISSION_NODES.map((n) => ({
    id: n.id,
    label: n.label,
    to: n.to,
    ...Object.fromEntries(roles.map((r) => [r.id, grantFor(n.id, r.id)])),
  }));

  const openAdd = () => {
    setDraft(EMPTY_ROLE);
    setErrors({});
    setDialog({ mode: "add" });
  };

  const openEdit = useCallback((role) => {
    setDraft({ label: role.label, scope: role.scope, note: role.note });
    setErrors({});
    setDialog({ mode: "edit", id: role.id });
  }, []);

  const closeDialog = () => {
    setDialog(null);
    setDraft(EMPTY_ROLE);
    setErrors({});
  };

  const submitRole = () => {
    const found = validateRole(draft, { editingId: dialog?.mode === "edit" ? dialog.id : null });
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    if (dialog.mode === "edit") {
      updateRole(dialog.id, { label: draft.label.trim(), scope: draft.scope.trim(), note: draft.note.trim() });
      announce(`Role ${draft.label.trim()} updated.`);
    } else {
      const created = addRole(draft);
      announce(`Role ${created.label} added with no access to any screen.`);
      setNotice({
        severity: "info",
        text: `"${created.label}" starts with no access anywhere. Grant it explicitly in the matrix below.`,
      });
    }
    closeDialog();
  };

  const deleteRole = useCallback((role) => {
    const result = removeRole(role.id);
    if (!result.ok) {
      setNotice({ severity: "warning", text: result.reason });
      return;
    }
    announce(`Role ${role.label} removed.`);
    setNotice({ severity: "info", text: `"${role.label}" removed, along with its column in the matrix.` });
  }, []);

  const setField = (field) => (e) => {
    const { value } = e.target;
    setDraft((d) => ({ ...d, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  return (
    <WsPage
      title="Roles"
      subtitle="Five roles from the screen plan, plus any you add. Toggle any cell to model an access change — the specification is kept underneath, so every deviation stays listed and exportable."
      breadcrumbs={[
        { label: "Genus Solar", href: "/overview" },
        { label: "Administration", href: "/admin/users" },
        { label: "Roles" },
      ]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Roles", value: exInt(roles.length) },
            { label: "Nav nodes governed", value: exInt(PERMISSION_NODES.length) },
            {
              label: "Changed from plan",
              value: diff.length ? `${exInt(diff.length)} deviation${diff.length === 1 ? "" : "s"}` : "None",
            },
          ]}
        />
      }
      actions={
        <>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Add role
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RestartAltIcon />}
            disabled={diff.length === 0}
            onClick={() => {
              const { orphaned } = resetRbac();
              setNotice(
                orphaned.length
                  ? {
                      severity: "warning",
                      text: `Reset to the specification. ${orphaned.join(", ")} held a role that no longer exists and ${orphaned.length === 1 ? "is" : "are"} now unassigned — reassign on Users.`,
                    }
                  : { severity: "info", text: "Matrix and roles reset to the specification." },
              );
              announce(
                orphaned.length
                  ? `Roles reset. ${orphaned.length} account${orphaned.length === 1 ? "" : "s"} left unassigned.`
                  : "Roles reset to the specification.",
              );
            }}
          >
            Reset to plan
          </Button>
        </>
      }
    >
      <Alert severity="warning" variant="outlined">
        <strong>Editable, but not enforced and not saved.</strong> There is no auth layer yet, so
        every route stays reachable by anyone with the URL whatever this matrix says, and these
        edits are gone on reload. Use it to model an access decision and export the deviation list
        below — that list is the thing worth taking away.
        {unassigned > 0 && (
          <>
            {" "}
            {exInt(unassigned)} account{unassigned === 1 ? "" : "s"} on{" "}
            <Box component={RouterLink} to="/admin/users" sx={{ color: "inherit" }}>
              Users
            </Box>{" "}
            hold no role — those are observed in the extracts, which have no concept of one.
          </>
        )}
      </Alert>

      {notice && (
        <Alert severity={notice.severity} variant="outlined" onClose={() => setNotice(null)}>
          {notice.text}
        </Alert>
      )}

      <WsTable
        title="Roles"
        note="Scope is separate from role — role says what, scope says what to"
        exportName="admin-roles"
        search={false}
        pageSize={12}
        cols={wsCols([
          ["n", "#", { width: 60, align: "right", type: "number" }],
          [
            "label",
            "Role",
            {
              width: 210,
              renderCell: ({ row }) => (
                <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
                  <Typography variant="body2">{row.label}</Typography>
                  {row.isNew && <StatusChip label="new" tone="info" />}
                  {row.custom && <StatusChip label="added" tone="warning" />}
                </Stack>
              ),
            },
          ],
          ["scope", "Default scope", { width: 170 }],
          ["reach", "Nav nodes reachable", { width: 160, align: "right", type: "number" }],
          [
            "holders",
            "Accounts holding it",
            {
              width: 160,
              align: "right",
              type: "number",
              renderCell: ({ row }) =>
                row.holders ? (
                  <Typography
                    variant="body2"
                    dir="ltr"
                    sx={{ fontVariantNumeric: "tabular-nums", unicodeBidi: "isolate" }}
                  >
                    {exInt(row.holders)}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: "text.tertiary" }}>
                    None
                  </Typography>
                ),
            },
          ],
          [
            "note",
            "What changes with this role",
            {
              width: 440,
              renderCell: ({ value }) => (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {value}
                </Typography>
              ),
            },
          ],
          [
            "id",
            "Edit",
            {
              width: 110,
              align: "center",
              sortable: false,
              renderCell: ({ row }) => (
                <Stack direction="row" sx={{ gap: 0.25, justifyContent: "center" }}>
                  <Tooltip title={`Edit ${row.label}`}>
                    <IconButton size="small" onClick={() => openEdit(row)} aria-label={`Edit ${row.label}`}>
                      <EditOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`Delete ${row.label}`}>
                    <IconButton size="small" onClick={() => deleteRole(row)} aria-label={`Delete ${row.label}`}>
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ),
            },
          ],
        ])}
        rows={roleRows}
        lockFirstColumn
      />

      <WsTable
        title="Access matrix"
        note="Toggle any cell. Revoking a grant clears its qualifier — “none · own” is not a state."
        exportName="admin-role-matrix"
        search={false}
        pageSize={12}
        cols={wsCols([
          ["label", "Nav node", { width: 190 }],
          ...roles.map((r) => [
            r.id,
            r.label,
            {
              width: 210,
              sortable: false,
              // Sorting and CSV read a flat string; the cell renders controls.
              // Both keep the qualifier, per AGENTS.md §5.
              valueGetter: (v) =>
                !v || v.level === "none"
                  ? "No access"
                  : `${v.level}${v.qualifier ? ` · ${v.qualifier}` : ""}`,
              renderCell: ({ row }) => (
                <GrantEditor
                  nodeId={row.id}
                  role={r}
                  grant={row[r.id] ?? { level: "none", qualifier: null }}
                  onChange={(patch) => setGrant(row.id, r.id, patch)}
                />
              ),
            },
          ]),
        ])}
        rows={matrixRows}
        lockFirstColumn
      />

      <WsSection
        title="Grant a whole role at once"
        note="Bulk-set every nav node for one role, then narrow the exceptions"
      >
        <Stack sx={{ gap: 1.25 }}>
          {roles.map((r) => (
            <Stack
              key={r.id}
              direction="row"
              sx={{ gap: 1.5, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}
            >
              <Stack direction="row" sx={{ gap: 1, alignItems: "center", minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {r.label}
                </Typography>
                <StatusChip
                  label={`${exInt(reachableNodeCount(r.id))} of ${exInt(PERMISSION_NODES.length)} reachable`}
                  tone={LEVEL_TONE[reachableNodeCount(r.id) ? "full" : "none"]}
                />
              </Stack>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={null}
                aria-label={`Set every node for ${r.label}`}
                onChange={(_, level) => {
                  if (!level) return;
                  setRoleColumn(r.id, level);
                  announce(`${r.label} set to ${level} on every nav node.`);
                }}
                sx={{ "& .MuiToggleButton-root": { px: 1.25, py: 0.25, fontSize: 11.5, textTransform: "none" } }}
              >
                {GRANT_LEVELS.map((l) => (
                  <ToggleButton key={l.value} value={l.value}>
                    All {l.short.toLowerCase()}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
          ))}
        </Stack>
      </WsSection>

      {diff.length > 0 && (
        <WsTable
          title="Changed from the specification"
          note="Every deviation from plan §8, exportable — this is the artefact to hand back"
          exportName="admin-role-deviations"
          search={false}
          pageSize={25}
          cols={wsCols([
            [
              "kind",
              "Change",
              {
                width: 150,
                renderCell: ({ value }) => (
                  <StatusChip
                    label={value}
                    tone={value === "Role removed" ? "danger" : value === "Role added" ? "info" : "warning"}
                  />
                ),
              },
            ],
            ["target", "What", { width: 320 }],
            ["from", "Was", { width: 200 }],
            ["to", "Now", { width: 200 }],
          ])}
          rows={diff}
        />
      )}

      <WsSection title="What is still open" note="Carried from the plan, not resolved by this screen">
        <Stack component="ul" sx={{ gap: 1.25, pl: 2.5, m: 0 }}>
          <Typography component="li" variant="body2" sx={{ color: "text.secondary" }}>
            <strong>No permission-denied layout exists.</strong> Locked content has a chip; locked
            routes render nothing at all. With five roles and route-level differences this now needs
            designing — plan §8 flags it as no longer theoretical.
          </Typography>
          <Typography component="li" variant="body2" sx={{ color: "text.secondary" }}>
            <strong>Admin is removed from public registration.</strong> Self-elected admin is a
            security defect, so the role cannot be chosen at sign-up — only granted.
          </Typography>
          <Typography component="li" variant="body2" sx={{ color: "text.secondary" }}>
            <strong>Analyst is the open question.</strong> Plan Q6 asks whether the fifth role is in
            scope at all, or whether warranty work stays an export.
          </Typography>
        </Stack>
      </WsSection>

      <FormDialog
        open={Boolean(dialog)}
        onClose={closeDialog}
        onSubmit={submitRole}
        title={dialog?.mode === "edit" ? "Edit role" : "Add role"}
        submitLabel={dialog?.mode === "edit" ? "Save for this session" : "Add for this session"}
        maxWidth="sm"
      >
        <Alert severity="info" variant="outlined">
          Roles live in memory for this session — there is no auth backend to write a grant to. The
          change is listed against the specification below the matrix so it can be exported.
        </Alert>

        <TextField
          label="Role name"
          value={draft.label}
          onChange={setField("label")}
          error={Boolean(errors.label)}
          helperText={errors.label}
          size="small"
          fullWidth
          autoFocus
        />

        <TextField
          label="Default scope"
          value={draft.scope}
          onChange={setField("scope")}
          error={Boolean(errors.scope)}
          helperText={errors.scope ?? "What this role may act on — e.g. All, Assigned sites, Own site."}
          size="small"
          fullWidth
        />

        <TextField
          label="What changes with this role"
          value={draft.note}
          onChange={setField("note")}
          helperText="Optional. Shown in the roles table."
          size="small"
          fullWidth
          multiline
          minRows={2}
        />
      </FormDialog>
    </WsPage>
  );
}
