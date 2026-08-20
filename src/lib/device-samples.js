/**
 * The four real gateway payloads — transcribed field for field.
 *
 * Source: `~/Downloads/New folder/*_pub_sub 1.json`, four messages captured
 * 2026-08-16 19:29–19:32 UTC (2026-08-17 00:59–01:01 IST) from two gateways on
 * the `rtsg-1 / Ongridrooftop` topic.
 *
 * This is a ~2-MINUTE SAMPLE OF TWO DEVICES, not the fleet. It exists to prove
 * the parser against real bytes and to put honest rows on the screens; the
 * counts it produces are the counts of this sample and the screens say so.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ONE FIELD IS REDACTED. `R-1-0---ICCID` — the SIM's serial — is masked to its
 * last four digits. It is not consumer PII, but it is a live subscriber
 * identifier, and this module is compiled into a public client bundle where
 * redacting at parse time would be theatre: the value would still be in the
 * downloaded JavaScript. The same reasoning `assets.jsx` applies to the consumer
 * master's names and phone numbers.
 *
 * IMEI is kept in full. It is the device number the screens are keyed on and the
 * operator has to be able to read it off the row to act on it.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Everything else is verbatim, INCLUDING the values that are obviously wrong —
 * the −127 °C board temperature, the all-zero meter frame, the meter clock 72
 * days in the future. Those are the rows that prove the sentinel handling works,
 * so "cleaning" them here would delete the test.
 */

/** `R-1-0---ICCID` as shipped, reduced to a suffix. See the module note. */
const ICCID_REDACTED = "•••• •••• •••• 4344";

/* ── 864494089242549 · JD10002 ──────────────────────────────────────────── */

const HEARTBEAT_242549 = {
  filename:
    "20260816_1929457004_rtsg-1_Ongridrooftop_864494089242549_Heartbeat_pub_sub 1.json",
  payload: {
    VD: 0,
    TIMESTAMP: "2026-08-17 00:59:41",
    MAXINDEX: 0,
    INDEX: 0,
    LOAD: 0,
    STINTERVAL: 30,
    MSGID: 1,
    DATE: "260817",
    IMEI: "864494089242549",
    ASN_0: "",
    "R-1-0---GSM": 1,
    "R-1-0---SIM": 1,
    "R-1-0---NET": 1,
    "R-1-0---GPRS": 1,
    "R-1-0---RSSI": -87,
    "R-1-0---ONLINE": 1,
    "R-1-0---RF": 1,
    "R-1-0---RTCDATE": "260817",
    "R-1-0---RTCTIME": "005941",
    // 1-wire "no sensor present". Must never read as a cold board.
    "R-1-0---TEMP": -127.0,
    "R-1-0---SIMSLOT": 1,
    "R-1-0---SD": 0,
    "R-1-0---FLASH": 0,
    // Null Island — never a rooftop in Bihar.
    "R-1-0---LAT": 0.0,
    "R-1-0---LON": 0.0,
    "R-1-0---SIMCHG": 0,
    "R-1-0---BATSTS": 0,
    "R-1-0---BATV": 0.0,
    "R-1-0---PWRSRC": 1,
    // Both empty in the source. Absent gateway nameplate, not blank strings.
    "R-1-0---FW": "",
    "R-1-0---HW": "",
    "R-1-0---MODEMFW": "LTE01R07A01_WIFI_C_SDK_A_BETA260423",
    "R-1-0---ICCID": ICCID_REDACTED,
    "R-1-0---OP": "",
    "R-1-0---MCC": "404",
    "R-1-0---MNC": "70",
    "R-1-0---IPVER": 6,
    // -111 dBm resolves to `warning` on gateway_rsrp. This gateway is on a
    // weak cell, which is exactly the condition that produces the queued
    // submissions and long ingestion lag §7 of dashboard-ia.md describes.
    "R-1-0---RSRP": -111,
    "R-1-0---RSRQ": -5,
    "R-1-0---SINR": 16,
    "R-1-0---INVERR": 0,
    "R-1-0---MTRERR": 0,
    "R-1-0---UPTIME": 0,
  },
};

const DATA_242549 = {
  filename: "20260816_1930021457_rtsg-1_Ongridrooftop_864494089242549_Data_pub_sub 1.json",
  payload: {
    VD: 5,
    TIMESTAMP: "2026-08-17 00:59:57",
    MAXINDEX: 0,
    INDEX: 0,
    LOAD: 0,
    STINTERVAL: 15,
    MSGID: 2,
    DATE: "260817",
    IMEI: "864494089242549",
    ASN_21: "JD10002",
    "MS-10-2-3--MTDET": 0,
    "MS-10-2-3--MTBLDATE": "261001",
    // 2026-10-28, i.e. 72 DAYS AFTER the message that carries it. Every
    // billing and demand stamp below agrees with this wrong clock.
    "MS-10-2-3--DATE": "261028",
    "MS-10-2-3--TIME": "095627",
    "MS-10-2-3--VN": 239.69,
    "MS-10-2-3--I": 0.0,
    "MS-10-2-3--POW": 0.0,
    "MS-10-2-3--RPOW": 0.0,
    "MS-10-2-3--APOW": 0.0,
    // 1.000 at zero current is the register default, not a measurement.
    "MS-10-2-3--PF": 1.0,
    "MS-10-2-3--FRQ": 49.974,
    "MS-10-2-3--KWHNET": 0.0,
    "MS-10-2-3--KWHIMP": 0.0,
    "MS-10-2-3--KWHEXP": 0.0,
    "MS-10-2-3--KVAHNET": 0.0,
    "MS-10-2-3--KVAHIMP": 0.0,
    "MS-10-2-3--KVAHEXP": 0.0,
    "MS-10-2-3--MDKWIMP": 0.0,
    "MS-10-2-3--MDKWEXP": 0.0,
    "MS-10-2-3--POFF": 4773,
    "MS-10-2-3--TC": 0,
    "MS-10-2-3--LBKWHNET": 0.0,
    "MS-10-2-3--LBKWHIMP": 0.0,
    "MS-10-2-3--LBKWHEXP": 0.0,
    "MS-10-2-3--PMDKVAIMP": 0.0,
    "MS-10-2-3--PMDKVAEXP": 0.0,
    "MS-10-2-3--LBMDKWIMP": 0.0,
    "MS-10-2-3--LBMDKWEXP": 0.0,
    "MS-10-2-3--LBMDKVAIMP": 0.0,
    "MS-10-2-3--LBMDKVAEXP": 0.0,
    "MS-10-2-3--MDRSTC": 3,
    "MS-10-2-3--PMDKW": 0.0,
    "MS-10-2-3--PMDKWDT": "261001003000",
    "MS-10-2-3--PMDKVA": 0.0,
    "MS-10-2-3--PMDKVADT": "261001003000",
    // Real billed history — 2.22 kW MD, PF 0.500 — against KWHNET of 0.00.
    "MS-10-2-3--LBMDKW": 2.22,
    "MS-10-2-3--LBMDKWDT": "260928010000",
    "MS-10-2-3--LBMDKVA": 4.34,
    "MS-10-2-3--LBMDKVADT": "260927000000",
    "MS-10-2-3--TMPSTS": "000000",
    "MS-10-2-3--TRNCOUNT": 74,
    "MS-10-2-3--LBPF": 0.5,
    "MS-10-2-3--LBPONDUR": 3337,
    "MS-10-2-3--LBDATE": "261001",
    "MS-10-2-3--CFGBILDAY": 1,
    "MS-10-2-3--MTRMFG": "GENUS POWER INFRASTRUCTURES LTD",
    "MS-10-2-3--MTRFWVER": "G36A5.160001",
    "MS-10-2-3--MTRTYPE": 5,
    "MS-10-2-3--MTRCAT": "C3",
    "MS-10-2-3--MTRCURR": "5-30A",
    "MS-10-2-3--MTRYOM": 2026,
  },
};

/* ── 864494089716682 · JD10003 ──────────────────────────────────────────── */

/** The failed meter read: every register zero, meter RTC `000000`, nameplate intact. */
const DATA_716682_FAILED = {
  filename: "20260816_1931082341_rtsg-1_Ongridrooftop_864494089716682_Data_pub_sub 1.json",
  payload: {
    VD: 5,
    TIMESTAMP: "2026-08-17 01:01:03",
    MAXINDEX: 0,
    INDEX: 0,
    LOAD: 0,
    STINTERVAL: 15,
    MSGID: 2,
    DATE: "260817",
    IMEI: "864494089716682",
    ASN_21: "JD10003",
    "MS-10-2-3--MTDET": 0,
    "MS-10-2-3--MTBLDATE": "000000",
    "MS-10-2-3--DATE": "000000",
    "MS-10-2-3--TIME": "000000",
    "MS-10-2-3--VN": 0.0,
    "MS-10-2-3--I": 0.0,
    "MS-10-2-3--POW": 0.0,
    "MS-10-2-3--RPOW": 0.0,
    "MS-10-2-3--APOW": 0.0,
    "MS-10-2-3--PF": 0.0,
    "MS-10-2-3--FRQ": 0.0,
    "MS-10-2-3--KWHNET": 0.0,
    "MS-10-2-3--KWHIMP": 0.0,
    "MS-10-2-3--KWHEXP": 0.0,
    "MS-10-2-3--KVAHNET": 0.0,
    "MS-10-2-3--KVAHIMP": 0.0,
    "MS-10-2-3--KVAHEXP": 0.0,
    "MS-10-2-3--MDKWIMP": 0.0,
    "MS-10-2-3--MDKWEXP": 0.0,
    "MS-10-2-3--POFF": 0,
    "MS-10-2-3--TC": 0,
    "MS-10-2-3--LBKWHNET": 0.0,
    "MS-10-2-3--LBKWHIMP": 0.0,
    "MS-10-2-3--LBKWHEXP": 0.0,
    "MS-10-2-3--LBKVAHNET": 0.0,
    "MS-10-2-3--PMDKVAIMP": 0.0,
    "MS-10-2-3--PMDKVAEXP": 0.0,
    "MS-10-2-3--LBMDKWIMP": 0.0,
    "MS-10-2-3--LBMDKWEXP": 0.0,
    "MS-10-2-3--LBMDKVAIMP": 0.0,
    "MS-10-2-3--LBMDKVAEXP": 0.0,
    "MS-10-2-3--MDRSTC": 0,
    "MS-10-2-3--PMDKW": 0.0,
    "MS-10-2-3--PMDKWDT": "000000000000",
    "MS-10-2-3--PMDKVA": 0.0,
    "MS-10-2-3--PMDKVADT": "000000000000",
    "MS-10-2-3--LBMDKW": 0.0,
    "MS-10-2-3--LBMDKWDT": "000000000000",
    "MS-10-2-3--LBMDKVA": 0.0,
    "MS-10-2-3--LBMDKVADT": "000000000000",
    "MS-10-2-3--TMPSTS": "000000",
    "MS-10-2-3--TRNCOUNT": 0,
    "MS-10-2-3--LBPF": 0.0,
    "MS-10-2-3--LBPONDUR": 0,
    "MS-10-2-3--LBDATE": "000000",
    "MS-10-2-3--CFGBILDAY": 0,
    // Nameplate survives the failed read — the gateway caches it.
    "MS-10-2-3--MTRMFG": "GENUS POWER INFRASTRUCTURES LTD",
    "MS-10-2-3--MTRFWVER": "G36A5.160001",
    "MS-10-2-3--MTRTYPE": 5,
    "MS-10-2-3--MTRCAT": "C3",
    "MS-10-2-3--MTRCURR": "5-30A",
    "MS-10-2-3--MTRYOM": 2026,
  },
};

const DATA_716682 = {
  filename: "20260816_1931399250_rtsg-1_Ongridrooftop_864494089716682_Data_pub_sub 1.json",
  payload: {
    VD: 5,
    TIMESTAMP: "2026-08-17 01:01:35",
    MAXINDEX: 0,
    INDEX: 0,
    LOAD: 0,
    STINTERVAL: 15,
    MSGID: 3,
    DATE: "260817",
    IMEI: "864494089716682",
    ASN_21: "JD10003",
    "MS-10-2-3--MTDET": 0,
    "MS-10-2-3--MTBLDATE": "000000",
    // 2026-07-22 — 25 days BEFORE the message. The opposite skew to JD10002.
    "MS-10-2-3--DATE": "260722",
    "MS-10-2-3--TIME": "200829",
    "MS-10-2-3--VN": 239.92,
    "MS-10-2-3--I": 0.0,
    "MS-10-2-3--POW": 0.0,
    "MS-10-2-3--RPOW": 0.0,
    "MS-10-2-3--APOW": 0.0,
    "MS-10-2-3--PF": 1.0,
    "MS-10-2-3--FRQ": 49.948,
    // 4.40 net against 0.00 import AND 0.00 export — arithmetically impossible.
    "MS-10-2-3--KWHNET": 4.4,
    "MS-10-2-3--KWHIMP": 0.0,
    "MS-10-2-3--KWHEXP": 0.0,
    "MS-10-2-3--KVAHNET": 4.4,
    "MS-10-2-3--KVAHIMP": 0.0,
    "MS-10-2-3--KVAHEXP": 0.0,
    "MS-10-2-3--MDKWIMP": 0.0,
    "MS-10-2-3--MDKWEXP": 0.0,
    "MS-10-2-3--POFF": 1468,
    "MS-10-2-3--TC": 0,
    "MS-10-2-3--LBKWHNET": 0.0,
    "MS-10-2-3--LBKWHIMP": 0.0,
    "MS-10-2-3--LBKWHEXP": 0.0,
    "MS-10-2-3--LBKVAHNET": 0.0,
    "MS-10-2-3--PMDKVAIMP": 0.0,
    "MS-10-2-3--PMDKVAEXP": 0.0,
    "MS-10-2-3--LBMDKWIMP": 0.0,
    "MS-10-2-3--LBMDKWEXP": 0.0,
    "MS-10-2-3--LBMDKVAIMP": 0.0,
    "MS-10-2-3--LBMDKVAEXP": 0.0,
    "MS-10-2-3--MDRSTC": 0,
    "MS-10-2-3--PMDKW": 3.15,
    "MS-10-2-3--PMDKWDT": "260720130000",
    "MS-10-2-3--PMDKVA": 3.16,
    "MS-10-2-3--PMDKVADT": "260720130000",
    "MS-10-2-3--LBMDKW": 0.0,
    "MS-10-2-3--LBMDKWDT": "000000000000",
    "MS-10-2-3--LBMDKVA": 0.0,
    "MS-10-2-3--LBMDKVADT": "000000000000",
    // 0x001A — three tamper bits asserted, meanings undocumented.
    "MS-10-2-3--TMPSTS": "001A00",
    "MS-10-2-3--TRNCOUNT": 1,
    "MS-10-2-3--LBPF": 0.0,
    "MS-10-2-3--LBPONDUR": 0,
    "MS-10-2-3--LBDATE": "000000",
    "MS-10-2-3--CFGBILDAY": 1,
    "MS-10-2-3--MTRMFG": "GENUS POWER INFRASTRUCTURES LTD",
    "MS-10-2-3--MTRFWVER": "G36A5.160001",
    "MS-10-2-3--MTRTYPE": 5,
    "MS-10-2-3--MTRCAT": "C3",
    "MS-10-2-3--MTRCURR": "5-30A",
    "MS-10-2-3--MTRYOM": 2026,
  },
};

/** Data messages, oldest first. */
export const SAMPLE_DATA_MESSAGES = [DATA_242549, DATA_716682_FAILED, DATA_716682];

/** Heartbeat messages, oldest first. */
export const SAMPLE_HEARTBEAT_MESSAGES = [HEARTBEAT_242549];

/**
 * What the sample is, stated once so every screen can say it.
 * The screens must not present two devices as the fleet.
 */
export const SAMPLE_SCOPE = {
  isSample: true,
  devices: 2,
  messages: 4,
  capturedFrom: "2026-08-16 19:29 UTC",
  capturedTo: "2026-08-16 19:32 UTC",
  note: "A 2-minute capture of 2 gateways, loaded to prove the parser against real payloads. Not the fleet — the bulk export is still outstanding.",
};
