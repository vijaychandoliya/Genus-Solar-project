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
import { fromLegacy } from "../mocks/devices.from-legacy.js";
// The legacy module is plain JavaScript. `allowJs` infers it, so no suppression
// is needed — and the boundary is crossed in ONE place and mapped immediately
// rather than leaking untyped values through the codebase.
import { devicesFor } from "../../../lib/device-data.js";

/** Real networks are neither instant nor uniform. Neither is this. */
const latency = () => new Promise((r) => setTimeout(r, 120 + Math.random() * 280));

/**
 * Serve the REAL parsed payloads, scoped by hierarchy node, so refactoring a
 * screen onto this stack changes nothing a user can see — and any visual
 * difference means the refactor is wrong. `DEVICE_FIXTURES` stays as the
 * hand-written set the contract tests run against, because those need a stable,
 * known shape rather than whatever the payloads happen to contain today.
 */
function legacyScope(scopeId: string | undefined): Device[] {
  const raw = (devicesFor as (id: string | undefined) => unknown[])(scopeId) ?? [];
  return raw.map((d) => fromLegacy(d as Parameters<typeof fromLegacy>[0]));
}

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
    // A scoped query is answered from the real payloads; an unscoped one from
    // the stable fixture set, which is what the contract tests exercise.
    const source = query.scopeId === undefined ? store : legacyScope(query.scopeId);
    const matched = filter(source, query);
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
      latestPayload: null,
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
