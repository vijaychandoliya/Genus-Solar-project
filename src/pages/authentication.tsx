import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import { GenusLockup } from "../components/brand.jsx";
import { AuthForm } from "../components/auth";
import type { AuthView } from "../components/auth";
import { UtilityHero } from "../components/utility-hero";
import { useSettings } from "../lib/settings.jsx";

export default function Authentication({ view = "login" }: { view?: AuthView }) {
  const { resolvedMode, set } = useSettings() as unknown as { resolvedMode: string; set: (patch: { mode: string }) => void };
  const modeLabel = resolvedMode === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return <Box component="main" sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.05fr) minmax(0, 1fr)" }, gridTemplateRows: "minmax(0, 1fr)", height: "100dvh", overflow: "hidden", bgcolor: "background.paper", "& > section": { display: { xs: "none", md: "flex" } } }}>
    <UtilityHero />
    <Stack sx={{ minWidth: 0, minHeight: 0, overflowY: "auto", px: { xs: 2, sm: 4, lg: 8 }, py: { xs: 2, md: 3 }, gap: { xs: 1.5, md: 3 } }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 2, flexShrink: 0 }}>
        <GenusLockup product="" subtitle="Smart metering platform" compact={false} sx={{}} />
        <Tooltip title={modeLabel}><IconButton aria-label={modeLabel} onClick={() => set({ mode: resolvedMode === "dark" ? "light" : "dark" })} sx={(t) => ({ minWidth: t.spacing(5.5), minHeight: t.spacing(5.5) })}>{resolvedMode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}</IconButton></Tooltip>
      </Stack>
      <Box sx={(t) => ({ width: "100%", maxWidth: t.spacing(52), mx: "auto", my: "auto", flexShrink: 0 })}>
        <AuthForm key={view} view={view} />
      </Box>
      <Stack sx={{ alignItems: "center", textAlign: "center", flexShrink: 0 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>Authentication preview · Sign-in and email delivery are not connected.</Typography>
      </Stack>
    </Stack>
  </Box>;
}
