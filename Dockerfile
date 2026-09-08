# syntax=docker/dockerfile:1
#
# Genus Solar — production image. Static bundle behind nginx.
#
# ── the one thing to know before building ─────────────────────────────────
# Vite inlines every VITE_* variable into the JavaScript AT BUILD TIME. There is
# no runtime configuration: this image is not promotable between environments,
# and the API base URL it was built against is baked into its bundle. One image
# per environment, tagged accordingly. See docs/DEPLOYMENT.md §2.
#
#   docker build \
#     --build-arg VITE_API_BASE_URL=https://api.genus-solar.example/api \
#     -t genus-solar:0.1.0-prod .
#
# Both base images are pinned by digest, resolved from Docker Hub, so this
# builds the same bytes next month as today. The tag is kept alongside for
# readability — the digest is what actually resolves. Bump both together on
# your own patch cadence (docs/DEPLOYMENT.md §7).

# ─────────────────────────────── build ───────────────────────────────────
FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32 AS build

WORKDIR /app
ENV CI=true

# Dependencies first, so a source-only change reuses this layer.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Public configuration only. NEVER pass an API key, client secret or bearer
# token here — a build arg lands in the bundle and in the image history, which
# for SBPDCL consumer data is a permanently disclosed credential.
ARG VITE_API_BASE_URL
ARG VITE_API_TIMEOUT=15000
ARG VITE_DATA_SOURCE=api
ARG VITE_ENABLE_LOGGING=false

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_API_TIMEOUT=${VITE_API_TIMEOUT} \
    VITE_DATA_SOURCE=${VITE_DATA_SOURCE} \
    VITE_ENABLE_LOGGING=${VITE_ENABLE_LOGGING}

# Fail here rather than at boot. src/config/env.ts throws when
# VITE_API_BASE_URL is missing from a production build, and that failure would
# otherwise surface as a blank screen in front of a user.
RUN test -n "$VITE_API_BASE_URL" || { \
      echo "ERROR: --build-arg VITE_API_BASE_URL=... is required (see docs/DEPLOYMENT.md)" >&2; \
      exit 1; }

# A mock build is a demo, never a deployment. The seam that drops the fixtures
# is src/app/bootstrap/container.ts.
RUN test "$VITE_DATA_SOURCE" != "mock" || { \
      echo "ERROR: refusing to build an image with VITE_DATA_SOURCE=mock" >&2; \
      exit 1; }

RUN npm run build

# The same needle npm run verify:no-mocks uses. Cheap, and it is the difference
# between shipping the programme's real numbers and shipping fixtures.
RUN if grep -rq "GTI-BHR-000141" dist/assets/*.js; then \
      echo "ERROR: fixture data found in dist — the mock repository was linked in" >&2; \
      exit 1; \
    fi

# ────────────────────────────── runtime ──────────────────────────────────
FROM nginx:stable-alpine@sha256:dc5069ad14f19660b141b21236140b91656bf89bbc3e2417c70ae650cd66104c AS runtime

# Replaces the image's own nginx.conf: it holds the SPA history fallback that
# BrowserRouter deep links need, and it keeps every writable path under /tmp so
# the container runs as an arbitrary uid.
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Unprivileged, and therefore above 1024. Publish it wherever you like:
#   docker run -p 80:8080 …
EXPOSE 8080
USER nginx

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
