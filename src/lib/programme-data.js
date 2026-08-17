/**
 * Programme data — derived from the two source extracts, not invented.
 *
 * `RAW_SURVEYS` transcribes the 9 rows of `Solar PV Site Survey.csv` field for
 * field. Everything downstream — verdicts, pipeline counts, exceptions, the
 * run-rate trend — is a pure computation over that transcription, using the
 * rules in docs/dashboard-ia.md §3.2 and §7. Nothing here is a placeholder
 * number; where a figure cannot be computed honestly (coverage %), the
 * dashboard renders `unknown`, not a guess.
 */
import { HIERARCHY, rollupRegistered } from "./hierarchy.jsx";
import { parseIndianDate } from "./format.js";

/* ── the 9 real survey rows ─────────────────────────────────────────────── */

const GHATAON = {
  circleId: "c-sasaram",
  districtId: "d-kaimur",
  subdivisionId: "sd-kudra",
  sectionId: "s-kudra-pusauli",
  panchayatId: "p-kudra-pusauli-ghataon",
  panchayatName: "GHATAON",
};
const BADHAUNA = {
  circleId: "c-sasaram",
  districtId: "d-kaimur",
  subdivisionId: "sd-bhabhua-rural",
  sectionId: "s-bhabhua-rural-chainpur",
  panchayatId: "p-bhabhua-rural-chainpur-badhauna",
  panchayatName: "BADHAUNA",
};

const RAW_SURVEYS = [
  {
    consumerName: "AMAJAD SAH",
    consumerNumber: "225304750594",
    place: GHATAON,
    surveyDate: "07-08-2026, 16:18",
    submittedOn: "07-08-2026 16:27:34",
    geo: { lat: 25.0906107, lng: 83.7253975, accuracy: 3.04 },
    rooftopAvailable: "Yes",
    roofTopStatus: "RCC Roof",
    shadowFree: "No",
    earlyLateShadow: "No",
    access: "Ladder",
    obstacles: "Yes",
    orientation: "East-West",
    floors: 1,
    structureLocated: "Yes",
    earthingLocated: "Yes",
    distStructure: 10,
    distEarthing: 10,
    contractor: "MERAQUI VENTURES PVT LTD",
    employee: "Deepak Kumar - 11126",
  },
  {
    consumerName: "SANGEETA DEVI",
    consumerNumber: "225304751666",
    place: GHATAON,
    surveyDate: "07-08-2026, 15:42",
    submittedOn: "07-08-2026 15:49:35",
    geo: { lat: 25.0886304, lng: 83.7220671, accuracy: 3 },
    rooftopAvailable: "Yes",
    roofTopStatus: "RCC Roof",
    shadowFree: "No",
    earlyLateShadow: "No",
    access: "Ladder",
    obstacles: "No",
    orientation: "East-West",
    floors: 1,
    structureLocated: "Yes",
    earthingLocated: "Yes",
    distStructure: 10,
    distEarthing: 10,
    contractor: "MERAQUI VENTURES PVT LTD",
    employee: "Deepak Kumar - 11126",
  },
  {
    consumerName: "LAKHAN CHOUDHARY",
    consumerNumber: "225304751591",
    place: GHATAON,
    surveyDate: "07-08-2026, 15:07",
    submittedOn: "07-08-2026 15:18:41",
    geo: { lat: 25.0888147, lng: 83.7218592, accuracy: 3 },
    // Rooftop Available? = No, yet structure/earthing are located and a
    // ladder + electricity bill were captured — the DQ-2 contradiction
    // docs/dashboard-ia.md §7 flags: roof evidence exists for a "no roof" row.
    rooftopAvailable: "No",
    shadowFreeGround: "No",
    structureLocated: "Yes",
    earthingLocated: "Yes",
    distStructure: 10,
    distEarthing: 10,
    hasRoofEvidence: true,
    contractor: "MERAQUI VENTURES PVT LTD",
    employee: "Deepak Kumar - 11126",
  },
  {
    consumerName: "VINOD MALAH",
    consumerNumber: "225304751526",
    place: GHATAON,
    surveyDate: "07-08-2026, 14:56",
    submittedOn: "07-08-2026 15:03:25",
    geo: { lat: 25.0889188, lng: 83.7219191, accuracy: 3 },
    rooftopAvailable: "Yes",
    roofTopStatus: "RCC Roof",
    shadowFree: "No",
    earlyLateShadow: "No",
    access: "Ladder",
    obstacles: "No",
    orientation: "East-West",
    floors: 1,
    structureLocated: "Yes",
    earthingLocated: "Yes",
    distStructure: 10,
    distEarthing: 10,
    contractor: "MERAQUI VENTURES PVT LTD",
    employee: "Deepak Kumar - 11126",
  },
  {
    consumerName: "BINDU DEVI",
    consumerNumber: "225304751319",
    place: GHATAON,
    surveyDate: "07-08-2026, 14:35",
    submittedOn: "07-08-2026 14:48:34",
    geo: { lat: 25.0888929, lng: 83.721925, accuracy: 3 },
    rooftopAvailable: "Yes",
    roofTopStatus: "RCC Roof",
    shadowFree: "No",
    earlyLateShadow: "No",
    access: "Ladder",
    obstacles: "No",
    orientation: "East-West",
    floors: 1,
    structureLocated: "Yes",
    earthingLocated: "Yes",
    distStructure: 10,
    // 109 against a fleet median of 10 — DQ-3, a near-certain typo for "10".
    distEarthing: 109,
    contractor: "MERAQUI VENTURES PVT LTD",
    employee: "Deepak Kumar - 11126",
  },
  {
    consumerName: "LAGAN CHAUDHARY",
    consumerNumber: "225304751508",
    place: GHATAON,
    surveyDate: "07-08-2026, 14:09",
    submittedOn: "07-08-2026 14:29:34",
    geo: { lat: 25.0888846, lng: 83.7218979, accuracy: 3 },
    rooftopAvailable: "Yes",
    roofTopStatus: "RCC Roof",
    shadowFree: "No",
    earlyLateShadow: "No",
    access: "Ladder",
    obstacles: "No",
    orientation: "East-West",
    floors: 1,
    structureLocated: "Yes",
    earthingLocated: "Yes",
    distStructure: 10,
    distEarthing: 10,
    contractor: "MERAQUI VENTURES PVT LTD",
    employee: "Deepak Kumar - 11126",
  },
  {
    consumerName: "UMA DEVI",
    consumerNumber: "225304751689",
    place: GHATAON,
    surveyDate: "07-08-2026, 12:38",
    submittedOn: "07-08-2026 13:00:21",
    geo: { lat: 25.0904258, lng: 83.7223091, accuracy: 3 },
    rooftopAvailable: "Yes",
    roofTopStatus: "RCC Roof",
    shadowFree: "Yes",
    earlyLateShadow: "Yes",
    access: "Ladder",
    obstacles: "No",
    orientation: "East-West",
    floors: 2,
    structureLocated: "Yes",
    earthingLocated: "Yes",
    distStructure: 10,
    distEarthing: 10,
    contractor: "MERAQUI VENTURES PVT LTD",
    employee: "Deepak Kumar - 11126",
  },
  {
    consumerName: "DHUKHANI DHOBI",
    consumerNumber: "22510032765",
    place: BADHAUNA,
    surveyDate: "06-08-2026, 16:33",
    submittedOn: "06-08-2026 16:49:42",
    geo: { lat: 25.003962, lng: 83.4244552, accuracy: 3.16 },
    rooftopAvailable: "Yes",
    roofTopStatus: "RCC Roof",
    shadowFree: "No",
    earlyLateShadow: "Yes",
    access: "Ladder",
    obstacles: "No",
    orientation: "North-South",
    floors: 1,
    structureLocated: "Yes",
    earthingLocated: "Yes",
    distStructure: 8,
    distEarthing: 9,
    contractor: "MERAQUI VENTURES PVT LTD",
    employee: "Aditya Raj Tiwari - 11125",
  },
  {
    consumerName: "LACHCHHOO BAHELIYA",
    consumerNumber: "225102131443",
    place: BADHAUNA,
    surveyDate: "06-08-2026, 15:29",
    submittedOn: "06-08-2026 16:07:13",
    geo: { lat: 24.9966848, lng: 83.4283026, accuracy: 3 },
    rooftopAvailable: "Yes",
    roofTopStatus: "RCC Roof",
    shadowFree: "No",
    earlyLateShadow: "No",
    access: "Manual Arrangement",
    obstacles: "No",
    orientation: "East-West",
    floors: 1,
    structureLocated: "Yes",
    earthingLocated: "Yes",
    distStructure: 8,
    distEarthing: 9,
    contractor: "MERAQUI VENTURES PVT LTD",
    employee: "Aditya Raj Tiwari - 11125",
  },
];

/* ── feasibility verdict — docs/dashboard-ia.md §3.2, applied literally ──── */

export function computeVerdict(row) {
  // DQ-2: "No roof" carrying roof evidence is a contradiction, not a fact.
  if (row.rooftopAvailable === "No" && row.hasRoofEvidence) return "Needs revisit";
  if (row.rooftopAvailable === "Yes") {
    const clean =
      row.shadowFree === "Yes" &&
      row.earlyLateShadow !== "Yes" &&
      row.obstacles === "No" &&
      row.access !== "Manual Arrangement";
    return clean ? "Feasible" : "Feasible with conditions";
  }
  return row.shadowFreeGround === "Yes" ? "Ground-mount candidate" : "Not feasible";
}

/** Human reasons a "with conditions" or "not feasible" verdict landed there. */
function verdictReasons(row) {
  const r = [];
  if (row.shadowFree === "No") r.push("roof not shadow-free");
  if (row.earlyLateShadow === "Yes") r.push("early/late shadow");
  if (row.obstacles === "Yes") r.push("obstruction present");
  if (row.access === "Manual Arrangement") r.push("no ladder access");
  return r;
}

export const SURVEY_ROWS = RAW_SURVEYS.map((row, i) => ({
  id: `survey-${i + 1}`,
  ...row,
  ...row.place,
  surveyDate: parseIndianDate(row.surveyDate),
  submittedOn: parseIndianDate(row.submittedOn),
  verdict: computeVerdict(row),
  verdictReasons: verdictReasons(row),
  photos: 10, // all ten evidence slots populated in every one of the 9 rows
}));

/** True if `nodeId` is this row's panchayat, or any ancestor of it. */
function rowIsUnder(row, nodeId) {
  // The discom root sits above every row's path but is never IN it, so it
  // needs its own check — without this, every scope-aware figure read 0 at
  // the top of the tree, which is where the app opens by default.
  if (nodeId === HIERARCHY.id) return true;
  return [row.circleId, row.districtId, row.subdivisionId, row.sectionId, row.panchayatId].includes(
    nodeId,
  );
}

export function surveyedCount(nodeId) {
  return SURVEY_ROWS.filter((r) => rowIsUnder(r, nodeId)).length;
}

/** The individual survey records in scope — the Sites screen's row detail. */
export function surveysFor(nodeId) {
  return SURVEY_ROWS.filter((r) => rowIsUnder(r, nodeId));
}

/**
 * Coverage %, or the honest reason it cannot be one.
 *
 * A ratio needs both sides drawn from the same population. In this dataset
 * that fails in two ways: `registered = 0` (Sasaram/Kaimur isn't in the
 * master at all — dividing by zero), or the scope spans more than one circle,
 * where "surveyed" and "registered" trace back to CIRCLES THAT DON'T OVERLAP.
 * The discom root is the only node that spans more than one circle today —
 * dividing Sasaram's 9 surveys by Jamui's 9,673 registrations would print a
 * tiny, confident-looking 0.09% for a programme that has surveyed 0% of the
 * only circle it is actually registered in. That is worse than an honest dash.
 */
export function coverageInfo(node) {
  const registered = rollupRegistered(node);
  const surveyed = surveyedCount(node.id);
  if (registered === 0) {
    return { pct: null, reason: "Registered = 0 for this scope — not in the master extract" };
  }
  if (node.level === "discom") {
    return {
      pct: null,
      reason: "This scope spans multiple circles whose registered and surveyed populations do not overlap",
    };
  }
  return { pct: (surveyed / registered) * 100, reason: null };
}

/* ── pipeline — docs/dashboard-ia.md §2, computed for a scope ─────────────── */

export function pipelineStages(node) {
  const registered = rollupRegistered(node);
  const surveyed = surveyedCount(node.id);
  // Every surveyed row in this sample carries a verdict, so "feasibility
  // decided" tracks 1:1 with "surveyed" today — it will diverge once survey
  // volume exceeds review capacity, and the gap becomes an exception.
  const decided = SURVEY_ROWS.filter((r) => rowIsUnder(r, node.id) && r.verdict).length;
  return [
    { id: "registered", name: "Registered", value: registered },
    { id: "assigned", name: "Assigned", value: 0 },
    { id: "surveyed", name: "Surveyed", value: surveyed },
    { id: "validated", name: "AI validated", value: 0 },
    { id: "decided", name: "Feasibility decided", value: decided },
    { id: "mco", name: "MCO raised", value: 0 },
    { id: "meter", name: "Meter / MDM", value: 0 },
    { id: "billing", name: "Billing linked", value: 0 },
    { id: "commissioned", name: "Commissioned", value: 0 },
  ];
}

/* ── exceptions — docs/dashboard-ia.md §7, one row per real defect ───────── */

export function exceptionsFor(node) {
  const rows = SURVEY_ROWS.filter((r) => rowIsUnder(r, node.id));
  const ex = [];
  for (const r of rows) {
    // DQ-1: every survey's consumer number is absent from the Jamui master —
    // the two extracts do not overlap (docs/dashboard-ia.md Q1).
    ex.push({
      id: `${r.id}-unmatched`,
      type: "Unmatched consumer",
      severity: "warning",
      consumer: r.consumerName,
      panchayat: r.panchayatName,
      detail: `Consumer ${r.consumerNumber} has no row in the registered master`,
      age: r.submittedOn,
    });
    if (r.verdict === "Needs revisit") {
      ex.push({
        id: `${r.id}-contradiction`,
        type: "Contradictory survey",
        severity: "critical",
        consumer: r.consumerName,
        panchayat: r.panchayatName,
        detail: "Rooftop Available? = No, but roof structure and ladder access were recorded",
        age: r.submittedOn,
      });
    }
    if (r.distEarthing > 50) {
      ex.push({
        id: `${r.id}-distance`,
        type: "Measurement outlier",
        severity: "warning",
        consumer: r.consumerName,
        panchayat: r.panchayatName,
        detail: `Distance of earthing recorded as ${r.distEarthing} m against a fleet median of 10 m`,
        age: r.submittedOn,
      });
    }
  }
  return ex.sort((a, b) => b.age - a.age);
}

/* ── run rate — the 2 real capture days ──────────────────────────────────── */

export function submissionsByDay(node) {
  const rows = SURVEY_ROWS.filter((r) => rowIsUnder(r, node.id));
  const counts = new Map();
  for (const r of rows) {
    const key = r.surveyDate.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
}

/* ── child rollups — for the ranked bar and the area table ───────────────── */

export function childRollups(node) {
  return (node.children ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    level: c.level,
    registered: rollupRegistered(c),
    surveyed: surveyedCount(c.id),
  }));
}

/* ── system accounts — the real "Total Users" number ──────────────────────
   No user table exists in either extract. What exists is the "Created By" /
   "Employee ID" values stamped on every row: one bulk-import admin account in
   the master, two field-survey accounts in the survey extract. That is a
   real, if small, count of accounts that have actually touched this data —
   not the same claim as "registered platform users", stated as such below.  */

export const SYSTEM_ACCOUNTS = [
  { name: "Admin - 11111", role: "Bulk import", source: "Consumer master" },
  { name: "Deepak Kumar - 11126", role: "Field surveyor", source: "Site survey" },
  { name: "Aditya Raj Tiwari - 11125", role: "Field surveyor", source: "Site survey" },
];

/** Latest submission timestamp in scope, or null if the scope has none. */
export function latestSubmission(node) {
  const rows = SURVEY_ROWS.filter((r) => rowIsUnder(r, node.id));
  if (!rows.length) return null;
  return rows.reduce((max, r) => (r.submittedOn > max ? r.submittedOn : max), rows[0].submittedOn);
}

/**
 * The consumer master's own latest upload batch — real, from `Created On`.
 * The extract arrived in 8 batches on one day; this is the last of them.
 */
export const MASTER_UPLOADED_AT = parseIndianDate("04-08-2026 14:14:45");

/**
 * Device fleet — GTI / BMS / UPS / general asset counts.
 *
 * Neither CSV contains a device record of any kind. This is not a
 * placeholder waiting to be filled with a plausible number — it is a
 * genuine absence, matching docs/dashboard-ia.md Q7 ("device telemetry
 * schema — outstanding"). Every consumer here is a signature CANDIDATE for
 * one rooftop installation once commissioned (stage 9 of 9); none exist yet.
 * Render these as `notConfigured`, never as 0 or an invented count.
 */
export const DEVICE_FLEET = {
  devices: { notConfigured: true, reason: "No device registry exists in the source extracts yet" },
  gti: { notConfigured: true, reason: "No GTI telemetry schema has arrived yet" },
  bms: { notConfigured: true, reason: "No BMS telemetry schema has arrived yet" },
  ups: { notConfigured: true, reason: "This programme is single-phase rooftop solar — no UPS fleet is specified" },
};

export { HIERARCHY };
