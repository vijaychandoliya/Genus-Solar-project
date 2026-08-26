/**
 * Screen inventory — the EVIDENCE BASE for docs/screen-guides.
 *
 * Screen documentation rots faster than any other kind, because it describes the
 * one part of a system that changes every sprint. The defence here is the same
 * one the token engine uses: derive what can be derived, so the parts most
 * likely to drift cannot.
 *
 * This script reads the router and the pages and reports, as FACT:
 *
 *   · every route and the page component it renders
 *   · which data modules each page imports, and what it takes from them
 *   · which shared components each page composes
 *   · which pages have a guide, and which guides describe a route that is gone
 *
 * It reports NOTHING about business meaning, API endpoints, databases or
 * permissions. Those cannot be derived from imports, and a generator that
 * guessed at them would produce exactly the confident-sounding fabrication the
 * documentation brief forbids. Those sections are written by a human and marked
 * with their confidence.
 *
 *   node scripts/screen-inventory.mjs           human-readable report
 *   node scripts/screen-inventory.mjs --json    machine-readable, for the gate
 *   node scripts/screen-inventory.mjs --check   exit 1 if a route has no guide
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

const root = (p) => fileURLToPath(new URL(p, import.meta.url));
const read = (p) => readFileSync(root(p), "utf8");

const GUIDE_DIR = "../docs/screen-guides";

/* ── routes ───────────────────────────────────────────────────────────────
   Parsed from App.jsx rather than maintained by hand, so a route added
   without a guide is caught by the gate rather than by a reader noticing. */

function routes() {
  const src = read("../src/App.jsx");

  // import Devices from "./pages/devices.jsx"  →  Devices: pages/devices.jsx
  const files = {};
  for (const m of src.matchAll(/import\s+(\w+)\s+from\s+"\.\/(pages\/[\w.-]+)"/g))
    files[m[1]] = m[2];

  const out = [];
  for (const m of src.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<(\w+)([^>]*)\/?>/g)) {
    const [, path, component, rest] = m;
    // A redirect is a route with no screen behind it; it needs a line in the
    // report so nobody hunts for a missing guide, but not a guide of its own.
    const redirect = component === "Navigate" ? /to="([^"]+)"/.exec(rest)?.[1] ?? "?" : null;
    out.push({ path, component, file: files[component] ?? null, redirect });
  }
  return out;
}

/* ── what a page actually depends on ──────────────────────────────────────
   The import list is the only honest, machine-checkable answer to "where does
   this screen's data come from". It stops one step short of the origin — that
   is what the data modules' own provenance notes are for — but it is a fact,
   and it is the fact readers most often get wrong. */

const DATA_MODULE = /^\.\.\/lib\/([\w-]+\.jsx?)$/;

function analysePage(file) {
  if (!file || !existsSync(root(`../src/${file}`))) return null;
  const src = read(`../src/${file}`);

  const imports = [...src.matchAll(/import\s+(?:{([^}]+)}|(\w+))\s+from\s+"([^"]+)"/g)].map(
    ([, named, dflt, from]) => ({
      from,
      names: named ? named.split(",").map((s) => s.trim().split(" as ")[0]) : [dflt],
    }),
  );

  const data = [];
  const features = [];
  const components = [];

  for (const imp of imports) {
    const dm = DATA_MODULE.exec(imp.from);
    if (dm) {
      // The token engine and pure formatters are infrastructure, not a screen's
      // subject matter. Listing them as "data sources" would bury the two or
      // three that actually answer "where do these rows come from".
      const INFRA = ["format", "theme", "tokens", "token-store", "settings", "a11y", "contrast", "ramp"];
      const base = dm[1].replace(/\.jsx?$/, "");
      if (!INFRA.includes(base)) data.push({ module: `src/lib/${dm[1]}`, uses: imp.names });
      continue;
    }
    if (imp.from.includes("/features/")) {
      features.push({ from: imp.from, uses: imp.names });
      continue;
    }
    if (imp.from.includes("../components/")) components.push({ from: imp.from, uses: imp.names });
  }

  return {
    lines: src.split("\n").length,
    // The first block comment in a page is this repo's convention for saying
    // what the screen is for and why it differs from its source design.
    intent: (/^\/\*\*([\s\S]*?)\*\//.exec(src)?.[1] ?? "")
      .split("\n")
      .map((l) => l.replace(/^\s*\*ered?\s?/, "").replace(/^\s*\*\s?/, "").trimEnd())
      .filter(Boolean)
      .slice(0, 3)
      .join(" "),
    data,
    features,
    components,
    hasTable: /<WsTable|<DataTable/.test(src),
    hasChart: /<Chart|echarts|<KpiStrip/.test(src),
    hasForm: /<TextField|<Select|<Checkbox/.test(src),
    hasFilters: /<FilterBar/.test(src),
    hasDialog: /<Dialog|<JsonPayloadDialog/.test(src),
  };
}

/* ── guides ───────────────────────────────────────────────────────────────── */

function guides() {
  const dir = root(GUIDE_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md")
    .map((f) => {
      const src = readFileSync(`${dir}/${f}`, "utf8");
      return {
        file: `docs/screen-guides/${f}`,
        /* Frontmatter `route:` is the join key between a guide and the router.
           It accepts a list, because two routes can genuinely share one screen —
           /account/profile and /account/support both render placeholder.jsx, and
           writing that page up twice would be duplication pretending to be
           coverage. */
        routes: (/^route:\s*(.+)$/m.exec(src)?.[1] ?? "")
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
        status: /^status:\s*(\S+)/m.exec(src)?.[1] ?? "unknown",
      };
    });
}

/* ── report ───────────────────────────────────────────────────────────────── */

const all = routes().map((r) => ({ ...r, analysis: analysePage(r.file) }));
const screens = all.filter((r) => !r.redirect && r.file);
const documented = guides();
const byRoute = Object.fromEntries(documented.flatMap((g) => g.routes.map((r) => [r, g])));

const missing = screens.filter((s) => !byRoute[s.path]);
const orphaned = documented.filter((g) => !g.routes.some((r) => screens.some((s) => s.path === r)));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ screens: all, guides: documented, missing, orphaned }, null, 2));
} else if (process.argv.includes("--check")) {
  /* A ratchet, both ways. Coverage may not fall, and it may not silently rise
     either — writing a guide without raising the baseline leaves the number
     stale, which is how a coverage figure stops meaning anything. */
  const baselineFile = root(`${GUIDE_DIR}/.baseline.json`);
  const baseline = existsSync(baselineFile)
    ? JSON.parse(readFileSync(baselineFile, "utf8"))
    : { documented: 0 };

  const covered = documented.filter((g) => g.routes.some((r) => screens.some((s) => s.path === r)));

  for (const g of orphaned) console.error(`  ORPHANED   ${g.routes.join(", ") || "(no route:)"} → ${g.file}`);

  if (orphaned.length) {
    console.error(
      `\n${orphaned.length} guide(s) describe a route that no longer exists. Delete them, or fix\n` +
        `their \`route:\` — a guide for a screen nobody can reach is worse than no guide.`,
    );
    process.exit(1);
  }

  if (covered.length < baseline.documented) {
    console.error(
      `\nscreen-guide coverage FELL: ${covered.length} documented, baseline is ${baseline.documented}.\n` +
        `A guide was deleted, or a route it covered was renamed.`,
    );
    process.exit(1);
  }

  if (covered.length > baseline.documented) {
    console.error(
      `\nscreen-guide coverage ROSE to ${covered.length} — raise "documented" in\n` +
        `docs/screen-guides/.baseline.json from ${baseline.documented} to ${covered.length}.`,
    );
    process.exit(1);
  }

  const remaining = missing.map((s) => s.path);
  console.log(
    `screen guides OK — ${covered.length} of ${screens.length} routes documented, none orphaned` +
      (remaining.length ? `\n  still to write: ${remaining.join(", ")}` : ""),
  );
} else {
  console.log("\nSCREEN INVENTORY — derived from src/App.jsx and the page sources\n");
  const pad = (s, n) => String(s ?? "").padEnd(n);
  console.log(`  ${pad("ROUTE", 26)}${pad("PAGE", 26)}${pad("LN", 5)}${pad("GUIDE", 8)}DATA MODULES`);
  console.log(`  ${"─".repeat(100)}`);
  for (const s of all) {
    if (s.redirect) {
      console.log(`  ${pad(s.path, 26)}${pad(`→ ${s.redirect}`, 26)}${pad("", 5)}${pad("—", 8)}(redirect)`);
      continue;
    }
    const g = byRoute[s.path];
    console.log(
      `  ${pad(s.path, 26)}${pad(s.file?.replace("pages/", "") ?? "?", 26)}` +
        `${pad(s.analysis?.lines ?? "?", 5)}${pad(g ? "yes" : "MISSING", 8)}` +
        ([...new Set(s.analysis?.data.map((d) => d.module.replace("src/lib/", "")) ?? [])].join(", ") || "—"),
    );
  }
  console.log(
    `\n  ${screens.length} screens · ${documented.length} documented · ${missing.length} missing` +
      `${orphaned.length ? ` · ${orphaned.length} orphaned` : ""}\n`,
  );
}
