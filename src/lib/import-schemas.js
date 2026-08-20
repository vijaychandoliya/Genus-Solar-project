/**
 * Import schemas and the dry-run validator.
 *
 * The validator is REAL — it parses the file you choose in the browser and
 * reports what it finds. It is not a mock of a server-side check. That is the
 * whole point of a dry run: the report has to come from the actual bytes, or
 * it tells you nothing about them.
 *
 * What it deliberately cannot do is COMMIT. There is no backend
 * (dms-parity-plan.md Phase 5), so the screen validates and stops. A commit
 * button that wrote to memory would be the worst of both worlds — it would
 * look like an import and behave like nothing.
 *
 * ── Why the rules are what they are ─────────────────────────────────────
 * Every check below traces to a defect already found in the real extracts:
 *
 *   · `* Code` columns are not codes (AGENTS.md §10). Circle Code equals
 *     Circle Name; Panchayat Code is the name with spaces stripped. A file
 *     keyed on them is a file that will not join, so it is a warning on sight.
 *   · Two date formats appear in the SAME row — "07-08-2026, 16:18" and
 *     "07-08-2026 16:27:34". Both are accepted; anything else is an error.
 *   · Geo "0,0" is Null Island, never a location.
 *   · A consumer number is a 12-digit string. Parsed as a number it loses its
 *     leading zeros and silently stops matching.
 */
/* NOT `parseIndianDate` — that helper falls back to `new Date(s)` for anything
   it does not recognise, which is correct for lenient DISPLAY of a value
   already in the system and exactly wrong for an import gate.

   `new Date("07-08-2026")` yields **8 July**, because V8 reads a hyphenated
   numeric string as month-first. So a file whose dates are real dd-mm-yyyy but
   in an unexpected shape would not fail here — it would import, silently, with
   every date a month out. The gate therefore matches the two shapes the source
   extracts actually use, and rejects everything else including strings
   `new Date` would happily accept. */

const DATE_SHAPE = /^(\d{2})-(\d{2})-(\d{4})(?:,?\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/;

/** Strict dd-mm-yyyy. Returns a Date, or null with no fallback guessing. */
function strictIndianDate(s) {
  const m = DATE_SHAPE.exec(String(s).trim());
  if (!m) return null;
  const [, dd, mm, yyyy, hh = "0", mi = "0", ss = "0"] = m;
  const d = new Date(+yyyy, +mm - 1, +dd, +hh, +mi, +ss);
  // Rejects 32-01 and 31-02, which the constructor would roll forward.
  if (d.getDate() !== +dd || d.getMonth() !== +mm - 1 || d.getFullYear() !== +yyyy) return null;
  if (+hh > 23 || +mi > 59 || +ss > 59) return null;
  return d;
}

/* ── CSV parsing ──────────────────────────────────────────────────────────
   Hand-rolled rather than a dependency: the two source files are quoted CSV
   with commas inside quoted fields (addresses, "07-08-2026, 16:18"), which is
   exactly the case a naive split(",") gets wrong and a 40-line reader gets
   right. Nothing here needs streaming or dialect detection.                 */

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      // Swallow CRLF as one break.
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      // A trailing newline must not produce a phantom empty row.
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/* ── field validators ─────────────────────────────────────────────────────── */

const isBlank = (v) => v == null || String(v).trim() === "";

const validators = {
  required: (v) => (isBlank(v) ? "is empty" : null),

  /** 12 digits, kept as text. Parsed as a number it loses leading zeros. */
  consumerNumber: (v) => {
    if (isBlank(v)) return "is empty";
    const s = String(v).trim();
    if (!/^\d{10,14}$/.test(s)) return `"${s}" is not a 10–14 digit consumer number`;
    return null;
  },

  /** Both source date shapes are legal; a third is not. */
  indianDate: (v) => {
    if (isBlank(v)) return "is empty";
    if (!strictIndianDate(v)) {
      return `"${v}" is not dd-mm-yyyy — the extracts use "07-08-2026, 16:18" and "07-08-2026 16:27:34". Anything else risks being read month-first`;
    }
    return null;
  },

  /** "lat,lng,accuracy". (0,0) is Null Island, never a rooftop in Bihar. */
  geo: (v) => {
    if (isBlank(v)) return "is empty";
    const parts = String(v).split(",").map((p) => Number(p.trim()));
    if (parts.length < 2 || parts.some((p) => Number.isNaN(p))) return `"${v}" is not "lat,lng[,accuracy]"`;
    const [lat, lng] = parts;
    if (lat === 0 && lng === 0) return "is (0, 0) — Null Island, not a location";
    if (lat < 6 || lat > 38 || lng < 68 || lng > 98) return `(${lat}, ${lng}) is outside India`;
    return null;
  },

  yesNo: (v) => {
    if (isBlank(v)) return "is empty";
    return /^(yes|no)$/i.test(String(v).trim()) ? null : `"${v}" is not Yes or No`;
  },

  positiveNumber: (v) => {
    if (isBlank(v)) return "is empty";
    const n = Number(v);
    if (Number.isNaN(n)) return `"${v}" is not a number`;
    if (n < 0) return `${n} is negative`;
    return null;
  },
};

/* ── the two schemas we actually ingest ───────────────────────────────────── */

export const SCHEMAS = [
  {
    id: "site-survey",
    label: "Site survey",
    file: "Solar PV Site Survey.csv",
    note: "One row per surveyed rooftop. Feeds verdicts, asset condition and the exception queue.",
    keyColumn: "Consumer Number",
    columns: [
      { name: "Consumer Name", rule: "required" },
      { name: "Consumer Number", rule: "consumerNumber", unique: true },
      { name: "Survey Date", rule: "indianDate" },
      { name: "Submitted On", rule: "indianDate" },
      { name: "Geo Location", rule: "geo" },
      { name: "Roof Top Available", rule: "yesNo" },
      { name: "Roof Top Status", rule: "required" },
      { name: "Shadow Free Area Available", rule: "yesNo" },
      { name: "No of Floors", rule: "positiveNumber" },
      { name: "Contractor Name", rule: "required" },
      { name: "Employee ID", rule: "required" },
    ],
  },
  {
    id: "consumer-master",
    label: "Consumer master",
    file: "Consumer master extract.csv",
    note: "The registration register. Every coverage denominator comes from here.",
    keyColumn: "Consumer Number",
    columns: [
      { name: "Consumer Number", rule: "consumerNumber", unique: true },
      { name: "Circle Name", rule: "required" },
      { name: "District Name", rule: "required" },
      { name: "Sub-Division Name", rule: "required" },
      { name: "Section Name", rule: "required" },
      { name: "Panchayat Name", rule: "required" },
      { name: "Created On", rule: "indianDate" },
      { name: "Created By", rule: "required" },
    ],
  },
];

/** Columns that look like keys and are not — AGENTS.md §10. */
const FAKE_CODE_COLUMNS = /^(circle|district|sub-?division|section|panchayat)\s*code$/i;

/**
 * Dry-run a file against a schema.
 *
 * Returns everything the screen needs to decide whether a commit would be
 * safe, and never mutates anything. Row numbers are 1-based and count the
 * header, so they match what a spreadsheet shows.
 */
export function dryRun(text, schemaId) {
  const schema = SCHEMAS.find((s) => s.id === schemaId);
  if (!schema) return { ok: false, fatal: `Unknown schema "${schemaId}".` };

  const rows = parseCsv(text);
  if (!rows.length) return { ok: false, fatal: "The file is empty." };

  const header = rows[0].map((h) => h.trim());
  const body = rows.slice(1);

  const findings = [];
  const push = (severity, kind, message, row = null, column = null) =>
    findings.push({ id: `${kind}-${row ?? "x"}-${column ?? "x"}-${findings.length}`, severity, kind, message, row, column });

  /* ── structure ── */
  const missing = schema.columns.filter((c) => !header.includes(c.name));
  missing.forEach((c) =>
    push("error", "Missing column", `Required column "${c.name}" is not in the header.`),
  );

  const known = new Set(schema.columns.map((c) => c.name));
  header
    .filter((h) => h && !known.has(h))
    .forEach((h) => {
      if (FAKE_CODE_COLUMNS.test(h)) {
        push(
          "warning",
          "Not a key",
          `"${h}" is present but is not a code — in the source extracts Circle Code equals Circle Name and Panchayat Code is the name with spaces stripped. It will be kept for reference and never joined on.`,
        );
      } else {
        push("info", "Unmapped column", `"${h}" is not in the schema and will be ignored on import.`);
      }
    });

  if (missing.length) {
    // Row-level checks against a header we cannot trust would produce noise.
    return {
      ok: false,
      schema,
      header,
      rowCount: body.length,
      findings,
      counts: tally(findings),
      stoppedEarly: true,
    };
  }

  /* ── rows ── */
  const index = Object.fromEntries(schema.columns.map((c) => [c.name, header.indexOf(c.name)]));
  const seen = new Map();
  let cleanRows = 0;

  body.forEach((cells, i) => {
    const rowNo = i + 2; // 1-based, plus the header
    let rowClean = true;

    // A short row is a structural problem, not a per-field one.
    if (cells.length !== header.length) {
      push(
        "error",
        "Column count",
        `Row has ${cells.length} fields against a header of ${header.length}.`,
        rowNo,
      );
      rowClean = false;
    }

    schema.columns.forEach((col) => {
      const value = cells[index[col.name]];
      const problem = validators[col.rule]?.(value);
      if (problem) {
        push("error", "Invalid value", `"${col.name}" ${problem}.`, rowNo, col.name);
        rowClean = false;
      }
      if (col.unique && !isBlank(value)) {
        const key = String(value).trim();
        if (seen.has(key)) {
          push(
            "error",
            "Duplicate key",
            `"${col.name}" = ${key} already appeared on row ${seen.get(key)}.`,
            rowNo,
            col.name,
          );
          rowClean = false;
        } else {
          seen.set(key, rowNo);
        }
      }
    });

    if (rowClean) cleanRows += 1;
  });

  const counts = tally(findings);
  return {
    ok: counts.error === 0,
    schema,
    header,
    rowCount: body.length,
    cleanRows,
    findings,
    counts,
    stoppedEarly: false,
  };
}

function tally(findings) {
  return findings.reduce(
    (acc, f) => ({ ...acc, [f.severity]: (acc[f.severity] ?? 0) + 1 }),
    { error: 0, warning: 0, info: 0 },
  );
}
