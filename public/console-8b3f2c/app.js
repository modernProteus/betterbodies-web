/*******************************************************
 * BetterBodies Admin Console — Shell + Services Module
 *
 * Framework-free, no build step. Loaded after config.js, apiClient.js,
 * and icons.js (see index.html). Everything below is read-only.
 *******************************************************/
(function () {
  "use strict";

  const CONFIG = window.CONSOLE_CONFIG;

  /* ---------------------------------------------------
   * Small utilities
   * ------------------------------------------------- */

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])
    );
  }

  function formatTimestamp(isoOrDate) {
    const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
    if (Number.isNaN(date.getTime())) return "unknown time";
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  /* ---------------------------------------------------
   * Toasts (shared UI helper)
   * ------------------------------------------------- */

  function showToast(message, variant) {
    const stack = document.getElementById("toast-stack");
    const toast = document.createElement("div");
    toast.className = "toast" + (variant === "error" ? " toast-error" : "");
    toast.textContent = message;
    stack.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  /* ---------------------------------------------------
   * Tooltips (shared UI helper): works on hover AND tap
   * ------------------------------------------------- */

  function createInfoTooltip(helpText) {
    const wrap = document.createElement("button");
    wrap.type = "button";
    wrap.className = "info-icon";
    wrap.setAttribute("aria-label", "More info");
    wrap.textContent = "i";

    const bubble = document.createElement("span");
    bubble.className = "tooltip-bubble";
    bubble.textContent = helpText;
    wrap.appendChild(bubble);

    wrap.addEventListener("click", (event) => {
      event.preventDefault();
      const isOpen = wrap.classList.contains("is-open");
      document
        .querySelectorAll(".info-icon.is-open")
        .forEach((el) => el.classList.remove("is-open"));
      if (!isOpen) wrap.classList.add("is-open");
    });

    return wrap;
  }

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".info-icon")) {
      document
        .querySelectorAll(".info-icon.is-open")
        .forEach((el) => el.classList.remove("is-open"));
    }
  });

  /* ---------------------------------------------------
   * Data-source status badge (shared UI helper)
   * ------------------------------------------------- */

  function createStatusBadge({ onRetry }) {
    const el = document.createElement("div");
    el.className = "status-badge-row";
    el.innerHTML = '<span class="status-badge"><span class="dot"></span><span class="status-text"></span></span>';

    function render(state) {
      const badge = el.querySelector(".status-badge");
      const text = el.querySelector(".status-text");
      badge.classList.remove("is-live", "is-snapshot");
      const existingBtn = badge.querySelector(".retry-btn");

      if (state.mode === "loading") {
        text.textContent = "Checking the sheet...";
        if (existingBtn) existingBtn.remove();
        return;
      }

      if (state.mode === "live") {
        badge.classList.add("is-live");
        text.innerHTML = `Live from sheet <span class="status-meta">&middot; fetched ${escapeHtml(
          formatTimestamp(state.fetchedAt)
        )}</span>`;
        if (existingBtn) existingBtn.remove();
      } else {
        badge.classList.add("is-snapshot");
        text.innerHTML = `Showing saved snapshot (couldn't reach the sheet) <span class="status-meta">&middot; snapshot from ${escapeHtml(
          state.snapshotDate
        )}</span>`;
        let btn = existingBtn;
        if (!btn) {
          btn = document.createElement("button");
          btn.type = "button";
          btn.className = "retry-btn";
          btn.textContent = "Retry";
          badge.appendChild(btn);
        }
        btn.onclick = onRetry;
      }
    }

    return { el, render };
  }

  /* ---------------------------------------------------
   * Icon picker (shared UI helper): searchable grid, live SVG preview
   * ------------------------------------------------- */

  function createIconPicker({ selected, onChange }) {
    const wrap = document.createElement("div");
    wrap.className = "icon-picker";

    const search = document.createElement("input");
    search.type = "text";
    search.className = "icon-picker-search";
    search.placeholder = "Search icons (e.g. heart, shield, safety)";

    const grid = document.createElement("div");
    grid.className = "icon-picker-grid";

    const preview = document.createElement("div");
    preview.className = "icon-picker-preview";

    let current = window.Icons.ICON_NAMES.includes(selected)
      ? selected
      : window.Icons.FALLBACK_ICON;

    function renderPreview() {
      preview.innerHTML = `<span class="icon-wrap">${window.Icons.getIcon(
        current
      )}</span><span>${escapeHtml(current)}</span>`;
    }

    function renderGrid(filter) {
      const term = (filter || "").trim().toLowerCase();
      grid.innerHTML = "";
      window.Icons.ICON_NAMES.filter((name) =>
        name.toLowerCase().includes(term)
      ).forEach((name) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "icon-picker-btn" + (name === current ? " selected" : "");
        btn.title = name;
        btn.innerHTML = window.Icons.getIcon(name);
        btn.addEventListener("click", () => {
          current = name;
          renderGrid(search.value);
          renderPreview();
          if (onChange) onChange(current);
        });
        grid.appendChild(btn);
      });
    }

    search.addEventListener("input", () => renderGrid(search.value));

    wrap.appendChild(search);
    wrap.appendChild(grid);
    wrap.appendChild(preview);

    renderGrid("");
    renderPreview();

    return {
      el: wrap,
      getValue: () => current,
      setValue: (name) => {
        current = window.Icons.ICON_NAMES.includes(name)
          ? name
          : window.Icons.FALLBACK_ICON;
        renderGrid(search.value);
        renderPreview();
      },
    };
  }

  /* ---------------------------------------------------
   * Shell: nav + module switching
   * ------------------------------------------------- */

  function renderNav() {
    const nav = document.getElementById("console-nav");
    nav.innerHTML = "";

    CONFIG.MODULES.forEach((mod) => {
      if (mod.status === "active") {
        const link = document.createElement("button");
        link.type = "button";
        link.className = "nav-item active";
        link.textContent = mod.label;
        link.addEventListener("click", () => showModule(mod.id));
        nav.appendChild(link);
      } else {
        const span = document.createElement("span");
        span.className = "nav-item disabled";
        span.innerHTML = `${escapeHtml(mod.label)} <span class="coming-soon-pill">Coming soon</span>`;
        nav.appendChild(span);
      }
    });
  }

  function showModule(id) {
    document.querySelectorAll(".module-panel").forEach((panel) => {
      panel.classList.toggle("visible", panel.dataset.module === id);
    });
  }

  /* ---------------------------------------------------
   * Bundled fallback snapshot for the Services live preview.
   * Used only when the live "services" endpoint can't be reached.
   * ------------------------------------------------- */

  const SNAPSHOT_DATE = "2026-07-04";
  const SNAPSHOT_SERVICES = [
    {
      key: "cpr",
      tier: 1,
      title: "CPR Certification",
      icon: "Heart",
      description:
        "Hands-on CPR training for individuals, caregivers, teachers, and professionals who need practical emergency response skills.",
    },
    {
      key: "bls",
      tier: 1,
      title: "BLS Certification",
      icon: "Shield",
      description:
        "Basic Life Support training for healthcare workers and professionals who need a higher level of emergency response readiness.",
    },
    {
      key: "fitness",
      tier: 2,
      title: "Personal Training & Fitness",
      icon: "Dumbbell",
      description:
        "High-energy, personalized training that meets you where you are and pushes you past your limits.",
    },
    {
      key: "aed_firstaid",
      tier: 3,
      title: "AED + First Aid",
      icon: "RotateCcw",
      description:
        "Practical first aid and AED-focused training that helps people respond calmly and effectively before help arrives.",
    },
    {
      key: "crisis",
      tier: 3,
      title: "Crisis Readiness",
      icon: "AlertTriangle",
      description:
        "Situational awareness, de-escalation, and response skills for real-world moments.",
    },
    {
      key: "personal_safety",
      tier: 3,
      title: "Personal Safety",
      icon: "Eye",
      description:
        "Body awareness, personal safety, and self-defense-informed instruction rooted in practical confidence.",
    },
    {
      key: "protection",
      tier: 3,
      title: "Personal & Event Protection",
      icon: "ShieldCheck",
      description:
        "Personal and event protection, plus active-shooter evacuation planning, delivered calmly and professionally.",
    },
    {
      key: "wellness",
      tier: 4,
      title: "Holistic Wellness & Apothecary",
      icon: "Leaf",
      description:
        "Holistic remedies, loose-leaf herbs, essential oils, and artisanal wellness goods.",
    },
  ];

  /* ---------------------------------------------------
   * Services module
   * ------------------------------------------------- */

  const FIELD_DEFS = [
    {
      key: "key",
      label: "key",
      type: "text",
      help:
        "Unique lowercase id with underscores, e.g. aed_firstaid. Used internally to match this service elsewhere in the codebase. Avoid changing it once a service is live.",
    },
    {
      key: "active",
      label: "active",
      type: "checkbox",
      default: true,
      help:
        "Whether this service shows on the public site. Unchecked rows are saved but hidden everywhere. Not in the original field list but required by the sheet's real column order, so it's included here to keep the row paste-ready.",
    },
    {
      key: "tier",
      label: "tier",
      type: "number",
      help: "Which tier/section this service displays under on the site (currently 1-4).",
    },
    {
      key: "sort",
      label: "sort",
      type: "number",
      help: "Order within its tier. Lower numbers show first.",
    },
    {
      key: "title",
      label: "title",
      type: "text",
      help: "The service name shown on the card and in the request popup.",
    },
    {
      key: "icon",
      label: "icon",
      type: "icon",
      help: "Icon shown on the card. Pick from the curated set below; anything else falls back to a generic message icon.",
    },
    {
      key: "description",
      label: "description",
      type: "textarea",
      help: "A sentence or two shown on the card, under the title.",
    },
    {
      key: "who",
      label: "who",
      type: "text",
      help: "Who this service is for. Shown as a supporting line on the card.",
    },
    {
      key: "cta",
      label: "cta",
      type: "text",
      help: 'Button text on the card, e.g. "Request CPR Training".',
    },
    {
      key: "lead_intent",
      label: "lead_intent",
      type: "text",
      help: "Internal tag sent with lead submissions so follow-up routing knows what someone asked about.",
    },
    {
      key: "modal_title",
      label: "modal_title",
      type: "text",
      help: "Heading shown in the popup form when someone clicks the CTA.",
    },
    {
      key: "modal_description",
      label: "modal_description",
      type: "textarea",
      help: "Supporting text shown in the popup above the contact form.",
    },
  ];

  function csvField(value) {
    const str = String(value ?? "");
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function buildCsvRow(values) {
    return FIELD_DEFS.map((field) => csvField(values[field.key])).join(",");
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const temp = document.createElement("textarea");
    temp.value = text;
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
    return Promise.resolve();
  }

  function renderServicePreviewCards(container, services) {
    if (!services.length) {
      container.innerHTML = '<div class="empty-state">No active services found.</div>';
      return;
    }

    container.innerHTML = "";
    services
      .slice()
      .sort((a, b) => (a.tier - b.tier) || ((a.sort || 0) - (b.sort || 0)))
      .forEach((service) => {
        const card = document.createElement("div");
        card.className = "service-card";
        card.innerHTML = `
          <span class="icon-wrap">${window.Icons.getIcon(service.icon)}</span>
          <span class="tier-tag">Tier ${escapeHtml(service.tier)}</span>
          <h4>${escapeHtml(service.title)}</h4>
          <p>${escapeHtml(service.description)}</p>
        `;
        container.appendChild(card);
      });
  }

  function initServicesModule() {
    const root = document.getElementById("module-services");

    root.innerHTML = `
      <div class="panel-intro">
        <h2>Services</h2>
        <p>Public-safe deep links, a live read-only preview of active services, and a row builder for adding new ones to the sheet.</p>
      </div>

      <div class="section">
        <div class="deep-links">
          <a class="btn" href="${CONFIG.sheetTabUrl(CONFIG.TABS.publicServices)}" target="_blank" rel="noopener">Open Public Services tab</a>
          <a class="btn" href="${CONFIG.sheetTabUrl(CONFIG.TABS.publicClasses)}" target="_blank" rel="noopener">Open Public Classes tab</a>
        </div>
      </div>

      <div class="section">
        <div class="section-heading">
          <h3>Live services preview</h3>
        </div>
        <div id="services-status-slot"></div>
        <div class="service-cards" id="services-preview-cards"></div>
      </div>

      <div class="section">
        <div class="section-heading">
          <h3>Row builder</h3>
        </div>
        <div class="card">
          <form id="service-row-form" class="form-grid"></form>
          <div class="csv-output">
            <label class="field-label" for="csv-result">CSV row (paste into the Public Services tab)</label>
            <textarea id="csv-result" readonly rows="2"></textarea>
            <div class="csv-actions">
              <button type="button" class="btn btn-primary" id="copy-csv-btn">Copy row</button>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="card">
          <h3>Read these once</h3>
          <ul class="rules-list">
            <li>Only rows with active = TRUE show on the public site.</li>
            <li>key must be unique and stay lowercase with underscores; it is used to match dual-path overrides in the codebase.</li>
            <li>tier and sort together control where a service shows and in what order.</li>
            <li>icon must come from the curated picker below. Anything else falls back to a generic icon on the live site.</li>
            <li>This console cannot write to the sheet. Paste the generated row into the Public Services tab yourself.</li>
          </ul>
          <div class="publish-reminder">
            <strong>Reminder:</strong>&nbsp;after editing the sheet, run <em>Better Bodies &rarr; Publish services to site</em> from the sheet's menu to push the change live.
          </div>
        </div>
      </div>
    `;

    setupServiceRowForm(root.querySelector("#service-row-form"));
    setupServicesPreview(root);
  }

  function setupServiceRowForm(form) {
    const values = {};
    FIELD_DEFS.forEach((field) => {
      values[field.key] = field.default ?? (field.type === "number" ? 0 : "");
    });

    let iconPicker = null;

    function updateCsv() {
      const csvBox = document.getElementById("csv-result");
      csvBox.value = buildCsvRow(values);
    }

    FIELD_DEFS.forEach((field) => {
      const wrap = document.createElement("div");
      wrap.className = "field" + (field.type === "checkbox" ? " checkbox-field" : "");

      const labelRow = document.createElement("label");
      labelRow.className = "field-label";
      labelRow.textContent = field.label;
      labelRow.appendChild(createInfoTooltip(field.help));
      wrap.appendChild(labelRow);

      if (field.type === "textarea") {
        const textarea = document.createElement("textarea");
        textarea.addEventListener("input", () => {
          values[field.key] = textarea.value;
          updateCsv();
        });
        wrap.appendChild(textarea);
      } else if (field.type === "checkbox") {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!field.default;
        checkbox.addEventListener("change", () => {
          values[field.key] = checkbox.checked ? "TRUE" : "FALSE";
          updateCsv();
        });
        values[field.key] = checkbox.checked ? "TRUE" : "FALSE";
        wrap.appendChild(checkbox);
      } else if (field.type === "icon") {
        iconPicker = createIconPicker({
          selected: window.Icons.FALLBACK_ICON,
          onChange: (name) => {
            values[field.key] = name;
            updateCsv();
          },
        });
        values[field.key] = iconPicker.getValue();
        wrap.appendChild(iconPicker.el);
      } else {
        const input = document.createElement("input");
        input.type = field.type === "number" ? "number" : "text";
        input.addEventListener("input", () => {
          values[field.key] = input.value;
          updateCsv();
        });
        wrap.appendChild(input);
      }

      form.appendChild(wrap);
    });

    updateCsv();

    document.getElementById("copy-csv-btn").addEventListener("click", () => {
      const csvBox = document.getElementById("csv-result");
      copyToClipboard(csvBox.value)
        .then(() => showToast("Row copied to clipboard."))
        .catch(() => showToast("Couldn't copy automatically. Select and copy the row manually.", "error"));
    });
  }

  function setupServicesPreview(root) {
    const statusSlot = root.querySelector("#services-status-slot");
    const cardsSlot = root.querySelector("#services-preview-cards");

    const badge = createStatusBadge({ onRetry: () => loadServices() });
    statusSlot.appendChild(badge.el);

    function loadServices() {
      badge.render({ mode: "loading" });
      ApiClient.get("services")
        .then((data) => {
          if (!data || !Array.isArray(data.services)) {
            throw new Error(
              'Endpoint responded but has no "services" array (deployed Apps Script may be behind code.gs).'
            );
          }
          badge.render({ mode: "live", fetchedAt: new Date() });
          renderServicePreviewCards(cardsSlot, data.services);
        })
        .catch((error) => {
          console.log(
            `[Services module] Falling back to bundled snapshot. Reason: ${error.message}`
          );
          badge.render({ mode: "snapshot", snapshotDate: SNAPSHOT_DATE });
          renderServicePreviewCards(cardsSlot, SNAPSHOT_SERVICES);
        });
    }

    loadServices();
  }

  /* ---------------------------------------------------
   * Schedule / Leads (coming soon stubs)
   * ------------------------------------------------- */

  function initComingSoonModule(id, label) {
    const root = document.getElementById(`module-${id}`);
    root.innerHTML = `
      <div class="coming-soon-panel">
        <h2>${escapeHtml(label)}</h2>
        <p>This module is coming soon. It will follow the same shell pattern as Services: config-driven deep links, a live read-only preview, and a status badge.</p>
      </div>
    `;
  }

  /* ---------------------------------------------------
   * Init
   * ------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", () => {
    renderNav();
    initServicesModule();
    initComingSoonModule("schedule", "Schedule");
    initComingSoonModule("leads", "Leads");
    showModule("services");
  });
})();
