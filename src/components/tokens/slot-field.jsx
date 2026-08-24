/**
 * Editing one component slot.
 *
 * A slot is a REFERENCE, not a value — `{sem:surface/raised}`, `{space:4}`,
 * `{type:label/m}`. So this edits the reference and shows what it currently
 * resolves to, rather than letting someone type a hex into a component and
 * quietly sever it from the system. The one exception is a literal, which is
 * shown as a literal and labelled as one, because a literal here is a value the
 * rest of the token system cannot reason about.
 *
 * Colour slots only offer SEMANTIC roles. Offering primitives would let a
 * component skip the tier that knows about light and dark — the mistake that
 * looks correct and breaks in dark mode.
 */
import React from "react";
import { Autocomplete, Box, MenuItem, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Swatch, VerdictChip, Ratio, FieldLabel, OverrideMark } from "./atoms.jsx";
import { contrast, isHex } from "../../lib/contrast.js";
import { parseSlotRef } from "../../lib/token-resolve.js";

const TIER_LABEL = {
  mix: "tint",
  sem: "semantic role",
  space: "spacing step",
  radius: "radius",
  motion: "duration",
  layout: "layout value",
  type: "type style",
  prim: "primitive",
};

export function SlotField({
  component,
  slot,
  spec,
  /** The reference currently stored, e.g. "{sem:surface/raised}" or 160. */
  ref: refValue,
  /** What that reference resolves to in the scope being judged. */
  resolved,
  original,
  isOverridden,
  onChange,
  onRevert,
  /** Options for the tier this slot draws from: [{ key, value }]. */
  options,
  /** Semantic roles, for a tint's source and backdrop: [{ key, value }]. */
  roles,
  /** Declared pairs involving this slot, already judged. */
  pairs = [],
  guard = "warn",
}) {
  const parsed = parseSlotRef(refValue);
  const tier = parsed?.tier ?? null;
  const isColor = spec.$type === "color";
  const isType = spec.$type === "typography";

  /** Which options would break a declared pair if chosen. */
  const scored = (options ?? []).map((o) => {
    const failures = isColor
      ? pairs
          .filter((p) => p.against && isHex(o.value))
          .map((p) => ({ ...p, ratio: contrast(o.value, p.against) }))
          .filter((p) => p.ratio < p.required)
      : [];
    return { ...o, failures, blocked: guard === "enforce" && failures.length > 0 };
  });

  const current = scored.find((o) => o.key === parsed?.key);

  return (
    <Box sx={{ py: 1.25, minWidth: 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", minWidth: 0, mb: 0.25 }}>
        <Typography variant="body2" sx={{ fontFamily: "ui-monospace, monospace", fontWeight: 600, minWidth: 0 }}>
          {slot}
        </Typography>
        <Typography sx={(t) => ({ ...t.typography.overline, color: t.palette.text.tertiary })}>
          {tier ? TIER_LABEL[tier] : "literal"}
        </Typography>
        <Box sx={{ flex: 1, minWidth: 4 }} />
        {isOverridden && <OverrideMark original={String(original)} onRevert={onRevert} what={`${component}.${slot}`} />}
      </Stack>

      {spec.$note && (
        <Typography variant="body2" sx={{ color: "text.tertiary", mb: 0.75 }}>
          {spec.$note}
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1, minWidth: 0 }}>
        {isColor && <Swatch color={resolved} size={20} radius={4} />}

        {/* A literal: edit it directly, and say so. */}
        {!tier ? (
          <TextField
            size="small"
            type={typeof refValue === "number" ? "number" : "text"}
            value={refValue}
            onChange={(e) => {
              const v = typeof refValue === "number" ? Number(e.target.value) : e.target.value;
              if (typeof v !== "number" || Number.isFinite(v)) onChange(v);
            }}
            slotProps={{ htmlInput: { "aria-label": `${slot} literal value` } }}
            sx={{ width: 132 }}
          />
        ) : tier === "mix" ? (
          /* A tint has three parts and needs three controls. Rendering it through
             the single-value picker gave an empty, uneditable combobox — every
             tint slot in the product was dead. */
          <MixEditor
            slot={slot}
            parsed={parsed}
            roles={roles ?? []}
            onChange={(next) => onChange(next)}
          />
        ) : isColor || isType ? (
          <Autocomplete
            size="small"
            disableClearable
            options={scored}
            value={current ?? null}
            getOptionLabel={(o) => o.key ?? ""}
            isOptionEqualToValue={(a, b) => a.key === b.key}
            getOptionDisabled={(o) => o.blocked}
            onChange={(_, next) => next && !next.blocked && onChange(`{${tier}:${next.key}}`)}
            filterOptions={(opts, st) => {
              const q = st.inputValue.trim().toLowerCase();
              const m = q ? opts.filter((o) => o.key.toLowerCase().includes(q)) : opts;
              // Failing options sink rather than vanish — hiding them makes the
              // palette look smaller than it is.
              return [...m].sort((a, b) => Number(a.failures.length > 0) - Number(b.failures.length > 0));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{ "& input": { fontFamily: "ui-monospace, monospace" } }}
              />
            )}
            renderOption={(props, o) => {
              const { key, ...rest } = props;
              return (
                <Box component="li" key={key} {...rest} sx={{ display: "flex", gap: 1, alignItems: "center", minWidth: 0 }}>
                  {isColor && <Swatch color={o.value} size={14} />}
                  <Typography variant="body2" sx={{ fontFamily: "ui-monospace, monospace", flex: 1, minWidth: 0 }}>
                    {o.key}
                  </Typography>
                  {isType && (
                    <Typography variant="body2" sx={{ color: "text.tertiary" }}>
                      {o.value?.size}/{o.value?.weight}
                    </Typography>
                  )}
                  {o.failures.length > 0 && (
                    <Tooltip title={o.failures.map((f) => `${f.label}: ${f.ratio.toFixed(2)} needs ${f.required}`).join(" · ")}>
                      <Box component="span"><VerdictChip level="fail" /></Box>
                    </Tooltip>
                  )}
                </Box>
              );
            }}
            sx={{ minWidth: 232 }}
          />
        ) : (
          /* A scale step — a fixed, short list, so a select beats a combobox. */
          <Select
            size="small"
            value={parsed?.key ?? ""}
            onChange={(e) => onChange(`{${tier}:${e.target.value}}`)}
            aria-label={`${slot} ${TIER_LABEL[tier]}`}
            sx={{ minWidth: 150 }}
          >
            {(options ?? []).map((o) => (
              <MenuItem key={o.key} value={o.key}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <span style={{ fontFamily: "ui-monospace, monospace" }}>{o.key}</span>
                  <Typography variant="body2" sx={{ color: "text.tertiary" }}>
                    {String(o.value)}
                    {typeof o.value === "number" ? "px" : ""}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        )}

        <Typography variant="body2" sx={{ color: "text.tertiary", fontFamily: "ui-monospace, monospace" }}>
          →{" "}
          {isType
            ? `${resolved?.size}/${resolved?.weight}/${resolved?.lineHeight}`
            : `${resolved}${typeof resolved === "number" ? "px" : ""}`}
        </Typography>
      </Stack>

      {pairs.length > 0 && (
        <Stack spacing={0.25} sx={{ mt: 0.75 }}>
          {pairs.map((p, i) => {
            const ratio = isHex(resolved) && isHex(p.against) ? contrast(resolved, p.against) : null;
            return (
              <Stack key={`${p.label}|${i}`} direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
                <Swatch color={p.against} size={11} />
                <Typography variant="body2" sx={{ color: "text.secondary", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.label}
                </Typography>
                {ratio === null ? (
                  <VerdictChip level="unknown" />
                ) : (
                  <>
                    <Typography variant="body2"><Ratio value={ratio} required={p.required} /></Typography>
                    <VerdictChip level={ratio >= p.required ? "pass" : "fail"} />
                  </>
                )}
              </Stack>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}


/* ── tint editor ──────────────────────────────────────────────────────────── */

/**
 * `{mix:role,over,pct}` — three values, so three controls.
 *
 * A tint is the one slot form that cannot be a single choice: it is a colour, a
 * backdrop, and a percentage. The first version routed it through the same
 * single-value picker as everything else, which produced an empty combobox and
 * left every tinted state in the product uneditable.
 *
 * The backdrop is part of the token on purpose. A translucent value has no
 * contrast ratio until you know what is behind it, so naming it here is what
 * lets the accessibility engine judge the pair at all.
 */
function MixEditor({ slot, parsed, roles, onChange }) {
  const emit = (patch) => {
    const next = { key: parsed.key, over: parsed.over, pct: parsed.pct, ...patch };
    onChange(`{mix:${next.key},${next.over},${Math.max(0, Math.min(100, Math.round(next.pct)))}}`);
  };

  const rolePicker = (which, value, label) => (
    <Autocomplete
      size="small"
      disableClearable
      options={roles}
      value={roles.find((r) => r.key === value) ?? null}
      getOptionLabel={(o) => o.key ?? ""}
      isOptionEqualToValue={(a, b) => a.key === b.key}
      onChange={(_, next) => next && emit({ [which]: next.key })}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          slotProps={{ ...params.slotProps }}
          sx={{ "& input": { fontFamily: "ui-monospace, monospace" } }}
        />
      )}
      renderOption={(props, o) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={key} {...rest} sx={{ display: "flex", gap: 1, alignItems: "center", minWidth: 0 }}>
            <Swatch color={o.value} size={14} />
            <Typography variant="body2" sx={{ fontFamily: "ui-monospace, monospace", minWidth: 0 }}>
              {o.key}
            </Typography>
          </Box>
        );
      }}
      sx={{ minWidth: 196 }}
    />
  );

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1, minWidth: 0 }}>
      {rolePicker("key", parsed.key, "Tint")}
      {rolePicker("over", parsed.over, "Over")}
      <TextField
        size="small"
        type="number"
        label="%"
        value={parsed.pct}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) emit({ pct: n });
        }}
        slotProps={{ htmlInput: { "aria-label": `${slot} tint percentage`, min: 0, max: 100 } }}
        sx={{ width: 92 }}
      />
    </Stack>
  );
}
