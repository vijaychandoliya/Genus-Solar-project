/**
 * 🧪 The shared contract suite.
 *
 * The single most valuable test in this architecture: the SAME assertions run
 * against the mock and against the real API client. That is what stops the two
 * drifting — the failure mode that quietly makes "we'll swap the mock later"
 * untrue, because by then the mock has been shaped around what the UI happened
 * to need rather than around what the server actually does.
 *
 * Behaviour and contract, never implementation.
 */
import { describe, it, expect } from "vitest";
import type { DeviceRepository } from "../../features/devices/repository/devices.repository.js";

export function describeDeviceRepository(
  name: string,
  makeRepo: () => DeviceRepository,
): void {
  describe(`DeviceRepository contract — ${name}`, () => {
    it("returns a page with items, total, page and pageSize", async () => {
      const page = await makeRepo().list({ page: 1, pageSize: 3 });
      expect(page.items.length).toBeLessThanOrEqual(3);
      expect(page.total).toBeTypeOf("number");
      expect(page.page).toBe(1);
      expect(page.pageSize).toBe(3);
    });

    it("returns domain models, never API shapes", async () => {
      const [first] = (await makeRepo().list()).items;
      expect(first).toBeDefined();
      // The mapper's whole job: no snake_case survives past the repository.
      expect(first).not.toHaveProperty("device_id");
      expect(first).not.toHaveProperty("last_seen_at");
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("deviceClass");
      // Dates are Dates, not strings — so callers never re-parse.
      if (first!.lastSeenAt !== null) expect(first!.lastSeenAt).toBeInstanceOf(Date);
    });

    it("filters by deviceClass", async () => {
      const page = await makeRepo().list({ deviceClass: "gti" });
      expect(page.items.every((d) => d.deviceClass === "gti")).toBe(true);
    });

    it("fetches one device by id", async () => {
      const [first] = (await makeRepo().list()).items;
      const one = await makeRepo().get(first!.id);
      expect(one.id).toBe(first!.id);
    });

    it("throws a not-found error for a missing id", async () => {
      // The KIND is the contract, not the status code. A component switching on
      // `kind` must behave identically whichever implementation is wired.
      await expect(makeRepo().get("does-not-exist")).rejects.toMatchObject({ kind: "not-found" });
    });
  });
}
