/**
 * DataTable — the one table engine.
 *
 * TanStack Table v8 headless engine painted with MUI Table primitives. The
 * column API is deliberately DataGrid-shaped ({ field, headerName, renderCell,
 * valueGetter, width, align, type }) so call sites read the way the rest of the
 * Genus estate does. MUI X is not a dependency and must not be reintroduced.
 *
 * Any edit here lands on every table in the app at once. Re-check: pinning in
 * both modes, a wide table's horizontal scroll, the empty state, pagination
 * hiding, full-screen enter/exit preserving state, CSV contents, saved prefs.
 */
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Checkbox,
  Popover,
  Stack,
  Typography,
  Tooltip,
  Divider,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import DownloadIcon from "@mui/icons-material/Download";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import CloseIcon from "@mui/icons-material/Close";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  flexRender,
} from "@tanstack/react-table";
import { exInt, exNum } from "../lib/format.js";
import { focusRing } from "../lib/theme.js";
import { GridEmptyOverlay } from "./atoms.jsx";

/* ── density ─────────────────────────────────────────────────────────────── */

const DENSITY = {
  condensed: { row: 40, py: 0.5, px: 1.25, head: 10 },
  regular: { row: 48, py: 1, px: 1.5, head: 12 },
  relaxed: { row: 56, py: 1.5, px: 2, head: 12 },
};
const DENSITY_ORDER = ["condensed", "regular", "relaxed"];
const ALIAS = { compact: "condensed", standard: "regular", comfortable: "relaxed" };
const resolveDensity = (d) => ALIAS[d] ?? (DENSITY[d] ? d : "regular");

/* ── preferences ─────────────────────────────────────────────────────────── */

const PREFS_KEY = "genus-table-prefs";

function readPrefs(key) {
  if (!key) return null;
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}")[key] ?? null;
  } catch {
    return null;
  }
}
function writePrefs(key, value) {
  if (!key) return;
  try {
    const all = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
    all[key] = value;
    localStorage.setItem(PREFS_KEY, JSON.stringify(all));
  } catch {
    /* quota — preferences simply do not persist */
  }
}

/* ── filtering ───────────────────────────────────────────────────────────── */

/** One filter fn, three shapes: array (faceted), {min,max} (range), string. */
function smartFilter(row, columnId, value) {
  if (value == null || value === "") return true;
  const cell = row.getValue(columnId);
  if (Array.isArray(value)) return value.length === 0 || value.includes(cell);
  if (typeof value === "object" && ("min" in value || "max" in value)) {
    const n = Number(cell);
    if (Number.isNaN(n)) return false;
    if (value.min != null && value.min !== "" && n < Number(value.min)) return false;
    if (value.max != null && value.max !== "" && n > Number(value.max)) return false;
    return true;
  }
  return String(cell ?? "").toLowerCase().includes(String(value).toLowerCase());
}

/* ── column adapter ──────────────────────────────────────────────────────── */

function adaptColumns(columns, { checkboxSelection }) {
  const adapted = columns.map((c) => ({
    id: c.field,
    accessorFn: (row) => (c.valueGetter ? c.valueGetter(row[c.field], row) : row[c.field]),
    header: c.headerName ?? c.field,
    enableSorting: c.sortable !== false,
    enableHiding: true,
    // An unnamed column cannot be filtered — there is nothing to label the control.
    enableColumnFilter: c.sortable !== false && Boolean(c.headerName),
    sortingFn: c.type === "number" ? "basic" : "alphanumeric",
    filterFn: smartFilter,
    size: c.width ?? 170,
    // Deliberately below the layout minWidth so a user can genuinely shrink a
    // column past its designed floor.
    minSize: 64,
    maxSize: c.maxWidth ?? 720,
    meta: {
      align: c.align ?? (c.type === "number" ? "right" : "left"),
      headerAlign: c.headerAlign ?? c.align ?? (c.type === "number" ? "right" : "left"),
      renderCell: c.renderCell,
      numeric: c.type === "number",
      minWidth: c.minWidth ?? 110,
    },
  }));

  if (checkboxSelection) {
    adapted.unshift({
      id: "__select__",
      header: "",
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      enableColumnFilter: false,
      size: 52,
      minSize: 52,
      maxSize: 52,
      meta: { align: "center", headerAlign: "center", select: true },
    });
  }
  return adapted;
}

/* ── search highlighting ─────────────────────────────────────────────────── */

function Highlight({ text, query }) {
  const s = String(text ?? "");
  if (!query) return s;
  const i = s.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return s;
  return (
    <>
      {s.slice(0, i)}
      <Box
        component="mark"
        sx={(t) => ({
          backgroundColor: alpha(t.palette.warning.main, t.palette.mode === "dark" ? 0.34 : 0.28),
          color: "inherit",
          borderRadius: 0.5,
          px: 0.25,
        })}
      >
        {s.slice(i, i + query.length)}
      </Box>
      {s.slice(i + query.length)}
    </>
  );
}

/* ── per-column filter popover ───────────────────────────────────────────── */

function ColumnFilter({ column, anchor, onClose }) {
  const numeric = column.columnDef.meta?.numeric;
  const facets = column.getFacetedUniqueValues();
  const [minMax] = useState(() => column.getFacetedMinMaxValues() ?? [null, null]);
  const [find, setFind] = useState("");
  const current = column.getFilterValue();

  const distinct = useMemo(
    () => [...facets.entries()].filter(([k]) => k != null && k !== "").sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
    [facets],
  );

  const body = () => {
    if (numeric) {
      const [lo, hi] = minMax ?? [null, null];
      return (
        <Stack direction="row" sx={{ gap: 1, p: 1.5, width: 260 }}>
          <TextField
            size="small"
            type="number"
            label="Min"
            placeholder={lo != null ? String(lo) : ""}
            value={current?.min ?? ""}
            onChange={(e) => column.setFilterValue((old) => ({ ...old, min: e.target.value }))}
          />
          <TextField
            size="small"
            type="number"
            label="Max"
            placeholder={hi != null ? String(hi) : ""}
            value={current?.max ?? ""}
            onChange={(e) => column.setFilterValue((old) => ({ ...old, max: e.target.value }))}
          />
        </Stack>
      );
    }
    if (distinct.length <= 25) {
      const sel = Array.isArray(current) ? current : [];
      const shown = find
        ? distinct.filter(([v]) => String(v).toLowerCase().includes(find.toLowerCase()))
        : distinct;
      return (
        <Box sx={{ width: 280, p: 1 }}>
          {distinct.length > 8 && (
            <TextField
              size="small"
              fullWidth
              autoFocus
              placeholder="Find value…"
              slotProps={{ htmlInput: { "aria-label": "Find filter value" } }}
              value={find}
              onChange={(e) => setFind(e.target.value)}
              sx={{ mb: 1 }}
            />
          )}
          <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
            {shown.map(([v, count]) => (
              <MenuItem
                key={String(v)}
                dense
                onClick={() => {
                  const next = sel.includes(v) ? sel.filter((x) => x !== v) : [...sel, v];
                  column.setFilterValue(next.length ? next : undefined);
                }}
                sx={{ gap: 1 }}
              >
                <Checkbox size="small" checked={sel.includes(v)} sx={{ p: 0.25 }} />
                <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {String(v)}
                </Box>
                <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                  {count}
                </Typography>
              </MenuItem>
            ))}
          </Box>
        </Box>
      );
    }
    return (
      <Box sx={{ p: 1.5, width: 260 }}>
        <TextField
          size="small"
          fullWidth
          autoFocus
          label="Contains"
          slotProps={{ htmlInput: { "aria-label": "Filter contains" } }}
          value={typeof current === "string" ? current : ""}
          onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        />
      </Box>
    );
  };

  return (
    <Popover open anchorEl={anchor} onClose={onClose} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
      {body()}
      <Divider />
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
        <Button size="small" onClick={() => column.setFilterValue(undefined)}>
          Clear
        </Button>
      </Box>
    </Popover>
  );
}

/* ── column header menu ──────────────────────────────────────────────────── */

function ColumnHeaderMenu({ column, anchor, onClose }) {
  const act = (fn) => () => {
    fn();
    onClose();
  };
  // A flat, fully-keyed array on purpose: MUI's Menu re-wraps children for
  // roving tab-index, and a nested array child loses its keys on the way through.
  const items = [
    <MenuItem key="asc" dense onClick={act(() => column.toggleSorting(false))}>
      Sort ascending
    </MenuItem>,
    <MenuItem key="desc" dense onClick={act(() => column.toggleSorting(true))}>
      Sort descending
    </MenuItem>,
    <MenuItem key="clear" dense disabled={!column.getIsSorted()} onClick={act(() => column.clearSorting())}>
      Clear sort
    </MenuItem>,
    <Divider key="d1" />,
    <MenuItem key="pl" dense onClick={act(() => column.pin("left"))}>
      Freeze to left
    </MenuItem>,
    <MenuItem key="pr" dense onClick={act(() => column.pin("right"))}>
      Freeze to right
    </MenuItem>,
    <MenuItem key="pn" dense disabled={!column.getIsPinned()} onClick={act(() => column.pin(false))}>
      Unfreeze
    </MenuItem>,
    <Divider key="d2" />,
    <MenuItem key="hide" dense onClick={act(() => column.toggleVisibility(false))}>
      Hide column
    </MenuItem>,
    <MenuItem key="rw" dense onClick={act(() => column.resetSize())}>
      Reset width
    </MenuItem>,
  ];
  return (
    <Menu open anchorEl={anchor} onClose={onClose}>
      {items}
    </Menu>
  );
}

/* ── CSV ─────────────────────────────────────────────────────────────────── */

function exportCsv(table, name) {
  const cols = table.getVisibleLeafColumns().filter((c) => c.id !== "__select__");
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = cols.map((c) => esc(c.columnDef.header)).join(",");
  // The filtered + sorted view, all pages — not the raw rows.
  const body = table
    .getSortedRowModel()
    .rows.map((r) => cols.map((c) => esc(r.getValue(c.id))).join(","))
    .join("\n");
  const blob = new Blob([`${head}\n${body}`], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name || "table"}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Module-level so it keeps its identity across renders. */
function FilterChip({ label, onDelete }) {
  return (
    <Stack
      direction="row"
      component="span"
      sx={(t) => ({
        alignItems: "center",
        gap: 0.5,
        ...t.typography.subtitle2,
        backgroundColor: t.palette.surface.raised,
        border: `1px solid ${t.palette.border.default}`,
        borderRadius: 999,
        pl: 1,
        pr: 0.25,
        py: 0.125,
      })}
    >
      {label}
      <IconButton size="small" onClick={onDelete} aria-label={`Remove filter ${label}`} sx={{ p: 0.25 }}>
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Stack>
  );
}

/* ── the component ───────────────────────────────────────────────────────── */

export function DataTable({
  columns,
  rows,
  getRowId,
  density: densityProp = "regular",
  fontSize = 13,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  hideFooter = false,
  onRowClick,
  getRowClassName,
  lockFirstColumn = false,
  checkboxSelection = false,
  selection,
  onSelectionChange,
  toolbar = false,
  enableColumnFilters = true,
  exportName = "table",
  emptyOverlay = null,
  overlayHeight = 220,
  maxHeight = 620,
  sx,
}) {
  const prefsKey = exportName || null;
  const saved = useRef(readPrefs(prefsKey)).current;

  const [density, setDensity] = useState(saved?.density ?? resolveDensity(densityProp));
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState(
    saved?.columnVisibility ?? Object.fromEntries(columns.filter((c) => c.hidden).map((c) => [c.field, false])),
  );
  const [columnPinning, setColumnPinning] = useState(
    saved?.columnPinning ??
      (lockFirstColumn
        ? { left: checkboxSelection ? ["__select__", columns[0]?.field] : [columns[0]?.field] }
        : {}),
  );
  const [columnSizing, setColumnSizing] = useState(saved?.columnSizing ?? {});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });
  const [full, setFull] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [colsAnchor, setColsAnchor] = useState(null);

  const cols = useMemo(() => adaptColumns(columns, { checkboxSelection }), [columns, checkboxSelection]);

  const table = useReactTable({
    data: rows,
    columns: cols,
    state: { sorting, columnFilters, globalFilter, columnVisibility, columnPinning, columnSizing, pagination },
    getRowId: getRowId ? (row, i) => String(getRowId(row) ?? i) : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onColumnSizingChange: setColumnSizing,
    onPaginationChange: setPagination,
    globalFilterFn: "includesString",
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    enableSortingRemoval: true,
    isMultiSortEvent: (e) => e.shiftKey,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  // Persist the view. Sorting, filters, search and page index are deliberately
  // NOT persisted — a stale filter surviving a reload looks like missing data.
  useEffect(() => {
    writePrefs(prefsKey, { density, columnPinning, columnVisibility, columnSizing });
  }, [prefsKey, density, columnPinning, columnVisibility, columnSizing]);

  const resetView = useCallback(() => {
    setDensity(resolveDensity(densityProp));
    setColumnPinning(lockFirstColumn ? { left: [columns[0]?.field] } : {});
    setColumnVisibility(Object.fromEntries(columns.filter((c) => c.hidden).map((c) => [c.field, false])));
    setColumnSizing({});
    setSorting([]);
    setColumnFilters([]);
    setGlobalFilter("");
  }, [columns, densityProp, lockFirstColumn]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e) => e.key === "Escape" && setFull(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [full]);

  const d = DENSITY[density];
  const total = rows.length;
  const shown = table.getFilteredRowModel().rows.length;
  const activeFilters = columnFilters.length + (globalFilter ? 1 : 0);
  const hiddenCount = Object.values(columnVisibility).filter((v) => v === false).length;

  /* ── pinning offsets ───────────────────────────────────────────────────── */
  const pinSx = (column, isHeader) => {
    const pinned = column.getIsPinned();
    if (!pinned) return {};
    const lastLeft = pinned === "left" && column.getIsLastColumn?.("left");
    const firstRight = pinned === "right" && column.getIsFirstColumn?.("right");
    return (t) => ({
      position: "sticky",
      [pinned === "left" ? "left" : "right"]:
        pinned === "left" ? column.getStart("left") : column.getAfter("right"),
      // Frozen cells must be fully opaque or scrolling columns bleed through.
      backgroundColor: isHeader ? t.palette.surface.raised : t.palette.surface.raised,
      zIndex: isHeader ? 3 : 2,
      // Only the innermost frozen column draws the edge, so a group of frozen
      // columns reads as one slab.
      ...(lastLeft && { boxShadow: `6px 0 6px -6px ${alpha(t.palette.common.black, 0.18)}` }),
      ...(firstRight && { boxShadow: `-6px 0 6px -6px ${alpha(t.palette.common.black, 0.18)}` }),
    });
  };

  /* ── toolbar ─────────────────────────────────────────────────────────────
     These are called as functions, never rendered as <Toolbar />. A component
     declared inside a render body is a NEW component type every render, so
     React unmounts and remounts it — which would steal focus from the search
     field on every keystroke.                                              */
  const renderToolbar = () => (
    <Stack
      direction="row"
      sx={{
        gap: 1,
        alignItems: "center",
        flexWrap: "wrap",
        px: 1.5,
        py: 1,
        borderBottom: (t) => `1px solid ${t.palette.border.subtle}`,
      }}
    >
      <TextField
        size="small"
        placeholder="Search all columns…"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        slotProps={{
          htmlInput: { "aria-label": "Search table" },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: { xs: "100%", sm: 240 } }}
      />
      <Typography variant="body2" sx={{ color: "text.secondary", ml: "auto", whiteSpace: "nowrap" }}>
        {shown === total ? `${exInt(total)} rows` : `${exInt(shown)} of ${exInt(total)} rows`}
      </Typography>
      <Tooltip
        title={`Density: ${density}. Next: ${DENSITY_ORDER[(DENSITY_ORDER.indexOf(density) + 1) % 3]} (${
          DENSITY[DENSITY_ORDER[(DENSITY_ORDER.indexOf(density) + 1) % 3]].row
        }px)`}
      >
        <Button
          size="small"
          variant="text"
          startIcon={<DensityMediumIcon />}
          onClick={() => setDensity(DENSITY_ORDER[(DENSITY_ORDER.indexOf(density) + 1) % 3])}
        >
          {density}
        </Button>
      </Tooltip>
      <Button size="small" variant="text" startIcon={<ViewColumnIcon />} onClick={(e) => setColsAnchor(e.currentTarget)}>
        Columns{hiddenCount ? ` (${table.getVisibleLeafColumns().length}/${cols.length})` : ""}
      </Button>
      <Button size="small" variant="text" startIcon={<DownloadIcon />} onClick={() => exportCsv(table, exportName)}>
        Export
      </Button>
      <Tooltip title="Reset table view">
        <IconButton size="small" onClick={resetView} aria-label="Reset table view">
          <RestartAltIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={full ? "Exit full screen" : "View table full screen"}>
        <IconButton
          size="small"
          onClick={() => setFull((v) => !v)}
          aria-label="View table full screen"
          aria-pressed={full}
        >
          {full ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Stack>
  );

  /* ── filter chips ──────────────────────────────────────────────────────── */
  const renderFilterChips = () =>
    activeFilters === 0 ? null : (
      <Stack
        direction="row"
        sx={(t) => ({
          gap: 1,
          alignItems: "center",
          flexWrap: "wrap",
          px: 1.5,
          py: 1,
          backgroundColor: alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.12 : 0.05),
          borderBottom: `1px solid ${t.palette.border.subtle}`,
        })}
      >
        <Typography variant="overline" sx={{ color: "text.tertiary" }}>
          Filters
        </Typography>
        {globalFilter && (
          <FilterChip label={`Search: "${globalFilter}"`} onDelete={() => setGlobalFilter("")} />
        )}
        {columnFilters.map((f) => {
          const col = table.getColumn(f.id);
          const v = f.value;
          const text = Array.isArray(v)
            ? v.length > 3
              ? `${v.slice(0, 3).join(", ")} +${v.length - 3}`
              : v.join(", ")
            : typeof v === "object"
              ? `${v.min ?? "–"} to ${v.max ?? "–"}`
              : String(v);
          return (
            <FilterChip
              key={f.id}
              label={`${col?.columnDef.header}: ${text}`}
              onDelete={() => col?.setFilterValue(undefined)}
            />
          );
        })}
        <Button
          size="small"
          variant="text"
          sx={{ ml: "auto" }}
          onClick={() => {
            setColumnFilters([]);
            setGlobalFilter("");
          }}
        >
          Clear all
        </Button>
      </Stack>
    );

  /* ── the grid ──────────────────────────────────────────────────────────── */
  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0, ...sx }}>
      {toolbar && renderToolbar()}
      {renderFilterChips()}

      <Box sx={{ overflow: "auto", maxHeight: full ? "none" : maxHeight, flex: 1, minHeight: 0 }}>
        <Table
          size="small"
          sx={{
            tableLayout: "fixed",
            width: table.getCenterTotalSize(),
            minWidth: "100%",
          }}
        >
          <TableHead>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const column = header.column;
                  const m = column.columnDef.meta ?? {};
                  const sorted = column.getIsSorted();
                  const sortIndex = column.getSortIndex();
                  const filtered = column.getIsFiltered();
                  const alwaysShow = filtered || sorted || column.getIsPinned();
                  return (
                    <TableCell
                      key={header.id}
                      align={m.headerAlign}
                      sortDirection={sorted || false}
                      sx={(t) => ({
                        position: "sticky",
                        top: 0,
                        zIndex: column.getIsPinned() ? 3 : 2,
                        width: header.getSize(),
                        py: d.py,
                        px: d.px,
                        fontSize: d.head,
                        fontWeight: 700,
                        letterSpacing: 0.3,
                        textTransform: "uppercase",
                        color: t.palette.text.secondary,
                        whiteSpace: "nowrap",
                        // Opaque base + tint as an image, so pinning still works.
                        backgroundColor: t.palette.surface.raised,
                        backgroundImage: `linear-gradient(${alpha(
                          t.palette.primary.main,
                          t.palette.mode === "dark" ? 0.18 : 0.1,
                        )}, ${alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.18 : 0.1)})`,
                        "&:hover .col-controls, &:focus-within .col-controls": { opacity: 1 },
                        ...(typeof pinSx(column, true) === "function"
                          ? pinSx(column, true)(t)
                          : pinSx(column, true)),
                      })}
                    >
                      <Stack
                        direction="row"
                        sx={{ alignItems: "center", gap: 0.25, justifyContent: m.headerAlign === "right" ? "flex-end" : "flex-start" }}
                      >
                        {m.select ? (
                          <Checkbox
                            size="small"
                            checked={selection?.size > 0 && selection?.size === table.getFilteredRowModel().rows.length}
                            indeterminate={selection?.size > 0 && selection?.size < table.getFilteredRowModel().rows.length}
                            onChange={(e) =>
                              onSelectionChange?.(
                                e.target.checked
                                  ? new Set(table.getFilteredRowModel().rows.map((r) => r.id))
                                  : new Set(),
                              )
                            }
                            slotProps={{ input: { "aria-label": "Select all rows" } }}
                            sx={{ p: 0.25 }}
                          />
                        ) : column.getCanSort() ? (
                          <TableSortLabel
                            active={Boolean(sorted)}
                            direction={sorted || "asc"}
                            onClick={column.getToggleSortingHandler()}
                            sx={{ font: "inherit", letterSpacing: "inherit", textTransform: "inherit" }}
                          >
                            {flexRender(column.columnDef.header, header.getContext())}
                            {sorting.length > 1 && sortIndex > -1 && (
                              <Box
                                component="span"
                                sx={(t) => ({
                                  ml: 0.5,
                                  px: 0.5,
                                  borderRadius: 999,
                                  fontSize: 9,
                                  backgroundColor: t.palette.primary.main,
                                  color: t.palette.primary.contrastText,
                                })}
                              >
                                {sortIndex + 1}
                              </Box>
                            )}
                          </TableSortLabel>
                        ) : (
                          flexRender(column.columnDef.header, header.getContext())
                        )}

                        {!m.select && (
                          <Stack
                            direction="row"
                            className="col-controls"
                            sx={{
                              opacity: alwaysShow ? 1 : 0,
                              transition: (t) => t.transitions.create("opacity"),
                              ml: "auto",
                            }}
                          >
                            {enableColumnFilters && column.getCanFilter() && column.getFacetedUniqueValues().size > 1 && (
                              <IconButton
                                size="small"
                                aria-label={`Filter ${column.columnDef.header}`}
                                onClick={(e) => setFilterAnchor({ el: e.currentTarget, column })}
                                sx={{ p: 0.25, color: filtered ? "primary.main" : "inherit" }}
                              >
                                <FilterAltIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              aria-label={`Options for ${column.columnDef.header}`}
                              onClick={(e) => setMenuAnchor({ el: e.currentTarget, column })}
                              sx={{ p: 0.25 }}
                            >
                              <MoreVertIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Stack>
                        )}
                      </Stack>

                      {column.getCanResize() && (
                        <Box
                          role="separator"
                          aria-orientation="vertical"
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          onDoubleClick={() => column.resetSize()}
                          sx={(t) => ({
                            position: "absolute",
                            top: 0,
                            insetInlineEnd: 0,
                            height: "100%",
                            width: 12,
                            cursor: "col-resize",
                            userSelect: "none",
                            touchAction: "none",
                            display: "flex",
                            justifyContent: "center",
                            zIndex: 1,
                            "&::after": {
                              content: '""',
                              width: 2,
                              height: "60%",
                              alignSelf: "center",
                              backgroundColor: t.palette.border.default,
                              transition: t.transitions.create(["height", "background-color"]),
                            },
                            "&:hover::after": { height: "80%" },
                            "&:active::after": { height: "100%", backgroundColor: t.palette.primary.main },
                          })}
                        />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length} sx={{ border: 0 }}>
                  <Box sx={{ minHeight: overlayHeight, display: "grid", placeItems: "center" }}>
                    {emptyOverlay ?? <GridEmptyOverlay />}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const selected = selection?.has(row.id);
                return (
                  <TableRow
                    key={row.id}
                    hover
                    selected={Boolean(selected)}
                    className={getRowClassName?.({ id: row.id, row: row.original })}
                    onClick={onRowClick ? () => onRowClick({ row: row.original, id: row.id }) : undefined}
                    sx={(t) => ({
                      height: d.row,
                      cursor: onRowClick ? "pointer" : "default",
                      "&:hover .genus-pinned": {
                        // Frozen cells are opaque, which would swallow the hover
                        // tint — repaint it as an image on top.
                        backgroundImage: `linear-gradient(${alpha(t.palette.primary.main, 0.06)}, ${alpha(
                          t.palette.primary.main,
                          0.06,
                        )})`,
                      },
                    })}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const column = cell.column;
                      const m = column.columnDef.meta ?? {};
                      const raw = cell.getValue();
                      const pinned = column.getIsPinned();
                      return (
                        <TableCell
                          key={cell.id}
                          align={m.align}
                          className={pinned ? "genus-pinned" : undefined}
                          sx={(t) => ({
                            py: d.py,
                            px: d.px,
                            fontSize,
                            width: column.getSize(),
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            ...(m.numeric && {
                              fontVariantNumeric: "tabular-nums",
                            }),
                            ...(typeof pinSx(column, false) === "function"
                              ? pinSx(column, false)(t)
                              : pinSx(column, false)),
                          })}
                        >
                          {m.select ? (
                            <Checkbox
                              size="small"
                              checked={Boolean(selected)}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => {
                                const next = new Set(selection ?? []);
                                next.has(row.id) ? next.delete(row.id) : next.add(row.id);
                                onSelectionChange?.(next);
                              }}
                              slotProps={{ input: { "aria-label": `Select row ${row.id}` } }}
                              sx={{ p: 0.25 }}
                            />
                          ) : m.renderCell ? (
                            // renderCell returns arbitrary JSX, so the engine
                            // will not reach into it to highlight matches.
                            m.renderCell({ value: raw, row: row.original, id: row.id })
                          ) : m.numeric ? (
                            // Integers group; anything with a fraction keeps it.
                            // exInt alone silently rounded 3.04 m of GPS
                            // accuracy to "3", which is a different claim.
                            Number.isInteger(Number(raw)) ? exInt(raw) : exNum(raw, 2)
                          ) : (
                            <Highlight text={raw} query={globalFilter} />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>

      {!hideFooter && (
        <TablePagination
          component="div"
          count={shown}
          page={pagination.pageIndex}
          onPageChange={(_, p) => setPagination((s) => ({ ...s, pageIndex: p }))}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={(e) =>
            setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })
          }
          rowsPerPageOptions={pageSizeOptions}
          sx={(t) => ({
            minHeight: 44,
            borderTop: `1px solid ${t.palette.border.subtle}`,
            backgroundColor: alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.08 : 0.03),
          })}
        />
      )}

      {filterAnchor && (
        <ColumnFilter column={filterAnchor.column} anchor={filterAnchor.el} onClose={() => setFilterAnchor(null)} />
      )}
      {menuAnchor && (
        <ColumnHeaderMenu column={menuAnchor.column} anchor={menuAnchor.el} onClose={() => setMenuAnchor(null)} />
      )}
      <Menu open={Boolean(colsAnchor)} anchorEl={colsAnchor} onClose={() => setColsAnchor(null)}>
        <MenuItem dense onClick={() => setColumnVisibility({})}>
          Show all
        </MenuItem>
        <Divider />
        {table
          .getAllLeafColumns()
          .filter((c) => c.getCanHide() && c.id !== "__select__")
          .map((c) => (
            <MenuItem key={c.id} dense onClick={() => c.toggleVisibility()} sx={{ gap: 1 }}>
              <Checkbox size="small" checked={c.getIsVisible()} sx={{ p: 0.25 }} />
              {c.columnDef.header}
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );

  // Portalled to body on purpose: the panels wrapping these tables keep a
  // transform from their entry animation, and a transformed ancestor becomes
  // the containing block for position:fixed — the overlay was being sized
  // against the panel and then clipped by its overflow:hidden.
  return full
    ? createPortal(
        <Box
          sx={(t) => ({
            position: "fixed",
            inset: 0,
            zIndex: t.zIndex.drawer + 2,
            backgroundColor: t.palette.surface.raised,
            display: "flex",
            flexDirection: "column",
          })}
        >
          {content}
        </Box>,
        document.body,
      )
    : content;
}
