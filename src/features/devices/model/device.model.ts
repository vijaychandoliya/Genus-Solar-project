/**
 * The device domain model — what the application thinks a device IS.
 *
 * Deliberately not the API's shape. The API sends `device_id` and
 * `last_seen_at`; past the mapper neither exists, which is what makes a field
 * rename on the backend a one-file change here instead of a grep across 21 pages.
 *
 * These names come from the existing product (src/lib/device-data.js), not from
 * a textbook: `deviceClass`, `consumerRef` and `circleId` are the vocabulary the
 * SBPDCL rollout actually uses, and inventing cleaner-sounding ones would only
 * create a second dialect nobody speaks.
 */

/** The four telemetry sources the platform ingests. */
export const DEVICE_CLASSES = ["gti", "bms", "ups", "meter"] as const;
export type DeviceClass = (typeof DEVICE_CLASSES)[number];

/** How recently a device reported, relative to its own declared interval. */
export const FRESHNESS = ["fresh", "late", "stale", "never"] as const;
export type Freshness = (typeof FRESHNESS)[number];

/**
 * Nameplate is CLASS-SPECIFIC, not a fixed set.
 *
 * A UPS declares `rated_va`; a BMS declares `chemistry` and `series_count`; a
 * rooftop gateway declares both a meter half and a gateway half. Flattening
 * those into one shape — which was my first attempt — invents a domain the
 * payloads do not have, and would have made `nameplateCompleteness` score
 * fields no device ever sends. The expected keys per class live in
 * `device.rules.ts`; the values arrive as-sent.
 */
export type NameplateValue = string | number | null;
export type Nameplate = Readonly<Record<string, NameplateValue>>;

export interface Device {
  readonly id: string;
  readonly name: string;
  readonly deviceClass: DeviceClass;
  readonly systemType: string | null;
  readonly siteId: string;
  readonly circleId: string | null;
  readonly districtId: string | null;
  readonly dealer: string | null;
  readonly consumerRef: string | null;
  readonly enabled: boolean;
  readonly lastSeenAt: Date | null;
  /** The device's own declared reporting interval, when it sends one. */
  readonly reportIntervalMs: number | null;
  /** False when we fell back to the class default — see device.rules. */
  readonly intervalIsDeclared: boolean;
  readonly nameplate: Nameplate;
}

/** A page of devices. The shape every list repository returns. */
export interface Paged<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

/** What a list screen may ask for. Mirrors the URL, so a filter is shareable. */
export interface DeviceQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly deviceClass?: DeviceClass;
  readonly siteId?: string;
  readonly enabled?: boolean;
}

/** What a write accepts. NOT `Partial<Device>` — the shapes differ on purpose:
 *  a caller cannot set `lastSeenAt`, and must not be typed as though it could. */
export interface DeviceInput {
  readonly name: string;
  readonly deviceClass: DeviceClass;
  readonly siteId: string;
  readonly enabled: boolean;
  readonly nameplate: Nameplate;
}
