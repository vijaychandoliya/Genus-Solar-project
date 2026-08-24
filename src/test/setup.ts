/**
 * Test bootstrap. Runs once before every suite.
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

// jsdom implements neither, and MUI + our own code use both. Without these the
// failure is a confusing "not a function" deep inside a component rather than a
// clear statement that the environment is missing an API.
if (!window.matchMedia)
  window.matchMedia = (query: string) =>
    ({
      matches: false, media: query, onchange: null,
      addListener() {}, removeListener() {},
      addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
    }) as unknown as MediaQueryList;

if (!globalThis.ResizeObserver)
  globalThis.ResizeObserver = class {
    observe() {} unobserve() {} disconnect() {}
  } as unknown as typeof ResizeObserver;
