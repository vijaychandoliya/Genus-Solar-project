/**
 * Route placeholder.
 *
 * Every nav destination resolves to a real route from day one, so the rail is
 * never a set of dead links.
 *
 * ── "Not built yet" was the wrong message ───────────────────────────────
 * It reads as backlog — as though someone simply has not got to it. Four
 * routes remain, and not one of them is waiting on effort. Each is waiting on
 * something specific that does not exist: an object that appears in no
 * payload, or an auth layer that has not been written. A screen built over
 * either would have to invent its rows, and AGENTS.md's standing rule is that
 * an invented row is worse than an honest gap — `DEVICE_FLEET` is the
 * cautionary tale the whole codebase is organised around.
 *
 * So each states three things: what it will be, what exactly is blocking it,
 * and what would unblock it. The third is the part that makes this a work
 * item rather than an apology.
 */
import { Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { WsPage, WsContext, WsSection } from "../components/workspaces.jsx";
import { EmptyState, SectionLabel, StatusChip } from "../components/atoms.jsx";
import { useHierarchy } from "../lib/hierarchy.jsx";
import { exInt } from "../lib/format.js";

/**
 * `blocker` is the fact that stops it. `unblocks` is what would have to arrive.
 * `kind` separates the two reasons, because they resolve on different
 * timescales and by different people: a missing extract is an integration
 * question, a missing auth layer is a build one.
 */
const SPEC = {
  "/telemetry/solar": {
    title: "PV generation against installed capacity",
    spec: "ia-and-screen-plan.md §7.6 · dms-parity-plan.md Q12",
    kind: "No such data",
    blurb:
      "Specific yield per rooftop — generation measured against installed kWp, ranked so an underperforming array is visible without reading a number.",
    blocker:
      "Blocked twice over, and they are independent. No inverter object appears in any sample payload — the stream named “GTI Data” carries a net meter (MS-*), not an inverter — so there is no numerator. And rated_kw is absent from the nameplate, so there is no denominator either. The only trace of an inverter anywhere in the four real payloads is the gateway’s INVERR error flag.",
    unblocks: [
      "An inverter object in the gateway payload, or a separate inverter stream.",
      "rated_kw on the device nameplate, so generation has something to be a fraction of.",
    ],
    related: [
      { label: "Meter telemetry — what the stream actually carries", to: "/telemetry/meter" },
      { label: "Ingestion health — which streams are delivering", to: "/data/health" },
    ],
  },
  "/admin/audit": {
    title: "Administrative action log",
    spec: "ia-and-screen-plan.md §11 · dms-parity-plan.md Phase 6",
    kind: "No backend",
    blurb:
      "Who changed what, when, and from where — role grants, threshold edits, imports, and rollbacks, each attributable to an account.",
    blocker:
      "An audit entry is an event that has to have happened. There is no auth layer, so no action is attributable to anyone, and nothing in the product currently writes a change anywhere durable — the accounts on Users are read back off the two extracts rather than administered. A log rendered now would either be empty or fabricated, and an empty audit log is indistinguishable from a broken one.",
    unblocks: [
      "An auth layer, so an actor exists to attribute an action to.",
      "A write path — role grants, threshold edits or imports that persist — so there is an action to record.",
    ],
    related: [
      { label: "Roles — the definitions an audit log would record grants against", to: "/admin/roles" },
      { label: "Batch history — the closest thing to a log that real data supports", to: "/data/history" },
    ],
  },
  "/account/profile": {
    title: "Your account",
    spec: "dms-parity-plan.md Phase 6",
    kind: "No backend",
    blurb: "Your own details, scope, notification preferences, and sign-out.",
    blocker:
      "There is no sign-in, so there is no “you”. The avatar in the top bar is a chip, not a session — it is not bound to an account, and the source DMS’s own Log out control has no equivalent here for the same reason.",
    unblocks: ["An auth layer with a session, which Phase 6 covers alongside Users and Roles."],
    related: [{ label: "Users — the accounts that do exist, and why", to: "/admin/users" }],
  },
  "/account/support": {
    title: "Support tickets",
    spec: "dms-parity-plan.md Phase 6",
    kind: "No backend",
    blurb: "Raise and track an issue against a site, a device, or a data problem.",
    blocker:
      "No ticketing system is integrated, and no ticket store exists. Unlike the telemetry gaps this one is not waiting on an extract — nothing anywhere in the source DMS holds tickets either, so this is a new capability rather than an un-ingested one.",
    unblocks: [
      "A decision on where tickets live — an existing service desk, or a table in this platform.",
      "An auth layer, so a ticket has a raiser.",
    ],
    related: [
      { label: "Alarms — the exception queue that exists today", to: "/alarms" },
    ],
  },
};

const KIND_TONE = { "No such data": "warning", "No backend": "info" };

export default function Placeholder({ title, to }) {
  const { pathLabel, node, registered } = useHierarchy();
  const s = SPEC[to];

  // A nav node with no entry here is a route somebody added without deciding
  // what it is. Say that, rather than rendering a confident-looking blank.
  if (!s) {
    return (
      <WsPage
        title={title}
        subtitle="This route exists in the navigation but has no specification recorded."
        breadcrumbs={[{ label: "Genus Solar", href: "/overview" }, { label: title }]}
      >
        <WsSection padded={false}>
          <EmptyState
            title="Unspecified route"
            body={`${to} is in NAV but has no entry in placeholder.jsx's SPEC map, so nothing is known about what it should become. Add one, or remove the nav item.`}
            minHeight={240}
          />
        </WsSection>
      </WsPage>
    );
  }

  return (
    <WsPage
      title={title}
      subtitle={s.blurb}
      breadcrumbs={[{ label: "Genus Solar", href: "/overview" }, { label: title }]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: node.level },
            { label: "Registered", value: `${exInt(registered)} consumers` },
            { label: "Status", value: s.kind },
          ]}
        />
      }
      actions={
        <Button component={Link} to="/gallery" size="small" variant="outlined">
          Component gallery
        </Button>
      }
    >
      <WsSection title="Why this is not built" note={s.spec}>
        <Stack sx={{ gap: 2 }}>
          <Stack direction="row" sx={{ gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <StatusChip label={s.kind} tone={KIND_TONE[s.kind] ?? "neutral"} />
            <Typography variant="body2" sx={{ color: "text.tertiary" }}>
              The shell, tokens, table engine and chart layer this screen needs are all in place.
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {s.blocker}
          </Typography>

          <Stack sx={{ gap: 1 }}>
            <SectionLabel>What would unblock it</SectionLabel>
            <Stack component="ul" sx={{ gap: 0.75, pl: 2.5, m: 0 }}>
              {s.unblocks.map((u) => (
                <Typography component="li" key={u} variant="body2" sx={{ color: "text.secondary" }}>
                  {u}
                </Typography>
              ))}
            </Stack>
          </Stack>

          {s.related?.length > 0 && (
            <Stack sx={{ gap: 1 }}>
              <SectionLabel>Built, and related</SectionLabel>
              <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                {s.related.map((r) => (
                  <Button key={r.to} component={Link} to={r.to} size="small" variant="outlined">
                    {r.label}
                  </Button>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </WsSection>
    </WsPage>
  );
}
