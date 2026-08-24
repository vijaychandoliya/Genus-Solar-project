/**
 * THE CONTRACT — 🟩 PRODUCTION.
 *
 * Both implementations satisfy this interface; nothing above it knows which one
 * answered. This type is the entire reason a developer can be handed a real API
 * spec tomorrow and not touch a component.
 *
 * Note it returns DOMAIN models, never API shapes. A repository that leaked
 * `device_id` upward would put the mapper's job into every caller.
 */
import type { Device, DeviceInput, DeviceQuery, Paged } from "../model/device.model.js";

export interface DeviceRepository {
  list(query?: DeviceQuery, signal?: AbortSignal): Promise<Paged<Device>>;
  get(id: string, signal?: AbortSignal): Promise<Device>;
  create(input: DeviceInput): Promise<Device>;
  update(id: string, input: DeviceInput): Promise<Device>;
  remove(id: string): Promise<void>;
}
