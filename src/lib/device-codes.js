/**
 * Status-code enums — the decoder for the raw integers the device extracts ship.
 *
 * The Dynamic Reports screen in the source DMS renders `Backup Status`,
 * `Inverter Mode`, `Mains Voltage` and `Inverter Status` as bare `1`s and `0`s
 * with no legend anywhere on the page. A bare code is not information: it fails
 * plan D3 ("every numeric telemetry field carries a band and a unit") and it
 * fails AGENTS.md §7, which requires a status to state itself in words.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EVERY MEANING BELOW IS UNVERIFIED.
 *
 * No enum documentation came with the extracts, so these are inferences from
 * the field names alone. `verified: false` propagates all the way to the cell,
 * where `CodeValue` renders the decoded word with a visible caveat rather than
 * presenting a guess as fact — see docs/dms-parity-plan.md Q4.
 *
 * When the real enums arrive: correct the maps, flip `verified` to true, and
 * the caveat disappears from every screen at once. Do not flip it early. A
 * decoded word that is wrong is worse than the raw code, because the raw code
 * at least looks like something the reader should go and check.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * One code set. `band` maps a value onto the same five-band vocabulary the rest
 * of the app uses, so a status column can carry emphasis without inventing a
 * second colour language.
 */
const CODE_SETS = {
  backup_status: {
    label: "Backup status",
    verified: false,
    hint: "Whether the load is currently being carried by the battery rather than the mains.",
    values: {
      0: { label: "Not on backup", band: "normal" },
      1: { label: "On backup", band: "watch" },
    },
  },

  inverter_mode: {
    label: "Inverter mode",
    verified: false,
    hint: "The inverter's present operating mode.",
    caveat:
      "A two-valued mode field is unusual — most inverters report at least line / battery / bypass / fault. Either this is a boolean the name mislabels, or the extract flattens a wider enum.",
    values: {
      0: { label: "Standby", band: "watch" },
      1: { label: "Inverting", band: "normal" },
    },
  },

  inverter_status: {
    label: "Inverter status",
    verified: false,
    hint: "Whether the inverter stage is healthy.",
    values: {
      0: { label: "Fault", band: "critical" },
      1: { label: "Healthy", band: "normal" },
    },
  },

  /**
   * The source column is named `Mains Voltage` and carries 0/1, not volts.
   *
   * Renamed on the way in, exactly as docs/dashboard-ia.md §8 renamed the
   * survey extract's `Device ID` to `capture_device`: a name that means one
   * thing in the source and another in the model makes every future query
   * ambiguous. `grid_voltage` is the real measured-volts metric and must stay
   * unambiguous, so this flag is `mains_present`.
   */
  mains_present: {
    label: "Mains present",
    verified: false,
    sourceName: "Mains Voltage",
    hint: "Whether utility supply is detected at the input. A flag, not a voltage.",
    caveat:
      'The source column is called "Mains Voltage" but carries 0/1. It is renamed here so it cannot be confused with the grid_voltage metric, which is measured in volts.',
    values: {
      0: { label: "No mains", band: "warning" },
      1: { label: "Mains present", band: "normal" },
    },
  },

  /* GTI message types — these ARE self-describing in the extract, so they are
     verified. They map the four GTI tabs onto one field. */
  gti_msg_type: {
    label: "Message type",
    verified: true,
    hint: "Which GTI message stream this row came from.",
    values: {
      telemetry: { label: "Telemetry", band: "normal" },
      heartbeat: { label: "Heartbeat", band: "normal" },
      gateway_handshake: { label: "Handshake", band: "normal" },
      ondemand: { label: "On demand", band: "normal" },
    },
  },

  device_class: {
    label: "Device class",
    verified: true,
    hint: "Which telemetry schema this device reports on.",
    values: {
      ups: { label: "UPS", band: "normal" },
      bms: { label: "BMS", band: "normal" },
      gti: { label: "GTI", band: "normal" },
    },
  },

  system_type: {
    label: "System type",
    verified: true,
    hint: "Whether the installation includes a solar array.",
    values: {
      solar: { label: "Solar", band: "normal" },
      "non solar": { label: "Non Solar", band: "normal" },
    },
  },
};

export { CODE_SETS };

/** Every registered code-set id. */
export const CODE_SET_IDS = Object.keys(CODE_SETS);

/**
 * Decode one raw value.
 *
 * Returns `known: false` for a value the set does not list, rather than
 * inventing a label. An undocumented code is a real finding — it means the
 * device firmware emits a state the platform has never been told about — and it
 * belongs in the exception queue, not silently rendered as its own integer.
 */
export function decode(setId, raw) {
  const set = CODE_SETS[setId];
  if (!set) return { known: false, label: raw == null ? "—" : String(raw), band: "unknown" };
  if (raw === null || raw === undefined || raw === "") {
    return { known: false, label: "—", band: "unknown", missing: true, set };
  }
  const key = typeof raw === "string" ? raw.toLowerCase() : raw;
  const hit = set.values[key];
  if (!hit) {
    return {
      known: false,
      label: `Code ${raw}`,
      band: "unknown",
      reason: `${raw} is not a documented value for ${set.label}.`,
      set,
    };
  }
  return { known: true, label: hit.label, band: hit.band, verified: set.verified, set, raw };
}

/** The full enum, for the MetricInfo panel behind a code cell. */
export function codeLegend(setId) {
  const set = CODE_SETS[setId];
  if (!set) return [];
  return Object.entries(set.values).map(([value, v]) => ({ value, ...v }));
}
