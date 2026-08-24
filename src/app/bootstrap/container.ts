/**
 * THE SEAM — 🟩 PRODUCTION.
 *
 * One conditional in the entire application. Everything else asks the container.
 *
 * ── why this file reads import.meta.env directly ─────────────────────────
 * It is the ONE deliberate exception to "only config/env.ts reads the
 * environment", and it exists because of a bug I shipped and then measured.
 *
 * The first version branched on `env.dataSource`. That is a value returned by a
 * validating function, so Vite cannot constant-fold it — and the mock branch
 * stayed reachable. Fixtures shipped in a VITE_DATA_SOURCE=api production
 * build. Reading the raw variable makes the comparison literal-vs-literal at
 * build time, the dead branch drops, and the fixtures go with it.
 *
 * Correctness is unaffected: config/env.ts has already validated this value at
 * module load, so an invalid setting has failed the boot before this line runs.
 *
 * Verified, not assumed: `npm run verify:no-mocks` builds with DATA_SOURCE=api
 * and greps for a fixture-only device id. Both halves of that sentence were
 * earned — the first version of the check grepped for "Rooftop gateway", which
 * also appears in telemetry-gti.jsx page copy, and reported a failure that was
 * not real. A grep gate is only as good as its needle.
 */
// Imported for its validation side effect — a bad VITE_DATA_SOURCE must fail at
// boot, not silently fall through to the api branch below.
import "../../config/env.js";
import { apiDeviceRepository } from "../../features/devices/repository/devices.api.repository.js";
import { mockDeviceRepository } from "../../features/devices/repository/devices.mock.repository.js";
import type { DeviceRepository } from "../../features/devices/repository/devices.repository.js";

export interface Repositories {
  readonly devices: DeviceRepository;
}

const useMock = import.meta.env.VITE_DATA_SOURCE === "mock";

export const repositories: Repositories = Object.freeze({
  devices: useMock ? mockDeviceRepository : apiDeviceRepository,
});

/** For tests, which need to drive a specific implementation explicitly. */
export const makeRepositories = (overrides: Partial<Repositories> = {}): Repositories =>
  Object.freeze({ ...repositories, ...overrides });
