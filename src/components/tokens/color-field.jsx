/**
 * Editing one colour, with the consequences visible while you type.
 *
 * Two editors on purpose. The native picker is for exploring — you drag and the
 * ratios move. The hex box is for landing on an exact value, which is what a
 * design system actually needs: "a bit darker" is not a token.
 *
 * The picker commits on `change` (pointer-up), not `input` (every pixel of the
 * drag). Each commit rebuilds the MUI theme and re-renders the tree under it —
 * 0.164 ms for the theme, but a real React commit for the app — so committing
 * per frame would make the drag stutter on a large screen. `input` still drives
 * the LOCAL preview, so the ratios update live while you drag; only the product
 * repaint waits for release. When the CSS-variable migration lands (§1.1 / M1)
 * this distinction can go away.
 */
import React, { useEffect, useState } from "react";
import { Box, Stack, TextField, Typography, Tooltip, IconButton, Button } from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { isHex, contrast } from "../../lib/contrast.js";
import { FieldLabel, OverrideMark, VerdictChip, Ratio, Swatch } from "./atoms.jsx";

export function ColorField({
  label,
  value,
  original,
  isOverridden,
  onChange,
  onRevert,
  /** Pairs this colour participates in — [{ label, against, required }]. */
  pairs = [],
  /** Existing tokens that would satisfy a failing pair. */
  suggestions = [],
  onPickSuggestion,
  disabled = false,
  blockedReason,
}) {
  const [draft, setDraft] = useState(value);
  const [live, setLive] = useState(value);

  // Re-sync when the resolved value changes underneath us — undo, revert, or an
  // edit to a primitive this token aliases.
  useEffect(() => {
    setDraft(value);
    setLive(value);
  }, [value]);

  const valid = isHex(draft);
  const preview = isHex(live) ? live : value;

  const commit = (next) => {
    if (!isHex(next) || next.toLowerCase() === String(value).toLowerCase()) return;
    onChange(next.toLowerCase());
  };

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, minWidth: 0 }}>
        <FieldLabel>{label}</FieldLabel>
        <Box sx={{ flex: 1, minWidth: 4 }} />
        {isOverridden && <OverrideMark original={original} onRevert={onRevert} what={label} />}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
        <Box
          component="input"
          type="color"
          aria-label={`${label} colour picker`}
          value={isHex(preview) ? preview : "#000000"}
          disabled={disabled}
          onInput={(e) => setLive(e.target.value)}
          onChange={(e) => {
            setLive(e.target.value);
            setDraft(e.target.value);
            commit(e.target.value);
          }}
          sx={(t) => ({
            width: 40,
            height: 32,
            flex: "0 0 40px",
            padding: 0,
            border: `1px solid ${t.palette.border.default}`,
            borderRadius: `${t.shape.borderRadius / 2}px`,
            background: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            "&::-webkit-color-swatch-wrapper": { padding: "2px" },
            "&::-webkit-color-swatch": { border: "none", borderRadius: 2 },
          })}
        />
        <TextField
          size="small"
          value={draft}
          disabled={disabled}
          error={!valid}
          helperText={!valid ? "Needs #rgb or #rrggbb" : undefined}
          onChange={(e) => {
            setDraft(e.target.value);
            if (isHex(e.target.value)) setLive(e.target.value);
          }}
          onBlur={() => (valid ? commit(draft) : setDraft(value))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && valid) commit(draft);
            if (e.key === "Escape") setDraft(value);
          }}
          slotProps={{ htmlInput: { "aria-label": `${label} hex value`, spellCheck: false } }}
          sx={{ width: 132, "& input": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" } }}
        />
        <Tooltip title="Copy hex">
          <IconButton
            size="small"
            aria-label="Copy hex"
            onClick={() => navigator.clipboard?.writeText(String(value))}
          >
            <ContentCopyOutlinedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {blockedReason && (
        <Typography variant="body2" sx={(t) => ({ color: t.palette.band.critical.fg, mt: 0.75 })}>
          {blockedReason}
        </Typography>
      )}

      {pairs.length > 0 && (
        <Stack spacing={0.5} sx={{ mt: 1.25, minWidth: 0 }}>
          {pairs.map((p, i) => {
            const ratio = isHex(preview) && isHex(p.against) ? contrast(preview, p.against) : 0;
            const ok = ratio >= p.required;
            return (
              <Stack key={`${p.label}|${p.against}|${i}`} direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
                <Swatch color={p.against} size={12} />
                <Typography variant="body2" sx={{ color: "text.secondary", minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.label}
                </Typography>
                <Typography variant="body2">
                  <Ratio value={ratio} required={p.required} />
                </Typography>
                <VerdictChip level={ok ? "pass" : "fail"} />
              </Stack>
            );
          })}
        </Stack>
      )}

      {suggestions.length > 0 && (
        <Box sx={{ mt: 1.25 }}>
          <FieldLabel hint="existing tokens that would clear it">Suggestions</FieldLabel>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
            {suggestions.map((s) => (
              <Button
                key={s.token}
                size="small"
                variant="outlined"
                onClick={() => onPickSuggestion?.(s)}
                startIcon={<Swatch color={s.hex} size={12} />}
                sx={{ textTransform: "none" }}
              >
                {s.token} · {s.ratio.toFixed(2)}
              </Button>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
