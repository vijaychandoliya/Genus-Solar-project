/**
 * 🧪 Pure domain rules — the cheapest and highest-value tests in the codebase.
 *
 * No React, no network, no fixtures-as-a-service. Just the business rules that
 * used to be welded to the fake data in src/lib/device-data.js.
 */
import { describe, it, expect } from "vitest";
import { nameplateCompleteness, missingNameplate, freshness, effectiveIntervalMs, toDeviceRow, DEFAULT_REPORT_INTERVAL_MS } from "./device.rules.js";
import type { Device, DeviceClass, Nameplate } from "./device.model.js";

const device = (over: Partial<Device> = {}): Device => ({
  id: "D1", name: "Test", deviceClass: "gti", systemType: null, siteId: "S1",
  circleId: null, districtId: null, dealer: null, consumerRef: null, enabled: true,
  lastSeenAt: null, reportIntervalMs: null, intervalIsDeclared: false, nameplate: {},
  latestPayload: null,
  ...over,
});

const GTI_FULL: Nameplate = {
  meter_manufacturer: "Genus", meter_firmware: "G1", meter_current_rating: "5-30A",
  gateway_firmware: "1.0", gateway_hardware: "R2", rated_kw: 5,
};

describe("nameplateCompleteness", () => {
  it("is 1 when every expected field is present", () => {
    expect(nameplateCompleteness(device({ nameplate: GTI_FULL }))).toBe(1);
  });

  it("is 0 when the nameplate is empty", () => {
    expect(nameplateCompleteness(device({ nameplate: {} }))).toBe(0);
  });

  it("scores against the class's OWN expected fields, not a shared list", () => {
    // The same nameplate is complete for a bms and meaningless for a gti — which
    // is the whole reason the field list is per class.
    const bmsPlate: Nameplate = {
      manufacturer: "Genus", model: "BMS-48V", chemistry: "LFP",
      series_count: 16, rated_capacity_ah: 200, rated_cycles: 6000,
    };
    expect(nameplateCompleteness(device({ deviceClass: "bms", nameplate: bmsPlate }))).toBe(1);
    expect(nameplateCompleteness(device({ deviceClass: "gti", nameplate: bmsPlate }))).toBe(0);
  });

  it("treats null AND empty string as missing, not as present", () => {
    expect(missingNameplate(device({ nameplate: { ...GTI_FULL, rated_kw: null } }))).toContain("rated_kw");
    // The payloads send "" for an unpopulated field; counting that as present
    // would inflate every completeness figure on the screen.
    expect(missingNameplate(device({ nameplate: { ...GTI_FULL, meter_firmware: "" } }))).toContain("meter_firmware");
  });
});

describe("freshness", () => {
  const now = new Date("2026-08-24T12:00:00Z");
  const seenAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000);

  it("distinguishes NEVER from stale", () => {
    // A device that never reported is not a device that stopped — the same
    // discipline AGENTS.md applies to `unknown` vs `normal` in telemetry.
    expect(freshness(device({ lastSeenAt: null }), now)).toBe("never");
    expect(freshness(device({ lastSeenAt: seenAgo(600), reportIntervalMs: 900_000 }), now)).toBe("stale");
  });

  it("bands on multiples of the device's own interval", () => {
    const d = (m: number) => device({ lastSeenAt: seenAgo(m), reportIntervalMs: 15 * 60_000 });
    expect(freshness(d(10), now)).toBe("fresh");   // within one interval
    expect(freshness(d(30), now)).toBe("late");    // two intervals
    expect(freshness(d(90), now)).toBe("stale");   // six
  });

  it("falls back to the class default when the device declares no interval", () => {
    const d = device({ deviceClass: "ups", reportIntervalMs: null });
    expect(effectiveIntervalMs(d)).toBe(DEFAULT_REPORT_INTERVAL_MS.ups);
  });

  it("uses the DECLARED interval over the class default when present", () => {
    // Same age, different interval → different verdict. That is the point of
    // recording whether the interval was declared: a device reporting every
    // minute is stale at five, and one reporting every fifteen is not.
    const seen = seenAgo(5);
    const declared = device({ deviceClass: "ups", lastSeenAt: seen, reportIntervalMs: 60_000 });
    const fallback = device({ deviceClass: "ups", lastSeenAt: seen, reportIntervalMs: null });

    expect(effectiveIntervalMs(declared)).toBe(60_000);
    expect(effectiveIntervalMs(fallback)).toBe(DEFAULT_REPORT_INTERVAL_MS.ups);
    expect(freshness(declared, now)).toBe("stale");
    expect(freshness(fallback, now)).toBe("fresh");
  });
});

describe("every device class has an expected nameplate", () => {
  it.each(["gti", "bms", "ups", "meter"] as DeviceClass[])("%s", (cls) => {
    expect(nameplateCompleteness(device({ deviceClass: cls, nameplate: {} }))).toBe(0);
  });
});

describe("the view model", () => {
  it("renders a percentage while the domain keeps a fraction", () => {
    const row = toDeviceRow(device({ nameplate: GTI_FULL }));
    expect(row.completeness).toBe(1);
    expect(row.completenessPct).toBe(100);
  });

  it("propagates null rather than rendering an unmeasurable device as 0%", () => {
    // Guarded so the test stays honest if a class gains an empty field list.
    const row = toDeviceRow(device({ nameplate: {} }));
    expect(row.completenessPct).toBe(row.completeness === null ? null : row.completeness * 100);
  });
});
