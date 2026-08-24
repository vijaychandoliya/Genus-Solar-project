/**
 * Reset — undoing an edit at whatever scope the mistake happened at.
 *
 * Three scopes, because a mistake has a size:
 *
 *   one token    the revert arrow beside an edited slot
 *   one scope    this component, this variant, this state, this tier
 *   everything   the draft bar
 *
 * A person who mis-set one padding should not have to choose between hunting it
 * down and losing an afternoon's work, which is what a lone "discard all" forces.
 *
 * Every reset is UNDOABLE — the store pushes the previous draft onto its history
 * — so these buttons are not destructive. They say so, because a button that
 * looks like it deletes work will not be pressed by someone who is unsure, and
 * that hesitation is exactly the state a reset control exists to relieve.
 */
import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { useTokens } from "../../lib/token-store.jsx";
import { Swatch } from "./atoms.jsx";
import { isHex } from "../../lib/contrast.js";

/** A value rendered as itself — swatch for a colour, px for a number. */
function Value({ v }) {
  if (v === undefined) return <Typography variant="body2" sx={{ color: "text.tertiary" }}>—</Typography>;
  if (v && typeof v === "object")
    return (
      <Typography variant="body2" sx={{ fontFamily: "ui-monospace, monospace" }}>
        {v.size !== undefined ? `${v.size}/${v.weight}/${v.lineHeight}` : JSON.stringify(v)}
      </Typography>
    );
  const s = String(v);
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", minWidth: 0 }}>
      {isHex(s) && <Swatch color={s} size={12} radius={3} />}
      <Typography variant="body2" sx={{ fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap" }}>
        {s}
        {typeof v === "number" ? "px" : ""}
      </Typography>
    </Stack>
  );
}

/**
 * Reset every override under `prefix`, or the whole draft when `prefix` is null.
 *
 * States its scope in the label and its size in the count, because "Reset" with
 * no object is the control people are most afraid of pressing. Confirms only
 * when there is enough at stake to be worth a second look.
 */
export function ResetButton({
  prefix = null,
  label = "Reset",
  confirmOver = 3,
  size = "small",
  variant = "outlined",
  iconOnly = false,
}) {
  const { changedUnder, revertUnder, resetAll } = useTokens();
  const affected = changedUnder(prefix);
  const [open, setOpen] = useState(false);

  const run = () => {
    if (prefix) revertUnder(prefix);
    else resetAll();
    setOpen(false);
  };

  if (affected.length === 0) {
    // Rendered but inert, rather than hidden. A control that appears only once
    // there is something to undo is a control nobody knows exists until they
    // have already made the mistake.
    const disabled = (
      <span>
        {iconOnly ? (
          <IconButton size={size} disabled aria-label={`${label} — nothing changed`}>
            <RestartAltOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        ) : (
          <Button size={size} variant={variant} disabled startIcon={<RestartAltOutlinedIcon />}>
            {label}
          </Button>
        )}
      </span>
    );
    return <Tooltip title="Nothing changed here">{disabled}</Tooltip>;
  }

  const noun = `${affected.length} token${affected.length === 1 ? "" : "s"}`;
  const trigger = iconOnly ? (
    <IconButton
      size={size}
      onClick={() => (affected.length > confirmOver ? setOpen(true) : run())}
      aria-label={`${label} — ${noun}`}
    >
      <RestartAltOutlinedIcon sx={{ fontSize: 17 }} />
    </IconButton>
  ) : (
    <Button
      size={size}
      variant={variant}
      startIcon={<RestartAltOutlinedIcon />}
      onClick={() => (affected.length > confirmOver ? setOpen(true) : run())}
    >
      {label} · {noun}
    </Button>
  );

  return (
    <>
      <Tooltip title={`Put ${noun} back to the shipped value. Undo restores the draft.`}>{trigger}</Tooltip>
      <ConfirmReset open={open} onClose={() => setOpen(false)} onConfirm={run} paths={affected} label={label} />
    </>
  );
}

function ConfirmReset({ open, onClose, onConfirm, paths, label }) {
  const { source, resolved } = useTokens();
  const at = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {label} — {paths.length} token{paths.length === 1 ? "" : "s"}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
          These go back to the value the design system ships. <strong>Undo restores the draft</strong>, so this
          is reversible — nothing is written to disk either way.
        </Typography>
        <Box sx={{ display: "grid", gap: 0.75, maxHeight: 320, overflowY: "auto", minWidth: 0 }}>
          {paths.map((p) => (
            <Stack key={p} direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontFamily: "ui-monospace, monospace", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {p}
              </Typography>
              <Value v={at(resolved.source, p)} />
              <Typography variant="body2" sx={{ color: "text.tertiary" }}>→</Typography>
              <Value v={at(source, p)} />
            </Stack>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text">
          Keep my changes
        </Button>
        <Button onClick={onConfirm} variant="contained">
          Reset {paths.length} token{paths.length === 1 ? "" : "s"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Every edit in the draft, with a per-row revert.
 *
 * The most direct answer to "I changed something by accident and I want it
 * back": rather than remembering where it was, read the list and put that one
 * row back.
 */
export function ChangeList({ maxHeight = 260 }) {
  const { changeList, revert } = useTokens();

  if (!changeList.length)
    return (
      <Typography variant="body2" sx={{ color: "text.tertiary" }}>
        No changes yet. Every edit will be listed here with its original value and a way back.
      </Typography>
    );

  return (
    <Box sx={{ display: "grid", gap: 0.5, maxHeight, overflowY: "auto", minWidth: 0 }}>
      {changeList.map(({ path, from, to }) => (
        <Stack
          key={path}
          direction="row"
          spacing={1}
          sx={(t) => ({
            alignItems: "center",
            minWidth: 0,
            p: 0.75,
            borderRadius: `${t.shape.borderRadius / 2}px`,
            border: `1px solid ${t.palette.border.default}`,
          })}
        >
          <Typography
            variant="body2"
            sx={{ fontFamily: "ui-monospace, monospace", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            title={path}
          >
            {path}
          </Typography>
          <Value v={from} />
          <Typography variant="body2" sx={{ color: "text.tertiary" }}>→</Typography>
          <Value v={to} />
          <Tooltip title={`Put this one back to ${String(from)}`}>
            <IconButton size="small" onClick={() => revert(path)} aria-label={`Revert ${path}`}>
              <UndoOutlinedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ))}
    </Box>
  );
}
