/**
 * Choosing what a semantic token points at.
 *
 * A semantic token is an ALIAS — `surface/raised` means "whatever neutral the
 * mode calls for", not a hex. Letting someone type a hex here would quietly
 * destroy the tier: the role would stop being a role. So this offers primitives
 * only, and it offers them with their consequences attached.
 *
 * Enforcement blocks on `fail` and never on `unknown`. A pair the engine cannot
 * judge is a gap in the contract, not a mistake by the person editing, and
 * blocking on it is how you teach people to switch the guard off.
 */
import React, { useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Stack,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { Swatch, VerdictChip, Ratio, FieldLabel, OverrideMark } from "./atoms.jsx";
import { contrast } from "../../lib/contrast.js";

export function AliasPicker({
  label,
  /** Current alias, e.g. "neutral.800". */
  value,
  original,
  isOverridden,
  onChange,
  onRevert,
  /** [{ alias, hex }] — every primitive this token may point at. */
  options,
  /** Declared pairs this token participates in: [{ label, against, required, side }]. */
  pairs = [],
  guard = "warn",
}) {
  const [open, setOpen] = useState(false);

  /** Score every option against every declared pair, once. */
  const scored = useMemo(() => {
    return options.map((o) => {
      const failures = [];
      for (const p of pairs) {
        if (!p.against || !o.hex) continue;
        const ratio = contrast(o.hex, p.against);
        if (ratio < p.required) failures.push({ ...p, ratio });
      }
      const worst = pairs.length
        ? Math.min(...pairs.filter((p) => p.against && o.hex).map((p) => contrast(o.hex, p.against)))
        : null;
      return { ...o, failures, worst, blocked: guard === "enforce" && failures.length > 0 };
    });
  }, [options, pairs, guard]);

  const current = scored.find((o) => o.alias === value);
  const blockedCount = scored.filter((o) => o.blocked).length;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, minWidth: 0 }}>
        <FieldLabel hint={pairs.length ? `${pairs.length} declared pair${pairs.length > 1 ? "s" : ""}` : "unchecked"}>
          {label}
        </FieldLabel>
        <Box sx={{ flex: 1, minWidth: 4 }} />
        {isOverridden && <OverrideMark original={original} onRevert={onRevert} what={label} />}
      </Stack>

      <Autocomplete
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        options={scored}
        value={current ?? null}
        disableClearable
        getOptionLabel={(o) => o.alias ?? ""}
        isOptionEqualToValue={(a, b) => a.alias === b.alias}
        getOptionDisabled={(o) => o.blocked}
        onChange={(_, next) => next && !next.blocked && onChange(next.alias)}
        // Failing options sink to the bottom rather than disappearing: hiding them
        // makes the list look like the palette has fewer colours than it has.
        filterOptions={(opts, state) => {
          const q = state.inputValue.trim().toLowerCase();
          const matched = q ? opts.filter((o) => o.alias.toLowerCase().includes(q)) : opts;
          return [...matched].sort((a, b) => Number(a.failures.length > 0) - Number(b.failures.length > 0));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder="Search primitives…"
            // MUI v9 passes the input wiring down as `params.slotProps.input`
            // (anchor ref, mousedown handler, end adornment) and TextField no
            // longer accepts the old `InputProps`. Spreading params' slotProps and
            // merging into `.input` is what keeps the swatch adornment without
            // dropping the wiring Autocomplete needs to position its popper.
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps?.input,
                startAdornment: current ? <Swatch color={current.hex} size={16} /> : null,
              },
            }}
            sx={{ "& input": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" } }}
          />
        )}
        renderOption={(props, o) => {
          const { key, ...rest } = props;
          return (
            <Box component="li" key={key} {...rest} sx={{ display: "flex", gap: 1, alignItems: "center", minWidth: 0 }}>
              <Swatch color={o.hex} size={16} />
              <Typography variant="body2" sx={{ fontFamily: "ui-monospace, monospace", minWidth: 0, flex: 1 }}>
                {o.alias}
              </Typography>
              {o.failures.length > 0 && (
                <Tooltip
                  title={o.failures
                    .map((f) => `${f.label}: ${f.ratio.toFixed(2)} needs ${f.required}`)
                    .join(" · ")}
                >
                  <Stack direction="row" spacing={0.5}>
                    {o.worst !== null && (
                      <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums", color: "text.tertiary" }}>
                        {o.worst.toFixed(2)}
                      </Typography>
                    )}
                    <VerdictChip level="fail" />
                  </Stack>
                </Tooltip>
              )}
            </Box>
          );
        }}
      />

      {/* What the current choice does, stated rather than implied. */}
      {current && pairs.length > 0 && (
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {pairs.map((p, i) => {
            const ratio = p.against && current.hex ? contrast(current.hex, p.against) : 0;
            return (
              <Stack key={`${p.label}|${p.against}|${i}`} direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
                <Swatch color={p.against} size={12} />
                <Typography variant="body2" sx={{ color: "text.secondary", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.label}
                </Typography>
                <Typography variant="body2">
                  <Ratio value={ratio} required={p.required} />
                </Typography>
                <VerdictChip level={ratio >= p.required ? "pass" : "fail"} />
              </Stack>
            );
          })}
        </Stack>
      )}

      {guard === "enforce" && blockedCount > 0 && (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 0.75 }}>
          <WarningAmberOutlinedIcon sx={(t) => ({ fontSize: 14, color: t.palette.band.warning.fg })} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {blockedCount} of {scored.length} options are blocked by enforcement — each states the pair it fails.
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
