/**
 * WsShell — the application shell.
 *
 *   ┌─ TopBar ───────────────────────────── sticky, 64/72 ─┐
 *   │  ☰   hierarchy path      ◐ ⚙   user chip             │
 *   ├──────────┬───────────────────────────────────────────┤
 *   │ Sidebar  │  main                                     │
 *   │ 280 / 76 │  padding 16 (xs) / 24 (sm+)               │
 *   │ ├ search │  fluid or 1280 container                  │
 *   │ ├ nav    │                                           │
 *   │ └ picker │                                           │
 *   ├──────────┴───────────────────────────────────────────┤
 *   │  footer · minHeight 52                               │
 *   └──────────────────────────────────────────────────────┘
 *
 * The page scrolls. Panes do not own scroll except the sidebar's own list.
 */
import { useState, useMemo, useRef, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  Divider,
  Button,
  Menu,
  Popover,
  MenuItem,
  Avatar,
  useMediaQuery,
  Chip,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import { useSettings } from "../../lib/settings.jsx";
import { useHierarchy, LEVEL_LABEL } from "../../lib/hierarchy.jsx";
import { layout } from "../../lib/tokens.js";
import { focusRing } from "../../lib/theme.js";
import { exInt } from "../../lib/format.js";
import { SectionLabel } from "../atoms.jsx";
import { GenusLockup, GenusMark } from "../brand.jsx";
import { ThemeCustomizer } from "./theme-customizer.jsx";

/* ── navigation ───────────────────────────────────────────────────────────
   Eight nodes. Order is deliberate — Serial Position Effect: Overview and
   Alarms take the first two slots because they are the daily jobs;
   Administration takes the last because it is rare but must be findable.
   Reference material sits in the middle, where recall is weakest and does not
   need to be strong.                                                        */

export const NAV = [
  { id: "overview", label: "Overview", to: "/overview", icon: DashboardOutlinedIcon },
  {
    id: "alarms",
    label: "Alarms",
    icon: NotificationsActiveOutlinedIcon,
    badge: 12,
    children: [
      { label: "Inbox", to: "/alarms" },
      { label: "Rules", to: "/alarms/rules" },
    ],
  },
  { id: "sites", label: "Sites", to: "/sites", icon: PlaceOutlinedIcon },
  { id: "assets", label: "Assets", to: "/assets", icon: Inventory2OutlinedIcon },
  {
    id: "telemetry",
    label: "Telemetry",
    icon: InsightsOutlinedIcon,
    children: [
      { label: "BMS", to: "/telemetry/bms" },
      { label: "GTI", to: "/telemetry/gti" },
      { label: "UPS", to: "/telemetry/ups" },
      { label: "Solar", to: "/telemetry/solar" },
      { label: "Meter", to: "/telemetry/meter" },
    ],
  },
  { id: "reports", label: "Reports", to: "/reports", icon: DescriptionOutlinedIcon },
  {
    id: "data",
    label: "Data",
    icon: StorageOutlinedIcon,
    children: [
      { label: "Import", to: "/data/import" },
      { label: "Batch history", to: "/data/history" },
      { label: "Ingestion health", to: "/data/health" },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    icon: AdminPanelSettingsOutlinedIcon,
    children: [
      { label: "Users", to: "/admin/users" },
      { label: "Roles", to: "/admin/roles" },
      { label: "Audit log", to: "/admin/audit" },
      { label: "Organisation", to: "/admin/organisation" },
    ],
  },
];

/* ── live region ──────────────────────────────────────────────────────────
   One polite region owned by the shell, which every screen can post a
   sentence to. Without it, a filter narrowing a table or a refresh landing new
   figures is announced to nobody.                                           */

let announceFn = () => {};
export const announce = (msg) => announceFn(msg);

/* ── hierarchy picker ─────────────────────────────────────────────────────── */

function HierarchyPicker({ compact, onPick }) {
  const { node, select, root, path } = useHierarchy();
  const [open, setOpen] = useState({});

  const renderNode = (n, depth = 0) => {
    const kids = n.children ?? [];
    const isOpen = open[n.id] ?? path.some((p) => p.id === n.id);
    const selected = n.id === node.id;
    return (
      <Box key={n.id}>
        <ListItemButton
          dense
          selected={selected}
          onClick={() => {
            select(n.id);
            if (kids.length) setOpen((o) => ({ ...o, [n.id]: !isOpen }));
            else onPick?.();
          }}
          sx={(t) => ({
            pl: 1 + depth * 1.25,
            borderRadius: `${t.shape.borderRadius / 2}px`,
            minHeight: 30,
            ...focusRing(t),
          })}
        >
          <ListItemText
            primary={n.name}
            secondary={depth === 0 ? undefined : LEVEL_LABEL[n.level]}
            slotProps={{
              primary: { variant: "body2", noWrap: true, sx: { fontWeight: selected ? 600 : 400 } },
              secondary: { variant: "caption", noWrap: true },
            }}
          />
          {kids.length > 0 && (isOpen ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />)}
        </ListItemButton>
        {kids.length > 0 && (
          <Collapse in={isOpen} unmountOnExit>
            {kids.map((c) => renderNode(c, depth + 1))}
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Collapse in={!compact} timeout={240} unmountOnExit={false}>
      <Box
        sx={(t) => ({
          px: 1,
          pb: 1,
          opacity: compact ? 0 : 1,
          transform: compact ? "translateY(8px)" : "translateY(0)",
          transition: t.transitions.create(["opacity", "transform"], {
            easing: t.transitions.easing.sharp,
            duration: t.transitions.duration.standard,
          }),
        })}
      >
        <SectionLabel sx={{ px: 1, pt: 1, pb: 0.5 }}>Hierarchy</SectionLabel>
        <Box
          sx={(t) => ({
            maxHeight: 260,
            overflowY: "auto",
            border: `1px solid ${t.palette.border.subtle}`,
            borderRadius: `${t.shape.borderRadius / 2}px`,
            backgroundColor: t.palette.surface.subtle,
            p: 0.5,
          })}
        >
          <List dense disablePadding>
            {renderNode(root)}
          </List>
        </Box>
      </Box>
    </Collapse>
  );
}

/* ── sidebar ─────────────────────────────────────────────────────────────── */

function SidebarContent({ mini, onNavigate }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState({ alarms: false, telemetry: false, data: false, admin: false });
  const { pathname } = useLocation();

  const items = useMemo(() => {
    if (!q.trim()) return NAV;
    const needle = q.toLowerCase();
    return NAV.map((n) => {
      if (n.label.toLowerCase().includes(needle)) return n;
      const kids = (n.children ?? []).filter((c) => c.label.toLowerCase().includes(needle));
      return kids.length ? { ...n, children: kids } : null;
    }).filter(Boolean);
  }, [q]);

  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Stack sx={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
      <Box
        sx={(t) => ({
          display: "flex",
          alignItems: "center",
          px: mini ? 0 : 2,
          justifyContent: mini ? "center" : "flex-start",
          minHeight: { xs: layout.topBarXs, sm: layout.topBarSm },
          flexShrink: 0,
          overflow: "hidden",
          transition: t.transitions.create(["padding", "justify-content"], {
            easing: t.transitions.easing.sharp,
            duration: t.transitions.duration.standard,
          }),
        })}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: mini ? "center" : "flex-start",
            width: "100%",
            minWidth: 0,
          }}
        >
          {/* Compact mark */}
          <Box
            sx={(t) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              opacity: mini ? 1 : 0,
              transform: mini ? "scale(1)" : "scale(0.85)",
              position: mini ? "relative" : "absolute",
              pointerEvents: mini ? "auto" : "none",
              transition: t.transitions.create(["opacity", "transform"], {
                easing: t.transitions.easing.sharp,
                duration: t.transitions.duration.short,
              }),
            })}
          >
            <GenusMark size={28} />
          </Box>

          {/* Expanded wordmark + label */}
          <Box
            sx={(t) => ({
              minWidth: 0,
              opacity: mini ? 0 : 1,
              transform: mini ? "translateX(-12px)" : "translateX(0)",
              position: mini ? "absolute" : "relative",
              pointerEvents: mini ? "none" : "auto",
              transition: t.transitions.create(["opacity", "transform"], {
                easing: t.transitions.easing.sharp,
                duration: t.transitions.duration.standard,
              }),
            })}
          >
            <GenusLockup product="Solar" subtitle="SBPDCL rooftop programme" compact={false} />
          </Box>
        </Box>
      </Box>
      <Divider />

      <Collapse in={!mini} timeout={240} unmountOnExit={false}>
        <Box
          sx={(t) => ({
            p: 1.5,
            pb: 1,
            flexShrink: 0,
            opacity: mini ? 0 : 1,
            transform: mini ? "translateY(-6px)" : "translateY(0)",
            transition: t.transitions.create(["opacity", "transform"], {
              easing: t.transitions.easing.sharp,
              duration: t.transitions.duration.standard,
            }),
          })}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search navigation…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            slotProps={{
              htmlInput: { "aria-label": "Search navigation" },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Collapse>

      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0, px: 1 }}>
        <List dense disablePadding>
          {items.map((item) => {
            const Icon = item.icon;
            const hasKids = Boolean(item.children?.length);
            const expanded = open[item.id] ?? item.children?.some((c) => isActive(c.to));
            const activeSelf = item.to ? isActive(item.to) : item.children?.some((c) => isActive(c.to));

            const row = (
              <ListItemButton
                key={item.id}
                dense
                selected={Boolean(activeSelf)}
                component={item.to ? NavLink : "div"}
                to={item.to}
                onClick={() => {
                  if (hasKids) setOpen((o) => ({ ...o, [item.id]: !expanded }));
                  else onNavigate?.();
                }}
                aria-current={activeSelf && item.to ? "page" : undefined}
                aria-expanded={hasKids ? Boolean(expanded) : undefined}
                sx={(t) => ({
                  borderRadius: `${t.shape.borderRadius / 2}px`,
                  mb: 0.25,
                  minHeight: 38,
                  px: mini ? 1 : 1.5,
                  justifyContent: mini ? "center" : "flex-start",
                  transition: t.transitions.create(["padding", "background-color", "justify-content"], {
                    easing: t.transitions.easing.sharp,
                    duration: t.transitions.duration.standard,
                  }),
                  "&.Mui-selected": {
                    backgroundColor: alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.2 : 0.09),
                    "& .MuiListItemText-primary": { fontWeight: 600, color: t.palette.primary.main },
                    "& .MuiListItemIcon-root": { color: t.palette.primary.main },
                  },
                  ...focusRing(t),
                })}
              >
                <ListItemIcon
                  sx={(t) => ({
                    minWidth: mini ? 0 : 34,
                    color: "text.secondary",
                    justifyContent: "center",
                    transition: t.transitions.create(["min-width", "color"], {
                      easing: t.transitions.easing.sharp,
                      duration: t.transitions.duration.standard,
                    }),
                  })}
                >
                  <Icon sx={{ fontSize: 19 }} />
                </ListItemIcon>

                <Box
                  sx={(t) => ({
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                    minWidth: 0,
                    opacity: mini ? 0 : 1,
                    transform: mini ? "translateX(-10px)" : "translateX(0)",
                    maxWidth: mini ? 0 : 200,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    pointerEvents: mini ? "none" : "auto",
                    transition: t.transitions.create(["opacity", "transform", "max-width"], {
                      easing: t.transitions.easing.sharp,
                      duration: t.transitions.duration.standard,
                    }),
                  })}
                >
                  <ListItemText primary={item.label} slotProps={{ primary: { variant: "body2", noWrap: true } }} />
                  {item.badge ? (
                    <Chip
                      size="small"
                      label={item.badge}
                      sx={(t) => ({
                        height: 18,
                        ml: 0.5,
                        backgroundColor: t.palette.band.critical.bg,
                        color: t.palette.band.critical.fg,
                      })}
                    />
                  ) : null}
                  {hasKids && (expanded ? <ExpandLess sx={{ fontSize: 16, ml: "auto" }} /> : <ExpandMore sx={{ fontSize: 16, ml: "auto" }} />)}
                </Box>
              </ListItemButton>
            );

            return (
              <Box key={item.id}>
                <Tooltip title={mini ? item.label : ""} placement="right" disableHoverListener={!mini}>
                  <span>{row}</span>
                </Tooltip>
                {hasKids && (
                  <Collapse in={Boolean(expanded) && !mini} unmountOnExit timeout={240}>
                    <List dense disablePadding sx={{ pl: 3.5 }}>
                      {item.children.map((c) => (
                        <ListItemButton
                          key={c.to}
                          dense
                          component={NavLink}
                          to={c.to}
                          selected={isActive(c.to)}
                          onClick={onNavigate}
                          aria-current={isActive(c.to) ? "page" : undefined}
                          sx={(t) => ({
                            borderRadius: `${t.shape.borderRadius / 2}px`,
                            minHeight: 32,
                            mb: 0.125,
                            "&.Mui-selected": {
                              backgroundColor: alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.16 : 0.07),
                              "& .MuiListItemText-primary": { fontWeight: 600, color: t.palette.primary.main },
                            },
                            ...focusRing(t),
                          })}
                        >
                          <ListItemText primary={c.label} slotProps={{ primary: { variant: "body2", noWrap: true } }} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>

      <Divider />
      <HierarchyPicker compact={mini} />
    </Stack>
  );
}

/* ── horizontal navigation ────────────────────────────────────────────────
   The `horizontal` layout's nav is a SEPARATE component, not the same tree
   rendered sideways. That is a real maintenance cost — anything added to NAV
   has to be checked here too — but a rail's collapsible sub-lists have no
   sensible horizontal equivalent, so children become a dropdown instead.     */

function HorizontalNav() {
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(null);
  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Stack
      component="nav"
      direction="row"
      aria-label="Primary"
      sx={(t) => ({
        gap: 0.5,
        px: 2,
        py: 0.75,
        overflowX: "auto",
        borderTop: `1px solid ${t.palette.border.subtle}`,
      })}
    >
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = item.to ? isActive(item.to) : item.children?.some((c) => isActive(c.to));
        const hasKids = Boolean(item.children?.length);
        return (
          <Box key={item.id}>
            <Button
              size="small"
              component={item.to ? NavLink : "button"}
              to={item.to}
              onClick={hasKids ? (e) => setMenu({ el: e.currentTarget, item }) : undefined}
              aria-current={active && item.to ? "page" : undefined}
              aria-haspopup={hasKids || undefined}
              startIcon={<Icon sx={{ fontSize: 18 }} />}
              endIcon={hasKids ? <ExpandMore sx={{ fontSize: 16 }} /> : undefined}
              sx={(t) => ({
                whiteSpace: "nowrap",
                color: active ? t.palette.primary.main : t.palette.text.secondary,
                backgroundColor: active
                  ? alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.2 : 0.09)
                  : "transparent",
                fontWeight: active ? 600 : 400,
                ...focusRing(t),
              })}
            >
              {item.label}
              {item.badge ? (
                <Box
                  component="span"
                  sx={(t) => ({
                    ml: 0.75,
                    px: 0.75,
                    borderRadius: 999,
                    ...t.typography.overline,
                    backgroundColor: t.palette.band.critical.bg,
                    color: t.palette.band.critical.fg,
                  })}
                >
                  {item.badge}
                </Box>
              ) : null}
            </Button>
          </Box>
        );
      })}

      <Menu open={Boolean(menu)} anchorEl={menu?.el} onClose={() => setMenu(null)}>
        {(menu?.item.children ?? []).map((c) => (
          <MenuItem
            key={c.to}
            dense
            component={NavLink}
            to={c.to}
            selected={isActive(c.to)}
            onClick={() => setMenu(null)}
          >
            {c.label}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
}

/* ── WsShell ─────────────────────────────────────────────────────────────── */

export function WsShell({ children }) {
  const settings = useSettings();
  const { pathLabel, registered, node } = useHierarchy();
  const permanent = useMediaQuery("(min-width: 1180px)");
  const [navOpen, setNavOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [scopeAnchor, setScopeAnchor] = useState(null);
  const [live, setLive] = useState("");
  const liveRef = useRef(null);

  announceFn = useCallback((msg) => setLive(msg), []);

  // Horizontal moves navigation into a bar under the top bar and drops the rail
  // entirely. Below the permanent breakpoint every layout collapses to the
  // temporary drawer — a horizontal nav with 8 nodes does not fit a phone.
  const horizontal = settings.layout === "horizontal" && permanent;
  const mini = settings.layout === "mini" && permanent;
  const railWidth = mini ? layout.miniWidth : layout.drawerWidth;
  const showRail = !horizontal;

  return (
    <Box sx={{ display: "flex", minHeight: "100%", backgroundColor: "background.default" }}>
      {/* One polite live region for the whole app. */}
      <Box
        ref={liveRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        {live}
      </Box>

      {showRail && (
        // The width reservation MUST key off the same 1180px query as
        // `permanent`, not MUI's `lg` (1200). Between 1180 and 1200 the drawer
        // was permanent while nothing reserved room for it, so it sat on top of
        // the content.
        <Box
          component="nav"
          sx={(t) => ({
            width: permanent ? railWidth : 0,
            flexShrink: 0,
            transition: permanent
              ? t.transitions.create("width", {
                  easing: t.transitions.easing.sharp,
                  duration: t.transitions.duration.standard,
                })
              : undefined,
          })}
        >
          <Drawer
            variant={permanent ? "permanent" : "temporary"}
            open={permanent ? true : navOpen}
            onClose={() => setNavOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={(t) => ({
              "& .MuiDrawer-paper": {
                width: permanent ? railWidth : layout.drawerWidth,
                boxSizing: "border-box",
                borderInlineEnd: `1px solid ${t.palette.border.subtle}`,
                overflowX: "hidden",
                whiteSpace: "nowrap",
                transition: permanent
                  ? t.transitions.create("width", {
                      easing: t.transitions.easing.sharp,
                      duration: t.transitions.duration.standard,
                    })
                  : undefined,
              },
            })}
          >
            <SidebarContent mini={mini} onNavigate={() => setNavOpen(false)} />
          </Drawer>
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={(t) => ({
            backgroundColor: t.palette.surface.canvas,
            color: t.palette.text.primary,
            borderBottom: `1px solid ${t.palette.border.subtle}`,
          })}
        >
          <Toolbar sx={{ minHeight: { xs: layout.topBarXs, sm: layout.topBarSm }, gap: 1 }}>
            {!horizontal && (
              <IconButton
                edge="start"
                onClick={() =>
                  permanent ? settings.set({ layout: mini ? "default" : "mini" }) : setNavOpen(true)
                }
                aria-label={
                  permanent ? (mini ? "Expand navigation" : "Collapse navigation") : "Open navigation"
                }
                aria-expanded={permanent ? !mini : navOpen}
              >
                <MenuIcon />
              </IconButton>
            )}
            {horizontal && (
              <Box sx={{ mr: 1, flexShrink: 0 }}>
                <GenusLockup product="Solar" />
              </Box>
            )}

            {/* In horizontal there is no rail, so the scope picker has to live
                here — otherwise choosing that layout silently removes the only
                way to change what every screen is scoped to. */}
            <Stack
              sx={{ minWidth: 0, flex: 1 }}
              {...(horizontal
                ? {
                    component: "button",
                    type: "button",
                    onClick: (e) => setScopeAnchor(e.currentTarget),
                    "aria-haspopup": "true",
                    "aria-expanded": Boolean(scopeAnchor),
                    "aria-label": `Change scope. Currently ${pathLabel}`,
                    sx: (t) => ({
                      minWidth: 0,
                      flex: 1,
                      alignItems: "flex-start",
                      border: `1px solid ${t.palette.border.subtle}`,
                      borderRadius: `${t.shape.borderRadius / 2}px`,
                      background: "none",
                      color: "inherit",
                      font: "inherit",
                      textAlign: "start",
                      cursor: "pointer",
                      px: 1.25,
                      py: 0.5,
                      maxWidth: 420,
                      "&:hover": { borderColor: t.palette.border.strong },
                      ...focusRing(t),
                    }),
                  }
                : {})}
            >
              <Typography variant="subtitle2" noWrap>
                {pathLabel}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.tertiary" }} noWrap>
                {LEVEL_LABEL[node.level]} · {exInt(registered)} registered consumers
              </Typography>
            </Stack>

            <Popover
              open={Boolean(scopeAnchor)}
              anchorEl={scopeAnchor}
              onClose={() => setScopeAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              slotProps={{ paper: { sx: { width: 320, maxHeight: 420 } } }}
            >
              <HierarchyPicker onPick={() => setScopeAnchor(null)} />
            </Popover>

            <Tooltip title="Settings">
              <IconButton onClick={() => setSettingsOpen(true)} aria-label="Open settings">
                <SettingsOutlinedIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={(e) => setAccount(e.currentTarget)} aria-label="Account menu" sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 30, height: 30, bgcolor: "secondary.main", fontSize: 13 }}>VC</Avatar>
            </IconButton>
            <Menu open={Boolean(account)} anchorEl={account} onClose={() => setAccount(null)}>
              <MenuItem dense component={NavLink} to="/account/profile" onClick={() => setAccount(null)}>
                Profile
              </MenuItem>
              <MenuItem dense component={NavLink} to="/account/support" onClick={() => setAccount(null)}>
                Support tickets
              </MenuItem>
              <Divider />
              <MenuItem dense onClick={() => setAccount(null)}>
                Sign out
              </MenuItem>
            </Menu>
          </Toolbar>

          {horizontal && <HorizontalNav />}
        </AppBar>

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: `${layout.contentPadXs}px`, sm: `${layout.contentPadSm}px` },
            py: { xs: `${layout.contentPadXs}px`, sm: `${layout.contentPadSm}px` },
            width: "100%",
            maxWidth: settings.width === "container" ? layout.contentMaxWidth : "100%",
            mx: settings.width === "container" ? "auto" : 0,
          }}
        >
          {children}
        </Box>

        <Box
          component="footer"
          sx={(t) => ({
            minHeight: layout.footerMinHeight,
            display: "flex",
            alignItems: "center",
            px: { xs: 2, sm: 3 },
            borderTop: `1px solid ${t.palette.border.subtle}`,
          })}
        >
          <Typography variant="caption" sx={{ color: "text.tertiary" }}>
            Genus Solar · SBPDCL rooftop programme · v0.1.0
          </Typography>
        </Box>
      </Box>

      <ThemeCustomizer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  );
}
