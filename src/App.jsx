import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HierarchyProvider } from "./lib/hierarchy.jsx";
import { WsShell } from "./components/organisms/shell.jsx";
import { LoadingState } from "./components/feedback/states.tsx";
/* ── every page is its own chunk ─────────────────────────────────────────
   These were 21 static imports, so the application compiled to one 2.3 MB
   JavaScript file and opening Overview downloaded the token editor, the
   component gallery and all four telemetry screens with it. `lazy()` gives
   each page a chunk of its own, fetched when somebody navigates to it.

   The SHELL is deliberately NOT lazy. It is the frame every route renders
   inside, so splitting it would only buy a round trip before anything at all
   appears. Same reason `Placeholder` is here rather than eager: it is a page
   like any other, and four routes reach it. */
const Gallery = lazy(() => import("./pages/gallery.jsx"));
const Overview = lazy(() => import("./pages/overview.jsx"));
const Alarms = lazy(() => import("./pages/alarms.jsx"));
const AlarmsRules = lazy(() => import("./pages/alarms-rules.jsx"));
const Sites = lazy(() => import("./pages/sites.jsx"));
const Assets = lazy(() => import("./pages/assets.jsx"));
const Devices = lazy(() => import("./pages/devices.jsx"));
const TelemetryGti = lazy(() => import("./pages/telemetry-gti.jsx"));
const TelemetryBms = lazy(() => import("./pages/telemetry-bms.jsx"));
const TelemetryUps = lazy(() => import("./pages/telemetry-ups.jsx"));
const TelemetryMeter = lazy(() => import("./pages/telemetry-meter.jsx"));
const DataImport = lazy(() => import("./pages/data-import.jsx"));
const DataHistory = lazy(() => import("./pages/data-history.jsx"));
const DataHealth = lazy(() => import("./pages/data-health.jsx"));
const Reports = lazy(() => import("./pages/reports.jsx"));
const AdminUsers = lazy(() => import("./pages/admin-users.jsx"));
const AdminRoles = lazy(() => import("./pages/admin-roles.jsx"));
const Appearance = lazy(() => import("./pages/appearance.jsx"));
const DesignTokens = lazy(() => import("./pages/design-tokens.jsx"));
const AdminOrganisation = lazy(() => import("./pages/admin-organisation.jsx"));
const Placeholder = lazy(() => import("./pages/placeholder.jsx"));
import { NAV } from "./components/organisms/shell.jsx";

/** Screens built for real. Everything else in NAV falls through to Placeholder. */
const BUILT = new Set([
  "/overview",
  "/alarms",
  "/alarms/rules",
  "/sites",
  "/assets",
  "/assets/condition",
  "/telemetry/bms",
  // The nav points at the default GTI stream; the bare path redirects to it.
  "/telemetry/gti/data",
  "/telemetry/ups",
  "/telemetry/meter",
  "/data/import",
  "/data/history",
  "/data/health",
  "/reports",
  "/admin/users",
  "/admin/roles",
  "/admin/appearance",
  "/admin/design-tokens",
  "/admin/organisation",
]);

/** Every remaining nav destination, flattened, so no rail item is a dead link. */
const ROUTES = NAV.flatMap((n) =>
  n.to ? [{ to: n.to, label: n.label }] : n.children.map((c) => ({ to: c.to, label: `${n.label} — ${c.label}` })),
).filter((r) => !BUILT.has(r.to));

export default function App() {
  return (
    <HierarchyProvider>
      <WsShell>
        {/* One boundary around the whole table rather than one per route: the
            fallback stands in for the page area while its chunk arrives, and the
            shell — rail, top bar, scope — stays put instead of flickering with it. */}
        <Suspense fallback={<LoadingState />}>
          <Routes>
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/alarms" element={<Alarms />} />
            <Route path="/alarms/rules" element={<AlarmsRules />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/assets" element={<Devices />} />
            <Route path="/assets/condition" element={<Assets />} />
            <Route path="/telemetry/bms" element={<TelemetryBms />} />
            <Route path="/telemetry/ups" element={<TelemetryUps />} />
            <Route path="/telemetry/meter" element={<TelemetryMeter />} />
            <Route path="/telemetry/gti" element={<Navigate to="/telemetry/gti/data" replace />} />
            <Route path="/telemetry/gti/:tab" element={<TelemetryGti />} />
            <Route path="/data/import" element={<DataImport />} />
            <Route path="/data/history" element={<DataHistory />} />
            <Route path="/data/health" element={<DataHealth />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/admin/appearance" element={<Appearance />} />
            <Route path="/admin/design-tokens" element={<DesignTokens />} />
            <Route path="/admin/organisation" element={<AdminOrganisation />} />
            {ROUTES.map((r) => (
              <Route key={r.to} path={r.to} element={<Placeholder title={r.label} to={r.to} />} />
            ))}
            <Route path="/account/profile" element={<Placeholder title="Profile" to="/account/profile" />} />
            <Route path="/account/support" element={<Placeholder title="Support tickets" to="/account/support" />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </Suspense>
      </WsShell>
    </HierarchyProvider>
  );
}
