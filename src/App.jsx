import { Routes, Route, Navigate } from "react-router-dom";
import { HierarchyProvider } from "./lib/hierarchy.jsx";
import { WsShell } from "./components/organisms/shell.jsx";
import Gallery from "./pages/gallery.jsx";
import Overview from "./pages/overview.jsx";
import Alarms from "./pages/alarms.jsx";
import AlarmsRules from "./pages/alarms-rules.jsx";
import Sites from "./pages/sites.jsx";
import Assets from "./pages/assets.jsx";
import Devices from "./pages/devices.jsx";
import TelemetryGti from "./pages/telemetry-gti.jsx";
import TelemetryBms from "./pages/telemetry-bms.jsx";
import TelemetryUps from "./pages/telemetry-ups.jsx";
import TelemetryMeter from "./pages/telemetry-meter.jsx";
import DataImport from "./pages/data-import.jsx";
import DataHistory from "./pages/data-history.jsx";
import DataHealth from "./pages/data-health.jsx";
import Reports from "./pages/reports.jsx";
import AdminUsers from "./pages/admin-users.jsx";
import AdminRoles from "./pages/admin-roles.jsx";
import AdminOrganisation from "./pages/admin-organisation.jsx";
import Placeholder from "./pages/placeholder.jsx";
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
          <Route path="/admin/organisation" element={<AdminOrganisation />} />
          {ROUTES.map((r) => (
            <Route key={r.to} path={r.to} element={<Placeholder title={r.label} to={r.to} />} />
          ))}
          <Route path="/account/profile" element={<Placeholder title="Profile" to="/account/profile" />} />
          <Route path="/account/support" element={<Placeholder title="Support tickets" to="/account/support" />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </WsShell>
    </HierarchyProvider>
  );
}
