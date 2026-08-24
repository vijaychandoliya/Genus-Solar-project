/**
 * The component's entire data contract — 🟩 PRODUCTION.
 *
 * A component calling this knows nothing about HTTP, Zod, fixtures or which
 * repository answered. Swapping VITE_DATA_SOURCE changes none of it.
 */
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { repositories } from "../../../app/bootstrap/container.js";
import { toDeviceRows, type DeviceRow } from "../model/device.rules.js";
import type { DeviceQuery, Paged, Device } from "../model/device.model.js";

/** Query keys in one place, so an invalidation cannot miss a cache entry. */
export const deviceKeys = {
  all: ["devices"] as const,
  lists: () => [...deviceKeys.all, "list"] as const,
  list: (query: DeviceQuery) => [...deviceKeys.lists(), query] as const,
  detail: (id: string) => [...deviceKeys.all, "detail", id] as const,
};

export interface DeviceListView {
  readonly rows: readonly DeviceRow[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export type UseDevicesResult = UseQueryResult<DeviceListView> & { isEmpty: boolean };

export function useDevices(query: DeviceQuery = {}): UseDevicesResult {
  const result = useQuery({
    queryKey: deviceKeys.list(query),
    // The signal comes from Query, so navigating away actually cancels the
    // request rather than leaving it to resolve into a dead component.
    queryFn: ({ signal }) => repositories.devices.list(query, signal),
    // Derived rows are computed INSIDE the cache, so a re-render that does not
    // change the data does not re-derive every row.
    select: (page: Paged<Device>): DeviceListView => ({
      rows: toDeviceRows(page.items),
      total: page.total,
      page: page.page,
      pageSize: page.pageSize,
    }),
    staleTime: 30_000,
  });

  // One derived flag, so every list screen tests emptiness the same way instead
  // of each inventing its own — which is how "no results" and "still loading"
  // end up looking identical on a slow connection.
  return { ...result, isEmpty: result.isSuccess && result.data.rows.length === 0 };
}

export function useDevice(id: string | undefined) {
  return useQuery({
    queryKey: deviceKeys.detail(id ?? ""),
    queryFn: ({ signal }) => repositories.devices.get(id as string, signal),
    enabled: Boolean(id),
  });
}
