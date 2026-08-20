/**
 * Roles, the permission matrix, and the account store.
 *
 * ── Two populations under one word ──────────────────────────────────────
 * "User" means two different things here and conflating them is the mistake
 * this module exists to prevent:
 *
 *   OBSERVED   — an account that demonstrably touched the source data. These
 *                are the `Created By` / `Employee ID` values stamped on the two
 *                extracts (programme-data.js SYSTEM_ACCOUNTS). Their `role` is
 *                a DESCRIPTOR of what they did — "Bulk import", "Field
 *                surveyor" — not an RBAC grant. Nobody assigned it; it is read
 *                back off the data.
 *
 *   PROVISIONED — an account created in this screen, carrying one of the five
 *                RBAC roles below plus a hierarchy scope.
 *
 * They render in one table because an administrator needs one list, but the
 * `origin` column keeps them apart. Printing a provisioned Analyst next to an
 * observed "Field surveyor" with no distinction would claim the extract had
 * granted a role it has no concept of.
 *
 * ── There is no backend ─────────────────────────────────────────────────
 * dms-parity-plan.md §3 gap 11 and Phase 6: no auth layer exists. Provisioned
 * accounts therefore live in this module's memory for the session and are gone
 * on reload. That is stated at the point of use, not buried here — an admin
 * screen that silently discards a submit is worse than one that has no button.
 */
import { SYSTEM_ACCOUNTS } from "./programme-data.js";

/* ── the five roles ───────────────────────────────────────────────────────
   docs/ia-and-screen-plan.md §8, verbatim. Analyst is the new fifth.        */

/* The five roles as SPECIFIED. Frozen, and never mutated — the editable copy
   below is layered on top so "what did we change from the plan" stays an
   answerable question rather than something you have to remember. */
export const ROLE_BASELINE = Object.freeze([
  {
    id: "super_admin",
    n: 1,
    label: "Super Admin",
    scope: "All",
    note: "Gains audit log and organisation settings.",
  },
  {
    id: "admin",
    n: 2,
    label: "Admin",
    scope: "All",
    note: "Removed from public registration — self-elected admin is a security defect.",
  },
  {
    id: "service_engineer",
    n: 3,
    label: "Service Engineer",
    scope: "Assigned sites",
    note: "Gains alarm assignment and visit logging.",
  },
  {
    id: "operator",
    n: 4,
    label: "User (store operator)",
    scope: "Own site",
    note: "Gains readiness composition (plan §7.1B).",
  },
  {
    id: "analyst",
    n: 5,
    label: "Analyst",
    scope: "All, read-only",
    isNew: true,
    note: "Cohort analysis and evidence export. Serves the warranty persona, who has no role and no screen today.",
  },
]);

/**
 * Access per nav node, per role — plan §8's own table.
 *
 * A cell is `{ level, qualifier }`. `level` is one of "full" | "partial" |
 * "none"; `qualifier` is the plan's own annotation ("own", "assigned",
 * "read", "B", "scoped") or null. The qualifier is never dropped: "✅ own" and
 * a bare "✅" are different grants, and flattening them to a tick would let a
 * store operator's own-site access read as fleet-wide.
 */
const F = (qualifier = null) => ({ level: "full", qualifier });
const P = (qualifier = null) => ({ level: "partial", qualifier });
const N = { level: "none", qualifier: null };

export const PERMISSION_NODES = [
  { id: "overview", label: "Overview", to: "/overview" },
  { id: "alarms_inbox", label: "Alarms — inbox", to: "/alarms" },
  { id: "alarms_rules", label: "Alarms — rules", to: "/alarms/rules" },
  { id: "sites", label: "Sites", to: "/sites" },
  { id: "assets", label: "Assets", to: "/assets" },
  { id: "telemetry", label: "Telemetry", to: "/telemetry/gti/data" },
  { id: "reports", label: "Reports", to: "/reports" },
  { id: "data", label: "Data", to: "/data/import" },
  { id: "admin", label: "Administration", to: "/admin/users" },
];

const MATRIX_BASELINE = Object.freeze({
  overview: { super_admin: F(), admin: F(), service_engineer: F(), operator: F("B"), analyst: F() },
  alarms_inbox: { super_admin: F(), admin: F(), service_engineer: F(), operator: F("own"), analyst: F("read") },
  alarms_rules: { super_admin: F(), admin: F(), service_engineer: N, operator: N, analyst: N },
  sites: { super_admin: F(), admin: F(), service_engineer: F("assigned"), operator: F("own"), analyst: F() },
  assets: { super_admin: F(), admin: F(), service_engineer: F(), operator: F("own"), analyst: F() },
  telemetry: { super_admin: F(), admin: F(), service_engineer: F("scoped"), operator: F("scoped"), analyst: F() },
  reports: { super_admin: F(), admin: F(), service_engineer: N, operator: N, analyst: F() },
  data: { super_admin: F(), admin: F(), service_engineer: N, operator: N, analyst: N },
  admin: { super_admin: F(), admin: P("partial"), service_engineer: N, operator: N, analyst: N },
});

/* Qualifiers the plan actually uses. A grant is "full" plus an optional
   narrowing word, and the word is not decoration — "full · own" and "full" are
   different grants, which is the whole reason scope is separate from role. */
export const QUALIFIERS = [
  { value: "", label: "No qualifier" },
  { value: "own", label: "own — their own site only" },
  { value: "assigned", label: "assigned — sites assigned to them" },
  { value: "scoped", label: "scoped — within their hierarchy scope" },
  { value: "read", label: "read — view without acting" },
  { value: "B", label: "B — readiness composition (plan §7.1B)" },
];

export const GRANT_LEVELS = [
  { value: "none", label: "None", short: "None" },
  { value: "partial", label: "Partial", short: "Part" },
  { value: "full", label: "Full", short: "Full" },
];

/* ── editable RBAC store ──────────────────────────────────────────────────
   Roles and the access matrix are editable in-session. Two rules keep that
   honest:

   1 · The baseline above is FROZEN and never written to, so `rbacDiff()` can
       always answer "what have we changed from the specification" exactly.
       A demo where someone toggles fifteen cells is useless if nobody can
       reconstruct which fifteen.

   2 · Nothing persists. There is no auth backend to write a grant to, and a
       matrix that survived a reload would read as enforced policy rather than
       as a workshop sketch. Same reasoning as the account store below.

   Deleting a role is guarded rather than cascading: an account holding a role
   that vanishes is an account with an undefined grant, which is exactly the
   state an access-control screen exists to prevent.                         */

const cloneGrant = (g) => ({ level: g.level, qualifier: g.qualifier ?? null });

function freshRoles() {
  return ROLE_BASELINE.map((r) => ({ ...r }));
}

function freshMatrix() {
  return Object.fromEntries(
    Object.entries(MATRIX_BASELINE).map(([nodeId, byRole]) => [
      nodeId,
      Object.fromEntries(Object.entries(byRole).map(([roleId, g]) => [roleId, cloneGrant(g)])),
    ]),
  );
}

let roles = freshRoles();
let matrix = freshMatrix();

let rolesSnap = roles;
let matrixSnap = matrix;

const rbacListeners = new Set();

function emitRbac({ rolesChanged = false, matrixChanged = false } = {}) {
  // Only the changed slice gets a new identity, so a component reading roles
  // does not re-render when a single matrix cell is toggled.
  if (rolesChanged) rolesSnap = roles;
  if (matrixChanged) matrixSnap = matrix;
  rbacListeners.forEach((fn) => fn());
}

export function subscribeRbac(fn) {
  rbacListeners.add(fn);
  return () => rbacListeners.delete(fn);
}

export function rolesSnapshot() {
  return rolesSnap;
}

export function matrixSnapshot() {
  return matrixSnap;
}

/** The grant for one cell, defaulting to no access for a role added later. */
export function grantFor(nodeId, roleId) {
  return matrix[nodeId]?.[roleId] ?? { level: "none", qualifier: null };
}

/** How many nav nodes a role can reach at all, against the LIVE matrix. */
export function reachableNodeCount(roleId) {
  return PERMISSION_NODES.filter((n) => grantFor(n.id, roleId).level !== "none").length;
}

/* ── mutations ────────────────────────────────────────────────────────────── */

export function setGrant(nodeId, roleId, patch) {
  const current = grantFor(nodeId, roleId);
  const next = { ...current, ...patch };
  // A revoked grant cannot keep a narrowing word — "none · own" is not a state.
  if (next.level === "none") next.qualifier = null;
  matrix = { ...matrix, [nodeId]: { ...matrix[nodeId], [roleId]: next } };
  emitRbac({ matrixChanged: true });
  return next;
}

/** Set every node for one role at once — the column header's bulk action. */
export function setRoleColumn(roleId, level) {
  matrix = Object.fromEntries(
    PERMISSION_NODES.map((n) => [
      n.id,
      {
        ...matrix[n.id],
        [roleId]: {
          level,
          qualifier: level === "none" ? null : (matrix[n.id]?.[roleId]?.qualifier ?? null),
        },
      },
    ]),
  );
  emitRbac({ matrixChanged: true });
}

function slugify(label) {
  return String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

export function validateRole({ label, scope }, { editingId = null } = {}) {
  const errors = {};
  const name = (label ?? "").trim();
  if (!name) errors.label = "Required.";
  else if (name.length < 3) errors.label = "Too short to be a role name.";
  else if (roles.some((r) => r.id !== editingId && r.label.toLowerCase() === name.toLowerCase()))
    errors.label = `"${name}" already exists.`;
  if (!(scope ?? "").trim()) errors.scope = "Required — say what this role may act on by default.";
  return errors;
}

export function addRole({ label, scope, note }) {
  const base = slugify(label) || "role";
  let id = base;
  for (let i = 2; roles.some((r) => r.id === id); i += 1) id = `${base}_${i}`;

  const role = {
    id,
    n: roles.length + 1,
    label: label.trim(),
    scope: scope.trim(),
    note: (note ?? "").trim() || "Added in this session — no change recorded against the plan yet.",
    custom: true,
  };
  roles = [...roles, role];

  // A new role starts with NO access everywhere. Defaulting a fresh role to
  // anything else would grant reach nobody asked for.
  matrix = Object.fromEntries(
    PERMISSION_NODES.map((n) => [n.id, { ...matrix[n.id], [id]: { level: "none", qualifier: null } }]),
  );
  emitRbac({ rolesChanged: true, matrixChanged: true });
  return role;
}

export function updateRole(id, patch) {
  roles = roles.map((r) => (r.id === id ? { ...r, ...patch } : r));
  emitRbac({ rolesChanged: true });
}

/**
 * Remove a role. Refuses while any account still holds it — returns
 * `{ ok: false, reason }` rather than throwing, because the caller is a click
 * handler that needs to show the reason, not a crash.
 */
export function removeRole(id) {
  const holders = snapshot.filter((a) => a.roleId === id);
  if (holders.length) {
    return {
      ok: false,
      reason: `${holders.length} account${holders.length === 1 ? "" : "s"} still hold${holders.length === 1 ? "s" : ""} this role (${holders
        .map((a) => a.name)
        .join(", ")}). Reassign them first — deleting it would leave them with an undefined grant.`,
    };
  }
  roles = roles.filter((r) => r.id !== id).map((r, i) => ({ ...r, n: i + 1 }));
  matrix = Object.fromEntries(
    Object.entries(matrix).map(([nodeId, byRole]) => {
      const next = { ...byRole };
      delete next[id];
      return [nodeId, next];
    }),
  );
  emitRbac({ rolesChanged: true, matrixChanged: true });
  return { ok: true };
}

/**
 * Back to the specification.
 *
 * Reset can remove a role that `removeRole` would have refused to delete,
 * because the guard there is per-role and this drops them all at once. Left
 * alone that leaves an account pointing at a role id nothing resolves — the
 * exact dangling grant the guard exists to prevent, arrived at by a different
 * door. So orphaned holders are cleared here and RETURNED, for the caller to
 * report: silently un-assigning somebody is no better than silently orphaning
 * them.
 */
export function resetRbac() {
  roles = freshRoles();
  matrix = freshMatrix();

  const liveIds = new Set(roles.map((r) => r.id));
  const orphaned = provisioned.filter((a) => a.roleId && !liveIds.has(a.roleId));
  if (orphaned.length) {
    provisioned = provisioned.map((a) =>
      a.roleId && !liveIds.has(a.roleId)
        ? { ...a, roleId: null, role: "No role", roleOrphaned: true }
        : a,
    );
    emit();
  }

  emitRbac({ rolesChanged: true, matrixChanged: true });
  return { orphaned: orphaned.map((a) => a.name) };
}

/** Accounts pointing at a role that no longer exists. Should always be empty. */
export function orphanedAccounts() {
  const liveIds = new Set(roles.map((r) => r.id));
  return snapshot.filter((a) => a.roleId && !liveIds.has(a.roleId));
}

/* ── diff against the specification ───────────────────────────────────────── */

const grantLabel = (g) =>
  g.level === "none" ? "No access" : `${g.level}${g.qualifier ? ` · ${g.qualifier}` : ""}`;

/**
 * Every deviation from the plan, as a flat list the screen can render and
 * export. This is the artefact a BA hands back to the client after a workshop.
 */
export function rbacDiff() {
  const out = [];

  const baseIds = new Set(ROLE_BASELINE.map((r) => r.id));
  const liveIds = new Set(roles.map((r) => r.id));

  roles.forEach((r) => {
    if (!baseIds.has(r.id)) {
      out.push({
        id: `role-added-${r.id}`,
        kind: "Role added",
        target: r.label,
        from: "—",
        to: `${r.label} · ${r.scope}`,
      });
      return;
    }
    const b = ROLE_BASELINE.find((x) => x.id === r.id);
    if (b.label !== r.label || b.scope !== r.scope) {
      out.push({
        id: `role-edited-${r.id}`,
        kind: "Role edited",
        target: b.label,
        from: `${b.label} · ${b.scope}`,
        to: `${r.label} · ${r.scope}`,
      });
    }
  });

  ROLE_BASELINE.forEach((b) => {
    if (!liveIds.has(b.id)) {
      out.push({ id: `role-removed-${b.id}`, kind: "Role removed", target: b.label, from: b.label, to: "—" });
    }
  });

  PERMISSION_NODES.forEach((node) => {
    roles.forEach((role) => {
      const base = MATRIX_BASELINE[node.id]?.[role.id];
      const live = grantFor(node.id, role.id);
      // A role that did not exist in the plan has no baseline cell to differ
      // from; its addition is already reported above.
      if (!base) return;
      if (base.level !== live.level || (base.qualifier ?? null) !== (live.qualifier ?? null)) {
        out.push({
          id: `grant-${node.id}-${role.id}`,
          kind: "Access changed",
          target: `${node.label} → ${role.label}`,
          from: grantLabel(base),
          to: grantLabel(live),
        });
      }
    });
  });

  return out;
}

/* ── account store ────────────────────────────────────────────────────────
   A module-level store rather than page state: the list must survive
   navigating away to /admin/roles and back, and useState in the page would
   silently drop a just-created account on the first breadcrumb click.

   Deliberately NOT localStorage. `genus-settings` persists display
   preferences, which are the user's own and cost nothing if stale. An account
   list that looks persisted but never reaches a server is a different class of
   lie — it would survive a reload and read as provisioned infrastructure.   */

const OBSERVED = SYSTEM_ACCOUNTS.map((a) => ({
  ...a,
  id: a.name,
  origin: "observed",
  roleId: null,
  scopeId: null,
  scopeLabel: null,
}));

let provisioned = [];
const listeners = new Set();

/** Stable snapshot — useSyncExternalStore compares by reference. */
let snapshot = OBSERVED;

function emit() {
  snapshot = [...OBSERVED, ...provisioned];
  listeners.forEach((fn) => fn());
}

export function subscribeAccounts(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function accountsSnapshot() {
  return snapshot;
}

export function provisionedCount() {
  return provisioned.length;
}

/**
 * Validate a new account against the accounts already on file.
 *
 * Returns a field→message map; empty means valid. Employee ID is checked
 * against the OBSERVED names too, because those embed their id ("Deepak
 * Kumar - 11126") — a new account reusing 11126 would collide with a real
 * surveyor and quietly re-attribute their submissions.
 */
export function validateAccount({ name, employeeId, roleId, scopeId }) {
  const errors = {};
  const trimmed = (name ?? "").trim();
  const empId = (employeeId ?? "").trim();

  if (!trimmed) errors.name = "Required.";
  else if (trimmed.length < 2) errors.name = "Too short to identify anyone.";

  if (!empId) errors.employeeId = "Required — every account in the extracts carries one.";
  else if (!/^\d{3,8}$/.test(empId)) errors.employeeId = "Digits only, 3–8 of them, matching the extract format.";
  else if (snapshot.some((a) => String(a.employeeId ?? a.name).includes(empId)))
    errors.employeeId = `${empId} is already on file.`;

  if (!roleId) errors.roleId = "Required.";
  else if (!roles.some((r) => r.id === roleId)) errors.roleId = "Unknown role.";

  if (!scopeId) errors.scopeId = "Required — role says what they may do, scope says what to.";

  return errors;
}

/** Append a provisioned account. Assumes `validateAccount` already passed. */
export function addAccount({ name, employeeId, roleId, scopeId, scopeLabel }) {
  const role = roles.find((r) => r.id === roleId);
  const account = {
    id: `${name.trim()} - ${employeeId.trim()}`,
    name: `${name.trim()} - ${employeeId.trim()}`,
    employeeId: employeeId.trim(),
    role: role.label,
    roleId,
    scopeId,
    scopeLabel,
    source: "Provisioned in session",
    origin: "provisioned",
    surveysInScope: 0,
  };
  provisioned = [...provisioned, account];
  emit();
  return account;
}

export function removeAccount(id) {
  provisioned = provisioned.filter((a) => a.id !== id);
  emit();
}
