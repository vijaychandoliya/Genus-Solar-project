/**
 * THE SEAM — 🟩 PRODUCTION.
 *
 * One conditional in the entire application. Everything else asks the container.
 *
 * The mock imports are STATIC, not dynamic, so the bundler can see them: with
 * VITE_DATA_SOURCE=api the mock branch is unreachable and tree-shaken away, so
 * fixtures do not ship. That is a claim worth verifying with a bundle analyser
 * before release rather than assuming — "it should tree-shake" is how 40kB of
 * fake devices reaches production.
 */
import { env } from "../../config/env.js";
import { apiDeviceRepository } from "../../features/devices/repository/devices.api.repository.js";
import { mockDeviceRepository } from "../../features/devices/repository/devices.mock.repository.js";
import type { DeviceRepository } from "../../features/devices/repository/devices.repository.js";

export interface Repositories {
  readonly devices: DeviceRepository;
}

const useMock = env.dataSource === "mock";

export const repositories: Repositories = Object.freeze({
  devices: useMock ? mockDeviceRepository : apiDeviceRepository,
});

/** For tests, which need to drive a specific implementation explicitly. */
export const makeRepositories = (overrides: Partial<Repositories> = {}): Repositories =>
  Object.freeze({ ...repositories, ...overrides });
