/**
 * Device fleet and telemetry — the model, ahead of the data.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE ROW ARRAYS ARE EMPTY ON PURPOSE. They are not stubs to fill with
 * plausible-looking numbers.
 *
 * The source DMS holds this data — 151 devices, 44 BMS readings, 42 UPS
 * readings, one GTI device across four message streams — and a real extract of
 * it is what fills these arrays. Until it arrives, every screen built on this
 * module renders its honest empty state, which states what is missing and why.
 *
 * This is the same decision `programme-data.js` records for `DEVICE_FLEET`, and
 * the reason is in AGENTS.md §3c: an earlier draft hand-typed 9 survey verdicts
 * and got 5 of them wrong. Fabricated telemetry would be worse, because nobody
 * can eyeball a wrong voltage the way they can spot a wrong verdict.
 *
 * TO LOAD THE REAL DATA: replace the four RAW_* arrays with the transcribed
 * extract, field for field, and delete the `PENDING` reasons below. Every
 * selector, derived metric, band and screen already works — they are pure
 * functions over these arrays. Nothing else has to change.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Shapes below are transcribed from the DMS's own column sets, so the
 * transcription is a rename, not a redesign. See docs/dms-parity-plan.md §2.
 */
import { HIERARCHY } from "./hierarchy.jsx";
import { bandFor, bandDetail, freshnessOf, isImplausible, worstBand } from "./bands.js";
import { SAMPLE_DATA_MESSAGES, SAMPLE_HEARTBEAT_MESSAGES, SAMPLE_SCOPE } from "./device-samples.js";
import {
  parseDataMessage,
  parseHeartbeatMessage,
  ingestLagSeconds,
  decodeTamper,
} from "./gti-parse.js";

export { SAMPLE_SCOPE };

/* ── why each stream is empty ─────────────────────────────────────────────
   One sentence per stream, surfaced in the UI. "No data" is not one of the
   four nothings §6 of the plan distinguishes — this is the "not yet ingested"
   nothing, and it says so.

   Data and Heartbeat are NO LONGER pending: four real payloads from two
   gateways are loaded (device-samples.js). They are a 2-minute sample, not the
   fleet, and `SAMPLE_SCOPE` is what the screens say so with.                 */

export const PENDING = {
  devices: {
    pending: false,
    reason: null,
    detail: null,
  },
  gti: {
    pending: false,
    reason: null,
    detail: null,
  },
  bms: {
    pending: true,
    reason: "BMS readings have not been extracted yet",
    detail:
      "The source system holds 44 pack readings. Three of them carry thermistor sentinel values that must resolve to unknown, not critical — see bands.js pack_temp.",
  },
  ups: {
    pending: true,
    reason: "UPS readings have not been extracted yet",
    detail:
      "The source system holds 42 readings, of which 41 report 0.00 V — silence rendered as a number, not a fleet-wide outage.",
  },
  /** Still genuinely absent — see the note on GTI_STREAMS below. */
  gtiInfo: {
    pending: true,
    reason: "No gateway_handshake message is in the sample",
    detail:
      "Gateway firmware and hardware arrive empty in the heartbeat, so the registry's nameplate is incomplete until a handshake message or the bulk export lands.",
  },
  gtiOndemand: {
    pending: true,
    reason: "No on-demand message is in the sample",
    detail: "The command/response stream was not included in the four sample payloads.",
  },
  inverter: {
    pending: true,
    reason: "No inverter object appears in any sample payload",
    detail:
      "The Data message carries a net meter (MS-*), not an inverter. The only trace of an inverter anywhere in these payloads is the gateway's INVERR error flag, so inverter telemetry is still outstanding.",
  },
};

/* ── expected reporting interval ──────────────────────────────────────────
   docs/dashboard-ia.md Q2 — CLOSED, and better than the seed it replaces.

   **The devices declare their own cadence.** `STINTERVAL` is in every payload:
   15 minutes on Data, 30 on Heartbeat, per device per message. So freshness is
   measured against what the device says it will do, not against a constant
   someone guessed — and a gateway that changes its cadence stays correctly
   classified without a code change.

   The fallbacks below apply only to classes with no payload yet (BMS, UPS).
   They remain [seed] and remain the most consequential unverified numbers here:
   an interval set too long makes a dead device read live for hours.          */

export const REPORT_INTERVAL_MS = {
  ups: 15 * 60 * 1000, // [seed] — no UPS payload seen yet
  bms: 15 * 60 * 1000, // [seed] — no BMS payload seen yet
  gti: 15 * 60 * 1000, // superseded per row by the payload's own STINTERVAL
};

/** True only for the classes still on a guessed interval. */
export const INTERVAL_IS_SEED = false;

/** A row's own declared interval, falling back to the class seed. */
function intervalMsFor(row, deviceClass = "gti") {
  if (row?.intervalMin) return row.intervalMin * 60 * 1000;
  return REPORT_INTERVAL_MS[deviceClass] ?? 15 * 60 * 1000;
}

/* ── the device registry ──────────────────────────────────────────────────
   Columns transcribed from the DMS Devices screen, with three renames and one
   deliberate omission.

   RENAMES — docs/dashboard-ia.md §8's rule, that a name meaning one thing in
   the source and another in the model makes every query ambiguous:
     Device No.  → deviceNo      (the IoT asset; NOT the survey extract's
                                  `Device ID`, which is a surveyor's phone and
                                  is already renamed `capture_device`)
     Device Type → deviceClass   ("type" is overloaded across both extracts)
     System Type → systemType    (kept, values normalised to lowercase)

   OMITTED — Consumer Name, Mobile No. and Owning User Email.
   `assets.jsx` refuses to bundle the consumer master's 9,673 names and phone
   numbers into a public client build, and a device registry keyed on consumer
   identity would reopen that decision by the back door. The model carries a
   `consumerRef` — the consumer NUMBER, which is already public in the survey
   extract — and the PII stays server-side until docs/dms-parity-plan.md Q3 is
   answered deliberately. The registry screen shows the ref and links out.   */

/**
 * The registry is DERIVED from the messages, not maintained beside them.
 *
 * There is no registry export yet, but every payload identifies its own device —
 * IMEI, ASN, the meter nameplate, the declared interval — so the fleet can be
 * assembled from the traffic. When the real registry arrives it becomes the
 * authority and this becomes a reconciliation (a device in the traffic but not
 * the registry is itself a finding worth having).
 *
 * @type {Array<{
 *   id: string, deviceNo: string, deviceClass: "ups"|"bms"|"gti",
 *   systemType: "solar"|"non solar", dealer: string|null,
 *   consumerRef: string|null, enabled: boolean,
 *   circleId: string|null, districtId: string|null, subdivisionId: string|null,
 *   sectionId: string|null, panchayatId: string|null,
 *   nameplate: object, lastSeen: Date|null,
 * }>} */
function devicesFromMessages(dataRows, heartbeatRows) {
  const byImei = new Map();

  const touch = (deviceNo) => {
    if (!byImei.has(deviceNo)) {
      byImei.set(deviceNo, {
        id: deviceNo,
        deviceNo,
        // These gateways front a net meter on a grid-tied rooftop. `gti` is the
        // class the nav and the registry already use for them.
        deviceClass: "gti",
        systemType: "solar",
        dealer: null,
        consumerRef: null,
        enabled: true,
        // NOT PLACED IN THE HIERARCHY. The payloads carry no geography — only
        // an ASN, and LAT/LON are (0,0). So these devices answer to the discom
        // root and vanish under any circle, which is honest: nothing in the
        // data says where they are. Raised as an exception rather than guessed.
        circleId: null,
        districtId: null,
        subdivisionId: null,
        sectionId: null,
        panchayatId: null,
        nameplate: {},
        lastSeen: null,
        intervalMin: null,
        streams: new Set(),
      });
    }
    return byImei.get(deviceNo);
  };

  for (const r of dataRows) {
    const d = touch(r.deviceNo);
    d.streams.add("data");
    // ASN is the only site-ish identifier in the payload. Kept as `asn`, NOT
    // mapped onto consumerRef — whether JD10002 joins the consumer register is
    // an open question, and asserting the join by assigning the field would
    // make it look answered.
    d.asn ??= r.asn;
    Object.assign(d.nameplate, r.nameplate);
    if (!d.lastSeen || (r.timestamp && r.timestamp > d.lastSeen)) d.lastSeen = r.timestamp;
    d.intervalMin ??= r.intervalMin;
    d.latestMeter =
      !d.latestMeter || (r.timestamp && r.timestamp > d.latestMeter.timestamp) ? r : d.latestMeter;
  }

  for (const r of heartbeatRows) {
    const d = touch(r.deviceNo);
    d.streams.add("heartbeat");
    // Gateway firmware/hardware are empty strings in the sample; the parser has
    // already turned those into nulls, so Object.assign cannot overwrite a real
    // meter value with a blank.
    for (const [k, v] of Object.entries(r.nameplate)) if (v !== null) d.nameplate[k] ??= v;
    if (!d.lastSeen || (r.timestamp && r.timestamp > d.lastSeen)) d.lastSeen = r.timestamp;
    d.latestHeartbeat =
      !d.latestHeartbeat || (r.timestamp && r.timestamp > d.latestHeartbeat.timestamp)
        ? r
        : d.latestHeartbeat;
  }

  return [...byImei.values()].map((d) => ({ ...d, streams: [...d.streams] }));
}

/* ── nameplate ────────────────────────────────────────────────────────────
   plan §2.2 calls this "the prerequisite" — no nameplate, no band, because a
   threshold cannot be resolved against an unknown pack design.

   GTI INFO is a nameplate stream, not a telemetry one. Firmware / hardware /
   manufacturer / model belong on the device record, and the GTI Info tab is a
   VIEW of them rather than their home — otherwise the registry can never
   report nameplate completeness, which is the column plan §7.4 leads with.  */

export const NAMEPLATE_FIELDS = {
  ups: ["manufacturer", "model", "rated_va", "firmware"],
  bms: ["manufacturer", "model", "chemistry", "series_count", "rated_capacity_ah", "rated_cycles"],
  // A rooftop gateway needs BOTH boards described plus the array rating. The
  // meter half arrives with every data frame; the gateway half arrives empty in
  // the heartbeat and `rated_kw` is nowhere in the payloads at all — which is
  // why `specific_yield` (kWh ÷ kWp) is still uncomputable.
  gti: [
    "meter_manufacturer",
    "meter_firmware",
    "meter_current_rating",
    "gateway_firmware",
    "gateway_hardware",
    "rated_kw",
  ],
};

/** Fraction of a device's expected nameplate fields that are populated, 0–100. */
export function nameplateCompleteness(device) {
  const expected = NAMEPLATE_FIELDS[device.deviceClass] ?? [];
  if (!expected.length) return null;
  const have = expected.filter((f) => {
    const v = device.nameplate?.[f];
    return v !== undefined && v !== null && v !== "";
  });
  return (have.length / expected.length) * 100;
}

/** Which nameplate fields are missing — the actionable half of the figure. */
export function missingNameplate(device) {
  const expected = NAMEPLATE_FIELDS[device.deviceClass] ?? [];
  return expected.filter((f) => {
    const v = device.nameplate?.[f];
    return v === undefined || v === null || v === "";
  });
}

/* ── telemetry rows ───────────────────────────────────────────────────────
   Four shapes, one per stream the DMS exposes. Every one keeps `payload` for
   the JSON action and `insertedOn` separately from `timestamp` — the gap
   between them IS the ingestion lag the Data health screen needs, and
   collapsing them into one field throws it away.                            */

/**
 * Data messages, parsed. Each yields TWO rows in the UI, because one message
 * carries two different things:
 *
 *   · an ENVELOPE row on the GTI Data screen (sequence, indices, interval, lag)
 *   · a METER row on the Meter screen (volts, hertz, import/export, demand)
 *
 * They are not duplicated storage — the same parsed object serves both, read
 * through different column sets. Splitting them into two arrays would be the
 * thing that lets them disagree.
 */
const GTI_DATA_PARSED = SAMPLE_DATA_MESSAGES.map((m) => parseDataMessage(m.payload, m.filename))
  .map((r) => ({ ...r, id: `${r.deviceNo}-data-${r.msgSeq}`, ingestLagSec: ingestLagSeconds(r) }))
  .sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0));

const GTI_HEARTBEAT_PARSED = SAMPLE_HEARTBEAT_MESSAGES.map((m) =>
  parseHeartbeatMessage(m.payload, m.filename),
)
  .map((r) => ({ ...r, id: `${r.deviceNo}-hb-${r.msgSeq}`, ingestLagSec: ingestLagSeconds(r) }))
  .sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0));

/** No handshake message in the sample. */
const RAW_GTI_INFO = [];
/** No on-demand message in the sample. */
const RAW_GTI_ONDEMAND = [];
/** BMS pack readings — soc, cycles, temp1..4, cells, capacity. */
const RAW_BMS = [];
/** UPS readings — voltage, load. */
const RAW_UPS = [];

/* ── derivation ───────────────────────────────────────────────────────────── */

/** The four thermistors, minus the ones that are lying. */
function plausibleTemps(row) {
  return [row.temp1, row.temp2, row.temp3, row.temp4].filter(
    (t) => typeof t === "number" && !isImplausible("pack_temp", t),
  );
}

/**
 * Derived BMS fields — plan §5.4's "the high-value diagnostics are derivations,
 * not raw fields".
 *
 * `tempSpread` is computed across PLAUSIBLE thermistors only. A pack reporting
 * 27 °C on one probe and −58 °C on three does not have an 85 °C spread; it has
 * one working probe and three disconnected ones. Computing the naive max−min
 * would manufacture a critical alarm out of a wiring fault — and it would look
 * exactly like a real thermal event, which is the worst possible failure for
 * this field.
 */
export function deriveBmsRow(row) {
  const temps = plausibleTemps(row);
  const faultyProbes = [row.temp1, row.temp2, row.temp3, row.temp4].filter(
    (t) => typeof t === "number" && isImplausible("pack_temp", t),
  ).length;

  const packTemp = temps.length ? Math.max(...temps) : null;
  const tempSpread = temps.length >= 2 ? Math.max(...temps) - Math.min(...temps) : null;

  const freshness = freshnessOf(row.timestamp, REPORT_INTERVAL_MS.bms);

  return {
    ...row,
    packTemp,
    tempSpread,
    faultyProbes,
    // Spread across one surviving probe is not a spread. Null, with the probe
    // count beside it, says why.
    tempSpreadReason:
      temps.length >= 2
        ? null
        : `Only ${temps.length} of 4 thermistors reported a plausible value`,
    freshness,
    // Capacity is banded against the nameplate rating, so the Ah/Wh unit
    // mismatch in the source (100 vs 10000) surfaces as an outlier rather than
    // as a pack a hundred times larger than its siblings.
    capacityRatio:
      row.capacity != null && row.nameplate?.rated_capacity_ah
        ? (row.capacity / row.nameplate.rated_capacity_ah) * 100
        : null,
  };
}

/** Derived UPS fields. Load needs a rating to mean anything. */
export function deriveUpsRow(row) {
  const freshness = freshnessOf(row.timestamp, REPORT_INTERVAL_MS.ups);
  return {
    ...row,
    freshness,
    loadPct:
      row.load != null && row.nameplate?.rated_va ? (row.load / row.nameplate.rated_va) * 100 : null,
    // SOC × capacity ÷ present load, plan §5.4. Uncomputable without both a
    // rating and a live load, which is most of this fleet today.
    autonomyMinutes: null,
  };
}

/* ── scope ────────────────────────────────────────────────────────────────
   Same contract as programme-data.js's `rowIsUnder`, including the discom-root
   special case. That root sits ABOVE every row's path and is never in it —
   without the explicit check, every scope-aware figure reads 0 at the top of
   the tree, which is where the app opens. AGENTS.md §3c records the bug.     */

function deviceIsUnder(device, nodeId) {
  if (nodeId === HIERARCHY.id) return true;
  return [
    device.circleId,
    device.districtId,
    device.subdivisionId,
    device.sectionId,
    device.panchayatId,
  ].includes(nodeId);
}

export const DEVICES = devicesFromMessages(GTI_DATA_PARSED, GTI_HEARTBEAT_PARSED).map((d) => ({
  ...d,
  completeness: nameplateCompleteness(d),
  missing: missingNameplate(d),
  // The device's OWN declared interval, not a class constant. Q2, closed.
  freshness: freshnessOf(d.lastSeen, intervalMsFor(d, d.deviceClass)),
  intervalIsDeclared: Boolean(d.intervalMin),
}));

const BY_DEVICE_NO = new Map(DEVICES.map((d) => [d.deviceNo, d]));

/** Attach the owning device and its per-row freshness. */
function withDevice(row, deviceClass = "gti") {
  const device = BY_DEVICE_NO.get(row.deviceNo);
  return {
    ...row,
    device,
    // Rows parsed from a payload already carry their own nameplate; rows from a
    // future bulk extract may not, so fall back to the registry's.
    nameplate: row.nameplate ?? device?.nameplate ?? null,
    freshness: freshnessOf(row.timestamp, intervalMsFor(row, deviceClass)),
  };
}

export const GTI_DATA = GTI_DATA_PARSED.map((r) => withDevice(r));
export const GTI_HEARTBEAT = GTI_HEARTBEAT_PARSED.map((r) => withDevice(r));
export const GTI_INFO = RAW_GTI_INFO.map((r) => withDevice(r));
export const GTI_ONDEMAND = RAW_GTI_ONDEMAND.map((r) => withDevice(r));
export const BMS_READINGS = RAW_BMS.map((r) => withDevice(r, "bms")).map(deriveBmsRow);
export const UPS_READINGS = RAW_UPS.map((r) => withDevice(r, "ups")).map(deriveUpsRow);

/**
 * Meter readings — the `MS-*` body of every Data message.
 *
 * Same objects as `GTI_DATA`, read through the meter's column set instead of the
 * envelope's. This is where the real telemetry lives: the DMS's GTI Data screen
 * showed only the envelope and discarded all sixty-odd meter fields.
 */
export const METER_READINGS = GTI_DATA;

/** The four GTI streams, keyed by the route segment that shows them. */
export const GTI_STREAMS = {
  data: { rows: GTI_DATA, label: "Data", msgType: "telemetry", pending: null },
  heartbeat: { rows: GTI_HEARTBEAT, label: "Heartbeat", msgType: "heartbeat", pending: null },
  info: { rows: GTI_INFO, label: "Info", msgType: "gateway_handshake", pending: PENDING.gtiInfo },
  "on-demand": {
    rows: GTI_ONDEMAND,
    label: "On demand",
    msgType: "ondemand",
    pending: PENDING.gtiOndemand,
  },
};

/* ── selectors ────────────────────────────────────────────────────────────── */

/** Devices in scope, optionally filtered by class. */
export function devicesFor(nodeId, { deviceClass } = {}) {
  return DEVICES.filter(
    (d) => deviceIsUnder(d, nodeId) && (!deviceClass || d.deviceClass === deviceClass),
  );
}

/** Readings in scope, within an optional ISO date range. */
export function readingsFor(rows, nodeId, { start, end, deviceNo } = {}) {
  const from = start ? new Date(`${start}T00:00:00`) : null;
  const to = end ? new Date(`${end}T23:59:59.999`) : null;
  return rows.filter((r) => {
    const d = r.device;
    if (d && !deviceIsUnder(d, nodeId)) return false;
    if (deviceNo && !String(r.deviceNo).toLowerCase().includes(deviceNo.toLowerCase())) return false;
    if (from && r.timestamp && r.timestamp < from) return false;
    if (to && r.timestamp && r.timestamp > to) return false;
    return true;
  });
}

/**
 * Fleet counts for the Overview tiles.
 *
 * Returns `{ pending: true, reason }` per class while the extract is
 * outstanding, which is exactly what `KpiTile`'s `notConfigured` prop consumes.
 * Two populations are counted separately and named separately, because the
 * source DMS conflates them and its own cards disagree with its own tables —
 * 146 against 151, 63 against 44, 76 against 42 (dms-parity-plan.md Q2). A
 * count with no stated population is how that happens.
 */
export function fleetCounts(nodeId) {
  const out = {};
  for (const cls of ["devices", "gti", "bms", "ups"]) {
    if (PENDING[cls]?.pending) {
      out[cls] = { pending: true, reason: PENDING[cls].reason, detail: PENDING[cls].detail };
      continue;
    }
    const registered =
      cls === "devices" ? devicesFor(nodeId).length : devicesFor(nodeId, { deviceClass: cls }).length;
    const reporting = (cls === "devices"
      ? devicesFor(nodeId)
      : devicesFor(nodeId, { deviceClass: cls })
    ).filter((d) => d.freshness === "live" || d.freshness === "late").length;
    out[cls] = { registered, reporting, pending: false };
  }
  return out;
}

/** Worst band across a device's headline measures — one chip per row. */
export function deviceHealth(device) {
  if (device.freshness === "offline" || device.freshness === "stale") return "unknown";
  const latest = device.latest ?? {};
  const bands = [];
  if (device.deviceClass === "bms") {
    bands.push(bandFor("soc", latest.soc, device.nameplate));
    bands.push(bandFor("pack_temp", latest.packTemp, device.nameplate));
    bands.push(bandFor("temp_spread", latest.tempSpread, device.nameplate));
  }
  if (device.deviceClass === "ups") {
    bands.push(bandFor("grid_voltage", latest.voltage, device.nameplate));
    bands.push(bandFor("ups_mode", latest.mode, device.nameplate));
  }
  return worstBand(bands);
}

/* ── exceptions ───────────────────────────────────────────────────────────
   Every entry below is a defect the FOUR REAL PAYLOADS actually contain. None
   is hypothetical, and none was hand-typed — each is recomputed from the parsed
   rows, the same discipline programme-data.js's `exceptionsFor` follows.

   Ordered by what would cost the most to get wrong: a clock skew silently
   misfiles billing; a failed read silently reads as a dead supply.           */

export function deviceExceptionsFor(nodeId) {
  const ex = [];
  const push = (e) => ex.push(e);

  for (const r of readingsFor(GTI_DATA, nodeId)) {
    // Weeks of skew, and every billing stamp the meter emits agrees with it.
    if (r.meterClockSkewDays != null && Math.abs(r.meterClockSkewDays) > 1) {
      const days = Math.abs(r.meterClockSkewDays);
      const dir = r.meterClockSkewDays > 0 ? "ahead of" : "behind";
      push({
        id: `${r.id}-clock`,
        type: "Meter clock skew",
        severity: days > 30 ? "critical" : "warning",
        deviceNo: r.deviceNo,
        detail: `Meter RTC is ${days.toFixed(1)} days ${dir} the message carrying its reading. Every billing period and max-demand window it stamps is offset by the same amount.`,
        age: r.timestamp,
      });
    }

    // The all-zero frame. Nameplate present, every register zero, RTC 000000.
    if (r.readFailed) {
      push({
        id: `${r.id}-noread`,
        type: "Meter did not respond",
        severity: "warning",
        deviceNo: r.deviceNo,
        detail:
          "Every register returned zero with the meter's own clock reading 000000. This is a failed read, not a dead supply — the measurements are withheld rather than shown as 0.",
        age: r.timestamp,
      });
    }

    // 0x001A on one sample — three bits asserted, meanings undocumented.
    if (r.tamper?.any) {
      push({
        id: `${r.id}-tamper`,
        type: "Tamper flags asserted",
        severity: "critical",
        deviceNo: r.deviceNo,
        detail: `TMPSTS = ${r.tamper.raw} — bits ${r.tamper.bits.join(", ")} set. The bit meanings are undocumented, so the condition is real but unnamed.`,
        age: r.timestamp,
      });
    }

    // 4.40 net against 0.00 import and 0.00 export.
    if (
      Number(r.energyNet) !== 0 &&
      Number(r.energyImport) === 0 &&
      Number(r.energyExport) === 0
    ) {
      push({
        id: `${r.id}-energy`,
        type: "Energy registers inconsistent",
        severity: "warning",
        deviceNo: r.deviceNo,
        detail: `Net energy reads ${r.energyNet} kWh while both import and export read 0.00. Net cannot be non-zero with both components zero.`,
        age: r.timestamp,
      });
    }

    // A device seen in the traffic but placed nowhere in the hierarchy.
    if (r.device && !r.device.circleId) {
      push({
        id: `${r.deviceNo}-unplaced`,
        type: "Device not placed in hierarchy",
        severity: "warning",
        deviceNo: r.deviceNo,
        detail: `The payload carries no geography — only ASN ${r.asn ?? "—"} — and its coordinates are (0, 0). The device answers to the discom root and disappears under any circle.`,
        age: r.timestamp,
      });
    }
  }

  for (const r of readingsFor(GTI_HEARTBEAT, nodeId)) {
    if (r.boardTempAbsent) {
      push({
        id: `${r.id}-temp`,
        type: "Board thermistor absent",
        severity: "warning",
        deviceNo: r.deviceNo,
        detail:
          "Board temperature reports -127 °C, the 1-wire 'no sensor present' reply. The gateway has no usable thermal reading.",
        age: r.timestamp,
      });
    }
    if (r.geoAbsent) {
      push({
        id: `${r.id}-geo`,
        type: "No coordinates",
        severity: "warning",
        deviceNo: r.deviceNo,
        detail: "Latitude and longitude are exactly (0, 0) — Null Island. The gateway cannot be mapped.",
        age: r.timestamp,
      });
    }
    if (bandFor("gateway_rsrp", r.rsrp) === "warning" || bandFor("gateway_rsrp", r.rsrp) === "critical") {
      push({
        id: `${r.id}-signal`,
        type: "Weak gateway signal",
        severity: bandFor("gateway_rsrp", r.rsrp) === "critical" ? "critical" : "warning",
        deviceNo: r.deviceNo,
        detail: `RSRP ${r.rsrp} dBm. A permanently weak gateway is a permanently late one — this is the condition that produces ingestion lag and gaps in the message sequence.`,
        age: r.timestamp,
      });
    }
    if (r.modemFirmwareIsBeta) {
      push({
        id: `${r.id}-beta`,
        type: "Beta modem firmware",
        severity: "warning",
        deviceNo: r.deviceNo,
        detail: `Modem firmware is ${r.nameplate?.modem_firmware ?? "a beta build"} — a pre-release build running in the field.`,
        age: r.timestamp,
      });
    }
  }

  // Deduplicate the per-device (rather than per-row) findings, then sort newest
  // first. Without this, one unplaced device raises one exception per message.
  const seen = new Set();
  return ex
    .filter((e) => (seen.has(e.id) ? false : seen.add(e.id)))
    .sort((a, b) => (b.age?.getTime() ?? 0) - (a.age?.getTime() ?? 0));
}

export { bandDetail, deviceIsUnder, decodeTamper };
