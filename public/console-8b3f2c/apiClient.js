/*******************************************************
 * BetterBodies Admin Console — API Client
 *
 * Thin wrapper around the Apps Script /exec endpoint (see code.gs).
 * Phase 1 is read-only: get() is the only path allowed to reach the
 * network. post() is a stub that throws until phase 2 ships auth.
 *******************************************************/
(function (global) {
  "use strict";

  function buildUrl(action) {
    const base = global.CONSOLE_CONFIG.APPS_SCRIPT_URL;
    return `${base}?action=${encodeURIComponent(action)}`;
  }

  async function get(action) {
    const response = await fetch(buildUrl(action), { method: "GET" });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status}) for action "${action}"`);
    }

    const data = await response.json();

    if (data && data.ok === false) {
      throw new Error(data.error || `Endpoint returned an error for "${action}"`);
    }

    return data;
  }

  async function post(_action, _payload) {
    // WRITE/AUTH LINE: phase 2 wires this to an authenticated POST against
    // the Apps Script endpoint. Until then, no code path may write.
    throw new Error("Writes require auth (phase 2).");
  }

  global.ApiClient = { get, post };
})(window);
