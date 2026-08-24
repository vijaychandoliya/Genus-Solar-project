/**
 * Endpoint calls — 🟩 PRODUCTION.
 *
 * Parses every response before returning it. `parse` is the difference between
 * a bad payload failing HERE with a field path, and failing three layers up as
 * an unreadable TypeError inside a chart.
 */
import { http } from "../../../services/http/client.js";
import { ValidationError } from "../../../services/http/errors.js";
import type { RequestOptions } from "../../../services/http/client.js";
import { DeviceApiSchema, DeviceListApiSchema } from "../schemas/devices.schema.js";
import type { DeviceApi, DeviceListApi } from "../schemas/devices.schema.js";
import type { DeviceQuery, DeviceInput } from "../model/device.model.js";
import { toDeviceInputApi } from "./devices.mapper.js";
import type { z } from "zod";

function parse<T>(schema: z.ZodType<T>, data: unknown, where: string): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  throw new ValidationError(`${where} returned an unexpected shape`, {
    // 502, not 400: the caller did nothing wrong — the upstream did.
    status: 502,
    details: result.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
  });
}

const queryParams = (q: DeviceQuery): RequestOptions["params"] => ({
  page: q.page ?? 1,
  page_size: q.pageSize ?? 50,
  search: q.search,
  device_class: q.deviceClass,
  site_id: q.siteId,
  enabled: q.enabled,
});

export async function fetchDevices(q: DeviceQuery = {}, options?: RequestOptions): Promise<DeviceListApi> {
  const data = await http.get<unknown>("/devices", { ...options, params: queryParams(q) });
  return parse(DeviceListApiSchema, data, "GET /devices");
}

export async function fetchDevice(id: string, options?: RequestOptions): Promise<DeviceApi> {
  const data = await http.get<unknown>(`/devices/${encodeURIComponent(id)}`, options);
  return parse(DeviceApiSchema, data, `GET /devices/${id}`);
}

export async function createDevice(input: DeviceInput, options?: RequestOptions): Promise<DeviceApi> {
  const data = await http.post<unknown>("/devices", toDeviceInputApi(input), options);
  return parse(DeviceApiSchema, data, "POST /devices");
}

export async function updateDevice(id: string, input: DeviceInput, options?: RequestOptions): Promise<DeviceApi> {
  const data = await http.put<unknown>(`/devices/${encodeURIComponent(id)}`, toDeviceInputApi(input), options);
  return parse(DeviceApiSchema, data, `PUT /devices/${id}`);
}

export async function deleteDevice(id: string, options?: RequestOptions): Promise<void> {
  await http.delete<null>(`/devices/${encodeURIComponent(id)}`, options);
}
