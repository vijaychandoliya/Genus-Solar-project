/** 🟩 PRODUCTION — the real one. Thin by design: all judgement is in the mapper. */
import * as api from "../api/devices.api.js";
import { toDevice, toDevicePage } from "../api/devices.mapper.js";
import type { DeviceRepository } from "./devices.repository.js";

export const apiDeviceRepository: DeviceRepository = {
  list: async (query = {}, signal) => toDevicePage(await api.fetchDevices(query, { signal })),
  get: async (id, signal) => toDevice(await api.fetchDevice(id, { signal })),
  create: async (input) => toDevice(await api.createDevice(input)),
  update: async (id, input) => toDevice(await api.updateDevice(id, input)),
  remove: (id) => api.deleteDevice(id),
};
