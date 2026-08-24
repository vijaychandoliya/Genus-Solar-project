/**
 * The runtime boundary — 🟩 PRODUCTION.
 *
 * TypeScript types are erased at build time, so a server that starts sending
 * `rated_kw` as a string satisfies every type in this codebase and fails three
 * layers later as "cannot read property toFixed of undefined" inside a chart.
 * Zod is what turns that into a precise, early, attributable failure.
 *
 * These schemas describe the API's shape — snake_case, nullable, exactly as sent.
 * They are NOT the domain model; the mapper converts between them.
 */
import { z } from "zod";
import { DEVICE_CLASSES } from "../model/device.model.js";

/**
 * Open by design. Nameplate keys differ per device class and the payloads add
 * fields over time; a closed schema would reject a device for carrying MORE
 * information than we knew about, which is the wrong failure. Values are
 * constrained to scalars so nothing structural sneaks through unvalidated.
 */
export const NameplateApiSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.null()]),
);

export const DeviceApiSchema = z.object({
  device_id: z.string().min(1),
  display_name: z.string(),
  device_class: z.enum(DEVICE_CLASSES),
  system_type: z.string().nullable().default(null),
  site_id: z.string(),
  circle_id: z.string().nullable().default(null),
  district_id: z.string().nullable().default(null),
  dealer: z.string().nullable().default(null),
  consumer_ref: z.string().nullable().default(null),
  enabled: z.boolean(),
  // ISO 8601. `z.iso.datetime()` is the Zod 4 form; the v3 spelling
  // `z.string().datetime()` still works but is the older idiom.
  last_seen_at: z.iso.datetime().nullable().default(null),
  report_interval_ms: z.number().int().positive().nullable().default(null),
  nameplate: NameplateApiSchema.nullable().default(null),
  // Opaque by design — see Device.latestPayload.
  latest_payload: z.unknown().nullable().default(null),
});

export const DeviceListApiSchema = z.object({
  items: z.array(DeviceApiSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
});

export type DeviceApi = z.infer<typeof DeviceApiSchema>;
export type DeviceListApi = z.infer<typeof DeviceListApiSchema>;
