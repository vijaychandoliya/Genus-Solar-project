import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SettingsProvider } from "../../lib/settings.jsx";
import { HierarchyProvider } from "../../lib/hierarchy.jsx";
import { getAccessToken, setAccessToken } from "../../services/auth/token-storage";
import { WsShell } from "./shell.jsx";

test("Sign out clears the frontend token and returns to Login", async () => {
  const user = userEvent.setup();
  setAccessToken("preview-token");
  render(
    <MemoryRouter initialEntries={["/overview"]}>
      <SettingsProvider>
        <HierarchyProvider>
          <Routes>
            <Route path="/overview" element={<WsShell><h1>Overview</h1></WsShell>} />
            <Route path="/login" element={<h1>Welcome back</h1>} />
          </Routes>
        </HierarchyProvider>
      </SettingsProvider>
    </MemoryRouter>,
  );
  await user.click(screen.getByRole("button", { name: "Account menu" }));
  await user.click(screen.getByRole("menuitem", { name: "Sign out" }));
  expect(screen.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "Account menu" })).not.toBeInTheDocument();
  expect(getAccessToken()).toBeNull();
});
