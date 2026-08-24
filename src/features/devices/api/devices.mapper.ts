/**
 * API shape → domain model. ONE DIRECTION, ONE PLACE — 🟩 PRODUCTION.
 *
 * Past this function no `snake_case` key and no `device_id` exists anywhere in
 * the application. That is the whole point: when the backend renames a field,
 * this file changes and nothing else does.
 */
import type { Device, DeviceInput, Paged } from "../model/device.model.js";
import type { DeviceApi, DeviceListApi } from "../schemas/devices.schema.js";

export function toDevice(dto: DeviceApi): Device {
  return {
    id: dto.device_id,
    name: dto.display_name,
    deviceClass: dto.device_class,
    systemType: dto.system_type,
    siteId: dto.site_id,
    circleId: dto.circle_id,
    districtId: dto.district_id,
    dealer: dto.dealer,
    consumerRef: dto.consumer_ref,
    enabled: dto.enabled,
    lastSeenAt: dto.last_seen_at === null ? null : new Date(dto.last_seen_at),
    reportIntervalMs: dto.report_interval_ms,
    // Whether the DEVICE declared its interval, rather than us assuming a class
    // default. Freshness is scored against this, so conflating the two would
    // silently reclassify healthy devices as stale.
    intervalIsDeclared: dto.report_interval_ms !== null,
    nameplate: dto.nameplate ?? {},
  };
}

export const toDevicePage = (dto: DeviceListApi): Paged<Device> => ({
  items: dto.items.map(toDevice),
  total: dto.total,
  page: dto.page,
  pageSize: dto.page_size,
});

/** Domain → API, for writes. Separate on purpose: the shapes are not symmetric —
 *  a write cannot set `lastSeenAt`, and typing it as `Partial<Device>` would
 *  suggest it could. */
export const toDeviceInputApi = (input: DeviceInput) => ({
  display_name: input.name,
  device_class: input.deviceClass,
  site_id: input.siteId,
  enabled: input.enabled,
  nameplate: input.nameplate,
});
