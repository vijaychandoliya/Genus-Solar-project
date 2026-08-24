# Frontend architecture & API integration — refactor proposal

> Production structure for Genus Solar: UI concerns in UI, data access behind a
> repository seam, mock and real implementations interchangeable by configuration.
>
> Builds on [design-system.md](design-system.md), which stays exactly as it is.

**File-type markers used throughout:**
🟩 production · 🟨 mock-only · ⚙️ config · 🧪 test · 🤖 generated (never hand-edited)

---

## 0. What the inventory actually found

I ran the brief's own step 1 before proposing anything. Four facts change the answer.

### F1 — The project is 100% JavaScript. The brief assumes TypeScript throughout.

```
62  .jsx / .js files
 0  .ts / .tsx files
 0  tsconfig.json
 1  .d.ts sidecar (the adapter contract added last week)
```

And this was **already decided**, in `token-engine-architecture.md` §5.5:

> *"This plan assumes sidecars: full editor checking, no build change, consistent
> with the current codebase. Adopting TS properly is defensible but it is a
> separate project and should not be smuggled in under this one."*

Every `.ts`/`.tsx`/`interface`/`Promise<User[]>` in the brief presumes a migration
that has not happened and that the repo has explicitly deferred once.

**Recommendation: JSDoc + `.d.ts` sidecars now; TypeScript as its own funded decision.**

The brief's own reasoning supports this. It says *"Do not blindly trust external API
data because TypeScript types disappear at runtime."* Exactly — which means the
load-bearing safety at the API boundary is **runtime validation**, and Zod works
identically in JavaScript. TypeScript buys editor DX and refactor confidence; it does
not buy API safety. Every architectural goal in the brief — separation, testability,
replaceability, mock/API parity — is reachable today. A TS migration touches all 62
files and would collide with everything currently in flight.

*If you want TS, do it as Phase 0 and budget it separately. The structure below is
identical either way; only the file extensions change.*

### F2 — There is no network code at all. This is greenfield, not a rescue.

Zero `fetch`, `axios`, `XMLHttpRequest`, `WebSocket` anywhere in `src/`. There is no
bad API code to unpick — the API layer is written once, correctly, on a clean sheet.

### F3 — Dummy data is already ~80% extracted. The real problem is a different one.

15 of 21 pages already import from `src/lib/*-data.js`; roughly 1,800 lines of data
live outside components. Most remaining inline arrays are **static UI configuration**
— column definitions, tab lists, icon maps — which the brief itself says to
distinguish from mock API data.

The actual defect is that domain logic and fixtures are **fused in the same modules**:

```js
// src/lib/device-data.js — 641 lines, doing two unrelated jobs
export const DEVICES = devicesFromMessages(GTI_DATA_PARSED, …)   // 🟨 fixture
export function nameplateCompleteness(device) { … }              // 🟩 domain rule
export function deriveBmsRow(row) { … }                          // 🟩 domain rule
export const REPORT_INTERVAL_MS = { ups: 15*60*1000 /* [seed] */ } // ⚙️ domain constant
```

Delete the fixtures and the business rules go with them. **That is the separation this
refactor is actually for** — not "move arrays out of components", which is mostly done.

### F4 — No linter and no test runner exist.

devDependencies are `@vitejs/plugin-react` and `vite`. So "enforce boundaries with
ESLint" and "add tests" each start with *install the tool*. AGENTS.md is explicit:
*"There is no test suite; [/gallery] is the substitute."*

---

## 1. Recommended architecture

**Feature-sliced, with a repository seam.** Four rules, in priority order:

1. **UI → hook → service → repository → transport.** The component never learns which
   transport answered.
2. **The repository interface is the contract.** `ApiDeviceRepository` and
   `MockDeviceRepository` implement the same shape; configuration picks one.
3. **Validate at the boundary, map once.** API shape → Zod → domain model. Nothing
   downstream ever sees an API field name.
4. **Design tokens are untouched.** `src/tokens/`, `src/lib/token-*`, `src/lib/theme.js`,
   `src/lib/a11y.js` and the generated outputs keep their current structure, their
   generated-never-written rule, and their contrast gate.

### What I am deliberately *not* recommending

| Not doing | Why |
|---|---|
| A TypeScript migration inside this refactor | F1. Separate, funded, and previously deferred on purpose |
| Redux / Zustand for server state | TanStack Query owns caching, retry, cancellation and request dedup. A global store would re-implement it worse |
| React Hook Form now | Two non-trivial forms exist (`alarms-rules`, `data-import`). Add it at the third, not before |
| MSW in the dev runtime | The repository swap already gives mock/real parity with no service worker. MSW earns its place in **tests**, where intercepting real `fetch` is the point |
| Renaming `src/lib` wholesale | It holds the token engine. Moving it would churn the one part of the codebase that is finished |
| A `types/` mega-folder | Types live beside the code they describe. A central dumping ground becomes a merge-conflict magnet |

---

## 2. Folder tree

```
src/
├── app/                          🟩 composition root — the only place that wires things
│   ├── App.jsx                       providers + router, nothing else
│   ├── providers/
│   │   ├── AppProviders.jsx          Settings → Tokens → Query → Router, in order
│   │   └── QueryProvider.jsx         TanStack Query client + defaults
│   ├── router/
│   │   ├── routes.jsx                route table, code-split
│   │   ├── guards.jsx                RequireAuth / RequirePermission
│   │   └── error-routes.jsx          404, 403, route-level error boundary
│   └── bootstrap/
│       └── container.js          🟩 THE SEAM — picks api|mock repositories once
│
├── config/                       ⚙️ environment, read exactly once
│   ├── env.js                        validated import.meta.env, fails loudly
│   └── features.js                   feature flags
│
├── services/                     🟩 cross-cutting infrastructure (not domain)
│   ├── http/
│   │   ├── client.js                 the ONLY fetch() in the codebase
│   │   ├── errors.js                 ApiError, NetworkError, … normalised
│   │   ├── interceptors.js           auth header, request id, logging
│   │   └── retry.js                  backoff policy
│   ├── auth/
│   │   ├── auth.service.js
│   │   └── token-storage.js
│   └── storage/
│       └── local-storage.js          safe wrapper — quota + private mode
│
├── features/                     🟩 one folder per domain. The unit of ownership.
│   ├── devices/
│   │   ├── api/
│   │   │   ├── devices.api.js        endpoint calls. Returns RAW api shapes.
│   │   │   └── devices.mapper.js     api shape → domain model. One direction.
│   │   ├── schemas/
│   │   │   └── devices.schema.js     Zod. The runtime boundary.
│   │   ├── model/
│   │   │   ├── device.model.js       domain constants + factories
│   │   │   └── device.rules.js       nameplateCompleteness, deriveBmsRow — MOVED HERE
│   │   ├── repository/
│   │   │   ├── devices.repository.js    the interface (JSDoc typedef)
│   │   │   ├── devices.api.repository.js
│   │   │   └── devices.mock.repository.js   🟨
│   │   ├── mocks/                    🟨 DELETABLE AS A UNIT
│   │   │   └── devices.fixture.js       the arrays that live in lib/device-data today
│   │   ├── hooks/
│   │   │   ├── useDevices.js         query + select + states
│   │   │   └── useDeviceFilters.js   URL-backed filter state
│   │   ├── components/
│   │   │   ├── DeviceTable.jsx
│   │   │   └── DeviceHealthChip.jsx
│   │   └── index.js                  PUBLIC API — the only legal import path
│   │
│   ├── alarms/  sites/  assets/  telemetry/  data-pipeline/
│   ├── reports/  admin/  appearance/          (same shape throughout)
│
├── components/                   🟩 domain-agnostic. Zero feature imports.
│   ├── ui/                           Button, Chip, Field — primitives
│   ├── layout/                       Shell, WsPage, WsSection
│   ├── feedback/                     LoadingState, ErrorState, EmptyState, RetryState
│   └── data-display/                 DataTable, Chart, KpiTile
│
├── pages/                        🟩 composition only. Target: under 120 lines each.
│
├── hooks/                        🟩 generic. useDebounce, useUrlState.
│
├── lib/                          🟩 THE TOKEN ENGINE — do not restructure
│   ├── token-resolve.js  ramp.js  contrast.js  a11y.js  theme.js
│   ├── token-store.jsx   settings.jsx   looks/   design-systems/
│   └── format.js  rbac.js  bands.js       (pure utilities, stay)
│
├── tokens/                       🤖 source + generated. Untouched by this refactor.
├── tokens.css                    🤖 generated — DO NOT EDIT
└── test/                         🧪
    ├── setup.js
    ├── msw/  handlers/  server.js
    └── contracts/repository.contract.js   ← one suite, run against BOTH impls
```

### Why each folder exists

| Folder | Owns | Must never |
|---|---|---|
| `app/` | Wiring. Providers, routes, the DI container | Contain business logic |
| `config/` | Reading the environment, once, validated | Be read via `import.meta.env` elsewhere |
| `services/` | Cross-cutting infrastructure: HTTP, auth, storage | Know about devices, alarms or sites |
| `features/*` | One business domain end to end | Import another feature's internals |
| `components/` | Domain-agnostic presentation | Import from `features/` |
| `pages/` | Composition of features into a screen | Fetch, transform or filter |
| `lib/` | The token engine and pure utilities | Gain data-access code |
| `test/` | Runner setup, MSW, shared contract suites | Ship in the production bundle |

---

## 3. The environment layer ⚙️

```js
// src/config/env.js                                            🟩 production
/**
 * The ONLY module that reads import.meta.env.
 *
 * Validated at module load, so a missing variable is a boot failure with a
 * readable message rather than `undefined` surfacing as a 404 against
 * "undefined/api/devices" three screens later.
 */
const raw = import.meta.env;

const required = (key, fallback) => {
  const v = raw[key] ?? fallback;
  if (v === undefined || v === "")
    throw new Error(`Missing ${key}. Copy .env.example to .env.local and fill it in.`);
  return v;
};

export const env = Object.freeze({
  mode: raw.MODE,
  isDev: raw.DEV,
  apiBaseUrl: required("VITE_API_BASE_URL", raw.DEV ? "http://localhost:8080/api" : undefined),
  apiTimeoutMs: Number(required("VITE_API_TIMEOUT", "15000")),
  /** "mock" | "api" — THE switch. Nothing else in the app branches on it. */
  dataSource: required("VITE_DATA_SOURCE", raw.DEV ? "mock" : "api"),
  enableLogging: (raw.VITE_ENABLE_LOGGING ?? String(raw.DEV)) === "true",
});

if (!["mock", "api"].includes(env.dataSource))
  throw new Error(`VITE_DATA_SOURCE must be "mock" or "api", got "${env.dataSource}"`);
```

```bash
# .env.example                                                  ⚙️ committed
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=15000
VITE_DATA_SOURCE=mock
VITE_ENABLE_LOGGING=true
```

### What is safe to put here — and what is not

**Everything prefixed `VITE_` is inlined into the JavaScript bundle at build time and
is readable by anyone who opens devtools.** There is no such thing as a secret in a
Vite client variable. Not obscured, not minified away — a literal string in a public
file.

| Safe ✅ | Never ❌ |
|---|---|
| API base URLs, timeouts, retry counts | API keys, client secrets, DB credentials |
| Feature flags, data-source switch | Signing keys, service-account JSON |
| Public analytics/map keys with a domain allowlist | Anything a backend would treat as a bearer credential |
| Build metadata: version, commit | Third-party tokens without origin restriction |

Anything genuinely secret is held by the backend, which exposes an endpoint instead.
For a utility platform handling SBPDCL consumer data this is not pedantry — a leaked
key in a bundle is a disclosed credential, permanently, across every cached copy.

---

## 4. API architecture 🟩

### 4.1 The single HTTP client

```js
// src/services/http/client.js                                  🟩 production
/**
 * The only fetch() in the codebase.
 *
 * Everything a feature would otherwise re-implement badly lives here once:
 * base URL, auth, timeout, cancellation, retry, status handling, error
 * normalisation, logging. A feature that calls fetch() directly has bypassed
 * all of it, which is why the ESLint rule in §14 forbids it.
 */
import { env } from "../../config/env.js";
import { normaliseError, ApiError, NetworkError, TimeoutError } from "./errors.js";
import { withRetry } from "./retry.js";
import { authHeader } from "../auth/token-storage.js";

const JSON_TYPE = "application/json";

async function request(path, { method = "GET", body, signal, timeoutMs, retry, ...rest } = {}) {
  const url = `${env.apiBaseUrl}${path}`;
  const requestId = crypto.randomUUID();

  // Compose the caller's signal with our timeout, so a component unmounting and a
  // slow server are the same kind of cancellation downstream.
  const timer = AbortSignal.timeout(timeoutMs ?? env.apiTimeoutMs);
  const composed = signal ? AbortSignal.any([signal, timer]) : timer;

  const run = async () => {
    let res;
    try {
      res = await fetch(url, {
        method,
        signal: composed,
        headers: {
          Accept: JSON_TYPE,
          ...(body ? { "Content-Type": JSON_TYPE } : {}),
          "X-Request-Id": requestId,
          ...authHeader(),
          ...rest.headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (cause) {
      // fetch() rejects only on network failure or abort — never on 4xx/5xx.
      if (cause?.name === "TimeoutError" || timer.aborted)
        throw new TimeoutError(`${method} ${path} timed out`, { requestId, cause });
      if (cause?.name === "AbortError") throw cause; // caller cancelled; not an error
      throw new NetworkError(`${method} ${path} could not reach the server`, { requestId, cause });
    }

    if (!res.ok) throw await normaliseError(res, { requestId, method, path });
    if (res.status === 204) return null;
    return res.json();
  };

  const result = await withRetry(run, { retry, method });
  if (env.enableLogging) console.debug(`[http] ${method} ${path}`, { requestId });
  return result;
}

export const http = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
```

### 4.2 Normalised errors

```js
// src/services/http/errors.js                                  🟩 production
/**
 * The UI must never branch on a status code. It branches on a KIND.
 *
 * `AppError.kind` is a closed set, so a component's error handling is a switch
 * with no default-shaped hole, and adding a new HTTP status does not require
 * touching a component.
 */
export class AppError extends Error {
  constructor(message, { kind, status, requestId, details, cause } = {}) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.kind = kind;
    this.status = status;
    this.requestId = requestId;   // put this in the UI — it is what support will ask for
    this.details = details ?? null;
    this.retryable = ["network", "timeout", "server"].includes(kind);
  }
}

export class NetworkError        extends AppError { constructor(m, o) { super(m, { ...o, kind: "network" }); } }
export class TimeoutError        extends AppError { constructor(m, o) { super(m, { ...o, kind: "timeout" }); } }
export class AuthenticationError extends AppError { constructor(m, o) { super(m, { ...o, kind: "auth" }); } }
export class PermissionError     extends AppError { constructor(m, o) { super(m, { ...o, kind: "permission" }); } }
export class NotFoundError       extends AppError { constructor(m, o) { super(m, { ...o, kind: "not-found" }); } }
export class ValidationError     extends AppError { constructor(m, o) { super(m, { ...o, kind: "validation" }); } }
export class ApiError            extends AppError { constructor(m, o) { super(m, { ...o, kind: o?.kind ?? "server" }); } }

const BY_STATUS = {
  400: (m, o) => new ValidationError(m, o),
  401: (m, o) => new AuthenticationError(m, o),
  403: (m, o) => new PermissionError(m, o),
  404: (m, o) => new NotFoundError(m, o),
  409: (m, o) => new ValidationError(m, o),
  422: (m, o) => new ValidationError(m, o),
};

export async function normaliseError(res, ctx) {
  // A failing server frequently returns HTML. Never let a parse failure mask the
  // real status — that turns "503 upstream down" into "unexpected token <".
  let payload = null;
  try { payload = await res.clone().json(); } catch { /* not JSON; the status still stands */ }

  const message = payload?.message ?? payload?.error ?? `${ctx.method} ${ctx.path} failed (${res.status})`;
  const opts = { ...ctx, status: res.status, details: payload?.details ?? null };

  const make = BY_STATUS[res.status];
  if (make) return make(message, opts);
  return new ApiError(message, { ...opts, kind: res.status >= 500 ? "server" : "client" });
}
```

### 4.3 Retry policy

```js
// src/services/http/retry.js                                   🟩 production
const SAFE = new Set(["GET", "HEAD"]);

/**
 * Retry idempotent requests only.
 *
 * A retried POST creates two alarm rules. That is worse than one failure, so the
 * default is deliberately narrow and a caller must opt in explicitly for anything
 * else — having convinced themselves the endpoint is idempotent.
 */
export async function withRetry(run, { retry, method } = {}) {
  const attempts = retry?.attempts ?? (SAFE.has(method) ? 2 : 0);
  let lastError;

  for (let i = 0; i <= attempts; i += 1) {
    try { return await run(); }
    catch (err) {
      lastError = err;
      if (err?.name === "AbortError" || !err?.retryable || i === attempts) throw err;
      await new Promise((r) => setTimeout(r, 2 ** i * 250 + Math.random() * 100)); // jittered backoff
    }
  }
  throw lastError;
}
```

---

## 5. The repository seam 🟩

This is the mechanism that makes mock and real interchangeable.

```js
// src/features/devices/repository/devices.repository.js        🟩 production
/**
 * The contract. Both implementations satisfy it; nothing above this line knows
 * which one answered.
 *
 * @typedef {Object} DeviceRepository
 * @property {(q?: DeviceQuery) => Promise<Paged<Device>>} list
 * @property {(id: string) => Promise<Device>}             get
 * @property {(input: DeviceInput) => Promise<Device>}     create
 * @property {(id: string, input: Partial<DeviceInput>) => Promise<Device>} update
 * @property {(id: string) => Promise<void>}               remove
 */
export const DEVICE_REPOSITORY_METHODS = ["list", "get", "create", "update", "remove"];
```

```js
// src/features/devices/repository/devices.api.repository.js    🟩 production
import * as api from "../api/devices.api.js";
import { toDevice } from "../api/devices.mapper.js";

/** @type {import("./devices.repository.js").DeviceRepository} */
export const apiDeviceRepository = {
  async list(query) {
    const res = await api.fetchDevices(query);
    return { items: res.items.map(toDevice), total: res.total, page: res.page };
  },
  async get(id)             { return toDevice(await api.fetchDevice(id)); },
  async create(input)       { return toDevice(await api.createDevice(input)); },
  async update(id, input)   { return toDevice(await api.updateDevice(id, input)); },
  async remove(id)          { await api.deleteDevice(id); },
};
```

```js
// src/features/devices/repository/devices.mock.repository.js   🟨 MOCK ONLY
import { DEVICE_FIXTURES } from "../mocks/devices.fixture.js";
import { NotFoundError } from "../../../services/http/errors.js";

/**
 * Same contract, no network.
 *
 * It imitates the API's SHAPE deliberately — async, paged, throwing the same
 * normalised errors, with latency. A mock that resolves instantly and never fails
 * trains the UI to have no loading state and no error state, and both defects
 * surface on the day the real API arrives.
 */
const latency = () => new Promise((r) => setTimeout(r, 120 + Math.random() * 280));

/** @type {import("./devices.repository.js").DeviceRepository} */
export const mockDeviceRepository = {
  async list({ page = 1, pageSize = 50, search, status } = {}) {
    await latency();
    let items = DEVICE_FIXTURES;
    if (search) items = items.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
    if (status) items = items.filter((d) => d.status === status);
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total: items.length, page };
  },
  async get(id) {
    await latency();
    const found = DEVICE_FIXTURES.find((d) => d.id === id);
    if (!found) throw new NotFoundError(`Device ${id} not found`, { status: 404 });
    return found;
  },
  async create(input)     { await latency(); return { ...input, id: crypto.randomUUID() }; },
  async update(id, input) { await latency(); return { ...(await this.get(id)), ...input }; },
  async remove()          { await latency(); },
};
```

### The container — the only place `dataSource` is read

```js
// src/app/bootstrap/container.js                               🟩 production
/**
 * THE SEAM. One conditional in the entire application.
 *
 * The mock imports are static rather than dynamic so the bundler can see them:
 * with VITE_DATA_SOURCE=api the mock branch is unreachable and tree-shaken out,
 * so fixtures do not ship to production. Verify with `npx vite-bundle-visualizer`
 * before release rather than assuming it.
 */
import { env } from "../../config/env.js";
import { apiDeviceRepository } from "../../features/devices/repository/devices.api.repository.js";
import { mockDeviceRepository } from "../../features/devices/repository/devices.mock.repository.js";
import { apiAlarmRepository } from "../../features/alarms/repository/alarms.api.repository.js";
import { mockAlarmRepository } from "../../features/alarms/repository/alarms.mock.repository.js";

const useMock = env.dataSource === "mock";

export const repositories = Object.freeze({
  devices: useMock ? mockDeviceRepository : apiDeviceRepository,
  alarms: useMock ? mockAlarmRepository : apiAlarmRepository,
});
```

---

## 6. Validation and mapping 🟩

The brief's own point: types vanish at runtime, so the boundary needs a guard.

```js
// src/features/devices/schemas/devices.schema.js               🟩 production
import { z } from "zod";

/** The API's shape — snake_case, nullable, exactly as the server sends it. */
export const DeviceApiSchema = z.object({
  device_id: z.string(),
  display_name: z.string(),
  device_type: z.enum(["gti", "bms", "ups", "meter"]),
  site_id: z.string(),
  last_seen_at: z.string().datetime().nullable(),
  nameplate: z.object({
    manufacturer: z.string().nullable(),
    model: z.string().nullable(),
    capacity_kw: z.number().nullable(),
  }).partial().nullable(),
});

export const DeviceListApiSchema = z.object({
  items: z.array(DeviceApiSchema),
  total: z.number().int(),
  page: z.number().int(),
});
```

```js
// src/features/devices/api/devices.mapper.js                   🟩 production
/**
 * API shape → domain model. ONE DIRECTION, ONE PLACE.
 *
 * Past this function no `snake_case` and no `device_id` exists anywhere in the
 * app. That is what makes an API rename a one-file change rather than a grep.
 */
export function toDevice(dto) {
  return {
    id: dto.device_id,
    name: dto.display_name,
    type: dto.device_type,
    siteId: dto.site_id,
    lastSeenAt: dto.last_seen_at ? new Date(dto.last_seen_at) : null,
    nameplate: {
      manufacturer: dto.nameplate?.manufacturer ?? null,
      model: dto.nameplate?.model ?? null,
      capacityKw: dto.nameplate?.capacity_kw ?? null,
    },
  };
}

/** Domain → API, for writes. Separate on purpose: the shapes are not symmetric. */
export function toDeviceInput(device) {
  return {
    display_name: device.name,
    device_type: device.type,
    site_id: device.siteId,
    nameplate: {
      manufacturer: device.nameplate.manufacturer,
      model: device.nameplate.model,
      capacity_kw: device.nameplate.capacityKw,
    },
  };
}
```

```js
// src/features/devices/api/devices.api.js                      🟩 production
import { http } from "../../../services/http/client.js";
import { DeviceApiSchema, DeviceListApiSchema } from "../schemas/devices.schema.js";
import { ValidationError } from "../../../services/http/errors.js";

/**
 * Parse, do not trust. A server that starts sending `capacity_kw` as a string
 * should fail HERE with a precise path, not three layers up as
 * "cannot read property toFixed of undefined" inside a chart.
 */
const parse = (schema, data, where) => {
  const r = schema.safeParse(data);
  if (r.success) return r.data;
  throw new ValidationError(`${where} returned an unexpected shape`, {
    status: 502,
    details: r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
  });
};

export const fetchDevices = async (q = {}) =>
  parse(DeviceListApiSchema, await http.get(`/devices?${new URLSearchParams(clean(q))}`), "GET /devices");

export const fetchDevice = async (id) =>
  parse(DeviceApiSchema, await http.get(`/devices/${encodeURIComponent(id)}`), `GET /devices/${id}`);

const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v != null && v !== ""));
```

**The full boundary:**

```
HTTP response → Zod parse → mapper → domain model → hook → component
                    ↑                    ↑
              fails loudly,        no API field name
            with a field path       survives past here
```

---

## 7. Hooks — server state 🟩

**Recommendation: adopt TanStack Query for server state.** It is the one new runtime
dependency I would argue hard for, because the brief asks for caching, retry,
cancellation, and consistent loading/error/empty states — and hand-rolling those in
`useEffect` is how every one of them ends up subtly different per page.

```js
// src/features/devices/hooks/useDevices.js                     🟩 production
import { useQuery } from "@tanstack/react-query";
import { repositories } from "../../../app/bootstrap/container.js";
import { toDeviceRows } from "../model/device.rules.js";

export const deviceKeys = {
  all: ["devices"],
  list: (q) => ["devices", "list", q],
  detail: (id) => ["devices", "detail", id],
};

/**
 * The component's entire data contract.
 *
 * `select` runs the view-model transform inside the cache, so re-renders that do
 * not change the data do not re-map 2,000 rows.
 */
export function useDevices(query = {}) {
  const q = useQuery({
    queryKey: deviceKeys.list(query),
    queryFn: ({ signal }) => repositories.devices.list({ ...query, signal }),
    select: (page) => ({ ...page, rows: toDeviceRows(page.items) }),
    staleTime: 30_000,
  });

  // One derived flag, so every list screen renders the same four states the same
  // way instead of each inventing its own emptiness test.
  return { ...q, isEmpty: q.isSuccess && q.data.rows.length === 0 };
}
```

### State: the right tool per kind

| Kind | Tool | Why |
|---|---|---|
| **Server state** | **TanStack Query** | Cache, dedup, retry, cancellation, background refresh. Not client state and should not live in a store |
| **UI state** | `useState` / context | Already done well by `settings.jsx` and `token-store.jsx`. No change |
| **URL state** | `useSearchParams` | Filters, pagination, selected tab. Makes a filtered alarm list a shareable link — which operators will want |
| **Form state** | `useState` now, **React Hook Form at the third non-trivial form** | Two exist today. Adding RHF for two is abstraction without a reason |
| **Persistent** | `services/storage` | `genus-settings`, `genus-tokens` — already correct |
| **Global app state** | **none** | There is no such thing here. Auth is server state, theme is context, filters are URL |

---

## 8. Components, pages and the four states

```js
// src/components/feedback/AsyncBoundary.jsx                    🟩 production
/**
 * Loading, error, empty and success in one place.
 *
 * Without this every screen invents its own, they drift, and "empty" quietly
 * becomes indistinguishable from "still loading" on a slow connection — which
 * reads to an operator as "there are no alarms".
 */
export function AsyncBoundary({ query, empty, children, skeleton }) {
  if (query.isPending) return skeleton ?? <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (query.isEmpty) return empty ?? <EmptyState />;
  return children(query.data);
}
```

```jsx
// src/pages/devices.jsx                                        🟩 production — AFTER
export default function DevicesPage() {
  const [filters, setFilters] = useDeviceFilters();   // URL-backed
  const devices = useDevices(filters);

  return (
    <WsPage title="Devices" breadcrumbs={BREADCRUMBS}>
      <DevicesFilters value={filters} onChange={setFilters} />
      <AsyncBoundary query={devices} empty={<EmptyState title="No devices match these filters" />}>
        {(data) => <DeviceTable rows={data.rows} total={data.total} />}
      </AsyncBoundary>
    </WsPage>
  );
}
```

### Placement rules

| Component | Lives in | Test |
|---|---|---|
| `Button`, `Chip` | `components/ui` | Would it make sense in a different product? |
| `DataTable`, `Chart` | `components/data-display` | Domain-agnostic, takes rows and columns |
| `LoadingState`, `ErrorState` | `components/feedback` | — |
| `DeviceTable`, `AlarmSeverityChip` | `features/*/components` | Names a domain concept |
| `DevicesPage` | `pages/` | Composes; holds no logic |
| `Shell`, `WsPage` | `components/layout` | Structural |

> **The rule that keeps this honest:** a component moves to `components/` when a
> *second* feature needs it — not when someone predicts one might. Premature promotion
> is how a shared folder fills with things only one caller uses.

---

## 9. Before / after — dummy data leaving a component

**Before** — `src/lib/device-data.js`, fixtures and business rules fused:

```js
// 🟨 fixture and 🟩 domain rule in one 641-line module
export const DEVICES = devicesFromMessages(GTI_DATA_PARSED, GTI_HEARTBEAT_PARSED).map(…);

export function nameplateCompleteness(device) {
  const present = NAMEPLATE_FIELDS[device.type].filter((f) => device[f] != null);
  return present.length / NAMEPLATE_FIELDS[device.type].length;
}
```

```jsx
// 🟩 page, importing the fixture directly — nothing between it and the data
import { DEVICES, nameplateCompleteness } from "../lib/device-data.js";
const rows = useMemo(() => DEVICES.filter(…).map(…), [filters]);
```

**After** — the rule survives deleting the fixture:

```js
// src/features/devices/model/device.rules.js                   🟩 PRODUCTION
export function nameplateCompleteness(device) { /* unchanged */ }
export const toDeviceRows = (devices) => devices.map((d) => ({
  ...d, completeness: nameplateCompleteness(d), isStale: isStale(d),
}));
```

```js
// src/features/devices/mocks/devices.fixture.js                🟨 MOCK ONLY — deletable
export const DEVICE_FIXTURES = [ /* the arrays from device-data.js */ ];
```

```jsx
// src/pages/devices.jsx                                        🟩 PRODUCTION
const devices = useDevices(filters);   // knows nothing about the source
```

**The proof:** `rm -rf src/features/*/mocks && VITE_DATA_SOURCE=api npm run build` still
compiles, and every page still renders. That is the acceptance test for this refactor,
and it is worth wiring into CI.

---

## 10. Testing 🧪

Nothing exists today, so this is additive. **Vitest + React Testing Library + MSW.**

```
src/features/devices/
├── model/device.rules.test.js         🧪 pure — the highest value per line
├── api/devices.mapper.test.js         🧪 mapping, including nulls
├── hooks/useDevices.test.jsx          🧪 with MSW, not a mocked repository
└── components/DeviceTable.test.jsx    🧪 behaviour, not implementation
```

### The contract suite — the same tests against both implementations

```js
// src/test/contracts/repository.contract.js                    🧪
export function describeDeviceRepository(name, makeRepo) {
  describe(`DeviceRepository contract — ${name}`, () => {
    it("lists devices with a total", async () => {
      const page = await makeRepo().list({ page: 1, pageSize: 10 });
      expect(page.items.length).toBeLessThanOrEqual(10);
      expect(typeof page.total).toBe("number");
    });

    it("throws NotFoundError for a missing id", async () => {
      await expect(makeRepo().get("nope")).rejects.toMatchObject({ kind: "not-found" });
    });
  });
}

// devices.repository.test.js
describeDeviceRepository("mock", () => mockDeviceRepository);
describeDeviceRepository("api",  () => apiDeviceRepository);   // MSW answers
```

**This is the single most valuable test in the architecture.** It is what stops the
mock and the real API drifting — the failure mode that makes "we'll swap it later"
untrue.

### When to use which mock

| Use | When |
|---|---|
| **Fixture array** | Static UI content, Storybook-style rendering, pure-function tests |
| **Mock repository** | Running the whole app without a backend — the dev default |
| **MSW** | Testing the API client, mapper and Zod schema *for real* — it intercepts `fetch`, so the code under test is production code |
| **Local dev API** | Once the backend exists. Then `VITE_DATA_SOURCE=api` against localhost |

---

## 11. Dependency rules ⚙️

```js
// eslint.config.js                                             ⚙️ config
{
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [
        { group: ["**/features/*/!(index.js)", "**/features/*/*/**"],
          message: "Import a feature only through its index.js. Reaching into internals couples you to its layout." },
        { group: ["**/mocks/**"],
          message: "Mocks are wired in app/bootstrap/container.js. A component importing one has bypassed the seam." },
      ],
    }],
  },
}
```

```
components/  →  ✗ features/          shared code must not know a domain
features/A/  →  ✗ features/B/internals    only B's index.js
services/    →  ✗ features/, components/  infrastructure knows no domain
api layer    →  ✗ react, components/      no UI below the service line
mocks/       →  ✗ imported by any 🟩 file except the container
lib/tokens   →  ✗ features/               the engine has no domain
```

Enforce with `eslint-plugin-boundaries` once the layout settles. Do it *after* the move,
not before — rules written against a structure that does not exist yet only produce
noise.

---

## 12. Naming conventions

| Kind | Pattern | Example |
|---|---|---|
| Component | `PascalCase.jsx` | `DeviceTable.jsx` |
| Page | `kebab-case.jsx` *(existing convention — keep it)* | `devices.jsx` |
| Hook | `useThing.js` | `useDevices.js` |
| API | `<domain>.api.js` | `devices.api.js` |
| Mapper | `<domain>.mapper.js` | `devices.mapper.js` |
| Schema | `<domain>.schema.js` | `devices.schema.js` |
| Repository | `<domain>.{api,mock}.repository.js` | `devices.mock.repository.js` |
| Domain rules | `<entity>.rules.js` | `device.rules.js` |
| Fixture 🟨 | `<domain>.fixture.js` | `devices.fixture.js` |
| Test 🧪 | `<subject>.test.js` — beside the subject | `device.rules.test.js` |
| Constants | `SCREAMING_SNAKE` | `REPORT_INTERVAL_MS` |

Pages stay `kebab-case` because the repo already does that across 21 files, and
consistency beats convention.

---

## 13. Migration sequence

Every phase leaves the app runnable, and none of them touches the token engine.

| # | Phase | Deliverable | Risk |
|---|---|---|---|
| 0 | **Decide TypeScript** | Yes → migrate first, separately. No → JSDoc + `.d.ts` | Blocks nothing else if answered |
| 1 | **Tooling** | Vitest, ESLint, `.env.example`, `config/env.js` | None — additive |
| 2 | **HTTP + errors** | `services/http/*`. No caller yet | None — unreferenced |
| 3 | **One vertical slice: `devices`** | Full stack incl. contract tests. **Proves the pattern** | The learning phase. Do not do two at once |
| 4 | **Split fixtures from rules** | `device-data.js` → `model/device.rules.js` 🟩 + `mocks/*.fixture.js` 🟨 | Mechanical; gate is `npm run build` |
| 5 | **Remaining features** | alarms, sites, assets, telemetry, data-pipeline, reports, admin | One per PR |
| 6 | **Pages become composition** | Every page under ~120 lines | Visual regression — check `/gallery` |
| 7 | **Boundary lint** | `eslint-plugin-boundaries` in CI | Noisy if done before phase 6 |
| 8 | **Delete** | Old `lib/*-data.js`; CI proves `rm -rf mocks` still builds | The payoff |

**Do phase 3 before committing to the rest.** One complete slice will teach you more
about whether this shape fits Genus than any amount of further planning.

---

## 14. Developer onboarding — the whole thing in eight lines

```
Where does my code go?

  Fetching data?              features/<domain>/api/
  Turning API into app data?  features/<domain>/api/*.mapper.js
  A business rule?            features/<domain>/model/*.rules.js
  React needs it?             features/<domain>/hooks/
  Names a domain concept?     features/<domain>/components/
  Any product could use it?   components/
  Fake data?                  features/<domain>/mocks/     🟨 never imported by UI
  A colour, size or radius?   you don't — use a token
```

---

## 15. Implementation checklist

**Decide first**
- [ ] **TypeScript: yes or no?** Blocks nothing, but changes every file extension below
- [ ] Confirm TanStack Query, Zod, Vitest, MSW as new dependencies
- [ ] Confirm `devices` as the pilot slice

**Phase 1–2 · foundation**
- [ ] Vitest + RTL + ESLint; `npm test` and `npm run lint` in CI
- [ ] `.env.example`; `config/env.js` with fail-fast validation
- [ ] `services/http/{client,errors,retry,interceptors}.js`
- [ ] `components/feedback/{LoadingState,ErrorState,EmptyState,AsyncBoundary}.jsx`

**Phase 3 · the pilot**
- [ ] `features/devices/` complete: api · schemas · model · repository · mocks · hooks · components · index.js
- [ ] Contract suite green against **both** repositories
- [ ] `devices.jsx` composes only
- [ ] Toggle `VITE_DATA_SOURCE` and confirm zero component changes

**Phase 4–8 · roll out**
- [ ] `device-data.js` split: rules 🟩 / fixtures 🟨
- [ ] One PR per feature
- [ ] CI job: `rm -rf src/features/*/mocks && VITE_DATA_SOURCE=api npm run build`
- [ ] Boundary lint rules
- [ ] Delete `src/lib/*-data.js`

**Never**
- [ ] `fetch()` outside `services/http/client.js`
- [ ] `import.meta.env` outside `config/env.js`
- [ ] A mock imported by anything except `app/bootstrap/container.js`
- [ ] A hex, px or font-size in a feature component — that is what tokens are for
- [ ] Hand-editing `src/tokens.css` or `src/lib/tokens.js` 🤖
