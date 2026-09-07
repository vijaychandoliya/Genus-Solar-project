/**
 * Compile the screen guides into the app bundle — the in-app Help panel's source.
 *
 * The panel is a PROJECTION of docs/screen-guides, not a second set of words.
 * That is the whole design: help text that is authored separately from the
 * reference documentation drifts from it within a sprint, and then the product
 * and the docs disagree in front of a user. One source, two renderings.
 *
 * Only the sections a person needs AT THE SCREEN are compiled in:
 *
 *   the summary blockquote   what this screen is for, in one line
 *   §2  Who Uses This Screen
 *   §3  How to Access It
 *   §9  Use Cases            the tasks people actually do here
 *   §13 Screen States        why it looks like this
 *   §14 Common Questions
 *   §15 Troubleshooting
 *
 * The data-flow traces, evidence marks and Known Unknowns stay in docs/ — they
 * are for developers and for retrieval, and shipping them would double the
 * payload to answer questions nobody asks with the product open.
 *
 * Markdown is parsed to STRUCTURED BLOCKS here rather than rendered at runtime,
 * so the app needs no markdown dependency, the output is styled with our own
 * tokens, and a malformed guide fails the build instead of the panel.
 *
 *   node scripts/build-help.mjs            emit src/lib/help/guides.generated.js
 *   node scripts/build-help.mjs --check    exit 1 if the emitted file is stale
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

const root = (p) => fileURLToPath(new URL(p, import.meta.url));
const GUIDE_DIR = root("../docs/screen-guides");
const OUT = root("../src/lib/help/guides.generated.js");

/** The sections the panel shows, in the order it shows them. */
const PANEL_SECTIONS = [
  { n: 9, key: "useCases", label: "What you can do here" },
  { n: 14, key: "questions", label: "Common questions" },
  { n: 15, key: "troubleshooting", label: "If something looks wrong" },
  { n: 13, key: "states", label: "Why the screen looks like this" },
  { n: 2, key: "audience", label: "Who this screen is for" },
  { n: 3, key: "access", label: "How to get here" },
];

/* ── inline markdown → tokens ─────────────────────────────────────────────
   A deliberately small subset: bold, code, links, italics. Anything else is
   left as text rather than half-rendered, because a stray asterisk in the UI
   is worse than a plain sentence.                                          */

/**
 * Strip the [C]/[I]/[U] evidence marks.
 *
 * They exist so a developer can tell a confirmed fact from an inference, and
 * they belong in the guide. In the panel they are noise a reader cannot act on —
 * so the projection drops them, and the footer points at the full guide for
 * anyone who wants the provenance.
 */
const stripMarks = (text) =>
  text
    // Unconditional: the marks also appear INSIDE bold spans — `**… [C]**` —
    // where a lookahead for whitespace or punctuation never matched.
    .replace(/\s*\*\*\[[CIU]\]\*\*/g, "")
    .replace(/\s*\[[CIU]\]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

function inline(raw) {
  const text = stripMarks(raw);
  const out = [];
  /* Bold is non-greedy rather than "no asterisks inside", so a bold run
     containing italics — `**Q. … *Edit nameplate*?**` — still matches as bold.
     With [^*]+ that line failed the bold branch entirely and the italic branch
     picked up a fragment, rendering one question in italics among eight bold
     ones. Bold is listed first, so it wins the alternation. */
  const re = /(\*\*.+?\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ t: "text", v: text.slice(last, m.index) });
    const s = m[0];
    // Bold can contain code and links — every `**Q. … `Stale` …**` line does —
    // so its content is parsed too. Without this the backticks render
    // literally, which looks like a formatting bug to a reader.
    if (s.startsWith("**")) out.push({ t: "b", parts: inline(s.slice(2, -2)) });
    else if (s.startsWith("`")) out.push({ t: "code", v: s.slice(1, -1) });
    else if (s.startsWith("[")) {
      const link = /\[([^\]]+)\]\(([^)]+)\)/.exec(s);
      // Only in-app routes become links. A relative .md path would 404 in the
      // product, and an external one would take someone out of the screen they
      // are asking about — so those render as plain text.
      out.push(
        link[2].startsWith("/")
          ? { t: "link", v: link[1], href: link[2] }
          : { t: "text", v: link[1] },
      );
    } else out.push({ t: "i", v: s.slice(1, -1) });
    last = m.index + s.length;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}

/* ── block markdown → structured blocks ───────────────────────────────────── */

function blocks(md) {
  const lines = md.split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i += 1; continue; }

    // A horizontal rule separates sections in the source and carries nothing.
    // It also used to HANG this parser: `---` matches none of the branches
    // below, and the paragraph loop refuses lines starting with `-`, so `i`
    // never advanced. Any line the parser does not understand must still move
    // the cursor — that is the invariant, not a special case for rules.
    if (/^([-*_]\s*){3,}$/.test(line.trim())) { i += 1; continue; }

    // ### heading
    if (line.startsWith("### ")) {
      out.push({ type: "h", text: inline(line.slice(4).trim()) });
      i += 1;
      continue;
    }

    // | table |
    if (line.trim().startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].trim().slice(1, -1).split("|").map((c) => c.trim());
        // the |---|---| separator row carries no content
        if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
        i += 1;
      }
      if (rows.length) out.push({ type: "table", head: rows[0].map(inline), rows: rows.slice(1).map((r) => r.map(inline)) });
      continue;
    }

    // - list
    if (/^[-*] /.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) {
        items.push(inline(lines[i].trim().slice(2)));
        i += 1;
      }
      out.push({ type: "list", items });
      continue;
    }

    // > blockquote
    if (line.trim().startsWith(">")) {
      const parts = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        parts.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      out.push({ type: "quote", text: inline(parts.join(" ").trim()) });
      continue;
    }

    /* paragraph — joined until a blank line.
       The guard matches list/table/quote/heading MARKERS specifically, not the
       characters they start with. An earlier version tested /^[-*|>#]/, which
       also rejected every line beginning `**bold**` — and since every common
       question in the guides is written `**Q. …**`, the panel silently rendered
       the answers with no questions above them. A bullet is `- `, with the
       space; `**` is emphasis. */
    const parts = [];
    while (i < lines.length && lines[i].trim() && !/^([-*] |[|>#])/.test(lines[i].trim())) {
      parts.push(lines[i].trim());
      i += 1;
    }
    if (parts.length) out.push({ type: "p", text: inline(parts.join(" ")) });
    // The invariant: never leave the loop without advancing. A line the
    // branches above all decline — a stray `#### `, an HTML comment — is
    // skipped rather than hanging the build.
    else i += 1;
  }

  return out;
}

/* ── one guide ────────────────────────────────────────────────────────────── */

function parseGuide(file) {
  const src = readFileSync(`${GUIDE_DIR}/${file}`, "utf8");

  const fm = /^---\n([\s\S]*?)\n---/.exec(src);
  if (!fm) throw new Error(`${file}: no frontmatter`);
  const meta = {};
  for (const line of fm[1].split("\n")) {
    const m = /^([\w]+):\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, k, raw] = m;
    meta[k] = raw.startsWith("[")
      ? raw.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean)
      : raw.trim();
  }

  const routes = String(meta.route ?? "").split(",").map((r) => r.trim()).filter(Boolean);
  if (!routes.length) throw new Error(`${file}: no route in frontmatter`);

  const body = src.slice(fm[0].length);
  const title = /^#\s+(.+)$/m.exec(body)?.[1]?.trim() ?? meta.title ?? file;

  // The blockquote directly under the H1 is every guide's one-line summary.
  const afterH1 = body.slice(body.indexOf("\n", body.indexOf("# ")));
  const summaryLines = [];
  for (const line of afterH1.split("\n")) {
    if (line.trim().startsWith(">")) summaryLines.push(line.trim().replace(/^>\s?/, ""));
    else if (summaryLines.length) break;
  }
  if (!summaryLines.length) throw new Error(`${file}: no summary blockquote under the H1`);

  // Split on "## N. Name"
  const sections = {};
  const re = /^## (\d+)\.\s+(.+)$/gm;
  const marks = [...body.matchAll(re)];
  marks.forEach((m, idx) => {
    const end = idx + 1 < marks.length ? marks[idx + 1].index : body.length;
    sections[Number(m[1])] = body.slice(m.index + m[0].length, end).trim();
  });

  const panel = {};
  for (const s of PANEL_SECTIONS) {
    const raw = sections[s.n];
    if (!raw) throw new Error(`${file}: missing §${s.n}, which the Help panel needs`);
    panel[s.key] = blocks(raw);
  }

  return {
    routes,
    title,
    summary: inline(summaryLines.join(" ").trim()),
    aliases: meta.aliases ?? [],
    related: meta.relatedScreens ?? [],
    updated: meta.updated ?? null,
    doc: `docs/screen-guides/${file}`,
    ...panel,
  };
}

/* ── emit ─────────────────────────────────────────────────────────────────── */

const files = readdirSync(GUIDE_DIR)
  .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md")
  .sort();

const guides = files.map(parseGuide);

const byRoute = {};
for (const g of guides) for (const r of g.routes) byRoute[r] = g;

const banner = `/**
 * GENERATED FROM docs/screen-guides — DO NOT HAND-EDIT.
 *
 * Regenerate with \`npm run help\`. Edit the guide, not this file: the panel is a
 * projection of the documentation, and hand-editing here would create exactly
 * the drift between the product and its docs that the projection prevents.
 *
 * Emitted ${new Date().toISOString().slice(0, 10)} from ${files.length} guides
 * covering ${Object.keys(byRoute).length} routes.
 */`;

const out = `${banner}

/** Panel sections, in the order the panel renders them. */
export const HELP_SECTIONS = ${JSON.stringify(PANEL_SECTIONS.map(({ key, label }) => ({ key, label })), null, 2)};

/** Route → guide. Routes with a \`:param\` are matched by prefix — see helpFor(). */
export const HELP_BY_ROUTE = ${JSON.stringify(byRoute, null, 1)};
`;

if (process.argv.includes("--check")) {
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  // The banner carries a date, so compare everything after it.
  const strip = (s) => s.slice(s.indexOf("export const HELP_SECTIONS"));
  if (!current || strip(current) !== strip(out)) {
    console.error(
      "help panel content is STALE — a screen guide changed but src/lib/help/guides.generated.js\n" +
        "was not regenerated. Run `npm run help`.",
    );
    process.exit(1);
  }
  console.log(`help OK — ${files.length} guides, ${Object.keys(byRoute).length} routes, in sync`);
} else {
  mkdirSync(root("../src/lib/help"), { recursive: true });
  writeFileSync(OUT, out);
  const kb = (out.length / 1024).toFixed(0);
  console.log(
    `help built — ${files.length} guides → ${Object.keys(byRoute).length} routes, ${kb} kB\n` +
      `  (panel sections only; the full guides stay in docs/ for developers and retrieval)`,
  );
}
