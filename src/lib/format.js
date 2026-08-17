/**
 * Formatting. Indian conventions throughout — en-IN digit grouping, lakh/crore
 * compaction, dd-mm-yyyy dates, because that is what the source data uses and
 * what the reader expects.
 *
 * The rule the components lean on: a formatted numeral contains no spaces;
 * prose does. That single test is how a component decides what may shrink.
 */

const NBSP = " ";

/** 314897 → "3,14,897" */
export function exInt(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

/** 12.345 → "12.35" (2dp default, trailing zeros kept) */
export function exNum(n, dp = 2) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

/** 317000 → "3.17L" · 12400000 → "1.24Cr" — lakh and crore, never K and M. */
export function exCompact(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  const v = Number(n);
  const a = Math.abs(v);
  if (a >= 1e7) return `${(v / 1e7).toFixed(2)}Cr`;
  if (a >= 1e5) return `${(v / 1e5).toFixed(2)}L`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return exInt(v);
}

/** 0.8342 → "83.4%" when `asRatio`, else 83.42 → "83.4%" */
export function exPct(n, { dp = 1, asRatio = false, signed = false } = {}) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  const v = asRatio ? Number(n) * 100 : Number(n);
  const sign = signed && v > 0 ? "+" : "";
  return `${sign}${v.toFixed(dp)}%`;
}

/** A value with its unit, joined by a non-breaking space so it never wraps. */
export function withUnit(value, unit) {
  if (value === "—" || value === null || value === undefined) return "—";
  return unit ? `${value}${NBSP}${unit}` : String(value);
}

/* ── dates ────────────────────────────────────────────────────────────────
   The source CSVs use two different formats in the same row:
     Survey Date  "07-08-2026, 16:18"
     Created On   "07-08-2026 16:27:34"
   Both are dd-mm-yyyy. Neither is ISO. Parse defensively.               */

export function parseIndianDate(s) {
  if (!s) return null;
  const m = String(s)
    .trim()
    .match(/^(\d{2})-(\d{2})-(\d{4})(?:,?\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const [, dd, mm, yyyy, hh = "0", mi = "0", ss = "0"] = m;
  return new Date(+yyyy, +mm - 1, +dd, +hh, +mi, +ss);
}

/** Date | string → "07-08-2026" */
export function toDmy(d) {
  const date = d instanceof Date ? d : parseIndianDate(d);
  if (!date) return "—";
  const p = (n) => String(n).padStart(2, "0");
  return `${p(date.getDate())}-${p(date.getMonth() + 1)}-${date.getFullYear()}`;
}

/** Date | string → "07-08-2026 16:27" */
export function toDmyTime(d) {
  const date = d instanceof Date ? d : parseIndianDate(d);
  if (!date) return "—";
  const p = (n) => String(n).padStart(2, "0");
  return `${toDmy(date)} ${p(date.getHours())}:${p(date.getMinutes())}`;
}

/** Milliseconds → "3 min" · "4 h" · "6 d". Prose, so it may wrap. */
export function humanAge(ms) {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return "—";
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} d`;
  const mo = Math.floor(d / 30);
  return mo < 12 ? `${mo} mo` : `${Math.floor(mo / 12)} y`;
}

/** "…ago" form for a timestamp. */
export function ageFrom(ts, now = Date.now()) {
  const date = ts instanceof Date ? ts : parseIndianDate(ts);
  if (!date) return "—";
  return `${humanAge(now - date.getTime())} ago`;
}

/* ── source-data parsers ────────────────────────────────────────────────── */

/** "25.0906107,83.7253975,3.04" → { lat, lng, accuracy } */
export function parseGeo(s) {
  if (!s) return null;
  const [lat, lng, acc] = String(s).split(",").map(Number);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng, accuracy: Number.isNaN(acc) ? null : acc };
}

/**
 * "SIM1: RSRP:-87dBm,RSRQ:-13db,SINR:null,ASU:53asu,airtel,4G;  SIM2: …"
 * → [{ sim, rsrp, rsrq, sinr, asu, carrier, tech }]
 */
export function parseSignal(s) {
  if (!s) return [];
  return String(s)
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const sim = chunk.match(/^SIM(\d)/)?.[1] ?? null;
      const num = (k) => {
        const v = chunk.match(new RegExp(`${k}:(-?\\d+)`))?.[1];
        return v === undefined ? null : Number(v);
      };
      const tail = chunk.split(",").slice(-2);
      return {
        sim: sim ? `SIM${sim}` : null,
        rsrp: num("RSRP"),
        rsrq: num("RSRQ"),
        sinr: num("SINR"),
        asu: num("ASU"),
        carrier: tail[0]?.trim() || null,
        tech: tail[1]?.trim() || null,
      };
    });
}

/** Postgres array literal `{"/a.jpg","/b.jpg"}` → ["/a.jpg", "/b.jpg"] */
export function parsePgArray(s) {
  if (!s) return [];
  const inner = String(s).trim().replace(/^\{/, "").replace(/\}$/, "");
  if (!inner) return [];
  return inner
    .split(/","|,(?=\/)/)
    .map((x) => x.replace(/^"|"$/g, "").trim())
    .filter(Boolean);
}

/**
 * Long entity names for chart axes. Strips the prefixes that make every
 * division name look alike, then truncates on a word boundary where it can.
 */
export function truncateName(s, max = 18) {
  if (!s) return "";
  const clean = String(s).replace(/^(AEN_|XEN_)/, "");
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return `${sp > max * 0.6 ? cut.slice(0, sp) : cut}…`;
}

/** Title Case for the SHOUTED names in the source data. */
export function titleCase(s) {
  if (!s) return "";
  return String(s)
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase());
}
