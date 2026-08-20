/**
 * The semantic band registry — docs/ia-and-screen-plan.md §5.
 *
 * A number without a band is a number the reader has to interpret alone, which
 * is exactly the expertise this platform exists to democratise. Every metric
 * rendered through <BandedValue> resolves through here.
 *
 * Bands are data, not code: add a metric by adding an entry, never by writing a
 * conditional at a call site.
 *
 * Thresholds marked [seed] are domain defaults for a 48 V-class LFP system and
 * a 1 kW single-phase Indian rooftop. They MUST be re-derived per pack design
 * and per tariff before they are trusted in the field.
 */

export const BAND_ORDER = ["critical", "warning", "watch", "normal", "unknown"];

/** Rank for "worst band wins" roll-ups. Higher is worse. */
export const BAND_RANK = { unknown: 0, normal: 1, watch: 2, warning: 3, critical: 4 };

export const BAND_LABEL = {
  normal: "Normal",
  watch: "Watch",
  warning: "Warning",
  critical: "Critical",
  unknown: "No data",
  good: "Healthy",
  info: "Info",
};

/* ── plausibility — the sensor-fault floor ────────────────────────────────
   A threshold set answers "is this reading good or bad". It cannot answer "is
   this a reading at all", and conflating the two paints a confident colour on
   a broken sensor.

   The BMS extract carries pack temperatures of -58.0 and -48.0 °C. No cell in
   Bihar is at -58 °C; those are a thermistor's open-circuit sentinel. Fed
   straight to `pack_temp`'s `criticalLow: 0`, they resolve to `critical` — a
   red chip, an alarm, and an engineer dispatched to a working battery. The UPS
   extract has the mirror-image case: 41 of 42 devices report 0.00 V, which is
   not zero volts but no reading at all, and `grid_voltage` would call every
   one of them critical.

   So every metric that can carry a sentinel declares a `plausible` range.
   Outside it the resolver returns `unknown` WITH a reason, which is the same
   contract §2 of AGENTS.md already sets for an unmet `requires` — an honest
   dash beats a confident wrong colour.                                      */

export const IMPLAUSIBLE = "implausible";

/** Why a value fell outside its metric's plausible range. Prose, for a tooltip. */
export function implausibleReason(metricId, value) {
  const m = METRICS[metricId];
  if (!m?.plausible) return null;
  const { min, max, sentinel } = m.plausible;
  if (sentinel?.includes(Number(value))) {
    return `${value}${m.unit ? ` ${m.unit}` : ""} is a known sensor-fault sentinel for this field, not a measurement.`;
  }
  if (min !== undefined && Number(value) < min) {
    return `${value}${m.unit ? ` ${m.unit}` : ""} is below the physically plausible floor of ${min} — treat as a faulty sensor, not a low reading.`;
  }
  if (max !== undefined && Number(value) > max) {
    return `${value}${m.unit ? ` ${m.unit}` : ""} is above the physically plausible ceiling of ${max} — treat as a faulty sensor, not a high reading.`;
  }
  return null;
}

/** True if the value is outside what this metric can physically report. */
export function isImplausible(metricId, value) {
  const m = METRICS[metricId];
  if (!m?.plausible) return false;
  if (value === null || value === undefined || Number.isNaN(Number(value))) return false;
  const v = Number(value);
  const { min, max, sentinel } = m.plausible;
  if (sentinel?.includes(v)) return true;
  if (min !== undefined && v < min) return true;
  if (max !== undefined && v > max) return true;
  return false;
}

/**
 * Resolve a value to a band using a symmetric threshold object.
 * Any absent bound simply does not apply, so a one-sided metric needs only
 * the bounds it has.
 */
function bandFromThresholds(value, t) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "unknown";
  const v = Number(value);
  if (t.criticalLow !== undefined && v < t.criticalLow) return "critical";
  if (t.criticalHigh !== undefined && v > t.criticalHigh) return "critical";
  if (t.warningLow !== undefined && v < t.warningLow) return "warning";
  if (t.warningHigh !== undefined && v > t.warningHigh) return "warning";
  if (t.watchLow !== undefined && v < t.watchLow) return "watch";
  if (t.watchHigh !== undefined && v > t.watchHigh) return "watch";
  return "normal";
}

/* ── the registry ────────────────────────────────────────────────────────── */

export const METRICS = {
  /* ── programme: pipeline and coverage ─────────────────────────────────── */

  coverage_pct: {
    label: "Coverage",
    unit: "%",
    precision: 1,
    polarity: "htb",
    hint: "Consumers with a submitted survey, divided by consumers registered in the master, for the selected hierarchy node.",
    caveat:
      "Uncomputable while the consumer master and the survey extract cover different circles — see docs/dashboard-ia.md Q1.",
    thresholds: { criticalLow: 25, warningLow: 50, watchLow: 75 },
  },

  days_in_stage: {
    label: "Age in stage",
    unit: "d",
    precision: 0,
    polarity: "ltb",
    hint: "Days since the record entered its current pipeline stage.",
    thresholds: { watchHigh: 3, warningHigh: 7, criticalHigh: 14 },
  },

  photo_completeness: {
    label: "Photo completeness",
    unit: "%",
    precision: 0,
    polarity: "htb",
    hint: "Populated photo slots out of the ten the survey form requires.",
    thresholds: { criticalLow: 60, warningLow: 80, watchLow: 100 },
  },

  geo_accuracy: {
    label: "GPS accuracy",
    unit: "m",
    precision: 1,
    polarity: "ltb",
    hint: "Reported accuracy radius at capture, from the third element of Geo Location.",
    thresholds: { watchHigh: 10, warningHigh: 25, criticalHigh: 50 },
  },

  capture_rsrp: {
    label: "Signal at capture",
    unit: "dBm",
    precision: 0,
    polarity: "htb",
    hint: "Reference Signal Received Power on the active SIM when the survey was submitted.",
    caveat: "Weak signal correlates with queued offline submissions and long submission lag.",
    thresholds: { criticalLow: -120, warningLow: -110, watchLow: -100 },
  },

  submission_lag_min: {
    label: "Submission lag",
    unit: "min",
    precision: 0,
    polarity: "ltb",
    hint: "Minutes between the surveyor stamping Survey Date and the record reaching the server.",
    thresholds: { watchHigh: 60, warningHigh: 480, criticalHigh: 1440 },
  },

  /* ── battery — arrives with device telemetry ──────────────────────────── */

  cell_voltage: {
    label: "Cell voltage",
    unit: "V",
    precision: 3,
    polarity: "band",
    requires: ["chemistry", "series_count"],
    hint: "Individual cell terminal voltage. The single most diagnostic field a pack emits.",
    caveat:
      "LFP sits on a flat plateau near 3.20–3.30 V, so a small delta means a large state-of-charge difference and voltage-derived SOC is unreliable there.",
    // [seed] LFP
    thresholds: {
      criticalLow: 2.5,
      warningLow: 2.8,
      watchLow: 3.0,
      watchHigh: 3.45,
      warningHigh: 3.55,
      criticalHigh: 3.65,
    },
    // A cell reading 0 V is a lost sense wire; above 5 V is not a Li-ion cell.
    plausible: { min: 0.5, max: 5 },
  },

  cell_delta: {
    label: "Cell delta",
    unit: "mV",
    precision: 0,
    polarity: "ltb",
    hint: "Highest cell voltage minus lowest, across the pack. The primary imbalance indicator.",
    thresholds: { watchHigh: 50, warningHigh: 120, criticalHigh: 250 },
    plausible: { min: 0, max: 2000 },
  },

  pack_temp: {
    label: "Pack temperature",
    unit: "°C",
    precision: 1,
    polarity: "band",
    hint: "Highest of the pack thermistors.",
    caveat:
      "-58 °C and -48 °C appear in the source extract and are thermistor open-circuit sentinels, not temperatures. They resolve to `unknown`, never to critical.",
    thresholds: { criticalLow: 0, warningLow: 5, watchHigh: 40, warningHigh: 45, criticalHigh: 55 },
    // -40 is the floor of a standard NTC's usable range; anything below is a
    // disconnected probe. 125 is its ceiling.
    plausible: { min: -40, max: 125, sentinel: [-58, -48] },
  },

  temp_spread: {
    label: "Temperature spread",
    unit: "°C",
    precision: 1,
    polarity: "ltb",
    hint: "Difference between the hottest and coldest thermistor. Spread matters as much as the maximum — it points at uneven cooling, a hot cell, or a bad connection.",
    caveat:
      "Computed only across thermistors that are themselves plausible. A pack reporting 27 °C on one probe and -58 °C on three does not have an 85 °C spread; it has one working probe.",
    thresholds: { watchHigh: 5, warningHigh: 8, criticalHigh: 12 },
    plausible: { min: 0, max: 100 },
  },

  charge_cycles: {
    label: "Charge cycles",
    unit: "",
    precision: 0,
    polarity: "ltb",
    requires: ["rated_cycles"],
    hint: "Equivalent full cycles counted by the BMS since commissioning.",
    caveat:
      "Banded as a fraction of the pack's rated cycle life, so it needs a nameplate. Without `rated_cycles` a count of 7 and a count of 7,000 are indistinguishable.",
    thresholds: { watchHigh: 60, warningHigh: 80, criticalHigh: 100 },
    plausible: { min: 0, max: 20000 },
  },

  soh: {
    label: "State of health",
    unit: "%",
    precision: 0,
    polarity: "htb",
    hint: "Learned full-charge capacity as a fraction of rated capacity.",
    caveat:
      "80% is the conventional end-of-life threshold for stationary use. A jump of more than a few points between readings is an estimator artefact, not real degradation.",
    thresholds: { criticalLow: 80, warningLow: 85, watchLow: 90 },
  },

  soc: {
    label: "State of charge",
    unit: "%",
    precision: 0,
    polarity: "htb",
    hint: "Coulomb-counted and voltage-corrected, so step changes at full charge are normal re-anchoring rather than faults.",
    caveat:
      "A reading of exactly 0.0 alongside 0 cycles and 0 °C is a pack that has never reported, not a flat one. Cross-check freshness before acting on a low SOC.",
    thresholds: { criticalLow: 10, warningLow: 20, watchLow: 40 },
    plausible: { min: 0, max: 100 },
  },

  capacity_ratio: {
    label: "Capacity vs rated",
    unit: "%",
    precision: 0,
    polarity: "htb",
    requires: ["rated_capacity_ah"],
    hint: "Reported pack capacity as a fraction of the nameplate rating.",
    caveat:
      "The source extract mixes units — 43 rows report 100 and one reports 10000, which is Ah against Wh, not a pack a hundred times larger. Until the unit is confirmed this metric flags the outlier rather than banding it.",
    thresholds: { criticalLow: 80, warningLow: 85, watchLow: 90 },
    plausible: { min: 0, max: 200 },
  },

  /* ── grid and meter ───────────────────────────────────────────────────── */

  grid_voltage: {
    label: "Grid voltage",
    unit: "V",
    precision: 1,
    polarity: "band",
    hint: "Single-phase supply voltage. Indian grid code is 230 V ±10%.",
    caveat:
      "0.00 V is how the UPS extract represents no reading — 41 of its 42 devices carry it. That is silence, not a blackout, and it resolves to `unknown`. A genuine outage shows as an offline freshness state plus a mode change, not as a zero.",
    thresholds: {
      criticalLow: 190,
      warningLow: 207,
      watchLow: 215,
      watchHigh: 245,
      warningHigh: 253,
      criticalHigh: 270,
    },
    // A live single-phase feed below 50 V is not a brownout, it is no
    // measurement. Above 400 V is not single-phase.
    plausible: { min: 50, max: 400, sentinel: [0] },
  },

  ups_load: {
    label: "UPS load",
    unit: "%",
    precision: 1,
    polarity: "ltb",
    requires: ["rated_va"],
    hint: "Present output load as a fraction of the unit's rated VA.",
    caveat:
      "The source extract reports load with no rating to divide by, so this is uncomputable until the registry carries `rated_va`. A bare load figure cannot say whether a unit is comfortable or about to trip.",
    thresholds: { watchHigh: 70, warningHigh: 85, criticalHigh: 100 },
    plausible: { min: 0, max: 150 },
  },

  grid_frequency: {
    label: "Grid frequency",
    unit: "Hz",
    precision: 2,
    polarity: "band",
    hint: "Indian grid code is 50 Hz ±0.5 Hz.",
    thresholds: {
      criticalLow: 47.5,
      warningLow: 49.5,
      watchHigh: 50.5,
      warningHigh: 51,
      criticalHigh: 52,
    },
  },

  power_factor: {
    label: "Power factor",
    unit: "",
    precision: 2,
    polarity: "htb",
    hint: "Ratio of real to apparent power.",
    caveat:
      "Meaningless at zero current — a meter with no load reports 1.000 as a register default, and banding that green states health the platform cannot see. The parser WITHHOLDS power factor below 0.05 A rather than passing the default through (gti-parse.js pfIsMeaningful). Indian commercial tariffs commonly penalise below 0.90 and incentivise above it, so this is one calculation away from a rupee figure.",
    thresholds: { criticalLow: 0.85, warningLow: 0.9, watchLow: 0.95 },
    plausible: { min: 0, max: 1 },
  },

  /* ── the gateway itself ──────────────────────────────────────────────────
     Distinct from `capture_rsrp`, which measures the SURVEYOR'S PHONE at the
     moment a survey was submitted. Same units, different subject: one is a
     one-off field condition, the other is a permanently installed asset whose
     weak signal is an ongoing operational fact. Sharing one metric id would
     make "signal" ambiguous in exactly the way §8's rename rules exist to
     prevent.                                                                */

  gateway_rsrp: {
    label: "Gateway signal",
    unit: "dBm",
    precision: 0,
    polarity: "htb",
    hint: "Reference Signal Received Power at the installed gateway's modem.",
    caveat:
      "A permanently weak gateway is a permanently late gateway — RSRP correlates directly with ingestion lag and with the gaps in the message sequence.",
    thresholds: { criticalLow: -120, warningLow: -110, watchLow: -100 },
    plausible: { min: -140, max: -40 },
  },

  board_temp: {
    label: "Board temperature",
    unit: "°C",
    precision: 1,
    polarity: "band",
    hint: "Gateway mainboard thermistor.",
    caveat:
      "-127 is the 1-wire bus reply for 'no sensor present' and appears in the real payloads. It is a missing probe, not a cold board, and resolves to unknown.",
    thresholds: { warningLow: -10, watchLow: 0, watchHigh: 60, warningHigh: 70, criticalHigh: 85 },
    plausible: { min: -40, max: 125, sentinel: [-127, 85] },
  },

  /**
   * Meter clock skew — days between the meter's own RTC and the message that
   * carried it.
   *
   * This is not a nice-to-have. In the two real samples one meter is 25 days
   * behind and the other 72 days AHEAD, and each one's billing and max-demand
   * stamps agree with its own wrong clock. Energy therefore lands in the wrong
   * billing period, and nothing else on the row looks wrong.
   *
   * Banded on ABSOLUTE skew — a clock ahead is as broken as one behind, and a
   * future-dated billing stamp is arguably worse because it will not be
   * revisited.
   */
  meter_clock_skew: {
    label: "Meter clock skew",
    unit: "d",
    precision: 1,
    polarity: "ltb",
    hint: "Absolute difference between the meter's real-time clock and the gateway message carrying its reading.",
    caveat:
      "Every billing period, max-demand window and last-billing stamp the meter emits is derived from this clock. A skew of weeks makes all of them wrong together, consistently, and therefore invisibly.",
    thresholds: { watchHigh: 1, warningHigh: 7, criticalHigh: 30 },
    plausible: { min: 0, max: 3650 },
  },

  thd_voltage: {
    label: "Voltage THD",
    unit: "%",
    precision: 1,
    polarity: "ltb",
    hint: "Total harmonic distortion on the voltage waveform.",
    thresholds: { watchHigh: 5, warningHigh: 8, criticalHigh: 10 },
  },

  demand_utilisation: {
    label: "Demand vs contracted",
    unit: "%",
    precision: 0,
    polarity: "ltb",
    requires: ["contracted_demand_kw"],
    hint: "Maximum demand as a fraction of the contracted figure on the connection.",
    caveat: "Exceeding contracted demand triggers a tariff penalty.",
    thresholds: { watchHigh: 80, warningHigh: 90, criticalHigh: 100 },
    plausible: { min: 0, max: 500 },
  },

  /* ── enum states — a mode is a band, not a status string ────────────────
     docs/ia-and-screen-plan.md §5.3: "UPS mode = Bypass is the highest-severity
     state in the fleet and is a band, not a status string — bypass removes
     protection entirely while reporting no fault at all." A metric with
     `states` resolves by lookup instead of by threshold.                    */

  ups_mode: {
    label: "UPS mode",
    unit: "",
    polarity: "enum",
    hint: "Which path the load is currently fed through.",
    caveat:
      "Bypass is the most dangerous state the fleet can report and the least likely to raise an alarm on its own — the unit is healthy, the load is live, and there is no protection between them.",
    states: {
      line: { band: "normal", label: "Line" },
      battery: { band: "warning", label: "On battery" },
      bypass: { band: "critical", label: "Bypass" },
      standby: { band: "watch", label: "Standby" },
      fault: { band: "critical", label: "Fault" },
    },
  },
};

/* ── editable registry ────────────────────────────────────────────────────
   The rules screen writes here. Two things make that different from editing
   the roles matrix, and both shape the design:

   1 · THESE EDITS ARE LIVE. Every `bandFor` / `bandDetail` call in the product
       reads `METRICS[id]` at call time, so changing a threshold immediately
       repaints Alarms, Overview and every telemetry grid. That is the point —
       it is the only way to see what a threshold change actually costs — but
       it means the screen has to say so.

   2 · A THRESHOLD SET CAN BE INCOHERENT in a way a permission grant cannot.
       `warningHigh: 40` under `watchHigh: 45` produces a ladder where the
       watch band is unreachable: a value of 42 is already `warning`, so the
       band the operator configured to fire first never fires at all. Nothing
       throws; the metric just quietly stops meaning what its author intended.
       So every write is validated against the whole ladder, not the one field.

   The baseline is a deep-frozen copy taken before any edit, so `rulesDiff()`
   can always answer what was changed — the artefact worth exporting after a
   threshold-tuning session.                                                 */

function cloneMetric(m) {
  return {
    ...m,
    ...(m.thresholds ? { thresholds: { ...m.thresholds } } : {}),
    ...(m.plausible
      ? {
          plausible: {
            ...m.plausible,
            ...(m.plausible.sentinel ? { sentinel: [...m.plausible.sentinel] } : {}),
          },
        }
      : {}),
    ...(m.states
      ? { states: Object.fromEntries(Object.entries(m.states).map(([k, v]) => [k, { ...v }])) }
      : {}),
    ...(m.requires ? { requires: [...m.requires] } : {}),
  };
}

/** Taken before anything can write. Never mutated. */
const METRIC_BASELINE = Object.freeze(
  Object.fromEntries(Object.entries(METRICS).map(([id, m]) => [id, Object.freeze(cloneMetric(m))])),
);

let rulesVersion = 0;
const rulesListeners = new Set();

function emitRules() {
  rulesVersion += 1;
  rulesListeners.forEach((fn) => fn());
}

export function subscribeRules(fn) {
  rulesListeners.add(fn);
  return () => rulesListeners.delete(fn);
}

/** A counter, not the registry — the registry is mutated in place so that
    every existing `METRICS[id]` reader keeps working without a rewrite. */
export function rulesVersionSnapshot() {
  return rulesVersion;
}

/* The ladder, in the order a value passes through it. Severity must increase
   outward from the middle in both directions. */
const LOW_ORDER = ["criticalLow", "warningLow", "watchLow"];
const HIGH_ORDER = ["watchHigh", "warningHigh", "criticalHigh"];

export const THRESHOLD_KEYS = [...LOW_ORDER, ...HIGH_ORDER];

export const THRESHOLD_LABEL = {
  criticalLow: "Critical below",
  warningLow: "Warning below",
  watchLow: "Watch below",
  watchHigh: "Watch above",
  warningHigh: "Warning above",
  criticalHigh: "Critical above",
};

export const THRESHOLD_BAND = {
  criticalLow: "critical",
  warningLow: "warning",
  watchLow: "watch",
  watchHigh: "watch",
  warningHigh: "warning",
  criticalHigh: "critical",
};

/**
 * Is this a coherent ladder? Returns `null` when fine, else the reason.
 *
 * Checks the two sides ascend, and that they do not cross — a low bound above
 * a high bound means some values are simultaneously too low and too high.
 */
export function ladderProblem(thresholds, plausible) {
  const t = thresholds ?? {};
  const num = (k) => (t[k] === undefined || t[k] === null || t[k] === "" ? null : Number(t[k]));

  const lows = LOW_ORDER.map((k) => ({ k, v: num(k) })).filter((x) => x.v !== null);
  for (let i = 1; i < lows.length; i += 1) {
    if (lows[i].v < lows[i - 1].v) {
      return `${THRESHOLD_LABEL[lows[i].k]} (${lows[i].v}) must not be below ${THRESHOLD_LABEL[
        lows[i - 1].k
      ].toLowerCase()} (${lows[i - 1].v}) — the ${THRESHOLD_BAND[lows[i].k]} band would be unreachable.`;
    }
  }

  const highs = HIGH_ORDER.map((k) => ({ k, v: num(k) })).filter((x) => x.v !== null);
  for (let i = 1; i < highs.length; i += 1) {
    if (highs[i].v < highs[i - 1].v) {
      return `${THRESHOLD_LABEL[highs[i].k]} (${highs[i].v}) must not be below ${THRESHOLD_LABEL[
        highs[i - 1].k
      ].toLowerCase()} (${highs[i - 1].v}) — the ${THRESHOLD_BAND[highs[i].k]} band would be unreachable.`;
    }
  }

  if (lows.length && highs.length) {
    const topLow = lows[lows.length - 1];
    const firstHigh = highs[0];
    if (topLow.v > firstHigh.v) {
      return `${THRESHOLD_LABEL[topLow.k]} (${topLow.v}) is above ${THRESHOLD_LABEL[
        firstHigh.k
      ].toLowerCase()} (${firstHigh.v}) — the two sides cross, so some values are both too low and too high.`;
    }
  }

  if (plausible) {
    const { min, max } = plausible;
    if (min !== undefined && max !== undefined && Number(min) >= Number(max)) {
      return `Plausible minimum (${min}) must be below the maximum (${max}).`;
    }
    const all = [...lows, ...highs];
    const outside = all.find(
      (x) =>
        (min !== undefined && x.v < Number(min)) || (max !== undefined && x.v > Number(max)),
    );
    if (outside) {
      return `${THRESHOLD_LABEL[outside.k]} (${outside.v}) sits outside the plausible range — the plausibility floor runs first, so that bound can never be reached.`;
    }
  }

  return null;
}

/**
 * Write one threshold. An empty value removes the bound, which is legitimate —
 * a one-sided metric needs only the bounds it has.
 *
 * Returns `{ ok, reason }`; the caller renders the reason rather than the write
 * happening and quietly producing a dead band.
 */
export function setThreshold(metricId, key, value) {
  const m = METRICS[metricId];
  if (!m) return { ok: false, reason: `Unknown metric "${metricId}".` };

  const next = { ...(m.thresholds ?? {}) };
  if (value === "" || value === null || value === undefined) delete next[key];
  else if (Number.isNaN(Number(value))) return { ok: false, reason: `"${value}" is not a number.` };
  else next[key] = Number(value);

  const problem = ladderProblem(next, m.plausible);
  if (problem) return { ok: false, reason: problem };

  m.thresholds = next;
  emitRules();
  return { ok: true };
}

/** Write a plausibility bound. Same validation, because the floor runs first. */
export function setPlausible(metricId, key, value) {
  const m = METRICS[metricId];
  if (!m) return { ok: false, reason: `Unknown metric "${metricId}".` };

  const next = { ...(m.plausible ?? {}) };
  if (value === "" || value === null || value === undefined) delete next[key];
  else if (Number.isNaN(Number(value))) return { ok: false, reason: `"${value}" is not a number.` };
  else next[key] = Number(value);

  const hasAny = next.min !== undefined || next.max !== undefined || next.sentinel?.length;
  const candidate = hasAny ? next : undefined;

  const problem = ladderProblem(m.thresholds, candidate);
  if (problem) return { ok: false, reason: problem };

  if (candidate) m.plausible = candidate;
  else delete m.plausible;
  emitRules();
  return { ok: true };
}

/** Re-map an enum state to a different band. `ups_mode` is the only one today. */
export function setStateBand(metricId, stateKey, band) {
  const m = METRICS[metricId];
  if (!m?.states?.[stateKey]) return { ok: false, reason: "Unknown state." };
  if (!BAND_ORDER.includes(band)) return { ok: false, reason: `"${band}" is not a band.` };
  m.states[stateKey] = { ...m.states[stateKey], band };
  emitRules();
  return { ok: true };
}

export function resetMetric(metricId) {
  const base = METRIC_BASELINE[metricId];
  if (!base) return;
  METRICS[metricId] = cloneMetric(base);
  emitRules();
}

export function resetRules() {
  Object.keys(METRIC_BASELINE).forEach((id) => {
    METRICS[id] = cloneMetric(METRIC_BASELINE[id]);
  });
  emitRules();
}

export function metricIsModified(metricId) {
  const a = METRIC_BASELINE[metricId];
  const b = METRICS[metricId];
  if (!a || !b) return false;
  return (
    JSON.stringify(a.thresholds ?? null) !== JSON.stringify(b.thresholds ?? null) ||
    JSON.stringify(a.plausible ?? null) !== JSON.stringify(b.plausible ?? null) ||
    JSON.stringify(a.states ?? null) !== JSON.stringify(b.states ?? null)
  );
}

const fmtBound = (v) => (v === undefined || v === null ? "—" : String(v));

/** Every change from the shipped registry, flat and exportable. */
export function rulesDiff() {
  const out = [];
  Object.keys(METRIC_BASELINE).forEach((id) => {
    const base = METRIC_BASELINE[id];
    const live = METRICS[id];

    THRESHOLD_KEYS.forEach((k) => {
      const a = base.thresholds?.[k];
      const b = live.thresholds?.[k];
      if (a !== b) {
        out.push({
          id: `${id}-${k}`,
          metric: base.label,
          field: THRESHOLD_LABEL[k],
          from: `${fmtBound(a)}${a !== undefined && base.unit ? ` ${base.unit}` : ""}`,
          to: `${fmtBound(b)}${b !== undefined && base.unit ? ` ${base.unit}` : ""}`,
        });
      }
    });

    ["min", "max"].forEach((k) => {
      const a = base.plausible?.[k];
      const b = live.plausible?.[k];
      if (a !== b) {
        out.push({
          id: `${id}-plausible-${k}`,
          metric: base.label,
          field: `Plausible ${k}`,
          from: fmtBound(a),
          to: fmtBound(b),
        });
      }
    });

    Object.keys(base.states ?? {}).forEach((k) => {
      const a = base.states[k].band;
      const b = live.states?.[k]?.band;
      if (a !== b) {
        out.push({
          id: `${id}-state-${k}`,
          metric: base.label,
          field: `State "${base.states[k].label}"`,
          from: BAND_LABEL[a] ?? a,
          to: BAND_LABEL[b] ?? b,
        });
      }
    });
  });
  return out;
}

/* ── grouping, for the rules screen ───────────────────────────────────────
   The registry above is organised by section comments, which a reader can see
   and a screen cannot. `/alarms/rules` needs the same grouping at runtime, so
   it is declared here rather than re-derived in the page — a second grouping
   living in a component is a second source of truth, and the one in the page
   is the one that silently goes stale when a metric is added.

   The assertion below is the point: adding a metric without grouping it fails
   at import, the same way build-tokens.mjs fails rather than emitting
   something plausible.                                                      */

export const METRIC_GROUPS = [
  {
    id: "programme",
    label: "Programme",
    note: "Pipeline and coverage, computed from the two source extracts.",
    metrics: [
      "coverage_pct",
      "days_in_stage",
      "photo_completeness",
      "geo_accuracy",
      "capture_rsrp",
      "submission_lag_min",
    ],
  },
  {
    id: "battery",
    label: "Battery",
    note: "Arrives with device telemetry. No BMS extract has landed yet, so these are unexercised.",
    metrics: [
      "cell_voltage",
      "cell_delta",
      "pack_temp",
      "temp_spread",
      "charge_cycles",
      "soh",
      "soc",
      "capacity_ratio",
    ],
  },
  {
    id: "grid",
    label: "Grid and meter",
    note: "Supply-side quality and load.",
    metrics: ["grid_voltage", "ups_load", "grid_frequency", "power_factor"],
  },
  {
    id: "gateway",
    label: "Gateway and meter register",
    note: "The installed asset itself, distinct from a surveyor's phone.",
    metrics: ["gateway_rsrp", "board_temp", "meter_clock_skew", "thd_voltage", "demand_utilisation"],
  },
  {
    id: "modes",
    label: "Modes",
    note: "A mode is a band, not a status string — resolved by lookup, not by threshold.",
    metrics: ["ups_mode"],
  },
];

/* Every metric is grouped exactly once, and every grouped id exists. */
{
  const grouped = METRIC_GROUPS.flatMap((g) => g.metrics);
  const missing = Object.keys(METRICS).filter((id) => !grouped.includes(id));
  const unknown = grouped.filter((id) => !METRICS[id]);
  const duplicated = grouped.filter((id, i) => grouped.indexOf(id) !== i);
  if (missing.length || unknown.length || duplicated.length) {
    throw new Error(
      `METRIC_GROUPS is out of step with METRICS.${missing.length ? ` Ungrouped: ${missing.join(", ")}.` : ""}` +
        `${unknown.length ? ` Not a metric: ${unknown.join(", ")}.` : ""}` +
        `${duplicated.length ? ` Grouped twice: ${duplicated.join(", ")}.` : ""}`,
    );
  }
}

/** The group a metric belongs to, by id. */
export const GROUP_OF = Object.fromEntries(
  METRIC_GROUPS.flatMap((g) => g.metrics.map((id) => [id, g])),
);

/**
 * A metric's thresholds as an ordered, readable scale.
 *
 * Returns the bounds in ascending value order with the band each one opens,
 * so a rules table can render "< 25 critical · < 50 warning · < 75 watch"
 * without every call site re-deriving which key means which direction.
 */
export function thresholdScale(metricId) {
  const m = METRICS[metricId];
  if (!m?.thresholds) return [];
  const t = m.thresholds;
  const lows = [
    ["criticalLow", "critical"],
    ["warningLow", "warning"],
    ["watchLow", "watch"],
  ]
    .filter(([k]) => t[k] !== undefined)
    .map(([k, band]) => ({ band, op: "<", value: t[k] }));
  const highs = [
    ["watchHigh", "watch"],
    ["warningHigh", "warning"],
    ["criticalHigh", "critical"],
  ]
    .filter(([k]) => t[k] !== undefined)
    .map(([k, band]) => ({ band, op: ">", value: t[k] }));
  return [...lows, ...highs];
}

/**
 * Resolve a metric's band for a value.
 *
 * `nameplate` gates metrics that cannot be judged without device configuration —
 * a pack voltage means nothing until the series count is known. A metric whose
 * `requires` are unmet returns "unknown", never a confident-looking "normal".
 */
export function bandFor(metricId, value, nameplate = null) {
  const m = METRICS[metricId];
  if (!m) return "unknown";
  if (m.requires?.length) {
    const missing = m.requires.some(
      (k) => nameplate == null || nameplate[k] === undefined || nameplate[k] === null,
    );
    if (missing) return "unknown";
  }
  // An enum metric resolves by lookup. An unrecognised state is `unknown`, not
  // `normal` — a mode string the platform has never seen is not evidence of
  // health.
  if (m.states) {
    if (value === null || value === undefined || value === "") return "unknown";
    return m.states[String(value).toLowerCase()]?.band ?? "unknown";
  }
  // The plausibility floor runs BEFORE the thresholds, or a sentinel reading
  // resolves to whichever extreme band it happens to fall past.
  if (isImplausible(metricId, value)) return "unknown";
  return bandFromThresholds(value, m.thresholds ?? {});
}

/**
 * The band plus the sentence explaining it, for the cases where "unknown" alone
 * is not enough. §2 of AGENTS.md: an unknown carries its reason.
 */
export function bandDetail(metricId, value, nameplate = null) {
  const m = METRICS[metricId];
  if (!m) return { band: "unknown", reason: `No metric "${metricId}" is registered.` };
  const band = bandFor(metricId, value, nameplate);
  if (band !== "unknown") return { band, reason: null };
  if (m.requires?.length) {
    const missing = m.requires.filter(
      (k) => nameplate == null || nameplate[k] === undefined || nameplate[k] === null,
    );
    if (missing.length) {
      return {
        band,
        reason: `Cannot be judged without ${missing.join(" and ")} on the device nameplate.`,
      };
    }
  }
  if (m.states && value != null && value !== "") {
    return { band, reason: `"${value}" is not a state this platform recognises for ${m.label}.` };
  }
  return { band, reason: implausibleReason(metricId, value) ?? "No reading." };
}

/** An enum metric's display label for a raw state. */
export function stateLabel(metricId, value) {
  const s = METRICS[metricId]?.states?.[String(value).toLowerCase()];
  return s?.label ?? (value == null || value === "" ? "—" : String(value));
}

/** Worst band across many — for rolling a site or an asset up to one chip. */
export function worstBand(bands) {
  const real = bands.filter((b) => b && b !== "unknown");
  if (!real.length) return "unknown";
  return real.reduce((a, b) => (BAND_RANK[b] > BAND_RANK[a] ? b : a), "normal");
}

/* ── freshness — docs/ia-and-screen-plan.md §6.1 ─────────────────────────── */

export const FRESHNESS = ["live", "late", "stale", "offline"];

/**
 * Classify a reading's age against the device's expected reporting interval.
 * Silence must never read as health, so this is computed for every row.
 */
export function freshnessOf(timestamp, intervalMs, now = Date.now()) {
  if (!timestamp || !intervalMs) return "offline";
  const t = timestamp instanceof Date ? timestamp.getTime() : new Date(timestamp).getTime();
  if (Number.isNaN(t)) return "offline";
  const ratio = (now - t) / intervalMs;
  if (ratio <= 1) return "live";
  if (ratio <= 3) return "late";
  if (ratio <= 12) return "stale";
  return "offline";
}

/**
 * A stale or offline reading gets no band. A four-hour-old value painted a
 * comfortable green is a lie about the present.
 */
export function bandWithFreshness(metricId, value, freshness, nameplate) {
  if (freshness === "stale" || freshness === "offline") return "unknown";
  return bandFor(metricId, value, nameplate);
}
