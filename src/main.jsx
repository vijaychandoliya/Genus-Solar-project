import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SettingsProvider } from "./lib/settings.jsx";
import { QueryProvider } from "./app/providers/QueryProvider.tsx";
import App from "./App.jsx";
import "./tokens.css";

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
