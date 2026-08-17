/**
 * Shell settings — theme mode, direction, content width, density.
 *
 * State lives in localStorage under `genus-settings`, merged over DEFAULTS on
 * load, so an unknown or corrupt key can never break boot.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { ThemeProvider, CssBaseline, useMediaQuery } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { getTheme } from "./theme.js";

const KEY = "genus-settings";

const DEFAULTS = {
  layout: "default", // "default" | "horizontal" | "mini"
  // The top-bar hamburger's own collapse, independent of `layout`. Only
  // meaningful when layout === "default": it hides the rail entirely so the
  // canvas takes the full width. It is NOT the same thing as choosing the
  // "Mini" layout (an icon-only rail) — see AGENTS.md on why those were
  // wrongly conflated into one setting originally.
  collapsed: false,
  direction: "ltr", // "ltr" | "rtl"
  mode: "system", // "light" | "dark" | "system"
  scheme: "default", // any key in tokens.schemes
  font: "inter", // any key in tokens.fonts
  width: "fluid", // "fluid" | "container"
  density: "condensed", // "condensed" | "regular" | "relaxed"
};

export { DEFAULTS };

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function write(next) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota or private mode — settings simply do not persist */
  }
}

const SettingsContext = createContext(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}

const ltrCache = createCache({ key: "genus", stylisPlugins: [prefixer] });
const rtlCache = createCache({ key: "genus-rtl", stylisPlugins: [prefixer, rtlPlugin] });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(read);
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  const resolvedMode =
    settings.mode === "system" ? (prefersDark ? "dark" : "light") : settings.mode;

  const set = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      write(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    write(DEFAULTS);
    setSettings({ ...DEFAULTS });
  }, []);

  // The generated CSS keys dark off [data-mode]. Keep the attribute in sync so
  // raw-CSS consumers (scrollbars, ::selection, print) follow the same switch.
  useEffect(() => {
    document.documentElement.setAttribute("data-mode", settings.mode);
    document.documentElement.dir = settings.direction;
    document.documentElement.lang = "en";
  }, [settings.mode, settings.direction]);

  const theme = useMemo(
    () => getTheme(resolvedMode, settings.direction, settings.scheme, settings.font),
    [resolvedMode, settings.direction, settings.scheme, settings.font],
  );

  const value = useMemo(
    () => ({ ...settings, resolvedMode, set, reset, defaults: DEFAULTS }),
    [settings, resolvedMode, set, reset],
  );

  return (
    <SettingsContext.Provider value={value}>
      <CacheProvider value={settings.direction === "rtl" ? rtlCache : ltrCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </CacheProvider>
    </SettingsContext.Provider>
  );
}
