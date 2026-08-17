/**
 * The discom hierarchy — picked once in the sidebar, inherited by every screen.
 *
 * Six levels: Discom ▸ Circle ▸ District ▸ Sub-Division ▸ Section ▸ Panchayat.
 * Never a per-page picker: a six-level path re-selected on each screen is a
 * guaranteed working-memory loss, and it is the reason the WFM estate moved
 * project selection into the rail.
 *
 * Node ids are GENERATED. The source data's `* Code` columns are not codes —
 * Circle Code equals Circle Name, District Code equals District Name, and
 * Panchayat Code is the name with spaces stripped. Only Sub-Division Code is a
 * real code and only in the survey extract. See docs/dashboard-ia.md §4.
 */
import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { HIERARCHY } from "./hierarchy-data.js";

export { HIERARCHY };

export const LEVELS = ["discom", "circle", "district", "subdivision", "section", "panchayat"];

export const LEVEL_LABEL = {
  discom: "Discom",
  circle: "Circle",
  district: "District",
  subdivision: "Sub-Division",
  section: "Section",
  panchayat: "Panchayat",
};

/** Depth-first index of every node, keyed by id, each carrying its ancestry. */
function indexTree(root) {
  const byId = new Map();
  const walk = (node, path) => {
    const entry = { ...node, path: [...path, node] };
    byId.set(node.id, entry);
    (node.children ?? []).forEach((c) => walk(c, entry.path));
  };
  walk(root, []);
  return byId;
}

const INDEX = indexTree(HIERARCHY);

const HierarchyContext = createContext(null);

export function useHierarchy() {
  const ctx = useContext(HierarchyContext);
  if (!ctx) throw new Error("useHierarchy must be used inside <HierarchyProvider>");
  return ctx;
}

export function HierarchyProvider({ children }) {
  const [nodeId, setNodeId] = useState(HIERARCHY.id);

  const node = INDEX.get(nodeId) ?? INDEX.get(HIERARCHY.id);

  /** Rolled-up registered consumers for the selected node and everything under it. */
  const registered = useMemo(() => {
    const sum = (n) =>
      (n.registered ?? 0) + (n.children ?? []).reduce((a, c) => a + sum(c), 0);
    return sum(node);
  }, [node]);

  const select = useCallback((id) => setNodeId(id), []);

  const value = useMemo(
    () => ({
      node,
      nodeId,
      select,
      path: node.path,
      registered,
      root: HIERARCHY,
      index: INDEX,
      /** "SBPDCL / JAMUI / GIDDHAUR" */
      pathLabel: node.path.map((n) => n.name).join(" / "),
    }),
    [node, nodeId, select, registered],
  );

  return <HierarchyContext.Provider value={value}>{children}</HierarchyContext.Provider>;
}
