/** 🧪 Both implementations, one suite. */
import { beforeEach, afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { describeDeviceRepository } from "../../../test/contracts/device-repository.contract.js";
import { mockDeviceRepository, __resetMockDevices } from "./devices.mock.repository.js";
import { apiDeviceRepository } from "./devices.api.repository.js";
import { DEVICE_FIXTURES } from "../mocks/devices.fixture.js";

/* ── the mock repository ─────────────────────────────────────────────────── */
beforeEach(__resetMockDevices);
describeDeviceRepository("mock", () => mockDeviceRepository);

/* ── the API repository, over MSW ─────────────────────────────────────────
   MSW intercepts fetch, so the code under test is the REAL client, the REAL Zod
   schema and the REAL mapper. A test that stubbed the repository instead would
   prove only that the stub works.

   The handlers serialise the fixtures back into API shape on purpose — that
   round trip is what actually exercises the mapper.                          */

const toApi = (d: (typeof DEVICE_FIXTURES)[number]) => ({
  device_id: d.id,
  display_name: d.name,
  device_class: d.deviceClass,
  system_type: d.systemType,
  site_id: d.siteId,
  circle_id: d.circleId,
  district_id: d.districtId,
  dealer: d.dealer,
  consumer_ref: d.consumerRef,
  enabled: d.enabled,
  last_seen_at: d.lastSeenAt ? d.lastSeenAt.toISOString() : null,
  report_interval_ms: d.reportIntervalMs,
  nameplate: d.nameplate,
});

const BASE = "http://localhost:8080/api";

const server = setupServer(
  http.get(`${BASE}/devices`, ({ request }) => {
    const url = new URL(request.url);
    const cls = url.searchParams.get("device_class");
    const pageSize = Number(url.searchParams.get("page_size") ?? 50);
    const page = Number(url.searchParams.get("page") ?? 1);
    const matched = DEVICE_FIXTURES.filter((d) => !cls || d.deviceClass === cls);
    const start = (page - 1) * pageSize;
    return HttpResponse.json({
      items: matched.slice(start, start + pageSize).map(toApi),
      total: matched.length,
      page,
      page_size: pageSize,
    });
  }),
  http.get(`${BASE}/devices/:id`, ({ params }) => {
    const found = DEVICE_FIXTURES.find((d) => d.id === params["id"]);
    if (!found) return HttpResponse.json({ message: "Device not found" }, { status: 404 });
    return HttpResponse.json(toApi(found));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describeDeviceRepository("api (MSW)", () => apiDeviceRepository);
