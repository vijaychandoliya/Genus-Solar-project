/**
 * Help lookup — matching a URL to its screen guide.
 *
 * The generated data is LAZY. It is 187 kB of text, and shipping it in the main
 * bundle would make every first paint pay for documentation most sessions never
 * open. `loadHelp()` returns a promise for a separate chunk, fetched the first
 * time someone opens the panel and cached by the module system thereafter.
 */

let cache = null;

/** Fetch the guide data. Safe to call repeatedly — the import is cached. */
export function loadHelp() {
  cache ??= import("./guides.generated.js");
  return cache;
}

/**
 * Find the guide for a pathname.
 *
 * Exact match first, then the longest matching prefix — because a route like
 * `/telemetry/gti/:tab` is documented once but visited as
 * `/telemetry/gti/heartbeat`. Longest-first matters: `/assets/condition` and
 * `/assets` are different screens, and a shortest-match would have shown the
 * Devices guide on the Assets condition screen.
 */
export function helpFor(byRoute, pathname) {
  if (byRoute[pathname]) return byRoute[pathname];

  const prefixes = Object.keys(byRoute)
    .filter((r) => !r.includes(":"))
    .sort((a, b) => b.length - a.length);

  for (const route of prefixes)
    if (pathname === route || pathname.startsWith(`${route}/`)) return byRoute[route];

  // Documented as `/telemetry/gti/:tab`, visited as `/telemetry/gti/data`.
  for (const route of Object.keys(byRoute).filter((r) => r.includes(":"))) {
    const base = route.slice(0, route.indexOf("/:"));
    if (pathname.startsWith(`${base}/`)) return byRoute[route];
  }

  return null;
}
