import { Routes, Route, Navigate } from "react-router-dom";
import { HierarchyProvider } from "./lib/hierarchy.jsx";
import { WsShell } from "./components/organisms/shell.jsx";
import Gallery from "./pages/gallery.jsx";
import Overview from "./pages/overview.jsx";
import Placeholder from "./pages/placeholder.jsx";
import { NAV } from "./components/organisms/shell.jsx";

/** Screens built for real. Everything else in NAV falls through to Placeholder. */
const BUILT = new Set(["/overview"]);

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
