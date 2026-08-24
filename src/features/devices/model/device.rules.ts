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

/** Which expected nameplate fields are absent. */
export function missingNameplate(device: Device): readonly string[] {
  return NAMEPLATE_FIELDS[device.deviceClass].filter(
    (field) => device.nameplate[field] === undefined || device.nameplate[field] === null,
  );
}

/** 0–1. How much of the expected nameplate this device actually carries. */
export function nameplateCompleteness(device: Device): number {
  const expected = NAMEPLATE_FIELDS[device.deviceClass];
  if (expected.length === 0) return 1;
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
   A DeviceRow is what a TABLE needs, which is not what the domain is: it is
   flat, pre-derived and sorted-friendly. Keeping it separate stops derived
   fields leaking into the domain model, where they would have to be recomputed
   or kept stale on every write.                                             */

export interface DeviceRow {
  readonly id: string;
  readonly name: string;
  readonly deviceClass: DeviceClass;
  readonly siteId: string;
  readonly enabled: boolean;
  readonly lastSeenAt: Date | null;
  readonly completeness: number;
  readonly missing: readonly string[];
  readonly freshness: Freshness;
}

export const toDeviceRow = (device: Device, now?: Date): DeviceRow => ({
  id: device.id,
  name: device.name,
  deviceClass: device.deviceClass,
  siteId: device.siteId,
  enabled: device.enabled,
  lastSeenAt: device.lastSeenAt,
  completeness: nameplateCompleteness(device),
  missing: missingNameplate(device),
  freshness: freshness(device, now),
});

export const toDeviceRows = (devices: readonly Device[], now?: Date): DeviceRow[] =>
  devices.map((device) => toDeviceRow(device, now));
