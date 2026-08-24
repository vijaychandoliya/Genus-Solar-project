/**
 * 🟨 MOCK ONLY — the entire directory is deletable.
 *
 * The acceptance test for the refactor is:
 *
 *     rm -rf src/features/<any>/mocks && VITE_DATA_SOURCE=api npm run build
 *
 * still compiling and every page still rendering. Nothing in 🟩 production code
 * may import this file; only the mock repository does, and the container is the
 * only thing that chooses the mock repository.
 *
 * Values are deliberately UNEVEN — devices that have never reported, incomplete
 * nameplates, a disabled unit, a stale one. Fixtures where every row is
 * well-formed produce a UI that has never rendered the cases operators actually
 * see, which is exactly how "it worked with the mock" becomes untrue.
 */
import type { Device } from "../model/device.model.js";

const at = (isoMinutesAgo: number): Date => new Date(Date.now() - isoMinutesAgo * 60_000);

export const DEVICE_FIXTURES: readonly Device[] = [
  {
    id: "GTI-BHR-000141",
    name: "Rooftop gateway — Patna Sadar 141",
    deviceClass: "gti",
    systemType: "on-grid",
    siteId: "SITE-PAT-0141",
    circleId: "CIR-PATNA",
    districtId: "DST-PATNA",
    dealer: "Surya Renewables",
    consumerRef: "CA-1140028871",
    enabled: true,
    lastSeenAt: at(6),
    reportIntervalMs: 15 * 60 * 1000,
    intervalIsDeclared: true,
    nameplate: {
      meter_manufacturer: "GENUS POWER INFRASTRUCTURES LTD",
      meter_firmware: "G36A5.160001",
      meter_current_rating: "5-30A",
      gateway_firmware: "1.4.2",
      gateway_hardware: "GW-R2",
      rated_kw: 5,
    },
  },
  {
    // Late, and missing half its nameplate — the common real-world row.
    id: "GTI-BHR-000208",
    name: "Rooftop gateway — Danapur 208",
    deviceClass: "gti",
    systemType: "on-grid",
    siteId: "SITE-PAT-0208",
    circleId: "CIR-PATNA",
    districtId: "DST-PATNA",
    dealer: "Surya Renewables",
    consumerRef: "CA-1140031204",
    enabled: true,
    lastSeenAt: at(38),
    reportIntervalMs: 15 * 60 * 1000,
    intervalIsDeclared: true,
    // Incomplete on purpose: the gateway half arrives empty in the heartbeat and
    // `rated_kw` is in no payload at all — the commonest real-world row.
    nameplate: {
      meter_manufacturer: "GENUS POWER INFRASTRUCTURES LTD",
      meter_firmware: "G36A5.160001",
      meter_current_rating: "5-30A",
    },
  },
  {
    // Never reported. Distinct from "stale" on purpose — see device.rules.
    id: "BMS-BHR-000042",
    name: "Battery module — Gaya 42",
    deviceClass: "bms",
    systemType: "hybrid",
    siteId: "SITE-GAY-0042",
    circleId: "CIR-GAYA",
    districtId: "DST-GAYA",
    dealer: "Magadh Solar",
    consumerRef: "CA-1150009913",
    enabled: true,
    lastSeenAt: null,
    reportIntervalMs: null,
    intervalIsDeclared: false,
    nameplate: {
      manufacturer: "Genus",
      model: "BMS-48V",
      chemistry: "LFP",
      rated_capacity_ah: 200,
    },
  },
  {
    // Stale: hours overdue against a 15-minute interval.
    id: "UPS-BHR-000017",
    name: "UPS — Muzaffarpur 17",
    deviceClass: "ups",
    systemType: "backup",
    siteId: "SITE-MUZ-0017",
    circleId: "CIR-MUZAFFARPUR",
    districtId: "DST-MUZAFFARPUR",
    dealer: "Tirhut Power",
    consumerRef: "CA-1160004402",
    enabled: true,
    lastSeenAt: at(260),
    reportIntervalMs: null,
    intervalIsDeclared: false,
    nameplate: {},
  },
  {
    // Disabled. Should not disappear from lists — operators need to see it.
    id: "MTR-BHR-000399",
    name: "Net meter — Bhagalpur 399",
    deviceClass: "meter",
    systemType: "on-grid",
    siteId: "SITE-BGP-0399",
    circleId: "CIR-BHAGALPUR",
    districtId: "DST-BHAGALPUR",
    dealer: "Anga Energy",
    consumerRef: "CA-1170022185",
    enabled: false,
    lastSeenAt: at(1450),
    reportIntervalMs: 15 * 60 * 1000,
    intervalIsDeclared: true,
    nameplate: {
      meter_manufacturer: "GENUS POWER INFRASTRUCTURES LTD",
      meter_firmware: "G36A5.160001",
      meter_current_rating: "10-60A",
    },
  },
];
