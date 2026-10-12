---
route: /login, /forgot-password, /reset-password
page: src/pages/authentication.tsx
title: Authentication
status: reviewed
updated: 2026-10-12
aliases: [login, sign in, forgot password, reset password]
dataModules: []
relatedScreens: [/overview, /gallery]
---

# Authentication

> Preview sign-in and password recovery shared by Genus solar, electricity, water and gas metering. No session, reset email or password change is created.

## 1. Overview

**[C]** One sign-in page for every Genus metering product — solar, electricity, water and gas — so it names no single product. A frontend preview of login, password recovery, email confirmation, password reset and completion. No authentication backend exists: sign-in creates no session, recovery sends no email, reset changes no password, and Remember me is an in-memory form preference. Dashboard routes remain accessible. Backend integration must validate reset tokens, enforce password policy and implement persistent sessions before production authentication is enabled.

## 2. Audience

- Users of any Genus metering product — solar, water or gas — returning to their dashboard.
- Designers reviewing authentication states in the component gallery.

## 3. Access

- Open `/login`, `/forgot-password` or `/reset-password` directly.
- The root URL opens Login. Explore the dashboard opens `/overview`.
- Account menu → Sign out clears the frontend access token and returns to `/login`. No backend request is made.
- Theme preferences carry through from the dashboard. The authentication page also offers a light/dark toggle.

## 9. Use cases

- Enter an email or username and password, and toggle password visibility. A hint appears under a password field while Caps Lock is on.
- Hover a meter reading, or hover or select Solar, Electricity, Water or Gas under the illustration, to spotlight that supply and read what it covers. Select it again to show all four.
- Preview the email-confirmation screen after submitting a valid email address.
- Use a different email without losing the previous address.
- Preview a password reset using matching passwords of at least 12 characters.

## 13. States

**[C]** The gallery exposes all five states. Login submission displays an explicit disconnected-service message. Recovery and reset confirmation identify themselves as previews. Password mismatch appears beside the confirmation field. The illustration shows one home with four supplies, each through its own meter: rooftop solar, the electricity grid, water from a tower, gas from the street main. Each meter shows a counting reading — the solar meter counts energy generated and the electricity meter energy used, both in kWh; the water meter counts litres, the gas meter cubic metres. These are sample readings; they report no telemetry and are hidden from screen readers, which hear a description of the scene instead. Each supply has its own icon and line texture as well as colour. Flows, meter lights, the sun and the counters animate; the pause button stops all of them, and none run when reduced motion is requested. Desktop uses a split layout that fills the current viewport. Mobile hides the illustration and shows the form only. The page does not scroll; the form panel can scroll when unusually short viewports or enlarged text require it to keep controls accessible. All forms inherit theme and direction preferences.

## 14. Questions

**Q. Was an email sent or my password changed?**

No. These screens are UI previews until verified backend endpoints are connected.

## 15. Troubleshooting

- If the reset form does not advance, use at least 12 characters in both password fields and make sure they match.
- A sign-in preview cannot grant access or validate credentials.
