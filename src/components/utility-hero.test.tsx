import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsProvider } from "../lib/settings.jsx";
import { UtilityHero } from "./utility-hero";

function setup() {
  render(<SettingsProvider><UtilityHero /></SettingsProvider>);
  return userEvent.setup();
}

test("a pinned utility spotlights the scene and explains itself", async () => {
  const user = setup();
  const scene = screen.getByRole("img");
  expect(scene).toHaveAttribute("data-focus", "all");
  expect(screen.queryByText(/from supply to tap/)).not.toBeInTheDocument();

  const water = screen.getByRole("button", { name: "Water" });
  await user.click(water);
  await user.unhover(water);
  expect(water).toHaveAttribute("aria-pressed", "true");
  expect(scene).toHaveAttribute("data-focus", "water");
  expect(screen.getByText(/from supply to tap/)).toBeVisible();

  await user.click(water);
  await user.unhover(water);
  expect(water).toHaveAttribute("aria-pressed", "false");
  expect(scene).toHaveAttribute("data-focus", "all");
});

test("hovering previews a utility without pinning it", async () => {
  const user = setup();
  const gas = screen.getByRole("button", { name: "Gas" });
  await user.hover(gas);
  expect(screen.getByRole("img")).toHaveAttribute("data-focus", "gas");
  await user.unhover(gas);
  expect(screen.getByRole("img")).toHaveAttribute("data-focus", "all");
  expect(gas).toHaveAttribute("aria-pressed", "false");
});

test("the animation can be paused and resumed", async () => {
  const user = setup();
  await user.click(screen.getByRole("button", { name: "Pause animation" }));
  expect(screen.getByRole("img")).toHaveAttribute("data-paused", "true");
  await user.click(screen.getByRole("button", { name: "Play animation" }));
  expect(screen.getByRole("img")).toHaveAttribute("data-paused", "false");
});

const reading = (u: string) => document.querySelector(`[data-readout="${u}"]`)!;

afterEach(() => { vi.useRealTimers(); });

test("every meter counts, and pausing stops the count", () => {
  vi.useFakeTimers();
  render(<SettingsProvider><UtilityHero /></SettingsProvider>);
  expect(reading("solar")).toHaveTextContent("Generated4,271.36");
  expect(reading("electricity")).toHaveTextContent("Used3,108.02");
  expect(reading("water")).toHaveTextContent("12,480.4");
  expect(reading("gas")).toHaveTextContent("318.426");

  act(() => { vi.advanceTimersByTime(10_000); });
  expect(reading("solar")).toHaveTextContent("Generated4,271.60");
  expect(reading("electricity")).toHaveTextContent("Used3,108.16");
  expect(reading("water")).toHaveTextContent("12,483.6");
  expect(reading("gas")).toHaveTextContent("318.437");

  fireEvent.click(screen.getByRole("button", { name: "Pause animation" }));
  const frozen = reading("water").textContent;
  act(() => { vi.advanceTimersByTime(10_000); });
  expect(reading("water").textContent).toBe(frozen);
});

test("counting stops while the page is in a background tab", () => {
  vi.useFakeTimers();
  const state = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
  render(<SettingsProvider><UtilityHero /></SettingsProvider>);
  act(() => { vi.advanceTimersByTime(10_000); });
  expect(reading("water")).toHaveTextContent("12,480.4");

  state.mockReturnValue("visible");
  act(() => { document.dispatchEvent(new Event("visibilitychange")); });
  act(() => { vi.advanceTimersByTime(10_000); });
  expect(reading("water")).toHaveTextContent("12,483.6");
  state.mockRestore();
});

test("readings are hidden from assistive tech; the scene describes them instead", () => {
  setup();
  expect(reading("water")).toHaveAttribute("aria-hidden", "true");
  expect(screen.getByRole("img")).toHaveAccessibleName(/electricity meter energy used, the water meter litres/);
});

test("hovering a reading spotlights its supply", async () => {
  const user = setup();
  await user.hover(reading("gas"));
  expect(screen.getByRole("img")).toHaveAttribute("data-focus", "gas");
  await user.unhover(reading("gas"));
  expect(screen.getByRole("img")).toHaveAttribute("data-focus", "all");
});

test("electricity is its own supply, with its own chip and reading", async () => {
  const user = setup();
  expect(screen.getAllByRole("button", { pressed: false }).map((b) => b.textContent)).toEqual(["Solar", "Electricity", "Water", "Gas"]);
  await user.click(screen.getByRole("button", { name: "Electricity" }));
  await user.unhover(screen.getByRole("button", { name: "Electricity" }));
  expect(screen.getByRole("img")).toHaveAttribute("data-focus", "electricity");
  expect(screen.getByText(/the electricity the home uses/)).toBeVisible();
  expect(reading("electricity")).toHaveTextContent("Electricity meter · kWh");
});
