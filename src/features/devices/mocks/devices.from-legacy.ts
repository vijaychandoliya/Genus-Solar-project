/**
 * 🟨 MOCK ONLY — the bridge from today's data to tomorrow's API.
 *
 * `src/lib/device-data.js` parses the real GTI payloads and is what every screen
 * renders today. Rather than replace that with hand-written fixtures — which
 * would make the pilot screen show LESS than it does now, and hide any mismatch
 * between my domain model and the actual payloads — the mock repository serves
 * exactly that data, mapped into the domain model.
 *
 * Two things this buys:
 *
 *   1. Refactoring the page changes nothing a user can see. The data is the same
 *      data, so a visual difference means the refactor is wrong.
 *   2. It exercises the mapping against REAL payload shapes, including the ugly
 *      ones — an empty gateway half, a device that never reported, a nameplate
 *      key we did not anticipate. Hand-written fixtures are always tidier than
 *      production, which is how a mapper passes every test and fails on day one.
 *
 * When the API exists this file is deleted, not rewritten: the API repository
 * already produces the same domain model from the same schema.
 */
import type { Device, DeviceClass, Nameplate } from "../model/device.model.js";

/* The legacy module is untyped JavaScript. This is the one place that boundary
   is crossed, and it is crossed explicitly rather than by leaking `any` through
   the codebase. */
interface LegacyDevice {
  id: string;
  deviceNo?: string;
  deviceClass: string;
  systemType?: string | null;
  dealer?: string | null;
  consumerRef?: string | null;
  enabled?: boolean;
  circleId?: string | null;
  districtId?: string | null;
  nameplate?: Record<string, unknown> | null;
  lastSeen?: string | null;
  intervalMin?: number | null;
  intervalIsDeclared?: boolean;
  latestMeter?: unknown;
}

const KNOWN_CLASSES: readonly string[] = ["gti", "bms", "ups", "meter"];

/** Values arrive as strings, numbers or null; anything else is not a nameplate. */
function toNameplate(raw: Record<string, unknown> | null | undefined): Nameplate {
  if (!raw) return {};
  const out: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(raw))
    if (value === null || typeof value === "string" || typeof value === "number") out[key] = value;
  return out;
}

export function fromLegacy(d: LegacyDevice): Device {
  // An unknown class would silently score completeness against an empty field
  // list and read as "no schema" rather than "we do not recognise this device".
  // Falling back to `gti` would be worse — it would score against fields the
  // device never sends. So: refuse loudly.
  if (!KNOWN_CLASSES.includes(d.deviceClass))
    throw new Error(`Unknown deviceClass "${d.deviceClass}" on ${d.id} — add it to DEVICE_CLASSES`);

  return {
    id: d.id,
    // The registry is keyed on the device NUMBER, which is what operators read
    // out over the phone. There is no separate display name in the payloads.
    name: d.deviceNo ?? d.id,
    deviceClass: d.deviceClass as DeviceClass,
    systemType: d.systemType ?? null,
    // No site identifier exists in the payloads yet; the hierarchy carries
    // location instead. Empty rather than invented.
    siteId: "",
    circleId: d.circleId ?? null,
    districtId: d.districtId ?? null,
    dealer: d.dealer ?? null,
    consumerRef: d.consumerRef ?? null,
    enabled: d.enabled ?? true,
    lastSeenAt: d.lastSeen ? new Date(d.lastSeen) : null,
    reportIntervalMs: d.intervalMin == null ? null : d.intervalMin * 60_000,
    intervalIsDeclared: d.intervalIsDeclared ?? false,
    nameplate: toNameplate(d.nameplate),
    latestPayload: d.latestMeter ?? null,
  };
}
