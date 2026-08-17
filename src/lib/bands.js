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
  },

  cell_delta: {
    label: "Cell delta",
    unit: "mV",
    precision: 0,
    polarity: "ltb",
    hint: "Highest cell voltage minus lowest, across the pack. The primary imbalance indicator.",
    thresholds: { watchHigh: 50, warningHigh: 120, criticalHigh: 250 },
  },

  pack_temp: {
    label: "Pack temperature",
    unit: "°C",
    precision: 1,
    polarity: "band",
    hint: "Highest of the pack thermistors.",
    thresholds: { criticalLow: 0, warningLow: 5, watchHigh: 40, warningHigh: 45, criticalHigh: 55 },
  },

  temp_spread: {
    label: "Temperature spread",
    unit: "°C",
    precision: 1,
    polarity: "ltb",
    hint: "Difference between the hottest and coldest thermistor. Spread matters as much as the maximum — it points at uneven cooling, a hot cell, or a bad connection.",
    thresholds: { watchHigh: 5, warningHigh: 8, criticalHigh: 12 },
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
    thresholds: { criticalLow: 10, warningLow: 20, watchLow: 40 },
  },

  /* ── grid and meter ───────────────────────────────────────────────────── */

  grid_voltage: {
    label: "Grid voltage",
    unit: "V",
    precision: 1,
    polarity: "band",
    hint: "Single-phase supply voltage. Indian grid code is 230 V ±10%.",
    thresholds: {
      criticalLow: 190,
      warningLow: 207,
      watchLow: 215,
      watchHigh: 245,
      warningHigh: 253,
      criticalHigh: 270,
    },
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
      "Indian commercial tariffs commonly penalise below 0.90 and incentivise above it — this is one calculation away from a rupee figure.",
    thresholds: { criticalLow: 0.85, warningLow: 0.9, watchLow: 0.95 },
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
  },
};

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
  return bandFromThresholds(value, m.thresholds ?? {});
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
