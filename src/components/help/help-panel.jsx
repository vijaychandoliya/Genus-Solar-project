/**
 * The in-app Help panel.
 *
 * Opens on any screen and shows that screen's guide — the same words as
 * docs/screen-guides, projected by scripts/build-help.mjs. One source, so the
 * product and its documentation cannot tell a user different things.
 *
 * ── Why blocks and not markdown ───────────────────────────────────────────
 * The guides are parsed to structured blocks at BUILD time, so this renders
 * with our own components and tokens rather than pulling in a markdown library
 * and then fighting its default styles. A malformed guide also fails the build
 * instead of the panel.
 *
 * ── Why it opens on "What you can do here" ────────────────────────────────
 * A person opening Help has a task, not a curiosity. Use cases first, common
 * questions second, troubleshooting third; the reference material — who the
 * screen is for, how to reach it — sits below, closed.
 */
import { useEffect, useState } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import { loadHelp, helpFor } from "../../lib/help/index.js";

/* ── inline tokens ────────────────────────────────────────────────────────── */

function Inline({ tokens, onNavigate }) {
  return (
    <>
      {tokens.map((t, i) => {
        if (t.t === "b")
          return (
            <Box key={i} component="strong" sx={{ fontWeight: 700 }}>
              {/* Bold carries nested tokens, because a bold run can contain
                  code or a link — every "Q." line in the guides does. */}
              {t.parts ? <Inline tokens={t.parts} onNavigate={onNavigate} /> : t.v}
            </Box>
          );
        if (t.t === "i")
          return (
            <Box key={i} component="em" sx={{ fontStyle: "italic" }}>
              {t.v}
            </Box>
          );
        if (t.t === "code")
          return (
            <Box
              key={i}
              component="code"
              sx={(th) => ({
                fontFamily: th.typography.fontFamilyMono ?? "monospace",
                fontSize: "0.86em",
                background: th.palette.surface.subtle,
                borderRadius: `${th.shape.borderRadius / 2}px`,
                px: 0.5,
              })}
            >
              {t.v}
            </Box>
          );
        if (t.t === "link")
          return (
            <Link key={i} component={RouterLink} to={t.href} onClick={onNavigate}>
              {t.v}
            </Link>
          );
        return <Box key={i} component="span">{t.v}</Box>;
      })}
    </>
  );
}

/* ── blocks ───────────────────────────────────────────────────────────────── */

function Block({ block, onNavigate }) {
  const nav = { onNavigate };

  if (block.type === "h")
    return (
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2 }}>
        <Inline tokens={block.text} {...nav} />
      </Typography>
    );

  if (block.type === "p")
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
        <Inline tokens={block.text} {...nav} />
      </Typography>
    );

  if (block.type === "quote")
    return (
      <Box
        sx={(t) => ({
          borderLeft: `2px solid ${t.palette.border.strong}`,
          pl: 1.5,
          my: 1,
        })}
      >
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          <Inline tokens={block.text} {...nav} />
        </Typography>
      </Box>
    );

  if (block.type === "list")
    return (
      <Stack component="ul" sx={{ m: 0, mt: 0.5, pl: 2.5, gap: 0.5 }}>
        {block.items.map((item, i) => (
          <Typography key={i} component="li" variant="body2" sx={{ color: "text.secondary" }}>
            <Inline tokens={item} {...nav} />
          </Typography>
        ))}
      </Stack>
    );

  if (block.type === "table")
    return (
      // Guides carry wide tables; the panel is narrow. Scroll the table, never
      // the panel body sideways.
      <Box sx={{ overflowX: "auto", mt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {block.head.map((cell, i) => (
                <TableCell key={i} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  <Inline tokens={cell} {...nav} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {block.rows.map((row, r) => (
              <TableRow key={r}>
                {row.map((cell, c) => (
                  <TableCell key={c} sx={{ color: "text.secondary", verticalAlign: "top" }}>
                    <Inline tokens={cell} {...nav} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );

  return null;
}

/* ── the panel ────────────────────────────────────────────────────────────── */

export function HelpPanel({ open, onClose }) {
  const { pathname } = useLocation();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  // Fetched on first open, not at boot — the guide data is a separate chunk.
  useEffect(() => {
    if (!open || data || failed) return;
    let cancelled = false;
    loadHelp()
      .then((m) => !cancelled && setData(m))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [open, data, failed]);

  const guide = data ? helpFor(data.HELP_BY_ROUTE, pathname) : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 460 } } } }}
      aria-label="Screen guide"
    >
      <Stack sx={{ height: "100%" }}>
        <Stack
          direction="row"
          sx={(t) => ({
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.5,
            borderBottom: `1px solid ${t.palette.border.subtle}`,
          })}
        >
          <HelpOutlineIcon sx={{ fontSize: 18, color: "text.tertiary" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
            {guide ? guide.title : "Screen guide"}
          </Typography>
          <IconButton size="small" onClick={onClose} aria-label="Close the screen guide">
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>

        <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 2 }}>
          {failed && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              The guide could not be loaded. It is also in the repository under
              docs/screen-guides.
            </Typography>
          )}

          {!failed && !data && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Loading…
            </Typography>
          )}

          {data && !guide && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              There is no guide for this screen yet. Every route is supposed to have one — if
              you are seeing this, the guide is missing rather than the screen being
              undocumented on purpose.
            </Typography>
          )}

          {guide && (
            <Stack sx={{ gap: 2 }}>
              <Typography variant="body2">
                <Inline tokens={guide.summary} onNavigate={onClose} />
              </Typography>

              {data.HELP_SECTIONS.map(({ key, label }) => {
                const blocks = guide[key];
                if (!blocks?.length) return null;
                return (
                  <Box key={key}>
                    <Divider sx={{ mb: 1.5 }} />
                    <Typography
                      variant="overline"
                      sx={{ color: "text.tertiary", letterSpacing: "0.08em" }}
                    >
                      {label}
                    </Typography>
                    {blocks.map((b, i) => (
                      <Block key={i} block={b} onNavigate={onClose} />
                    ))}
                  </Box>
                );
              })}

              <Divider />
              <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                Full reference, including where every figure comes from:{" "}
                <Box component="code" sx={{ fontSize: "inherit" }}>
                  {guide.doc}
                </Box>
                {guide.updated ? ` · updated ${guide.updated}` : null}
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    </Drawer>
  );
}

/** The trigger. Lives in the top bar so it is in the same place on every screen. */
export function HelpButton({ onClick }) {
  return (
    <IconButton size="small" onClick={onClick} aria-label="Open the guide for this screen">
      <HelpOutlineIcon sx={{ fontSize: 20 }} />
    </IconButton>
  );
}
