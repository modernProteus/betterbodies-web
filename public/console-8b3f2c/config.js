/*******************************************************
 * BetterBodies Admin Console — Config
 *
 * Phase 1: read-only, unlisted, no auth. Only public-safe sheet
 * tabs are named here. Leads / Bookings / Change Requests / Settings /
 * Issues gids are intentionally OMITTED until phase 2 (auth-gated).
 *******************************************************/
(function (global) {
  "use strict";

  const SHEET_ID = "1eRYpgwoA449EjPJLRcZdxxl0-Gvfhe5sVFA-kCseY3c";
  const SHEET_BASE = `https://docs.google.com/spreadsheets/d/${SHEET_ID}`;

  const CONFIG = {
    SHEET_ID,
    SHEET_BASE,

    // Deployed Apps Script /exec web app backing code.gs in the repo root.
    APPS_SCRIPT_URL:
      "https://script.google.com/macros/s/AKfycbzXq9f6f1MCbmrZeocsYdWXHeKFx0BWpIaExA-rqAOGw4YuJAn7d9Ruaq48rokRreBV/exec",

    // Public-safe tabs only. Add more here as new modules go public;
    // sensitive tabs stay out of this file until phase 2 ships auth.
    TABS: {
      publicServices: 1656152760,
      publicClasses: 979701574,
    },

    MODULES: [
      { id: "services", label: "Services", status: "active" },
      { id: "schedule", label: "Schedule", status: "coming-soon" },
      { id: "leads", label: "Leads", status: "coming-soon" },
    ],
  };

  CONFIG.sheetTabUrl = function sheetTabUrl(gid) {
    return `${SHEET_BASE}/edit#gid=${gid}`;
  };

  global.CONSOLE_CONFIG = CONFIG;
})(window);
