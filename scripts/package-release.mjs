/**
 * Packages a deployable release zip — the built bundle plus everything needed
 * to serve it, and nothing that needs a toolchain to use.
 *
 * `npm run package` → release/genus-solar-<version>-<sha>.zip
 *
 * ── why a script and not a hand-rolled zip ────────────────────────────────
 * The bundle has configuration compiled into it (see §2 of DEPLOYMENT.md), so a
 * zip is not self-describing: two files with the same name can point at
 * different backends. Every archive this produces therefore carries a
 * BUILD-INFO.txt recording the exact values it was built with, the commit, and
 * whether the tree was dirty — so the question "what is actually in this zip"
 * has an answer that does not depend on anyone's memory.
 *
 * The archive is standalone. It contains no source and no Dockerfile that needs
 * source: the image recipe inside it copies the prebuilt bundle into nginx.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const r = (...p) => join(root, ...p);

const pkg = JSON.parse(readFileSync(r("package.json"), "utf8"));

// ── configuration compiled into this bundle ──────────────────────────────
// The default is same-origin and relative on purpose: serve this bundle and
// reverse-proxy /api behind the same hostname and it works untouched, with no
// CORS and no backend hostname baked in. An absolute cross-origin URL is a
// deliberate override, not the path of least resistance.
const apiBaseUrl = process.env.VITE_API_BASE_URL || "/api";
const apiTimeout = process.env.VITE_API_TIMEOUT || "15000";
const dataSource = process.env.VITE_DATA_SOURCE || "api";
const enableLogging = process.env.VITE_ENABLE_LOGGING || "false";

if (dataSource !== "api") {
  console.error(
    `\nREFUSING: VITE_DATA_SOURCE=${dataSource}. A fixture build is a demo, never a release.\n`,
  );
  process.exit(1);
}

// Returns "" for an inherited stdio call, which execFileSync reports as null.
const run = (cmd, args, opts = {}) =>
  (execFileSync(cmd, args, { cwd: root, encoding: "utf8", ...opts }) ?? "").trim();

const git = (...args) => {
  try {
    return run("git", args);
  } catch {
    return "";
  }
};

const sha = git("rev-parse", "--short", "HEAD") || "nogit";
const branch = git("rev-parse", "--abbrev-ref", "HEAD") || "unknown";
const dirty = git("status", "--porcelain").length > 0;
const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

const name = `genus-solar-${pkg.version}-${sha}${dirty ? "-dirty" : ""}`;
const staging = r("release", ".staging", name);
const zipPath = r("release", `${name}.zip`);

console.log(`\npackaging ${name}`);
console.log(`  VITE_API_BASE_URL   ${apiBaseUrl}`);
console.log(`  VITE_API_TIMEOUT    ${apiTimeout}`);
console.log(`  VITE_DATA_SOURCE    ${dataSource}`);
console.log(`  VITE_ENABLE_LOGGING ${enableLogging}\n`);

// ── build ────────────────────────────────────────────────────────────────
rmSync(r("dist"), { recursive: true, force: true });
run("npx", ["vite", "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    VITE_API_BASE_URL: apiBaseUrl,
    VITE_API_TIMEOUT: apiTimeout,
    VITE_DATA_SOURCE: dataSource,
    VITE_ENABLE_LOGGING: enableLogging,
  },
});

// The same needle `npm run verify:no-mocks` uses. A release that ships fixture
// data would report invented programme numbers as if they were SBPDCL's.
const bundles = readdirSync(r("dist", "assets")).filter((f) => f.endsWith(".js"));
for (const file of bundles) {
  if (readFileSync(r("dist", "assets", file), "utf8").includes("GTI-BHR-000141")) {
    console.error(`\nREFUSING: fixture data found in dist/assets/${file}\n`);
    process.exit(1);
  }
}

// The bundle throws at boot without this, which reaches a user as a blank
// screen. Catch it here instead.
const booted = bundles.some((f) =>
  readFileSync(r("dist", "assets", f), "utf8").includes(apiBaseUrl),
);
if (!booted) {
  console.error(`\nREFUSING: "${apiBaseUrl}" is not present in the bundle — check the build.\n`);
  process.exit(1);
}

// ── stage ────────────────────────────────────────────────────────────────
rmSync(r("release", ".staging"), { recursive: true, force: true });
mkdirSync(staging, { recursive: true });

cpSync(r("dist"), join(staging, "dist"), { recursive: true });
cpSync(r("deploy", "nginx.conf"), join(staging, "nginx.conf"));
cpSync(r("deploy", "security-headers.conf"), join(staging, "security-headers.conf"));
cpSync(r("docs", "DEPLOYMENT.md"), join(staging, "DEPLOYMENT.md"));

writeFileSync(
  join(staging, "Dockerfile"),
  `# Builds a servable image from the PREBUILT bundle in this archive — no Node,
# no npm, no source. The repository's own Dockerfile compiles from source
# instead; this one exists so the zip is deployable on its own.
#
#   docker build -t genus-solar:${pkg.version} .
#   docker run --rm -p 8080:8080 genus-solar:${pkg.version}
#
# The bundle is already configured (see BUILD-INFO.txt). Changing where it
# points needs a new build from source, not a new image — DEPLOYMENT.md §2.
#
# Pinned by digest, resolved from Docker Hub — DEPLOYMENT.md §7.
FROM nginx:stable-alpine@sha256:dc5069ad14f19660b141b21236140b91656bf89bbc3e2417c70ae650cd66104c

COPY nginx.conf /etc/nginx/nginx.conf
COPY security-headers.conf /etc/nginx/security-headers.conf
COPY dist /usr/share/nginx/html

EXPOSE 8080
USER nginx

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
`,
);

const assets = readdirSync(r("dist", "assets"))
  .map((f) => `  dist/assets/${f}  ${(statSync(r("dist", "assets", f)).size / 1024).toFixed(1)} kB`)
  .join("\n");

writeFileSync(
  join(staging, "BUILD-INFO.txt"),
  `Genus Solar — release ${name}

  version              ${pkg.version}
  commit               ${git("rev-parse", "HEAD") || "unknown"} (${branch})
  working tree         ${dirty ? "DIRTY — contains uncommitted changes" : "clean"}
  built                ${stamp}
  node                 ${process.version}

Compiled into the bundle (DEPLOYMENT.md §2 — these cannot be changed after the
fact; changing one means a new build from source):

  VITE_API_BASE_URL    ${apiBaseUrl}
  VITE_API_TIMEOUT     ${apiTimeout}
  VITE_DATA_SOURCE     ${dataSource}
  VITE_ENABLE_LOGGING  ${enableLogging}

Contents:

${assets}
`,
);

writeFileSync(
  join(staging, "README-FIRST.md"),
  `# Genus Solar ${pkg.version} — deployable bundle

A static site: HTML, JavaScript, CSS, SVG. No Node process, no server-side
runtime. \`dist/\` is the whole application.

**Read BUILD-INFO.txt first.** This bundle has its configuration compiled in,
so the archive is only correct for one backend. It is currently built for:

    VITE_API_BASE_URL = ${apiBaseUrl}

${
  apiBaseUrl.startsWith("/")
    ? `That is a relative, same-origin path — serve this bundle and reverse-proxy
\`${apiBaseUrl}\` behind the same hostname and it works as-is, with no CORS to
configure. If the API lives on a different origin, this archive is the wrong
one: rebuild from source with an absolute URL (DEPLOYMENT.md §1).`
    : `If that is not the backend this environment should talk to, this archive is
the wrong one — rebuild from source (DEPLOYMENT.md §1). It cannot be
re-pointed after the fact.`
}

## Serve it — pick one

**Docker** (nginx, correct configuration included):

    docker build -t genus-solar:${pkg.version} .
    docker run --rm -p 8080:8080 genus-solar:${pkg.version}

**An existing nginx**: copy \`dist/\` to your webroot and take the location
blocks from \`nginx.conf\`. Two of them are load-bearing — the SPA history
fallback and the \`/assets\` handling. DEPLOYMENT.md §4 says why.

**A bucket or CDN** (S3, CloudFront, Azure Static Web Apps): upload the
contents of \`dist/\`, then configure the history fallback and the cache
headers. DEPLOYMENT.md §4 has the per-host rules. Do not skip that section —
the two defaults that look obviously right there are both wrong for this app.

## Then check it worked

    curl -fsS  http://HOST/healthz                        # docker only → ok
    curl -fsS  http://HOST/telemetry/gti/data | grep root # deep link → the shell
    curl -fsS  http://HOST/assets/condition   | grep root # the /assets trap (§4)
    curl -fsSI http://HOST/ | grep -i cache-control       # → no-store

And in a browser: the dashboard shows data (the API is reachable and CORS is
open), a refresh on a deep route stays put, and the console has no CORS or
mixed-content errors. A blank screen with a console error naming an
environment variable means the bundle was built without one.

Integrity: \`shasum -c SHA256SUMS.txt\` (run it from this directory).

Full runbook: DEPLOYMENT.md.
`,
);

// ── checksums, over the staged tree ──────────────────────────────────────
const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name !== ".DS_Store") files.push(p);
  }
})(staging);
files.sort();

writeFileSync(
  join(staging, "SHA256SUMS.txt"),
  files
    .map(
      (f) =>
        `${createHash("sha256").update(readFileSync(f)).digest("hex")}  ${relative(staging, f)}`,
    )
    .join("\n") + "\n",
);

// ── zip ──────────────────────────────────────────────────────────────────
rmSync(zipPath, { force: true });
run("zip", ["-rqX", zipPath, name, "-x", ".DS_Store", "-x", "__MACOSX/*"], {
  cwd: r("release", ".staging"),
});
rmSync(r("release", ".staging"), { recursive: true, force: true });

const kb = (statSync(zipPath).size / 1024).toFixed(0);
console.log(`\npackaged  ${relative(root, zipPath)}  ${kb} kB`);
if (dirty)
  console.log(
    "  NOTE: built from a dirty working tree — the zip is not reproducible from a commit.",
  );
console.log(`  configured for  ${apiBaseUrl}\n`);
