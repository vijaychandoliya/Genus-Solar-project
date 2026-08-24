/**
 * Device business rules — 🟩 PRODUCTION.
 *
 * These are the rules currently fused into src/lib/device-data.js alongside its
 * fixtures. That fusion is the actual defect this refactor exists to fix: delete
 * the fake data today and `nameplateCompleteness` goes with it, even though it
 * is a real rule the product needs whatever the data source is.
 *
 * Pure functions over the domain model. No React, no fetch, no fixtures — which
 * is also why these are the cheapest and most valuable things in the codebase to
 * test.
 */
import type { Device, DeviceClass, Freshness } from "./device.model.js";

/**
 * Which nameplate facts each class is expected to carry.
 *
 * Carried over verbatim from device-data.js. A rooftop gateway needs BOTH boards
 * described plus the array rating, which is why `gti` is the longest list and
 * why its completeness scores lowest in practice.
 */
export const NAMEPLATE_FIELDS: Record<DeviceClass, readonly string[]> = {
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
  // The meter class carries the same meter half a gti gateway does.
  meter: ["meter_manufacturer", "meter_firmware", "meter_current_rating"],
};

/**
 * Class fallbacks for devices that do not declare their own interval.
 *
 * `[seed]` markers preserved from the original: these are the most consequential
 * unverified numbers in the product, because freshness is scored against them
 * and a wrong interval silently reclassifies a healthy device as stale.
 */
export const DEFAULT_REPORT_INTERVAL_MS: Record<DeviceClass, number> = {
  gti:   15 * 60 * 1000,
  meter: 15 * 60 * 1000,
  ups:   15 * 60 * 1000, // [seed] — no UPS payload observed yet
  bms:   15 * 60 * 1000, // [seed] — no BMS payload observed yet
};

/** The interval to judge this device against: its own, or its class default. */
export const effectiveIntervalMs = (device: Device): number =>
  device.reportIntervalMs ?? DEFAULT_REPORT_INTERVAL_MS[device.deviceClass];

/** An empty string counts as MISSING, not present — carried over from the
 *  original, and it matters: the payloads send "" for an unpopulated field. */
const isBlank = (v: unknown): boolean => v === undefined || v === null || v === "";

/** Which expected nameplate fields are absent. The actionable half of the figure. */
export function missingNameplate(device: Device): readonly string[] {
  return NAMEPLATE_FIELDS[device.deviceClass].filter((field) => isBlank(device.nameplate[field]));
}

/**
 * 0–1, or `null` when the class declares no expected nameplate at all.
 *
 * `null` is NOT zero. A class with no schema is unmeasurable, and scoring it 0
 * would put "we never defined what this device should report" in the same column
 * as "this device reported nothing" — the same distinction AGENTS.md keeps
 * between `unknown` and `normal`. The original returned 0–100; the domain keeps
 * a fraction and the VIEW MODEL renders the percentage, which is the whole point
 * of having both.
 */
export function nameplateCompleteness(device: Device): number | null {
  const expected = NAMEPLATE_FIELDS[device.deviceClass];
  if (expected.length === 0) return null;
  return (expected.length - missingNameplate(device).length) / expected.length;
}

/**
 * How overdue a device is, in multiples of its own interval.
 *
 * Banded rather than a raw age because "late" and "stale" mean different things
 * to an operator: late is worth watching, stale is worth acting on. `never` is
 * kept distinct from `stale` for the same reason AGENTS.md keeps `unknown`
 * distinct from `normal` — a device that has never reported is not a device
 * that stopped.
 */
export function freshness(device: Device, now: Date = new Date()): Freshness {
  if (device.lastSeenAt === null) return "never";
  const overdue = (now.getTime() - device.lastSeenAt.getTime()) / effectiveIntervalMs(device);
  if (overdue <= 1) return "fresh";
  if (overdue <= 3) return "late";
  return "stale";
}

/* ── view model ───────────────────────────────────────────────────────────
   A DeviceRow is the domain entity PLUS the things a table cannot compute for
   itself — completeness, what is missing, freshness. Keeping the derivations
   out of `Device` matters: a domain model that carried them would have to
   recompute them on every write or serve them stale, and `freshness` is a
   function of the CURRENT TIME, which no stored entity can honestly hold.    */

export interface DeviceRow extends Device {
  /** 0–1, or null when unmeasurable. */
  readonly completeness: number | null;
  /** 0–100 for display. Null propagates — never rendered as 0%. */
  readonly completenessPct: number | null;
  readonly missing: readonly string[];
  readonly freshness: Freshness;
}

export const toDeviceRow = (device: Device, now?: Date): DeviceRow => {
  const completeness = nameplateCompleteness(device);
  return {
    ...device,
    completeness,
    completenessPct: completeness === null ? null : completeness * 100,
    missing: missingNameplate(device),
    freshness: freshness(device, now),
  };
};

export const toDeviceRows = (devices: readonly Device[], now?: Date): DeviceRow[] =>
  devices.map((device) => toDeviceRow(device, now));
