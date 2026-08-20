/**
 * Gateway payload parser — the `rtsg-1 / Ongridrooftop` pub-sub messages.
 *
 * Two message types arrive per gateway, and the type in the FILENAME is a
 * transport envelope, not a schema:
 *
 *   …_<IMEI>_Data_pub_sub.json       envelope + one `MS-*` meter object
 *   …_<IMEI>_Heartbeat_pub_sub.json  envelope + one `R-*` radio/gateway object
 *
 * **"GTI Data" carries a net meter, not an inverter.** The body has import AND
 * export energy registers, max-demand registers, and a meter nameplate from
 * GENUS POWER INFRASTRUCTURES — that is the rooftop revenue meter. The only
 * trace of an inverter anywhere in these payloads is the gateway's `INVERR`
 * error flag. Inverter telemetry is still missing, so the Meter screen is where
 * this body belongs and `/telemetry/solar` stays unbuilt.
 *
 * The field names are namespaced by device object and MUST be split, never
 * matched as literals — the moment a second meter or an inverter object appears
 * on the same gateway its address changes and every hardcoded prefix breaks
 * silently.
 */

/* ── the object address ───────────────────────────────────────────────────
   `MS-10-2-3--VN`   → class MS, address [10,2,3], field VN
   `R-1-0---GSM`     → class R,  address [1,0],    field GSM

   Both are the same fixed shape — `CLASS-a-b-c--FIELD` — with the unused
   address segments left empty, which is why R has one more dash than MS. A
   naive `split("--")` works on MS and returns the wrong thing on R.          */

const FIELD_KEY = /^([A-Z]+)((?:-\d*)+)-+([A-Z0-9_]+)$/;

/** `"MS-10-2-3--VN"` → `{ objectClass: "MS", address: [10,2,3], field: "VN" }` */
export function splitFieldKey(key) {
  const m = String(key).match(FIELD_KEY);
  if (!m) return null;
  const [, objectClass, addr, field] = m;
  const address = addr
    .split("-")
    .filter((s) => s !== "")
    .map(Number);
  return { objectClass, address, field, objectId: `${objectClass}-${address.join("-")}` };
}

/**
 * Group a raw payload into its envelope and its objects.
 *
 * Returns `{ envelope, objects: { "MS-10-2-3": {...}, ... } }`. Any key that is
 * not an object-addressed field is envelope — including the `ASN_<n>` keys,
 * whose numeric suffix varies by message type (`ASN_21` on Data, `ASN_0` on
 * Heartbeat) and is therefore normalised to `asn` rather than matched.
 */
export function splitPayload(raw) {
  const envelope = {};
  const objects = {};
  for (const [key, value] of Object.entries(raw ?? {})) {
    const parsed = splitFieldKey(key);
    if (parsed) {
      (objects[parsed.objectId] ??= { objectClass: parsed.objectClass, address: parsed.address, fields: {} });
      objects[parsed.objectId].fields[parsed.field] = value;
      continue;
    }
    if (/^ASN_\d+$/.test(key)) {
      envelope.asn = value === "" ? null : value;
      envelope.asnSlot = Number(key.slice(4));
      continue;
    }
    envelope[key] = value;
  }
  return { envelope, objects };
}

/* ── time ─────────────────────────────────────────────────────────────────
   The single most consequential thing in these files: **the filename stamp is
   UTC and the payload TIMESTAMP is IST.** Verified across all four samples —
   `20260816_193139` + 5:30 = `2026-08-17 01:01:39` against a payload reading
   `01:01:35`.

   Both are therefore parsed to absolute instants with their offset stated
   explicitly, never with `new Date("2026-08-17 01:01:35")`, which would silently
   adopt the VIEWER's timezone and make the ingestion lag wrong by hours for
   anyone outside India.

   > The payload is 4–5 s EARLIER than the filename in every sample, which is
   > the real ingestion lag. That is why `timestamp` and `insertedOn` are kept as
   > separate fields rather than collapsed into one.                          */

const IST = "+05:30";

/** `"2026-08-17 01:01:35"` (device wall clock, IST) → absolute instant. */
export function parseIstStamp(s) {
  if (!s) return null;
  const d = new Date(`${String(s).trim().replace(" ", "T")}${IST}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** `"260722"` (yymmdd, IST) → instant, or null for the `"000000"` unset value. */
export function parseYymmdd(s, time = "000000") {
  const v = String(s ?? "");
  if (!/^\d{6}$/.test(v) || v === "000000") return null;
  const t = /^\d{6}$/.test(String(time)) ? String(time) : "000000";
  const yy = v.slice(0, 2);
  const iso = `20${yy}-${v.slice(2, 4)}-${v.slice(4, 6)}T${t.slice(0, 2)}:${t.slice(2, 4)}:${t.slice(4, 6)}`;
  const d = new Date(`${iso}${IST}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** `"260720130000"` (yymmddHHmmss) → instant, or null for the all-zero unset. */
export function parseYymmddStamp(s) {
  const v = String(s ?? "");
  if (!/^\d{12}$/.test(v) || /^0+$/.test(v)) return null;
  return parseYymmdd(v.slice(0, 6), v.slice(6));
}

/**
 * `20260816_1931399250_rtsg-1_Ongridrooftop_864494089716682_Data_pub_sub 1.json`
 *
 * The date and time are UTC. The four digits after HHMMSS are undocumented —
 * not milliseconds (they exceed 999) and not monotonic across the samples, so
 * most likely a collision-avoidance suffix. Captured as `seq` and not relied on.
 */
export function parseSourceFilename(name) {
  const m = String(name).match(
    /(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})(\d{0,4})_([^_]+)_([^_]+)_(\d+)_([A-Za-z]+)_pub_sub/,
  );
  if (!m) return null;
  const [, y, mo, d, hh, mi, ss, seq, topic, programme, imei, stream] = m;
  return {
    ingestedOn: new Date(Date.UTC(+y, +mo - 1, +d, +hh, +mi, +ss)),
    seq: seq || null,
    topic,
    programme,
    imei,
    stream: stream.toLowerCase(), // "data" | "heartbeat"
  };
}

/* ── sentinels ────────────────────────────────────────────────────────────
   Three distinct "this is not a measurement" values appear in the real
   payloads, and every one of them would band as a confident extreme if fed
   straight to a threshold set. They are declared here rather than at call sites
   so a new stream cannot forget one.                                         */

/** Board temperature. -127 is the 1-wire bus "no sensor present" reply. */
export const BOARD_TEMP_SENTINEL = -127;

/** Geo. Exactly (0, 0) is Null Island — never a rooftop in Bihar. */
export function geoIsAbsent(lat, lon) {
  return Number(lat) === 0 && Number(lon) === 0;
}

/**
 * A Data frame whose meter object never answered.
 *
 * The discriminator is the METER'S OWN RTC reading `000000`, not the voltage
 * being zero and not `MTDET` — two of the three samples carry `MTDET: 0`
 * alongside a perfectly good 239.92 V reading, so MTDET is not a
 * meter-detected flag whatever its name suggests.
 *
 * In the failed frame every register is zero AND the nameplate is still
 * populated, which tells us the gateway caches nameplate rather than reading it
 * live — so a failed read loses the measurements but not the identity.
 */
export function meterReadFailed(fields) {
  return String(fields?.DATE ?? "") === "000000" && String(fields?.TIME ?? "") === "000000";
}

/* ── tamper ───────────────────────────────────────────────────────────────── */

/**
 * `TMPSTS` is a hex bitfield — `"001A00"` on one sample, `"000000"` on the
 * other. 0x1A has three bits set, so that meter is asserting three tamper
 * conditions.
 *
 * **The bit meanings are undocumented.** This returns the positions and no
 * labels, because naming them from guesswork would put invented words next to a
 * real alarm. Requested alongside the other enum docs.
 */
export function decodeTamper(hex) {
  const raw = String(hex ?? "");
  if (!/^[0-9A-Fa-f]+$/.test(raw)) return { raw, value: null, bits: [], any: false, documented: false };
  const value = parseInt(raw, 16);
  const bits = [];
  for (let i = 0; i < 24; i++) if (value & (1 << i)) bits.push(i);
  return { raw, value, bits, any: value !== 0, documented: false };
}

/* ── power factor ─────────────────────────────────────────────────────────
   Both samples report `PF: 1.000` with `I: 0.000` and `POW: 0.000`.

   A power factor is a ratio of real to apparent power. At zero current there is
   no apparent power to divide by, so 1.000 is the register's default, not a
   measurement — and `power_factor`'s thresholds would happily call it a healthy
   green. That is a false GOOD, which is worse than a false alarm here: it tells
   an operator a connection is fine when the platform actually knows nothing
   about it.                                                                  */

/** Below this the meter is effectively idle and PF carries no information. */
export const PF_MIN_CURRENT_A = 0.05;

export function pfIsMeaningful(fields) {
  const i = Number(fields?.I);
  const apow = Number(fields?.APOW);
  if (Number.isNaN(i) && Number.isNaN(apow)) return false;
  return i >= PF_MIN_CURRENT_A || apow > 0;
}

/* ── field maps ───────────────────────────────────────────────────────────
   Label, unit, and the band registry id where one applies. `metric: null`
   means the field is real but has no threshold semantics yet — a register or an
   identifier, not a judgeable measurement.                                   */

export const METER_FIELDS = {
  VN: { label: "Voltage", unit: "V", metric: "grid_voltage", dp: 2 },
  I: { label: "Current", unit: "A", metric: null, dp: 3 },
  POW: { label: "Active power", unit: "kW", metric: null, dp: 3 },
  RPOW: { label: "Reactive power", unit: "kVAr", metric: null, dp: 3 },
  APOW: { label: "Apparent power", unit: "kVA", metric: null, dp: 3 },
  PF: { label: "Power factor", unit: "", metric: "power_factor", dp: 3 },
  FRQ: { label: "Frequency", unit: "Hz", metric: "grid_frequency", dp: 3 },

  KWHNET: { label: "Energy net", unit: "kWh", metric: null, dp: 2 },
  KWHIMP: { label: "Energy import", unit: "kWh", metric: null, dp: 2 },
  KWHEXP: { label: "Energy export", unit: "kWh", metric: null, dp: 2 },
  KVAHNET: { label: "Apparent net", unit: "kVAh", metric: null, dp: 2 },
  KVAHIMP: { label: "Apparent import", unit: "kVAh", metric: null, dp: 2 },
  KVAHEXP: { label: "Apparent export", unit: "kVAh", metric: null, dp: 2 },

  MDKWIMP: { label: "MD import", unit: "kW", metric: null, dp: 2 },
  MDKWEXP: { label: "MD export", unit: "kW", metric: null, dp: 2 },
  PMDKW: { label: "Previous MD", unit: "kW", metric: null, dp: 2 },
  PMDKVA: { label: "Previous MD apparent", unit: "kVA", metric: null, dp: 2 },
  MDRSTC: { label: "MD resets", unit: "", metric: null, dp: 0 },

  LBPF: { label: "Last-billing PF", unit: "", metric: "power_factor", dp: 3 },
  LBPONDUR: { label: "Last-billing power-on", unit: "min", metric: null, dp: 0 },
  LBMDKW: { label: "Last-billing MD", unit: "kW", metric: null, dp: 2 },
  LBMDKVA: { label: "Last-billing MD apparent", unit: "kVA", metric: null, dp: 2 },

  // Units undocumented. 1468 and 4773 on the two samples — minutes would be
  // 1.0 and 3.3 days, which is plausible, but a count of events is equally
  // plausible and the two readings cannot distinguish them.
  POFF: { label: "Power off", unit: "?", metric: null, dp: 0, unverifiedUnit: true },
  TC: { label: "Tamper count", unit: "", metric: null, dp: 0 },
  TRNCOUNT: { label: "Transactions", unit: "", metric: null, dp: 0 },
  CFGBILDAY: { label: "Billing day", unit: "", metric: null, dp: 0 },
};

/**
 * Meter nameplate → device nameplate keys.
 *
 * **Namespaced `meter_*` on purpose.** The meter reports `MTRFWVER`
 * (`G36A5.160001`) and the gateway reports `FW`, and they are two different
 * firmwares on two different boards. A single `firmware` key would let whichever
 * object parsed last silently win — and an engineer reading a firmware version
 * off a row has no way to tell which device it belongs to. Same §8 rule that
 * renamed `Device ID` to `capture_device`.
 *
 * Note this arrives with EVERY data frame rather than from a separate handshake,
 * so nameplate can drift between frames and the registry keeps last-known-good.
 */
export const METER_NAMEPLATE = {
  MTRMFG: "meter_manufacturer",
  MTRFWVER: "meter_firmware",
  MTRTYPE: "meter_type",
  MTRCAT: "meter_category",
  MTRCURR: "meter_current_rating",
  MTRYOM: "meter_year",
};

export const GATEWAY_FIELDS = {
  RSSI: { label: "RSSI", unit: "dBm", metric: null, dp: 0 },
  RSRP: { label: "RSRP", unit: "dBm", metric: "gateway_rsrp", dp: 0 },
  RSRQ: { label: "RSRQ", unit: "dB", metric: null, dp: 0 },
  SINR: { label: "SINR", unit: "dB", metric: null, dp: 0 },
  TEMP: { label: "Board temperature", unit: "°C", metric: "board_temp", dp: 1 },
  BATV: { label: "Battery", unit: "V", metric: null, dp: 2 },
  UPTIME: { label: "Uptime", unit: "s", metric: null, dp: 0 },
};

/** 0/1 link and health flags. All present on every heartbeat. */
export const GATEWAY_FLAGS = ["GSM", "SIM", "NET", "GPRS", "ONLINE", "RF", "SD", "FLASH", "SIMCHG", "BATSTS", "PWRSRC"];

/** The two error flags that matter operationally. */
export const GATEWAY_ERRORS = { INVERR: "Inverter error", MTRERR: "Meter error" };

/* ── frame derivation ─────────────────────────────────────────────────────── */

/** The common envelope, normalised. */
function deriveEnvelope(envelope, source) {
  return {
    // `MSGID` is a per-device SEQUENCE, not an identifier: heartbeat 1 → data 2
    // → data 3, ascending with time on both sample devices. Which means a gap
    // in MSGID is a lost message, and that is worth watching.
    msgSeq: envelope.MSGID ?? null,
    schemaVersion: envelope.VD ?? null,
    timestamp: parseIstStamp(envelope.TIMESTAMP),
    insertedOn: source?.ingestedOn ?? null,
    maxIndex: envelope.MAXINDEX ?? null,
    index: envelope.INDEX ?? null,
    load: envelope.LOAD ?? null,
    // Self-declared reporting cadence, in MINUTES — 15 on Data, 30 on
    // Heartbeat. This closes docs/dashboard-ia.md Q2 with a real value from the
    // device instead of the seed constant that used to stand in for it.
    intervalMin: envelope.STINTERVAL ?? null,
    deviceNo: String(envelope.IMEI ?? source?.imei ?? ""),
    asn: envelope.asn ?? null,
    topic: source?.topic ?? null,
    programme: source?.programme ?? null,
  };
}

/** Ingestion lag in seconds — filename UTC minus payload IST. */
export function ingestLagSeconds(row) {
  if (!row.timestamp || !row.insertedOn) return null;
  return (row.insertedOn.getTime() - row.timestamp.getTime()) / 1000;
}

/**
 * Parse one Data message into `{ envelope, meter }`.
 *
 * The meter's own clock is carried through as `meterClock` and compared against
 * the message time. In the samples one meter is 25 days BEHIND and the other 72
 * days AHEAD, with every derived billing stamp agreeing with its own wrong
 * clock — so the skew is reported per row rather than corrected, because
 * silently trusting either clock decides which billing period the energy lands
 * in.
 */
export function parseDataMessage(raw, filename) {
  const source = filename ? parseSourceFilename(filename) : null;
  const { envelope, objects } = splitPayload(raw);
  const base = deriveEnvelope(envelope, source);

  const meterObj = Object.values(objects).find((o) => o.objectClass === "MS");
  const f = meterObj?.fields ?? {};

  const failed = meterReadFailed(f);
  const meterClock = parseYymmdd(f.DATE, f.TIME);
  const skewDays =
    meterClock && base.timestamp ? (meterClock.getTime() - base.timestamp.getTime()) / 86400000 : null;

  const nameplate = {};
  for (const [src, key] of Object.entries(METER_NAMEPLATE)) {
    if (f[src] !== undefined && f[src] !== "") nameplate[key] = f[src];
  }

  const pfUsable = pfIsMeaningful(f);

  return {
    ...base,
    stream: "data",
    objectId: meterObj ? `${meterObj.objectClass}-${meterObj.address.join("-")}` : null,
    // A failed read keeps its identity and loses its measurements. Nulling them
    // here is what stops `0.00 V` reaching a threshold set at all.
    readFailed: failed,
    voltage: failed ? null : f.VN,
    current: failed ? null : f.I,
    activePower: failed ? null : f.POW,
    reactivePower: failed ? null : f.RPOW,
    apparentPower: failed ? null : f.APOW,
    frequency: failed ? null : f.FRQ,
    // PF is withheld — not zeroed — when the meter is idle. See pfIsMeaningful.
    powerFactor: failed || !pfUsable ? null : f.PF,
    powerFactorWithheld: !failed && !pfUsable,
    energyNet: f.KWHNET,
    energyImport: f.KWHIMP,
    energyExport: f.KWHEXP,
    apparentNet: f.KVAHNET,
    mdImport: f.MDKWIMP,
    mdExport: f.MDKWEXP,
    previousMd: f.PMDKW,
    previousMdAt: parseYymmddStamp(f.PMDKWDT),
    lastBillingMd: f.LBMDKW,
    lastBillingMdAt: parseYymmddStamp(f.LBMDKWDT),
    lastBillingPf: f.LBPF,
    lastBillingDate: parseYymmdd(f.LBDATE),
    billingDate: parseYymmdd(f.MTBLDATE),
    powerOff: f.POFF,
    tamper: decodeTamper(f.TMPSTS),
    tamperCount: f.TC,
    transactions: f.TRNCOUNT,
    mdResets: f.MDRSTC,
    meterClock,
    meterClockSkewDays: skewDays,
    nameplate,
    raw,
  };
}

/** Parse one Heartbeat message into the gateway's own state. */
export function parseHeartbeatMessage(raw, filename) {
  const source = filename ? parseSourceFilename(filename) : null;
  const { envelope, objects } = splitPayload(raw);
  const base = deriveEnvelope(envelope, source);

  const gw = Object.values(objects).find((o) => o.objectClass === "R");
  const f = gw?.fields ?? {};

  const flags = {};
  for (const k of GATEWAY_FLAGS) if (f[k] !== undefined) flags[k] = f[k];

  const boardTempAbsent = Number(f.TEMP) === BOARD_TEMP_SENTINEL;
  const geoAbsent = geoIsAbsent(f.LAT, f.LON);

  return {
    ...base,
    stream: "heartbeat",
    objectId: gw ? `${gw.objectClass}-${gw.address.join("-")}` : null,
    gatewayClock: parseYymmdd(f.RTCDATE, f.RTCTIME),
    rssi: f.RSSI ?? null,
    rsrp: f.RSRP ?? null,
    rsrq: f.RSRQ ?? null,
    sinr: f.SINR ?? null,
    // The sentinel is KEPT, not nulled. The gateway did transmit -127; it is a
    // real value that is not a real temperature, and `board_temp`'s plausibility
    // floor resolves it to unknown at render time. Showing it de-emphasised
    // lets an engineer confirm the bus reply for themselves, which a dash does
    // not — the dash is reserved for a value that never arrived (see the failed
    // meter read, where the measurements are genuinely absent).
    boardTemp: f.TEMP,
    boardTempAbsent,
    lat: geoAbsent ? null : f.LAT,
    lon: geoAbsent ? null : f.LON,
    geoAbsent,
    batteryVolts: f.BATV,
    flags,
    errors: Object.fromEntries(Object.keys(GATEWAY_ERRORS).map((k) => [k, f[k] ?? null])),
    uptime: f.UPTIME ?? null,
    nameplate: {
      // `gateway_*`, not `firmware`/`hardware` — the meter reports its own and
      // the two must never merge. Both are empty strings in the sample and are
      // recorded as ABSENT so the registry counts them missing, not blank.
      gateway_firmware: f.FW || null,
      gateway_hardware: f.HW || null,
      modem_firmware: f.MODEMFW || null,
      operator: f.OP || null,
      mcc: f.MCC || null,
      mnc: f.MNC || null,
      ip_version: f.IPVER ?? null,
      sim_slot: f.SIMSLOT ?? null,
    },
    // A beta modem build in the field is worth surfacing on its own.
    modemFirmwareIsBeta: /beta/i.test(String(f.MODEMFW ?? "")),
    raw,
  };
}
