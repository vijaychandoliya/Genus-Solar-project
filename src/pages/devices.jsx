/**
 * Device registry — docs/ia-and-screen-plan.md §7.4, docs/dms-parity-plan.md §2.2.
 *
 * The DMS's Devices screen, rebuilt on this product's rules. Four differences
 * from the source, each deliberate:
 *
 * 1 · NO CONSUMER PII. The source table leads with Consumer Name, Mobile No.
 *     and Owning User Email. `assets.jsx` already refuses to bundle the consumer
 *     master's 9,673 names and phone numbers into a public client build, and a
 *     registry keyed on consumer identity reopens that by the back door. This
 *     shows the consumer NUMBER — already public in the survey extract — and
 *     leaves the rest server-side until dms-parity-plan.md Q3 is answered.
 *
 * 2 · NAMEPLATE COMPLETENESS is the lead column after identity, because plan
 *     §7.4 makes it the point of the screen: an incomplete nameplate is why a
 *     device's telemetry cannot be banded at all. The source screen has no
 *     equivalent, so nothing there tells you why a pack reads "unknown".
 *
 * 3 · FRESHNESS on every row. The source shows a Date Time with no judgement
 *     attached; one of its GTI devices last reported over two months ago and
 *     the screen says nothing about it.
 *
 * 4 · A NAMED ROW MENU, not three unlabelled icon buttons. An icon with no
 *     accessible name fails §7 outright, and the source's three are
 *     indistinguishable without clicking one.
 */
import { useMemo, useState } from "react";
import { MenuItem, TextField, IconButton, Menu } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DevicesOtherOutlinedIcon from "@mui/icons-material/DevicesOtherOutlined";
import { WsPage, WsContext, WsTable, wsCols, resultNote } from "../components/workspaces.jsx";
import { FilterBar, JsonPayloadDialog } from "../components/molecules.jsx";
import {
  BandedValue,
  CodeValue,
  EmptyState,
  FreshnessChip,
  StatusChip,
  WsTag,
} from "../components/atoms.jsx";
import { useHierarchy, LEVEL_LABEL } from "../lib/hierarchy.jsx";
import { devicesFor, PENDING, INTERVAL_IS_SEED } from "../lib/device-data.js";
import { bandFor } from "../lib/bands.js";
import { exInt, toDmyTime, ageFrom } from "../lib/format.js";

const CLASSES = [
  { id: "", label: "All classes" },
  { id: "ups", label: "UPS" },
  { id: "bms", label: "BMS" },
  { id: "gti", label: "GTI" },
];

/** Completeness is a percentage, so it gets a band — but a low one is a data
 *  gap, not a device fault, so the copy says which. */
function CompletenessCell({ row }) {
  if (row.completeness == null) return <WsTag label="No schema" />;
  return (
    <BandedValue
      value={row.completeness}
      unit="%"
      dp={0}
      band={bandFor("photo_completeness", row.completeness)}
    />
  );
}

export default function Devices() {
  const { node, pathLabel } = useHierarchy();
  const [deviceClass, setDeviceClass] = useState("");
  const [query, setQuery] = useState("");
  const [payload, setPayload] = useState(null);
  const [menu, setMenu] = useState({ anchor: null, row: null });

  const all = useMemo(() => devicesFor(node.id), [node]);
  const rows = useMemo(
    () =>
      all.filter(
        (d) =>
          (!deviceClass || d.deviceClass === deviceClass) &&
          (!query ||
            String(d.deviceNo).toLowerCase().includes(query.toLowerCase()) ||
            String(d.consumerRef ?? "").includes(query)),
      ),
    [all, deviceClass, query],
  );

  const cols = wsCols([
    ["deviceNo", "Device no.", { minWidth: 190 }],
    [
      "deviceClass",
      "Class",
      { width: 110, renderCell: ({ value }) => <CodeValue set="device_class" value={value} showRaw={false} /> },
    ],
    [
      // `valueGetter` receives (rawValue, row) — passing one argument and
      // treating it as the row reads `undefined.nameplate` and throws inside
      // the table's accessor, which surfaces as a blank page rather than a
      // useful error. Both arguments, always.
      "meter",
      "Meter",
      {
        minWidth: 160,
        valueGetter: (raw, row) => {
          const cat = row.nameplate?.meter_category;
          const cur = row.nameplate?.meter_current_rating;
          return cat || cur ? [cat, cur].filter(Boolean).join(" · ") : null;
        },
        renderCell: ({ value }) => value ?? "—",
      },
    ],
    [
      "completeness",
      "Nameplate",
      { width: 130, align: "right", renderCell: ({ row }) => <CompletenessCell row={row} /> },
    ],
    [
      "freshness",
      "Reporting",
      {
        width: 160,
        renderCell: ({ row }) => (
          <FreshnessChip freshness={row.freshness} age={row.lastSeen ? ageFrom(row.lastSeen) : undefined} />
        ),
      },
    ],
    [
      "lastSeen",
      "Last reading",
      { width: 150, sortable: false, renderCell: ({ value }) => (value ? toDmyTime(value) : "—") },
    ],
    [
      "systemType",
      "System",
      { width: 120, renderCell: ({ value }) => <CodeValue set="system_type" value={value} showRaw={false} /> },
    ],
    ["dealer", "Dealer", { minWidth: 150, renderCell: ({ value }) => value ?? "—" }],
    // The consumer NUMBER, not the name. See the module note.
    ["consumerRef", "Consumer no.", { width: 150, renderCell: ({ value }) => value ?? "—" }],
    [
      "enabled",
      "State",
      {
        width: 110,
        renderCell: ({ value }) => (
          <StatusChip label={value ? "Enabled" : "Disabled"} tone={value ? "good" : "neutral"} />
        ),
      },
    ],
    [
      "actions",
      "",
      {
        width: 56,
        sortable: false,
        align: "center",
        renderCell: ({ row }) => (
          <IconButton
            size="small"
            aria-label={`Actions for device ${row.deviceNo}`}
            onClick={(e) => {
              e.stopPropagation();
              setMenu({ anchor: e.currentTarget, row });
            }}
          >
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        ),
      },
    ],
  ]);

  return (
    <WsPage
      title="Devices"
      subtitle="Every registered device in scope, with the nameplate completeness that decides whether its telemetry can be judged at all."
      breadcrumbs={[{ label: "Genus Solar", href: "/overview" }, { label: "Devices" }]}
      context={
        <WsContext
          items={[
            { label: "Scope", value: pathLabel },
            { label: "Level", value: LEVEL_LABEL[node.level] },
            { label: "Devices", value: `${exInt(all.length)} in scope` },
          ]}
          chips={
            INTERVAL_IS_SEED
              ? [<WsTag key="seed" label="Reporting intervals are seed values" />]
              : []
          }
        />
      }
    >
      <FilterBar
        resultNote={resultNote(rows.length, all.length, "devices")}
        onClear={deviceClass || query ? () => { setDeviceClass(""); setQuery(""); } : undefined}
      >
        <TextField
          select
          size="small"
          label="Class"
          value={deviceClass}
          onChange={(e) => setDeviceClass(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {CLASSES.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Device or consumer no."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ minWidth: 220 }}
        />
      </FilterBar>

      <WsTable
        title="Registry"
        note="The device number is frozen — the table is wider than the viewport and the identity must not scroll away."
        exportName="device-registry"
        cols={cols}
        rows={rows}
        lockFirstColumn
        pageSize={10}
        emptyOverlay={
          <EmptyState
            icon={<DevicesOtherOutlinedIcon />}
            title="Registry not yet ingested"
            body={PENDING.devices.detail}
            minHeight={200}
          />
        }
      />

      <Menu
        open={Boolean(menu.anchor)}
        anchorEl={menu.anchor}
        onClose={() => setMenu({ anchor: null, row: null })}
      >
        <MenuItem
          onClick={() => {
            setPayload({
              title: `Device ${menu.row?.deviceNo}`,
              subtitle: "Registry record as stored",
              body: menu.row,
            });
            setMenu({ anchor: null, row: null });
          }}
        >
          View raw record
        </MenuItem>
        <MenuItem disabled>Edit nameplate</MenuItem>
        <MenuItem disabled>Assign to user</MenuItem>
      </Menu>

      <JsonPayloadDialog
        open={Boolean(payload)}
        onClose={() => setPayload(null)}
        title={payload?.title}
        subtitle={payload?.subtitle}
        payload={payload?.body}
      />
    </WsPage>
  );
}
