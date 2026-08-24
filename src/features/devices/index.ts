/**
 * The feature's PUBLIC API — 🟩 PRODUCTION.
 *
 * The only legal import path from outside this folder. Reaching into
 * `features/devices/api/...` from a page couples that page to this feature's
 * internal layout and defeats the point of the boundary.
 *
 * Note what is NOT exported: the api module, the schemas, the mapper, the
 * fixtures and the mock repository. Those are implementation.
 */
export { useDevices, useDevice, deviceKeys } from "./hooks/useDevices.js";
export type { DeviceListView } from "./hooks/useDevices.js";
export type { Device, DeviceClass, DeviceQuery, DeviceInput, Freshness } from "./model/device.model.js";
export { DEVICE_CLASSES, FRESHNESS } from "./model/device.model.js";
export type { DeviceRow } from "./model/device.rules.js";
export { nameplateCompleteness, missingNameplate, freshness } from "./model/device.rules.js";
