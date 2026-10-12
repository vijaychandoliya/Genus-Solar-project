import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { getTheme } from "../lib/theme.js";
import { AuthForm } from "./auth";
import { getAccessToken } from "../services/auth/token-storage";

function setup(view: "login" | "forgot" | "reset") {
  render(<MemoryRouter><ThemeProvider theme={getTheme()}><AuthForm view={view} /></ThemeProvider></MemoryRouter>);
  return userEvent.setup();
}

test("password visibility preserves the entered password", async () => {
  const user = setup("login");
  const password = screen.getByLabelText(/^Password/);
  await user.type(password, "my-password");
  await user.click(screen.getByRole("button", { name: "Show password" }));
  expect(password).toHaveAttribute("type", "text");
  expect(password).toHaveValue("my-password");
  await user.click(screen.getByRole("button", { name: "Hide password" }));
  expect(password).toHaveAttribute("type", "password");
});

test("reset-link preview confirms the entered email without claiming delivery", async () => {
  const user = setup("forgot");
  await user.type(screen.getByLabelText(/^Email address/), "engineer@example.com");
  await user.click(screen.getByRole("button", { name: "Send Reset Link" }));
  expect(screen.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
  expect(screen.getByText("engineer@example.com")).toBeVisible();
  expect(screen.getByText(/No email has been sent/)).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Use a different email" }));
  expect(screen.getByLabelText(/^Email address/)).toHaveValue("engineer@example.com");
});

test("password reset rejects mismatched passwords before showing completion", async () => {
  const user = setup("reset");
  await user.type(screen.getByLabelText(/^New password/), "a-long-password");
  await user.type(screen.getByLabelText(/^Confirm password/), "different-password");
  await user.click(screen.getByRole("button", { name: "Reset Password" }));
  expect(screen.getByText("Passwords do not match.")).toBeVisible();
  expect(screen.queryByRole("heading", { name: "You're all set" })).not.toBeInTheDocument();
  await user.clear(screen.getByLabelText(/^Confirm password/));
  await user.type(screen.getByLabelText(/^Confirm password/), "a-long-password");
  await user.click(screen.getByRole("button", { name: "Reset Password" }));
  expect(screen.getByRole("heading", { name: "You're all set" })).toBeVisible();
  expect(screen.getByText(/No password has been changed/)).toBeVisible();
});

test("sign-in preview never creates an authenticated session", async () => {
  const user = setup("login");
  await user.type(screen.getByLabelText(/^Email or username/), "engineer");
  await user.type(screen.getByLabelText(/^Password/), "my-password");
  await user.click(screen.getByRole("button", { name: "Sign In" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Sign-in is not connected yet");
  expect(getAccessToken()).toBeNull();
  expect(screen.getByRole("link", { name: "Explore the dashboard" })).toHaveAttribute("href", "/overview");
});

test("invalid recovery email stays on the form", async () => {
  const user = setup("forgot");
  await user.type(screen.getByLabelText(/^Email address/), "not-an-email");
  await user.click(screen.getByRole("button", { name: "Send Reset Link" }));
  expect(screen.getByRole("heading", { name: "Reset your password" })).toBeVisible();
  expect(screen.queryByRole("heading", { name: "Check your inbox" })).not.toBeInTheDocument();
});

test("password fields warn while Caps Lock is on", async () => {
  const user = setup("login");
  const password = screen.getByLabelText(/^Password/);
  await user.click(password);
  await user.keyboard("{CapsLock}a");
  expect(password).toHaveAccessibleDescription("Caps Lock is on.");
  await user.keyboard("{CapsLock}a");
  expect(screen.queryByText("Caps Lock is on.")).not.toBeInTheDocument();
});
