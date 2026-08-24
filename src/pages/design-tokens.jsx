/**
 * Design tokens — the live editor.
 *
 * Every token in the product is editable here, and every edit repaints the
 * product immediately: the store resolves the draft through the SAME function
 * scripts/build-tokens.mjs uses, hands the result to getTheme(), and the theme
 * rebuild propagates. So the preview is not an approximation of the build output,
 * it is the build output.
 *
 * Contrast is judged live against src/tokens/contracts.json — the same contract
 * the build gate scores, with the same maths. The editor and CI cannot disagree.
 *
 * Nothing here writes to disk. A draft lives in localStorage and Export produces
 * a JSON you commit, which is what keeps `scripts/figma-tokens.json` the reviewed
 * source of truth rather than a file the UI mutates behind your back.
 */
import React, { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import RedoOutlinedIcon from "@mui/icons-material/RedoOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";

import { WsPage, WsSection } from "../components/workspaces.jsx";
import { Panel } from "../components/molecules.jsx";
import { EmptyState, SectionLabel } from "../components/atoms.jsx";
import { DataTable } from "../components/data-table.jsx";
import { useSettings } from "../lib/settings.jsx";
import { useTokens } from "../lib/token-store.jsx";
import { primitiveAliases, deref, FILL_STEPS } from "../lib/token-resolve.js";
import { audit, summarise, paletteFor, CONTRACTS, EXPECTED_DEFECTS } from "../lib/a11y.js";
import { contrast, requiredRatio, isHex } from "../lib/contrast.js";
import { ColorField } from "../components/tokens/color-field.jsx";
import { AliasPicker } from "../components/tokens/alias-picker.jsx";
import { ContrastMeter, VerdictChip, Swatch, Ratio, FieldLabel, OverrideMark } from "../components/tokens/atoms.jsx";
import { ComponentsTab } from "../components/tokens/components-tab.jsx";
import { ResetButton, ChangeList } from "../components/tokens/reset.jsx";

/* ── helpers ──────────────────────────────────────────────────────────────── */

const groupOf = (path) => path.split("/")[0];

const download = (name, text) => {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

/* ── draft bar ────────────────────────────────────────────────────────────── */

function DraftBar({ guard, setGuard }) {
  const { dirty, undo, redo, canUndo, canRedo, overrides, resolved, replaceDraft } = useTokens();
  const fileRef = useRef(null);
  const [showChanges, setShowChanges] = useState(false);

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={(t) => ({ alignItems: "center",
        p: 1.5,
        flexWrap: "wrap",
        gap: 1,
        borderRadius: `${t.shape.borderRadius}px`,
        border: `1px solid ${dirty ? t.palette.primary.main : t.palette.border.default}`,
        backgroundColor: t.palette.surface.subtle,
        minWidth: 0,
      })}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 0 }}>
        {dirty === 0 ? "No changes" : `${dirty} token${dirty === 1 ? "" : "s"} changed`}
      </Typography>

      <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

      <Tooltip title="Undo">
        <IconButton size="small" onClick={undo} disabled={!canUndo} aria-label="Undo">
          <UndoOutlinedIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Redo">
        <IconButton size="small" onClick={redo} disabled={!canRedo} aria-label="Redo">
          <RedoOutlinedIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
      <ResetButton label="Reset all" confirmOver={0} />

      <Button
        size="small"
        variant="text"
        disabled={dirty === 0}
        onClick={() => setShowChanges((v) => !v)}
        sx={{ textTransform: "none" }}
      >
        {showChanges ? "Hide changes" : "Review changes"}
      </Button>

      <Box sx={{ flex: 1, minWidth: 8 }} />

      <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
        <SectionLabel sx={{ mb: 0 }}>Guardrails</SectionLabel>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={guard}
          onChange={(_, v) => v && setGuard(v)}
          aria-label="Accessibility guardrails"
        >
          <ToggleButton value="off" sx={{ textTransform: "none" }}>Off</ToggleButton>
          <ToggleButton value="warn" sx={{ textTransform: "none" }}>Warn</ToggleButton>
          <ToggleButton value="enforce" sx={{ textTransform: "none" }}>Enforce</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Button
        size="small"
        variant="outlined"
        startIcon={<FileUploadOutlinedIcon />}
        onClick={() => fileRef.current?.click()}
      >
        Import
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          try {
            const parsed = JSON.parse(await f.text());
            // Accept either a bare override patch or a full exported document.
            replaceDraft(parsed.overrides ?? parsed);
          } catch {
            /* a malformed file must not wipe the current draft */
          }
          e.target.value = "";
        }}
      />

      <Button
        size="small"
        variant="contained"
        startIcon={<FileDownloadOutlinedIcon />}
        disabled={dirty === 0}
        onClick={() =>
          download(
            "genus-token-draft.json",
            JSON.stringify(
              {
                $meta: {
                  kind: "genus-token-draft",
                  note: "Sparse override patch over scripts/figma-tokens.json. Merge it there and run `npm run tokens`.",
                  changed: dirty,
                },
                overrides,
              },
              null,
              2,
            ),
          )
        }
      >
        Export draft
      </Button>
      <Tooltip title="The full merged document — drop it in as scripts/figma-tokens.json">
        <Button
          size="small"
          variant="outlined"
          disabled={dirty === 0}
          onClick={() => download("figma-tokens.json", JSON.stringify(resolved.source, null, 2))}
        >
          Export full
        </Button>
      </Tooltip>

      {showChanges && (
        <Box sx={{ width: "100%", mt: 0.5 }}>
          <SectionLabel>Every change, newest last</SectionLabel>
          <ChangeList />
        </Box>
      )}
    </Stack>
  );
}

/* ── scope ────────────────────────────────────────────────────────────────── */

/**
 * Which scheme and mode the contrast readouts are judged against.
 *
 * It defaults to what the viewer is actually looking at, because that is the
 * pair they can see. It is selectable because 15 of 18 combinations were failing
 * before M0 and only one of them was ever on screen at a time.
 */
function ScopeBar({ scope, setScope, schemes }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1, minWidth: 0 }}>
      <SectionLabel sx={{ mb: 0 }}>Judged against</SectionLabel>
      <Select
        size="small"
        value={scope.scheme}
        onChange={(e) => setScope({ ...scope, scheme: e.target.value })}
        aria-label="Colour scheme to judge against"
        sx={{ minWidth: 132 }}
      >
        {Object.entries(schemes).map(([id, s]) => (
          <MenuItem key={id} value={id}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Swatch color={s.swatch} size={12} />
              <span>{s.label}</span>
            </Stack>
          </MenuItem>
        ))}
      </Select>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={scope.mode}
        onChange={(_, v) => v && setScope({ ...scope, mode: v })}
        aria-label="Mode to judge against"
      >
        <ToggleButton value="light" sx={{ textTransform: "none" }}>Light</ToggleButton>
        <ToggleButton value="dark" sx={{ textTransform: "none" }}>Dark</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}

/* ── primitives ───────────────────────────────────────────────────────────── */

function PrimitivesTab({ scope, guard }) {
  const { resolved, set, revert, compare } = useTokens();
  const [selected, setSelected] = useState("blue.500");

  const families = Object.entries(resolved.primitives);
  const [family, step] = selected.split(".");
  const path = step ? `primitives.${family}.${step}` : `primitives.${family}`;
  const cmp = compare(path);
  const value = deref(resolved.primitives, selected);

  const palette = paletteFor(resolved, scope.scheme, scope.mode);

  /* Which declared pairs would move if this primitive moved. A primitive is not
     itself in the contract — its semantic dependants are — so this walks the
     alias table to find them. */
  const pairs = useMemo(() => {
    const roles = Object.entries(resolved.source.semantic)
      .filter(([p, a]) => !p.startsWith("$") && a[scope.mode] === selected)
      .map(([p]) => p);
    const out = [];
    for (const row of CONTRACTS) {
      if (row.exempt) continue;
      const required = requiredRatio(row.kind, row.typeToken, resolved.type.styles);
      if (roles.includes(row.fg) && palette[row.bg])
        out.push({ label: `on ${row.bg}`, against: palette[row.bg], required });
      else if (roles.includes(row.bg) && palette[row.fg])
        out.push({ label: `under ${row.fg}`, against: palette[row.fg], required });
    }
    return out.slice(0, 6);
  }, [resolved, selected, scope.mode, palette]);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1fr) 360px" }, gap: 2, minWidth: 0 }}>
      <Panel
        title="Primitive palette"
        note="Raw values. Every semantic role aliases one of these."
        action={<ResetButton prefix="primitives" label="Reset primitives" />}
      >
        <Box sx={{ p: 2, display: "grid", gap: 2, minWidth: 0 }}>
          {families.map(([fam, node]) => (
            <Box key={fam} sx={{ minWidth: 0 }}>
              <FieldLabel hint={typeof node === "string" ? node : `${Object.keys(node).length} steps`}>{fam}</FieldLabel>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75 }}>
                {typeof node === "string" ? (
                  <StepChip alias={fam} hex={node} selected={selected === fam} onSelect={setSelected} />
                ) : (
                  Object.entries(node).map(([st, hex]) => (
                    <StepChip
                      key={st}
                      alias={`${fam}.${st}`}
                      label={st}
                      hex={hex}
                      selected={selected === `${fam}.${st}`}
                      onSelect={setSelected}
                    />
                  ))
                )}
              </Stack>
            </Box>
          ))}
        </Box>
      </Panel>

      <Panel
        title={selected}
        note="Editing a primitive moves every role that aliases it."
        action={<ResetButton prefix={`primitives.${family}`} label={`Reset ${family}`} iconOnly />}
      >
        <Box sx={{ p: 2, minWidth: 0 }}>
          <ColorField
            label="Value"
            value={value ?? "#000000"}
            original={cmp.original ?? "—"}
            isOverridden={cmp.isOverridden}
            onChange={(hex) => set(path, hex)}
            onRevert={() => revert(path)}
            pairs={guard === "off" ? [] : pairs}
            suggestions={[]}
          />
          <Divider sx={{ my: 2 }} />
          <FieldLabel hint={`${scope.scheme} · ${scope.mode}`}>Roles that alias this</FieldLabel>
          <AliasedRoles selected={selected} mode={scope.mode} />
        </Box>
      </Panel>
    </Box>
  );
}

function StepChip({ alias, label, hex, selected, onSelect }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect(alias)}
      aria-pressed={selected}
      title={`${alias} — ${hex}`}
      sx={(t) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.25,
        px: 0.5,
        py: 0.5,
        cursor: "pointer",
        background: "none",
        // 2px when selected with a compensating 1px margin, so selection does not
        // nudge its neighbours — the same trick the theme customizer uses.
        border: selected ? `2px solid ${t.palette.primary.main}` : `1px solid ${t.palette.border.default}`,
        margin: selected ? 0 : "1px",
        borderRadius: `${t.shape.borderRadius / 2}px`,
        "&:focus-visible": { outline: `2px solid ${t.palette.focusRing}`, outlineOffset: 2 },
      })}
    >
      <Box sx={{ width: 26, height: 20, borderRadius: 1, backgroundColor: hex }} />
      <Typography sx={(t) => ({ ...t.typography.overline, color: t.palette.text.tertiary })}>
        {label ?? alias}
      </Typography>
    </Box>
  );
}

function AliasedRoles({ selected, mode }) {
  const { resolved } = useTokens();
  const roles = Object.entries(resolved.source.semantic).filter(
    ([p, a]) => !p.startsWith("$") && a[mode] === selected,
  );
  if (!roles.length)
    return (
      <Typography variant="body2" sx={{ color: "text.tertiary" }}>
        No semantic role points here in {mode} mode. Changing it affects nothing but the palette.
      </Typography>
    );
  return (
    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
      {roles.map(([p]) => (
        <Typography key={p} variant="body2" sx={{ fontFamily: "ui-monospace, monospace" }}>
          {p}
        </Typography>
      ))}
    </Stack>
  );
}

/* ── semantic ─────────────────────────────────────────────────────────────── */

function SemanticTab({ scope, guard }) {
  const { resolved, set, revert, compare } = useTokens();
  const paths = Object.keys(resolved.source.semantic).filter((p) => !p.startsWith("$"));
  const [selected, setSelected] = useState(paths[0]);

  const options = useMemo(
    () => primitiveAliases(resolved.primitives).map((alias) => ({ alias, hex: deref(resolved.primitives, alias) })),
    [resolved.primitives],
  );

  const palette = paletteFor(resolved, scope.scheme, scope.mode);
  const rows = audit(resolved, scope);

  const grouped = useMemo(() => {
    const out = {};
    for (const p of paths) (out[groupOf(p)] ??= []).push(p);
    return out;
  }, [paths.join("|")]);

  const pairsFor = (path, mode) =>
    CONTRACTS.filter((r) => !r.exempt && (r.fg === path || r.bg === path)).map((r) => {
      const other = r.fg === path ? r.bg : r.fg;
      return {
        label: r.fg === path ? `on ${other}` : `under ${other}`,
        against: mode === scope.mode ? palette[other] : resolved.semantic[mode][other],
        required: requiredRatio(r.kind, r.typeToken, resolved.type.styles),
      };
    });

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0,1fr)" }, gap: 2, minWidth: 0 }}>
      <Panel
        title="Roles"
        note={`${paths.length} semantic tokens`}
        action={<ResetButton prefix="semantic" label="Reset roles" iconOnly />}
      >
        <Box sx={{ p: 1, maxHeight: 620, overflowY: "auto", minWidth: 0 }}>
          {Object.entries(grouped).map(([g, items]) => (
            <Box key={g} sx={{ mb: 1 }}>
              <SectionLabel sx={{ px: 1 }}>{g}</SectionLabel>
              {items.map((p) => {
                const bad = rows.filter((r) => (r.fg === p || r.bg === p) && r.verdict.level === "fail");
                return (
                  <Box
                    key={p}
                    component="button"
                    type="button"
                    onClick={() => setSelected(p)}
                    aria-pressed={selected === p}
                    sx={(t) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      width: "100%",
                      px: 1,
                      py: 0.75,
                      cursor: "pointer",
                      background: selected === p ? t.palette.surface.subtle : "none",
                      border: 0,
                      borderRadius: `${t.shape.borderRadius / 2}px`,
                      textAlign: "start",
                      minWidth: 0,
                      "&:focus-visible": { outline: `2px solid ${t.palette.focusRing}`, outlineOffset: -2 },
                    })}
                  >
                    <Swatch color={resolved.semantic[scope.mode][p]} size={14} />
                    <Typography
                      variant="body2"
                      sx={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: selected === p ? 600 : 400 }}
                    >
                      {p.slice(g.length + 1) || p}
                    </Typography>
                    {bad.length > 0 && <VerdictChip level="fail" defect={bad.every((b) => b.verdict.knownDefect)} />}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Panel>

      <Box sx={{ display: "grid", gap: 2, minWidth: 0, alignContent: "start" }}>
        <Panel title={selected} note="A role points at a primitive, per mode. It never holds a hex of its own.">
          <Box sx={{ p: 2, display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0,1fr))" }, minWidth: 0 }}>
            {["light", "dark"].map((mode) => {
              const path = `semantic.${selected}.${mode}`;
              const cmp = compare(path);
              return (
                <AliasPicker
                  key={mode}
                  label={`${mode} mode`}
                  value={resolved.source.semantic[selected][mode]}
                  original={cmp.original}
                  isOverridden={cmp.isOverridden}
                  onChange={(alias) => set(path, alias)}
                  onRevert={() => revert(path)}
                  options={options}
                  pairs={guard === "off" ? [] : pairsFor(selected, mode)}
                  guard={guard}
                />
              );
            })}
          </Box>
        </Panel>

        <Panel title="Declared pairs" note={`${scope.scheme} · ${scope.mode} — the contract, judged live`}>
          <Box sx={{ p: 2, display: "grid", gap: 1.5, minWidth: 0 }}>
            {rows.filter((r) => r.fg === selected || r.bg === selected).length === 0 ? (
              <EmptyState
                title="Not in the contract"
                body={`No declared pair uses ${selected}. That means it is UNCHECKED, not that it is compliant — add a row to src/tokens/contracts.json to have it gated.`}
                minHeight={120}
              />
            ) : (
              rows
                .filter((r) => r.fg === selected || r.bg === selected)
                .map((r, i) => (
                  <ContrastMeter
                    key={`${r.fg}|${r.bg}|${i}`}
                    fg={r.verdict.fg ?? palette[r.fg]}
                    bg={r.verdict.bg ?? palette[r.bg]}
                    required={r.verdict.required ?? 4.5}
                    typeStyle={r.typeToken ? resolved.type.styles[r.typeToken] && {
                      fontSize: resolved.type.styles[r.typeToken].size,
                      fontWeight: resolved.type.styles[r.typeToken].weight,
                    } : undefined}
                    label={`${r.fg} on ${r.bg}${r.typeToken ? ` · ${r.typeToken}` : ` · ${r.kind}`}`}
                  />
                ))
            )}
          </Box>
        </Panel>
      </Box>
    </Box>
  );
}

/* ── type ─────────────────────────────────────────────────────────────────── */

const TYPE_FIELDS = [
  ["size", "Size", "px"],
  ["weight", "Weight", ""],
  ["lineHeight", "Line height", "px"],
  ["tracking", "Tracking", "px"],
];

function TypeTab() {
  const { resolved, set, revert, compare } = useTokens();
  const styles = Object.entries(resolved.type.styles);

  return (
    <Panel
      title="Type ramp"
      note="Inter · 10/12/14/16/18/20/28/32/56 at 400–700. Sizes 24 and 40 do not exist in this system — see AGENTS.md."
      action={<ResetButton prefix="type" label="Reset type" />}
    >
      <Box sx={{ p: 2, display: "grid", gap: 2, minWidth: 0 }}>
        {styles.map(([key, s]) => {
          const large = s.size >= 24 || (s.size >= 18.66 && s.weight >= 700);
          return (
            <Box key={key} sx={(t) => ({ p: 1.5, border: `1px solid ${t.palette.border.default}`, borderRadius: `${t.shape.borderRadius}px`, minWidth: 0 })}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", mb: 1, flexWrap: "wrap", gap: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>
                  {key}
                </Typography>
                <Tooltip title="WCAG large scale is ≥24px, or ≥18.66px at weight 700. Large text needs only 3:1 instead of 4.5:1 — so this flag changes what the gate requires.">
                  <Box component="span">
                    <VerdictChip level={large ? "pass" : "exempt"} title={large ? "Qualifies as large text — 3:1" : "Normal text — 4.5:1"} />
                  </Box>
                </Tooltip>
                <Box sx={{ flex: 1, minWidth: 4 }} />
                <Typography
                  sx={{
                    fontSize: s.size,
                    fontWeight: s.weight,
                    lineHeight: `${s.lineHeight}px`,
                    letterSpacing: `${s.tracking}px`,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  Handgloves
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {TYPE_FIELDS.map(([f, label, unit]) => {
                  const path = `type.styles.${key}.${f}`;
                  const cmp = compare(path);
                  return (
                    <Box key={f} sx={{ minWidth: 0 }}>
                      <TextField
                        size="small"
                        type="number"
                        label={label}
                        value={s[f]}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isFinite(n)) set(path, n);
                        }}
                        slotProps={{ input: { endAdornment: unit ? <Typography variant="body2" sx={{ color: "text.tertiary" }}>{unit}</Typography> : null } }}
                        sx={{ width: 116 }}
                      />
                      {cmp.isOverridden && (
                        <Box sx={{ mt: 0.5 }}>
                          <OverrideMark original={String(cmp.original)} onRevert={() => revert(path)} what={path} />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Panel>
  );
}

/* ── scale ────────────────────────────────────────────────────────────────── */

const SCALE_GROUPS = [
  ["spacing", "Spacing", "4px grid. theme.spacing maps n → n × spacing[2], so p:2 is 16px."],
  ["radius", "Radius", "control 4 · surface 8 · pill 999."],
  ["motion", "Motion", "Durations in ms, plus the easing curve."],
  ["layout", "Layout", "Shell geometry — rail widths, top bar, row heights."],
];

function ScaleTab() {
  const { resolved, set, revert, compare } = useTokens();

  return (
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0,1fr))" }, minWidth: 0 }}>
      {SCALE_GROUPS.map(([group, title, note]) => (
        <Panel
          key={group}
          title={title}
          note={note}
          action={<ResetButton prefix={`nonFigma.${group}`} label={`Reset ${title.toLowerCase()}`} iconOnly />}
        >
          <Box sx={{ p: 2, display: "flex", flexWrap: "wrap", gap: 1.5, minWidth: 0 }}>
            {Object.entries(resolved[group]).map(([key, val]) => {
              const path = `nonFigma.${group}.${key}`;
              const cmp = compare(path);
              const numeric = typeof val === "number";
              return (
                <Box key={key} sx={{ minWidth: 0 }}>
                  <TextField
                    size="small"
                    type={numeric ? "number" : "text"}
                    label={key}
                    value={val}
                    onChange={(e) => {
                      const next = numeric ? Number(e.target.value) : e.target.value;
                      if (!numeric || Number.isFinite(next)) set(path, next);
                    }}
                    sx={{ width: numeric ? 116 : 240 }}
                  />
                  {cmp.isOverridden && (
                    <Box sx={{ mt: 0.5 }}>
                      <OverrideMark original={String(cmp.original)} onRevert={() => revert(path)} what={path} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Panel>
      ))}
    </Box>
  );
}

/* ── schemes ──────────────────────────────────────────────────────────────── */

function SchemesTab({ scope }) {
  const { resolved, set, revert, compare } = useTokens();

  return (
    <Panel
      title="Colour schemes"
      note="A scheme swaps the brand hue and nothing else — neutrals, surfaces, text and the status ramps never change, so no scheme can restyle a warning."
      action={<ResetButton prefix="schemes" label="Reset schemes" />}
    >
      <Box sx={{ p: 2, display: "grid", gap: 2, minWidth: 0 }}>
        {Object.entries(resolved.schemes).map(([id, s]) => {
          const path = `schemes.${id}.base`;
          const cmp = compare(path);
          const sm = s[scope.mode];
          const [rest, hover, pressed] = FILL_STEPS[scope.mode];
          return (
            <Box key={id} sx={(t) => ({ p: 1.5, border: `1px solid ${t.palette.border.default}`, borderRadius: `${t.shape.borderRadius}px`, minWidth: 0 })}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.25, flexWrap: "wrap", gap: 1 }}>
                <Swatch color={s.swatch} size={20} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.label}</Typography>
                <VerdictChip
                  level={s.fromFigma ? "pass" : "exempt"}
                  title={s.fromFigma ? "A real Figma ramp" : "Generated from a base hue by the HSL curve — see §5.3"}
                />
                <Box sx={{ flex: 1, minWidth: 4 }} />
                {cmp.isOverridden && <OverrideMark original={String(cmp.original)} onRevert={() => revert(path)} what={path} />}
              </Stack>

              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "220px minmax(0,1fr)" }, minWidth: 0 }}>
                {s.fromFigma ? (
                  <Box>
                    <FieldLabel hint="from the design file">Ramp</FieldLabel>
                    <Typography variant="body2" sx={{ color: "text.tertiary" }}>
                      Published by Figma, so there is no base hue to edit. Change its primitive family instead.
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    component="input"
                    type="color"
                    aria-label={`${s.label} base hue`}
                    value={isHex(s.base) ? s.base : "#000000"}
                    onChange={(e) => set(path, e.target.value.toLowerCase())}
                    sx={(t) => ({
                      width: "100%",
                      height: 34,
                      padding: 0,
                      border: `1px solid ${t.palette.border.default}`,
                      borderRadius: `${t.shape.borderRadius / 2}px`,
                      background: "none",
                      cursor: "pointer",
                    })}
                  />
                )}

                <Box sx={{ minWidth: 0 }}>
                  <FieldLabel hint={`${scope.mode} · steps ${rest}/${hover}/${pressed}`}>Derived</FieldLabel>
                  <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
                    <DerivedBit label="Fill" hex={sm.rest} />
                    <DerivedBit label="Label" hex={sm.onBrand} against={sm.rest} required={4.5} />
                    <DerivedBit label="Focus ring" hex={sm.focus} against={resolved.semantic[scope.mode]["surface/subtle"]} required={3} />
                  </Stack>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Panel>
  );
}

function DerivedBit({ label, hex, against, required }) {
  const ratio = against && isHex(hex) && isHex(against) ? contrast(hex, against) : null;
  return (
    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
      <FieldLabel>{label}</FieldLabel>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
        <Swatch color={hex} size={16} radius={4} />
        <Typography variant="body2" sx={{ fontFamily: "ui-monospace, monospace" }}>{hex}</Typography>
        {ratio !== null && (
          <>
            <Typography variant="body2"><Ratio value={ratio} required={required} /></Typography>
            <VerdictChip level={ratio >= required ? "pass" : "fail"} />
          </>
        )}
      </Stack>
    </Stack>
  );
}

/* ── audit ────────────────────────────────────────────────────────────────── */

const LEVEL_ORDER = { fail: 0, unknown: 1, exempt: 2, pass: 3 };

function AuditTab() {
  const { resolved } = useTokens();
  const rows = useMemo(() => audit(resolved), [resolved]);
  const totals = useMemo(() => summarise(rows), [rows]);

  const data = useMemo(
    () =>
      [...rows]
        .sort(
          (a, b) =>
            LEVEL_ORDER[a.verdict.level] - LEVEL_ORDER[b.verdict.level] ||
            (a.verdict.ratio ?? 99) - (b.verdict.ratio ?? 99),
        )
        .map((r, i) => ({
          id: `${r.scheme}-${r.mode}-${r.fg}-${r.bg}-${i}`,
          scheme: resolved.schemes[r.scheme]?.label ?? r.scheme,
          mode: r.mode,
          pair: `${r.fg} on ${r.bg}`,
          kind: r.typeToken ?? r.kind,
          ratio: r.verdict.ratio ?? null,
          required: r.verdict.required ?? null,
          level: r.verdict.level,
          defect: Boolean(r.verdict.knownDefect),
          note: r.verdict.note ?? r.verdict.knownDefect?.note ?? r.verdict.reason ?? "",
        })),
    [rows, resolved.schemes],
  );

  const columns = [
    { field: "scheme", headerName: "Scheme", minWidth: 110 },
    { field: "mode", headerName: "Mode", minWidth: 84 },
    { field: "pair", headerName: "Pair", minWidth: 340, flex: 1 },
    { field: "kind", headerName: "Kind", minWidth: 96 },
    {
      field: "ratio",
      headerName: "Ratio",
      minWidth: 118,
      renderCell: ({ row }) =>
        row.ratio === null ? (
          <Typography variant="body2" sx={{ color: "text.tertiary", fontStyle: "italic" }}>—</Typography>
        ) : (
          <Typography variant="body2"><Ratio value={row.ratio} required={row.required} /></Typography>
        ),
    },
    {
      field: "level",
      headerName: "Verdict",
      minWidth: 128,
      renderCell: ({ row }) => <VerdictChip level={row.level} defect={row.defect} title={row.note || undefined} />,
    },
  ];

  return (
    <Box sx={{ display: "grid", gap: 2, minWidth: 0 }}>
      <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 2 }}>
        <Tally label="Scored" value={totals.pass + totals.fail} />
        <Tally label="Pass" value={totals.pass} />
        <Tally label="Blocking failures" value={totals.blocking} tone={totals.blocking ? "fail" : "pass"} />
        <Tally
          label="Known defects"
          value={totals.defect}
          tone={totals.defect === EXPECTED_DEFECTS ? "defect" : "fail"}
          note={
            totals.defect === EXPECTED_DEFECTS
              ? `matches the ${EXPECTED_DEFECTS} on record`
              : totals.defect > EXPECTED_DEFECTS
                ? `${totals.defect - EXPECTED_DEFECTS} MORE than the ${EXPECTED_DEFECTS} on record — a new shortfall is hiding behind a knownDefect marker, and the build will refuse this`
                : `${EXPECTED_DEFECTS - totals.defect} FEWER than on record — something got fixed; drop its knownDefect marker`
          }
        />
        <Tally label="Exempt" value={totals.exempt} />
        <Tally label="Unknown" value={totals.unknown} tone={totals.unknown ? "unknown" : "pass"} />
      </Stack>

      <Panel
        title="Contract audit"
        note={`${CONTRACTS.length} declared pairs × ${Object.keys(resolved.schemes).length} schemes × 2 modes. Exempt rows are never scored — an exemption is not a pass.`}
      >
        <DataTable
          columns={columns}
          rows={data}
          getRowId={(r) => r.id}
          density="condensed"
          fontSize={12}
          pageSize={25}
          toolbar
          exportName="token-contrast-audit"
          maxHeight={560}
        />
      </Panel>
    </Box>
  );
}

function Tally({ label, value, tone = "pass", note }) {
  return (
    <Box
      sx={(t) => ({
        minWidth: 120,
        maxWidth: 260,
        p: 1.25,
        border: `1px solid ${tone === "fail" ? t.palette.band.critical.fg : t.palette.border.default}`,
        borderRadius: `${t.shape.borderRadius}px`,
      })}
    >
      <SectionLabel sx={{ mb: 0.25 }}>{label}</SectionLabel>
      <Typography
        sx={(t) => ({
          ...t.typography.h3,
          fontVariantNumeric: "tabular-nums",
          color:
            tone === "fail" ? t.palette.band.critical.fg
            : tone === "defect" ? t.palette.band.warning.fg
            : tone === "unknown" ? t.palette.band.warning.fg
            : t.palette.text.primary,
        })}
      >
        {value}
      </Typography>
      {note && (
        <Typography variant="body2" sx={{ color: "text.tertiary", mt: 0.25 }}>
          {note}
        </Typography>
      )}
    </Box>
  );
}

/* ── page ─────────────────────────────────────────────────────────────────── */

const TABS = [
  ["primitives", "Primitives"],
  ["semantic", "Semantic roles"],
  ["components", "Components"],
  ["type", "Type"],
  ["scale", "Spacing & scale"],
  ["schemes", "Schemes"],
  ["audit", "Audit"],
];

export default function DesignTokens() {
  const { scheme, resolvedMode } = useSettings();
  const { resolved, problems, dirty } = useTokens();
  const [tab, setTab] = useState("primitives");
  const [guard, setGuard] = useState("warn");
  const [scope, setScope] = useState({ scheme, mode: resolvedMode });

  const totals = useMemo(() => summarise(audit(resolved)), [resolved]);

  return (
    <WsPage
      breadcrumbs={[{ label: "Genus Solar", to: "/overview" }, { label: "Administration" }]}
      title="Design tokens"
      subtitle="Every token in the product, editable live. Changes resolve through the same function the build uses and repaint immediately — nothing is written to disk until you export."
      context={
        <Stack spacing={1.5} sx={{ minWidth: 0 }}>
          <DraftBar guard={guard} setGuard={setGuard} />
          <ScopeBar scope={scope} setScope={setScope} schemes={resolved.schemes} />
        </Stack>
      }
    >
      {problems.length > 0 && (
        <Panel title="This draft would fail the build" sx={{ mb: 2 }}>
          <Box sx={{ p: 2 }}>
            {problems.map((p) => (
              <Typography key={p} variant="body2" sx={(t) => ({ color: t.palette.band.critical.fg }) }>
                {p}
              </Typography>
            ))}
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              These are the same assertions <code>npm run tokens</code> runs. The editor still renders the draft
              so you can see and fix it — only the build treats them as fatal.
            </Typography>
          </Box>
        </Panel>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={(t) => ({ mb: 2, borderBottom: `1px solid ${t.palette.border.subtle}` })}
      >
        {TABS.map(([id, label]) => (
          <Tab
            key={id}
            value={id}
            label={
              id === "audit" && (totals.blocking || totals.unknown) ? (
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                  <span>{label}</span>
                  <VerdictChip level={totals.blocking ? "fail" : "unknown"} />
                </Stack>
              ) : (
                label
              )
            }
          />
        ))}
      </Tabs>

      {tab === "primitives" && <PrimitivesTab scope={scope} guard={guard} />}
      {tab === "semantic" && <SemanticTab scope={scope} guard={guard} />}
      {tab === "components" && <ComponentsTab scope={scope} guard={guard} />}
      {tab === "type" && <TypeTab />}
      {tab === "scale" && <ScaleTab />}
      {tab === "schemes" && <SchemesTab scope={scope} />}
      {tab === "audit" && <AuditTab />}

      <WsSection
        title="How this reaches production"
        note={
          dirty
            ? "Export the draft, merge it into scripts/figma-tokens.json, and run npm run tokens. The gate re-scores every pair on the way in."
            : "Edit a token to start a draft. Drafts live in localStorage and survive a reload."
        }
        padded={false}
      />
    </WsPage>
  );
}
