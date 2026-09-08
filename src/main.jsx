import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SettingsProvider } from "./lib/settings.jsx";
import { QueryProvider } from "./app/providers/QueryProvider.tsx";
import App from "./App.jsx";
import "./tokens.css";

/**
 * Promote the alternate font faces.
 *
 * index.html requests them with media="print" so they do not block first paint
 * — they back the Typography section of the theme customizer and most sessions
 * never change it. Flipping to media="all" on the sheet's own load event is
 * what the inline onload attribute in index.html used to do; it lives here
 * because a Content-Security-Policy without 'unsafe-inline' blocks inline
 * handlers, and it did so silently.
 */
const alternates = document.getElementById("font-alternates");
if (alternates) {
  if (alternates.sheet) alternates.media = "all";
  else
    alternates.addEventListener("load", () => {
      alternates.media = "all";
    }, { once: true });
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        {/* Server state. Inside SettingsProvider so a query's error state is
            rendered with the user's chosen theme rather than an unstyled one. */}
        <QueryProvider>
          <App />
        </QueryProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
