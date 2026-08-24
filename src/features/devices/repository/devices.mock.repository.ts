/**
 * 🟨 MOCK ONLY — deletable as a unit.
 *
 * Same contract, no network. It imitates the API's BEHAVIOUR deliberately:
 * asynchronous, paged, latent, and throwing the same normalised errors. A mock
 * that resolves instantly and never fails trains the UI to have no loading state
 * and no error state, and both defects surface on the day the real API arrives —
 * which is the worst possible day to discover them.
 */
import { NotFoundError } from "../../../services/http/errors.js";
import type { Device, DeviceInput, DeviceQuery, Paged } from "../model/device.model.js";
import type { DeviceRepository } from "./devices.repository.js";
import { DEVICE_FIXTURES } from "../mocks/devices.fixture.js";

/** Real networks are neither instant nor uniform. Neither is this. */
const latency = () => new Promise((r) => setTimeout(r, 120 + Math.random() * 280));

let store: Device[] = [...DEVICE_FIXTURES];

function filter(devices: readonly Device[], q: DeviceQuery): Device[] {
  let out = [...devices];
  if (q.search) {
    const needle = q.search.toLowerCase();
    out = out.filter(
      (d) => d.name.toLowerCase().includes(needle) || d.id.toLowerCase().includes(needle),
    );
  }
  if (q.deviceClass) out = out.filter((d) => d.deviceClass === q.deviceClass);
  if (q.siteId) out = out.filter((d) => d.siteId === q.siteId);
  if (q.enabled !== undefined) out = out.filter((d) => d.enabled === q.enabled);
  return out;
}

export const mockDeviceRepository: DeviceRepository = {
  async list(query = {}): Promise<Paged<Device>> {
    await latency();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const matched = filter(store, query);
    const start = (page - 1) * pageSize;
    return { items: matched.slice(start, start + pageSize), total: matched.length, page, pageSize };
  },

  async get(id): Promise<Device> {
    await latency();
    const found = store.find((d) => d.id === id);
    // The SAME error the API layer would produce, so a 404 path is exercised in
    // development rather than discovered in production.
    if (!found) throw new NotFoundError(`Device ${id} not found`, { status: 404 });
    return found;
  },

  async create(input: DeviceInput): Promise<Device> {
    await latency();
    const device: Device = {
      id: crypto.randomUUID(),
      name: input.name,
      deviceClass: input.deviceClass,
      systemType: null,
      siteId: input.siteId,
      circleId: null,
      districtId: null,
      dealer: null,
      consumerRef: null,
      enabled: input.enabled,
      lastSeenAt: null,
      reportIntervalMs: null,
      intervalIsDeclared: false,
      nameplate: input.nameplate,
    };
    store = [device, ...store];
    return device;
  },

  async update(id, input): Promise<Device> {
    const existing = await this.get(id);
    const updated: Device = {
      ...existing,
      name: input.name,
      deviceClass: input.deviceClass,
      siteId: input.siteId,
      enabled: input.enabled,
      nameplate: { ...existing.nameplate, ...input.nameplate },
    };
    store = store.map((d) => (d.id === id ? updated : d));
    return updated;
  },

  async remove(id): Promise<void> {
    await this.get(id);
    store = store.filter((d) => d.id !== id);
  },
};

/** Test-only: restore the fixture set between suites. */
export const __resetMockDevices = (): void => { store = [...DEVICE_FIXTURES]; };
