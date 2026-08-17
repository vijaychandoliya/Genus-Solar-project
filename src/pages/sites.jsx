/**
 * Sites — individual survey/site records within scope.
 *
 * Where Overview reads as a fleet ("how many, where"), this screen is the
 * drill-down: the actual site records behind those counts. Every field comes
 * from the real transcribed rows in src/lib/programme-data.js — roof type,
 * orientation, feasibility verdict and the specific reasons behind it, GPS
 * accuracy, contractor and employee attribution.
 *
 * No aggregate chart here — that duplicates Overview's "Registered by area"
 * panel for no reason. This screen's whole job is the individual record.
 */
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import { WsPage, WsContext, WsTable, wsCols } from "../components/workspaces.jsx";
import { KpiStrip } from "../components/molecules.jsx";
import { StatusChip, WsTag } from "../components/atoms.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { surveysFor } from "../lib/programme-data.js";
import { exInt, toDmyTime } from "../lib/format.js";

const VERDICT_TONE = {
  Feasible: "good",
  "Feasible with conditions": "warning",
  "Ground-mount candidate": "info",
  "Not feasible": "danger",
  "Needs revisit": "danger",
};

function Field({ label, value }) {
  return (
    <Stack sx={{ minWidth: 0 }}>
      <Typography variant="overline" sx={{ color: "text.tertiary" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
        {value ?? "—"}
      </Typography>
    </Stack>
  );
}

function SiteDetailDialog({ site, onClose }) {
  if (!site) return null;
  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ typography: "h5" }}>{site.consumerName}</DialogTitle>
      <DialogContent dividers>
        <Stack sx={{ gap: 2 }}>
          <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <StatusChip label={site.verdict} tone={VERDICT_TONE[site.verdict] ?? "neutral"} />
            {site.verdictReasons.map((r) => (
              <WsTag key={r} label={r} />
            ))}
          </Stack>

          <Divider />

          <Stack direction="row" sx={{ gap: 3, flexWrap: "wrap" }}>
            <Field label="Consumer number" value={site.consumerNumber} />
            <Field label="Panchayat" value={site.panchayatName} />
            <Field label="Roof status" value={site.roofTopStatus} />
            <Field label="Orientation" value={site.orientation} />
            <Field label="Floors" value={site.floors} />
            <Field label="Access" value={site.access} />
          </Stack>

          <Divider />

          <Stack direction="row" sx={{ gap: 3, flexWrap: "wrap" }}>
            <Field
              label="Structure located"
              value={site.distStructure != null ? `${site.structureLocated} · ${site.distStructure} m` : site.structureLocated}
            />
            <Field
              label="Earthing located"
              value={site.distEarthing != null ? `${site.earthingLocated} · ${site.distEarthing} m` : site.earthingLocated}
            />
            <Field
              label="GPS"
              value={site.geo ? `${site.geo.lat.toFixed(5)}, ${site.geo.lng.toFixed(5)} (±${site.geo.accuracy} m)` : "—"}
            />
          </Stack>

          <Divider />

          <Stack direction="row" sx={{ gap: 3, flexWrap: "wrap" }}>
            <Field label="Contractor" value={site.contractor} />
            <Field label="Employee" value={site.employee} />
            <Field label="Submitted" value={site.submittedOn ? toDmyTime(site.submittedOn) : "—"} />
            <Field label="Evidence photos" value={`${site.photos} / 10 captured`} />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="text">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Sites() {
  const { node, pathLabel } = useHierarchy();
  const sites = useMemo(() => surveysFor(node.id), [node]);
  const [openSite, setOpenSite] = useState(null);

  const withConditions = sites.filter((s) => s.verdict === "Feasible with conditions").length;
  const needsRevisit = sites.filter((s) => s.verdict === "Needs revisit").length;

  return (
    <WsPage
      title="Sites"
      subtitle="The individual survey records behind the Overview counts — one row per site actually visited."
      breadcrumbs={[{ label: "Genus Solar", href: "/overview" }, { label: "Sites" }]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Sites surveyed", value: `${exInt(sites.length)} in scope` },
          ]}
        />
      }
    >
      <KpiStrip
        items={[
          { label: "Surveyed", value: sites.length, note: "This scope" },
          { label: "With conditions", value: withConditions, note: "Feasible, needs remediation" },
          { label: "Needs revisit", value: needsRevisit, note: "Data contradiction on file" },
        ]}
      />

      <WsTable
        title="Site records"
        note="Click a row for the full survey record"
        exportName="sites-records"
        cols={wsCols([
          ["consumerName", "Consumer", { minWidth: 160 }],
          ["panchayatName", "Panchayat", { width: 120 }],
          ["roofTopStatus", "Roof", { width: 110 }],
          ["orientation", "Orientation", { width: 120 }],
          [
            "verdict",
            "Verdict",
            {
              width: 190,
              renderCell: ({ value }) => <StatusChip label={value} tone={VERDICT_TONE[value] ?? "neutral"} />,
            },
          ],
          ["photos", "Photos", { width: 90, align: "right", type: "number" }],
          [
            "geo",
            "GPS accuracy",
            {
              width: 120,
              align: "right",
              sortable: false,
              renderCell: ({ value }) => (value ? `±${value.accuracy} m` : "—"),
            },
          ],
          ["employee", "Surveyor", { minWidth: 170 }],
        ])}
        rows={sites}
        onRowClick={({ row }) => setOpenSite(row)}
        pageSize={10}
      />

      <SiteDetailDialog site={openSite} onClose={() => setOpenSite(null)} />
    </WsPage>
  );
}
