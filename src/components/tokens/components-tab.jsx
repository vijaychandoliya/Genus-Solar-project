/**
 * Components tab — tier 3, with variants and states.
 *
 * Pick a component, pick a variant, see every state and every token applied to
 * it, change any of them.
 *
 * Two kinds of preview, and the distinction is deliberate:
 *
 *   BASE slots get a REAL component. `KpiTile` and `PanelHeader` read
 *   `theme.component.*`, so what you see is the thing the product renders.
 *
 *   STATE slots get a swatch strip painted from the state's own tokens. A real
 *   component cannot be forced into `:hover` or `:disabled` for display, and a
 *   mock that *looked* like a hovered button would be a drawing of what someone
 *   hoped the tokens said. The strip is literally the token values, so it cannot
 *   drift from them — and each one carries its measured ratio.
 */
import React, { useMemo, useState } from "react";
import { Box, Stack, Typography, Divider, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import { Panel, KpiTile } from "../molecules.jsx";
import { EmptyState, SectionLabel, StatusChip } from "../atoms.jsx";
import { SlotField } from "./slot-field.jsx";
import { VerdictChip, Swatch, Ratio } from "./atoms.jsx";
import { ResetButton } from "./reset.jsx";
import { useTokens } from "../../lib/token-store.jsx";
import { componentRows } from "../../lib/a11y.js";
import { parseSlotRef, primitiveAliases, deref } from "../../lib/token-resolve.js";
import { requiredRatio, contrast, isHex } from "../../lib/contrast.js";

/* Which tier each slot draws from, and therefore which options to offer. */
const OPTIONS_FOR = {
  sem: (r) => Object.keys(r.semantic.light).map((key) => ({ key, value: r.semantic.light[key] })),
  space: (r) => Object.entries(r.spacing).map(([key, value]) => ({ key, value })),
  radius: (r) => Object.entries(r.radius).map(([key, value]) => ({ key, value })),
  motion: (r) => Object.entries(r.motion).map(([key, value]) => ({ key, value })),
  layout: (r) => Object.entries(r.layout).map(([key, value]) => ({ key, value })),
  type: (r) => Object.entries(r.type.styles).map(([key, value]) => ({ key, value })),
  prim: (r) => primitiveAliases(r.primitives).map((key) => ({ key, value: deref(r.primitives, key) })),
  derive: (r) => [
    { key: "onBrand", value: r.schemes.default.light.onBrand },
    ...Object.entries(r.contrastOn.light).map(([key, value]) => ({ key, value })),
  ],
  // A tint is edited by MixEditor, which needs the role list for BOTH its source
  // and its backdrop — not a single option list.
  mix: () => null,
};

/** Semantic roles, for a tint's two role pickers. */
const ROLE_OPTIONS = (r) => Object.keys(r.semantic.light).map((key) => ({ key, value: r.semantic.light[key] }));

const GROUP_OF = (slot, spec) => {
  if (spec.$type === "color") return "Colour";
  if (spec.$type === "typography") return "Type";
  if (/radius/i.test(slot)) return "Shape";
  if (/padding|gap|margin/i.test(slot)) return "Spacing";
  return "Size";
};
const GROUP_ORDER = ["Colour", "Type", "Spacing", "Shape", "Size"];

/* Real components, for base slots only. */
const PREVIEWS = {
  kpiTile: () => (
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))" } }}>
      <KpiTile label="Registered consumers" value={9673} tone="info" icon={<BoltOutlinedIcon />} />
      <KpiTile label="GTI devices" value={null} notConfigured tone="neutral" freshness="No extract yet" />
    </Box>
  ),
  panel: () => (
    <Panel title="Band registry" note="Thresholds and plausibility floors, read live from bands.js">
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Panel body — padding, radius, border and both type slots come from tier 3.
        </Typography>
      </Box>
    </Panel>
  ),
  statusChip: () => (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, alignItems: "center" }}>
      <StatusChip label="Feasible" tone="good" />
      <StatusChip label="Advisory" tone="info" />
      <StatusChip label="Expiring" tone="warning" />
      <StatusChip label="Expired" tone="danger" />
      <StatusChip label="Unknown" tone="neutral" />
    </Stack>
  ),
};

/* ── the state strip ──────────────────────────────────────────────────────── */

/**
 * One row per state, painted from that state's own tokens, with the ratio the
 * pair actually measures. Selecting a row opens its slots below.
 */
function StateStrip({ states, baseType, selected, onSelect, rowsByState }) {
  return (
    <Box sx={{ display: "grid", gap: 0.75, minWidth: 0 }}>
      {Object.entries(states).map(([sid, slots]) => {
        const fg = slots.fg;
        const bg = slots.bg === "transparent" ? null : slots.bg;
        const rows = rowsByState[sid] ?? [];
        const worst = rows
          .filter((r) => r.verdict.ratio !== undefined)
          .sort((a, b) => a.verdict.ratio - b.verdict.ratio)[0];
        const level = rows.some((r) => r.verdict.level === "fail" && !r.verdict.knownDefect)
          ? "fail"
          : rows.some((r) => r.verdict.level === "fail")
            ? "defect"
            : rows.every((r) => r.verdict.level === "exempt") && rows.length
              ? "exempt"
              : "pass";

        return (
          <Box
            key={sid}
            component="button"
            type="button"
            onClick={() => onSelect(sid)}
            aria-pressed={selected === sid}
            sx={(t) => ({
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "110px 200px minmax(0,1fr) auto" },
              alignItems: "center",
              gap: 1.5,
              width: "100%",
              p: 1,
              cursor: "pointer",
              textAlign: "start",
              background: selected === sid ? t.palette.surface.subtle : "none",
              border: `1px solid ${selected === sid ? t.palette.primary.main : t.palette.border.default}`,
              borderRadius: `${t.shape.borderRadius / 2}px`,
              minWidth: 0,
              "&:focus-visible": { outline: `2px solid ${t.palette.focusRing}`, outlineOffset: 2 },
            })}
          >
            <Typography variant="body2" sx={{ fontFamily: "ui-monospace, monospace", fontWeight: selected === sid ? 700 : 500 }}>
              {sid}
            </Typography>

            {/* painted from the state's own tokens — cannot drift from them */}
            <Box
              sx={(t) => ({
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 32,
                px: 1.5,
                borderRadius: `${t.component.button.radius}px`,
                backgroundColor: bg ?? "transparent",
                color: isHex(fg) ? fg : "inherit",
                border: `1px solid ${slots.border && slots.border !== "transparent" ? slots.border : "transparent"}`,
                outline: slots.ring ? `2px solid ${slots.ring}` : "none",
                outlineOffset: 2,
                fontSize: baseType?.size ?? 14,
                fontWeight: baseType?.weight ?? 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              })}
            >
              {bg ? "Sample label" : "Sample label (no fill)"}
            </Box>

            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5, minWidth: 0 }}>
              {["fg", "bg", "border", "ring"].map((k) =>
                slots[k] && slots[k] !== "transparent" ? (
                  <Tooltip key={k} title={`${k} · ${slots[k]}`}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                      <Swatch color={slots[k]} size={12} radius={k === "fg" ? 999 : 3} />
                      <Typography sx={(t) => ({ ...t.typography.overline, color: t.palette.text.tertiary })}>{k}</Typography>
                    </Box>
                  </Tooltip>
                ) : null,
              )}
            </Stack>

            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              {worst && (
                <Typography variant="body2">
                  <Ratio value={worst.verdict.ratio} required={worst.verdict.required ?? 4.5} />
                </Typography>
              )}
              <VerdictChip
                level={level === "defect" ? "fail" : level}
                defect={level === "defect"}
                title={rows.find((r) => r.verdict.knownDefect)?.verdict.knownDefect?.note ?? undefined}
              />
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}

/* ── the tab ──────────────────────────────────────────────────────────────── */

export function ComponentsTab({ scope, guard }) {
  const { resolved, set, revert, compare } = useTokens();
  const ids = Object.keys(resolved.componentDefs ?? {});
  const [selected, setSelected] = useState(ids[0] ?? null);
  const [variant, setVariant] = useState(null);
  const [state, setState] = useState(null);

  if (!ids.length)
    return (
      <EmptyState
        title="No component tokens declared"
        body="Add a `components` block to scripts/figma-tokens.json. Each slot aliases a lower tier; see the $note in that file for the reference syntax."
      />
    );

  const def = resolved.componentDefs[selected];
  const values = resolved.components[scope.mode][selected] ?? {};
  const variantDefs = def.$variants ?? {};
  const variantIds = Object.keys(variantDefs).filter((k) => !k.startsWith("$"));
  const vid = variantIds.includes(variant) ? variant : variantIds[0] ?? null;
  const vdef = vid ? variantDefs[vid] : null;
  const stateIds = vdef ? Object.keys(vdef.$states ?? {}).filter((k) => !k.startsWith("$")) : [];
  const sid = stateIds.includes(state) ? state : stateIds[0] ?? null;

  const rows = componentRows(resolved, selected, scope);
  const rowsByState = useMemo(() => {
    const out = {};
    for (const r of rows) if (r.variant === vid && r.state) (out[r.state] ??= []).push(r);
    return out;
  }, [rows, vid]);

  const baseSpecs = Object.entries({ ...def, ...(def.$base ?? {}) }).filter(
    ([k, v]) => !k.startsWith("$") && v && typeof v === "object" && "$value" in v,
  );

  const grouped = useMemo(() => {
    const out = {};
    for (const [slot, spec] of baseSpecs) (out[GROUP_OF(slot, spec)] ??= []).push([slot, spec]);
    return out;
  }, [selected, baseSpecs.length]);

  const baseType = values.labelType ?? values.valueType;
  const Preview = PREVIEWS[selected];
  const failing = rows.filter((r) => r.verdict.level === "fail");

  /** Declared/derived pairs involving one base slot. */
  const basePairsFor = (slot) =>
    (def.$pairs ?? [])
      .filter((p) => p.fg === slot || p.bg === slot)
      .map((p) => {
        const other = p.fg === slot ? p.bg : p.fg;
        return {
          label: p.fg === slot ? `on ${other}` : `under ${other}`,
          against: other === "@surface" ? resolved.semantic[scope.mode]["surface/raised"] : values[other],
          required: requiredRatio(p.kind, p.typeToken, resolved.type.styles),
        };
      })
      .filter((p) => p.required !== null);

  /** For a state slot, the other side of its auto-derived pair. */
  const statePairsFor = (slot, stateSlots) => {
    if (!vdef || !sid) return [];
    const surface = resolved.semantic[scope.mode]["surface/raised"];
    const bg = stateSlots.bg === "transparent" ? surface : stateSlots.bg;
    if (slot === "fg") return [{ label: "on bg", against: bg, required: requiredRatio("text", undefined, resolved.type.styles) }];
    if (slot === "bg") return [{ label: "under fg", against: stateSlots.fg, required: requiredRatio("text", undefined, resolved.type.styles) }];
    if (slot === "ring") return [{ label: "on the surface behind", against: surface, required: 3 }];
    // A transparent border has no pair to judge — showing one would render an
    // UNKNOWN verdict for a slot that is deliberately absent, which reads as a
    // gap in the contract rather than the intended "there is no edge here".
    if (slot === "border" && def.$borderRole === "control" && stateSlots.border !== "transparent")
      return [{ label: "on bg", against: bg, required: 3 }];
    return [];
  };

  const slotPath = (spec, base) =>
    scope.mode === "dark" && spec.$darkValue !== undefined ? `${base}.$darkValue` : `${base}.$value`;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "220px minmax(0,1fr)" }, gap: 2, minWidth: 0 }}>
      {/* component list */}
      <Panel
        title="Components"
        note={`${ids.length} declared`}
        action={<ResetButton prefix="components" label="Reset all components" iconOnly />}
      >
        <Box sx={{ p: 1, maxHeight: 640, overflowY: "auto", minWidth: 0 }}>
          {ids.map((id) => {
            const d = resolved.componentDefs[id];
            const bad = componentRows(resolved, id, scope).filter((r) => r.verdict.level === "fail");
            const nBase = Object.keys({ ...d, ...(d.$base ?? {}) }).filter((k) => !k.startsWith("$")).length;
            const nVar = Object.keys(d.$variants ?? {}).filter((k) => !k.startsWith("$")).length;
            const nState = Object.values(d.$variants ?? {}).reduce(
              (n, v) => n + Object.keys(v.$states ?? {}).filter((k) => !k.startsWith("$")).length,
              0,
            );
            return (
              <Box
                key={id}
                component="button"
                type="button"
                onClick={() => {
                  setSelected(id);
                  setVariant(null);
                  setState(null);
                }}
                aria-pressed={selected === id}
                sx={(t) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                  px: 1,
                  py: 0.75,
                  cursor: "pointer",
                  background: selected === id ? t.palette.surface.subtle : "none",
                  border: 0,
                  borderRadius: `${t.shape.borderRadius / 2}px`,
                  textAlign: "start",
                  minWidth: 0,
                  "&:focus-visible": { outline: `2px solid ${t.palette.focusRing}`, outlineOffset: -2 },
                })}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: selected === id ? 600 : 400 }}>
                    {d.$label ?? id}
                  </Typography>
                  <Typography sx={(t) => ({ ...t.typography.overline, color: t.palette.text.tertiary })}>
                    {nBase} base{nVar ? ` · ${nVar} var · ${nState} states` : ""}
                  </Typography>
                </Box>
                {bad.length > 0 && <VerdictChip level="fail" defect={bad.every((b) => b.verdict.knownDefect)} />}
              </Box>
            );
          })}
        </Box>
      </Panel>

      <Box sx={{ display: "grid", gap: 2, minWidth: 0, alignContent: "start" }}>
        {/* real-component preview, base slots only */}
        {Preview && (
          <Panel title={`${def.$label ?? selected} — live`} note={def.$note}>
            <Box sx={(t) => ({ p: 2, backgroundColor: t.palette.surface.canvas })}>
              <Preview />
            </Box>
          </Panel>
        )}

        {/* variants and states */}
        {vid && (
          <Panel
            title="Variants and states"
            note={
              failing.length
                ? `${failing.length} pair${failing.length > 1 ? "s" : ""} short in ${scope.scheme} · ${scope.mode}`
                : `All pairs pass in ${scope.scheme} · ${scope.mode}`
            }
            action={
              <ResetButton
                prefix={`components.${selected}.$variants.${vid}`}
                label={`Reset ${vdef?.$label ?? vid}`}
                iconOnly
              />
            }
          >
            <Box sx={{ p: 2, minWidth: 0 }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={vid}
                onChange={(_, v) => {
                  if (v) {
                    setVariant(v);
                    setState(null);
                  }
                }}
                aria-label="Variant"
                sx={{ mb: 1.5, flexWrap: "wrap" }}
              >
                {variantIds.map((v) => (
                  <ToggleButton key={v} value={v} sx={{ textTransform: "none" }}>
                    {variantDefs[v].$label ?? v}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {vdef.$knownDefect && (
                <Box
                  sx={(t) => ({
                    mb: 1.5,
                    p: 1.25,
                    borderRadius: `${t.shape.borderRadius / 2}px`,
                    backgroundColor: t.palette.band.warning.bg,
                    color: t.palette.band.warning.fg,
                  })}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Known defect — awaiting a decision</Typography>
                  <Typography variant="body2">{vdef.$knownDefect.note}</Typography>
                </Box>
              )}

              <StateStrip
                states={values.variants?.[vid]?.states ?? {}}
                baseType={baseType}
                selected={sid}
                onSelect={setState}
                rowsByState={rowsByState}
              />

              {sid && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                    <SectionLabel sx={{ mb: 0 }}>{`${vdef.$label ?? vid} · ${sid}`}</SectionLabel>
                    <Box sx={{ flex: 1 }} />
                    <ResetButton
                      prefix={`components.${selected}.$variants.${vid}.$states.${sid}`}
                      label={`Reset ${sid}`}
                    />
                  </Stack>
                  {Object.entries(vdef.$states[sid])
                    .filter(([k]) => !k.startsWith("$"))
                    .map(([slot, spec]) => {
                      const base = `components.${selected}.$variants.${vid}.$states.${sid}.${slot}`;
                      const path = slotPath(spec, base);
                      const cmp = compare(path);
                      const ref = scope.mode === "dark" && spec.$darkValue !== undefined ? spec.$darkValue : spec.$value;
                      const tier = parseSlotRef(ref)?.tier;
                      const stateSlots = values.variants?.[vid]?.states?.[sid] ?? {};
                      return (
                        <SlotField
                          key={slot}
                          component={selected}
                          slot={slot}
                          spec={spec}
                          ref={ref}
                          resolved={stateSlots[slot]}
                          original={cmp.original}
                          isOverridden={cmp.isOverridden}
                          onChange={(next) => set(path, next)}
                          onRevert={() => revert(path)}
                          options={tier ? OPTIONS_FOR[tier]?.(resolved) : null}
                          roles={ROLE_OPTIONS(resolved)}
                          pairs={guard === "off" ? [] : statePairsFor(slot, stateSlots)}
                          guard={guard}
                        />
                      );
                    })}
                </>
              )}
            </Box>
          </Panel>
        )}

        {/* base slots */}
        <Panel
          title="Base tokens"
          action={<ResetButton prefix={`components.${selected}`} label={`Reset ${def.$label ?? selected}`} />}
          note={
            variantIds.length
              ? "Shared by every variant and state above."
              : (def.$pairs ?? []).length
                ? `${def.$pairs.length} declared pairs`
                : "No pairs declared — these slots are UNCHECKED, which is not the same as compliant"
          }
        >
          <Box sx={{ p: 2, minWidth: 0 }}>
            {GROUP_ORDER.filter((g) => grouped[g]).map((g, gi) => (
              <Box key={g} sx={{ minWidth: 0 }}>
                {gi > 0 && <Divider sx={{ my: 1.5 }} />}
                <SectionLabel>{g}</SectionLabel>
                {grouped[g].map(([slot, spec]) => {
                  const base = `components.${selected}.${def.$base?.[slot] ? "$base." : ""}${slot}`;
                  const path = slotPath(spec, base);
                  const cmp = compare(path);
                  const ref = scope.mode === "dark" && spec.$darkValue !== undefined ? spec.$darkValue : spec.$value;
                  const tier = parseSlotRef(ref)?.tier;
                  return (
                    <SlotField
                      key={slot}
                      component={selected}
                      slot={slot + (path.endsWith("$darkValue") ? " (dark)" : "")}
                      spec={spec}
                      ref={ref}
                      resolved={values[slot]}
                      original={cmp.original}
                      isOverridden={cmp.isOverridden}
                      onChange={(next) => set(path, next)}
                      onRevert={() => revert(path)}
                      options={tier ? OPTIONS_FOR[tier]?.(resolved) : null}
                      roles={ROLE_OPTIONS(resolved)}
                      pairs={guard === "off" ? [] : basePairsFor(slot)}
                      guard={guard}
                    />
                  );
                })}
              </Box>
            ))}
          </Box>
        </Panel>
      </Box>
    </Box>
  );
}
