# Deploying Genus Solar

For whoever owns the environment. It assumes no knowledge of the codebase and
tells you what the artifact is, what it needs, and how to know a deploy worked.

| | |
|---|---|
| Artifact | A static bundle — HTML, JS, CSS, SVG. No server-side runtime, no Node process in production. |
| Serve with | Any static host that can do a SPA history fallback. An nginx image is included. |
| Backend | Separate service, not in this repo. The bundle talks to it over HTTPS from the browser. |
| Node (build only) | 20.19+ or 22.12+ — `.nvmrc` pins 22. Not needed at runtime. |
| Port | 8080 in the container, unprivileged. |
| Health | `GET /healthz` → `200 ok`. Static-only; it says nothing about the backend. |

---

## 1 · Build it

```bash
npm ci
npm run verify                     # typecheck · lint · tests · docs · contrast gate · build
VITE_API_BASE_URL=https://api.genus-solar.example/api npm run build:prod
```

Output lands in `dist/`. That directory *is* the deployable — copy it to a
bucket, bake it into an image, hand it to a CDN.

Or build the image, which does the same thing plus two guards:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.genus-solar.example/api \
  -t genus-solar:0.1.0-prod .
```

Or package a handover zip — the built bundle plus the nginx config, this
runbook, a Dockerfile that needs no source, checksums, and a BUILD-INFO.txt
recording the commit and the exact values compiled in:

```bash
npm run package                                             # defaults to VITE_API_BASE_URL=/api
VITE_API_BASE_URL=https://api.genus-solar.example/api npm run package
```

→ `release/genus-solar-<version>-<sha>.zip`. It refuses to package a `mock`
build, greps the output for fixture data, and marks the filename `-dirty` when
the working tree had uncommitted changes, because a zip that cannot be traced to
a commit should say so on its face. The default `/api` is relative and
same-origin: serve the bundle and reverse-proxy `/api` behind the same hostname
and it works untouched, with no CORS to configure.

---

## 2 · Configuration is build-time. Read this before you plan a pipeline.

Vite inlines every `VITE_*` variable into the JavaScript as a literal string
when the bundle is compiled. There is no runtime configuration file, no
`window.__ENV__`, nothing to mount over.

Three consequences, all of which change how you ship this:

1. **An image is not promotable between environments.** A bundle built against
   staging's API cannot be re-pointed at production. Build once per
   environment and tag accordingly — `genus-solar:0.1.0-staging`,
   `genus-solar:0.1.0-prod` — or fold the build into each environment's deploy
   job.
2. **Changing the API URL is a rebuild, not a restart.** Editing an env var on
   the running container does nothing.
3. **Nothing secret can go in a `VITE_*` variable, ever.** The value is
   readable in devtools and cached in every browser and CDN that touched the
   bundle. A key committed this way is disclosed permanently, and for a
   platform handling SBPDCL consumer data that is not recoverable by rotating
   later. Secrets stay behind the backend, which exposes an endpoint instead.

| Variable | Required | Default | Notes |
|---|---|---|---|
| `VITE_API_BASE_URL` | **yes** | none in a production build | Absolute URL, no trailing slash. Missing → the app throws at boot and the user sees a blank screen. The Dockerfile fails the build instead. |
| `VITE_API_TIMEOUT` | no | `15000` | Per-request timeout in ms. Must be a positive number or boot fails. |
| `VITE_DATA_SOURCE` | no | `api` in a production build | `mock` links the fixture repositories into the bundle. Never for a deployed environment; the Dockerfile refuses it. |
| `VITE_ENABLE_LOGGING` | no | `false` in production | Console diagnostics. |

`.env.production.example` is the copy-and-fill version of that table. Note that
`.dockerignore` excludes every `.env*` file except the examples, so a
developer's local `.env.local` cannot leak dev values into an image build.

---

## 3 · Run the container

```bash
docker run -d --name genus-solar \
  -p 80:8080 \
  --read-only --tmpfs /tmp \
  --cap-drop ALL --security-opt no-new-privileges:true \
  genus-solar:0.1.0-prod
```

It runs as the unprivileged `nginx` user, writes only to `/tmp` (pid and
request temp paths are configured there), and logs JSON lines to stdout, so a
read-only root filesystem works.

`deploy/docker-compose.yml` is the same thing for a local smoke test:

```bash
docker compose -f deploy/docker-compose.yml up --build
```

Kubernetes, minimally — the parts that matter are the probe paths and the
read-only filesystem:

```yaml
containers:
  - name: web
    image: registry.example/genus-solar:0.1.0-prod
    ports: [{ containerPort: 8080 }]
    readinessProbe: { httpGet: { path: /healthz, port: 8080 }, initialDelaySeconds: 3 }
    livenessProbe:  { httpGet: { path: /healthz, port: 8080 }, periodSeconds: 30 }
    resources:
      requests: { cpu: 25m, memory: 32Mi }
      limits:   { cpu: 250m, memory: 128Mi }
    securityContext:
      runAsNonRoot: true
      readOnlyRootFilesystem: true
      allowPrivilegeEscalation: false
      capabilities: { drop: [ALL] }
    volumeMounts: [{ name: tmp, mountPath: /tmp }]
volumes: [{ name: tmp, emptyDir: {} }]
```

---

## 4 · If you serve `dist/` yourself, two rules

**Rule 1 — the SPA history fallback is mandatory.** The app uses
`BrowserRouter`, so `/telemetry/gti` and `/admin/design-tokens` are client-side
routes with no file behind them. Serve `index.html` for any path that does not
match a file, or every page refresh and every shared link is a 404.

| Host | The rule |
|---|---|
| nginx | `try_files $uri $uri/ /index.html;` — already in `deploy/nginx.conf` |
| Apache | `FallbackResource /index.html` |
| Caddy | `try_files {path} /index.html` |
| S3 + CloudFront | Custom error response: 403 **and** 404 → `/index.html`, response code 200 |
| S3 website endpoint | Error document `index.html` (returns 404 status — CloudFront's version is better) |
| Azure Static Web Apps / Netlify / Vercel | `/*` → `/index.html`, 200 |

**Rule 2 — cache the hashed assets hard and the shell not at all.**

| Path | `Cache-Control` | Why |
|---|---|---|
| `/assets/*` | `public, max-age=31536000, immutable` | Filenames are content-hashed; a deploy changes the name. |
| `/index.html`, everything else | `no-store, must-revalidate` | A cached shell keeps requesting the previous deploy's asset names and 404s until someone hard-reloads. |
| `/*.svg`, `/favicon.svg` | `public, max-age=3600` | Stable names across deploys, so a long cache pins a stale logo. |

Get rule 2 wrong and the failure mode is a white screen for returning users
after a deploy, which is the single most common way this class of app breaks.

**The trap in rule 2 — `/assets` is a route as well as a directory.** Vite
writes the hashed bundles to `/assets/`, and the app *also* has screens at
`/assets` (Devices) and `/assets/condition` (Asset condition). A blanket
"`/assets/*` → serve from disk, 404 otherwise" rule — the obvious way to write
rule 2, and the default shape of a CloudFront cache behaviour or an ingress
path rule — breaks both screens on every refresh and every shared link, and
worse, a blanket "`/assets/*` → cache immutably" stamps a year-long cache on
the HTML shell served at those paths.

Split on the filename instead of the prefix. `deploy/nginx.conf` matches the
content-hash shape (`index-BaZB5CBP.js`) for the immutable cache, 404s
file-shaped misses under `/assets/`, and lets everything else fall through to
the SPA fallback. On CloudFront the equivalent is a cache behaviour matched on
`/assets/*.js`, `/assets/*.css` and the other extensions rather than
`/assets/*`. The CI smoke test asserts both paths return the shell, so a future
change to the config cannot quietly regress them.

---

## 5 · Backend and network prerequisites

- **CORS.** The browser calls `VITE_API_BASE_URL` directly from the app's
  origin. The backend must allow that origin, plus the methods and headers the
  app sends. Alternatively serve both from one origin and reverse-proxy
  `/api` — then set `VITE_API_BASE_URL=/api` and no CORS is involved. On a
  closed SBPDCL network this is usually the simpler answer.
- **HTTPS everywhere.** A mixed-content page (HTTPS shell, HTTP API) has its
  API calls blocked by the browser. TLS terminates at your ingress or load
  balancer; the container speaks plain HTTP on 8080 behind it.
- **Google Fonts reachability.** `index.html` loads Inter from
  `fonts.googleapis.com`. Inside an air-gapped or egress-filtered government
  network that request fails and the app silently falls back to system fonts —
  it still works, it just does not match the design system. If that matters,
  self-host the font files and tell us; it is a small change to `index.html`.

---

## 6 · Pipeline

`.github/workflows/ci.yml` runs `npm run verify` and `npm run verify:no-mocks`,
builds the image, boots it, and smoke-tests the health endpoint plus a deep
link. It deliberately **does not push or deploy** — registry and environment
credentials belong to whoever owns the cluster, and putting a deploy path in a
file every branch can edit is how a pipeline becomes an exploit. Add your own
job for that:

```yaml
  release:
    needs: [verify, image]
    if: startsWith(github.ref, 'refs/tags/v')
    environment: production          # so the approval gate is yours, not a branch's
    steps:
      - uses: docker/login-action@v3
        with: { registry: registry.example, username: ..., password: ${{ secrets.REGISTRY_TOKEN }} }
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: registry.example/genus-solar:${{ github.ref_name }}-prod
          build-args: VITE_API_BASE_URL=${{ vars.PROD_API_BASE_URL }}
```

Note that the release build is a *separate* build from the CI one, for the
reason in §2: the CI image is compiled against a placeholder API URL and is not
the thing you ship.

---

## 7 · Hardening — what is already done, and what is left

**Done, and verified:**

- **Base images pinned by digest.** `node:22-alpine` and `nginx:stable-alpine`
  both carry their `@sha256:…`, resolved from Docker Hub, so the image builds
  the same bytes next month as today. The tag stays alongside for readability.
  Bump both together on your own patch cadence — a pinned digest gets no
  security updates until somebody moves it.
- **Content-Security-Policy on.** In `deploy/security-headers.conf`, exercised
  against a production build in a browser before being switched on: charts,
  both Google Fonts sheets, Emotion's runtime styles, the CSV export, the
  design-token editor and every lazy route chunk, console clean. It caught a
  real defect on the way in — see the note in that file.
- **Security headers** on every location, including `/assets/`, which nginx's
  non-merging `add_header` makes easy to lose.

**Still yours to do:**

- **If your API is not same-origin**, add its origin to `connect-src` in
  `deploy/security-headers.conf`. The policy ships as `connect-src 'self'`,
  which is correct for the recommended reverse-proxy topology and for the
  release zip's `/api` build — and wrong, silently and completely, for a
  cross-origin API.
- **Add HSTS at the TLS terminator**, not here — the container does not know
  whether it is behind HTTPS.
- **Check your CDN is not overriding the origin cache headers** from §4.

## 8 · Verifying a deploy

```bash
BASE=https://solar.example

curl -fsS  $BASE/healthz                       # → ok
curl -fsSI $BASE/ | grep -i cache-control      # → no-store, must-revalidate
curl -fsS  $BASE/telemetry/gti/data  | grep '<div id="root">'   # deep link → the shell, not a 404
curl -fsS  $BASE/assets/condition    | grep '<div id="root">'   # the /assets collision (§4)
curl -fsSI $BASE/assets/$(curl -fsS $BASE/ | grep -o 'assets/index-[^"]*\.js' | head -1 | cut -d/ -f2) \
  | grep -i cache-control                      # → immutable
```

Then in a browser, because these are the failures curl cannot see:

1. The dashboard renders with data — proves `VITE_API_BASE_URL` is right and
   CORS is open. A blank screen with a console error about a missing
   environment variable means the bundle was built without it (§2).
2. Refresh on a deep route — proves the fallback (§4).
3. Console is clean of CORS and mixed-content errors (§5).
4. Text is set in Inter, not the system font — proves font egress (§5).

---

## 9 · Rollback

The artifact is immutable and stateless: there is no migration, no session
store, nothing to unwind. Rolling back is repointing at the previous tag.

```bash
docker run -d -p 80:8080 genus-solar:0.1.0-prod      # the known-good tag
# k8s: kubectl rollout undo deployment/genus-solar
# bucket: re-sync the previous dist/ and invalidate /index.html only
```

Keep the previous tag until the new one has served real traffic. If you deploy
by syncing a bucket, upload the hashed `/assets/*` files **before** replacing
`index.html` — the reverse order serves a shell that asks for assets that are
not there yet.

---

## 10 · Known limits

- **No runtime configuration.** §2. If you need one image promoted across
  environments, that is a deliberate application change (a `config.js` written
  by the container entrypoint and read at boot) and it touches
  `src/config/env.ts`, which is currently the only module allowed to read the
  environment. Ask before assuming it exists.
- **The container image has not been built on this machine** — no container
  runtime was available. The CI workflow's `image` job builds it, boots it and
  smoke-tests the health endpoint, the deep links, the `/assets` collision and
  the cache headers on every push, so the first pipeline run is its
  verification. `dist/` itself is built and verified.

### What first paint costs, for the record

Previously one 2,361 kB chunk — every screen, plus all of ECharts, downloaded
to look at one of them. Now:

| | Bytes | Gzipped |
|---|---|---|
| Entry chunk (what first paint fetches) | 402 kB | 123 kB |
| Chart engine — only on the 3 screens that plot | 554 kB | 185 kB |
| Screen guides — only when Help is opened | 115 kB | 21 kB |
| Any one page's own chunk | 2–87 kB | 1–26 kB |
| All 45 chunks together | 1,895 kB | 586 kB |

Three changes got that: `echarts/core` with an explicit registration list
instead of the whole library, `React.lazy` per route, and the chart engine
behind a dynamic import so Overview's tiles and tables paint before the plots.
The engine is the only chunk above the 500 kB default warning threshold, which
is why `vite.config.js` sets the limit to 600 with a note naming it.
