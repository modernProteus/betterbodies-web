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

  function fieldLabel(text, helpText) {
    const label = document.createElement("span");
    label.className = "field-label";
    label.appendChild(document.createTextNode(text + " "));
    label.appendChild(createInfoTooltip(helpText));
    return label;
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

  // Real "Public Services" sheet column order. The row builder must output
  // exactly this order for a paste to line up.
  const ROW_COLUMNS = [
    "key",
    "active",
    "tier",
    "sort",
    "title",
    "icon",
    "description",
    "who",
    "cta",
    "lead_intent",
    "modal_title",
    "modal_description",
  ];

  const HELP_TEXT = {
    key: "Auto-generated from the title: lowercase, spaces and punctuation become underscores. Used internally to match this service elsewhere in the code. A live service's key should not change, so only override it if you really need to.",
    active:
      "Whether this service shows on the public site. Unchecked rows are saved but hidden everywhere.",
    tier: "Which tier/section this shows under on the site (1 to 4). Tier 1 gets the red outline treatment shown in the preview; tiers 2-4 use the calm default look.",
    sort: "Order within its tier. Lower numbers show first.",
    title: "The service name shown on the card and in the request popup.",
    icon: "Icon shown on the card. Tap it to pick from the curated set; anything else falls back to a generic message icon.",
    description: "A sentence or two shown on the card, under the title.",
    who: "Who this service is for. Shown as \"Best for\" on the card.",
    cta: 'Button text on the card, e.g. "Request CPR Training".',
    lead_intent:
      "Internal tag sent with lead submissions so follow-up routing knows what someone asked about.",
    modal_title: "Heading shown in the popup form when someone clicks the CTA.",
    modal_description:
      "Supporting text shown in the popup above the contact form.",
  };

  // Google Sheets splits pasted plain text on tabs, not commas. A comma-joined
  // row lands entirely in one cell; a tab-joined row fills across columns.
  function tsvCell(value) {
    return String(value == null ? "" : value).replace(/[\t\r\n]+/g, " ");
  }

  function buildTsvRow(values) {
    return ROW_COLUMNS.map((key) => tsvCell(values[key])).join("\t");
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

  // Lowercase, strip diacritics, collapse anything that isn't a-z0-9 into a
  // single underscore. Shared by the auto-key generator and the manual
  // override input, so both always land on the same slug-safe alphabet.
  function sanitizeToSlugChars(raw) {
    return String(raw || "")
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/_{2,}/g, "_");
  }

  function slugify(title) {
    return sanitizeToSlugChars(title).replace(/^_+|_+$/g, "");
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
        <p>Public-safe deep links, a live read-only preview of active services, and a card builder for adding new ones to the sheet.</p>
      </div>

      <div class="section">
        <div class="deep-links">
          <a class="btn" href="${CONFIG.sheetTabUrl(CONFIG.TABS.publicClasses)}" target="_blank" rel="noopener noreferrer">Open Public Classes tab</a>
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
          <h3>Card builder</h3>
        </div>
        <div class="two-speeds-banner">
          Classes update instantly (no Publish). Services need Publish to appear.
        </div>
        <div class="card">
          <div class="card-builder-grid" id="card-builder-grid"></div>
          <div class="csv-output">
            <label class="field-label" for="csv-result">Row to paste into the Public Services tab</label>
            <textarea id="csv-result" readonly rows="2"></textarea>
            <div class="csv-actions">
              <button type="button" class="btn btn-primary" id="copy-csv-btn">Copy row</button>
            </div>
            <a class="btn open-sheet-link" id="open-sheet-link" href="${CONFIG.sheetTabUrl(CONFIG.TABS.publicServices)}" target="_blank" rel="noopener noreferrer">Open sheet to paste &rarr;</a>
          </div>
        </div>
      </div>

      <div class="section">
        <details class="how-it-works">
          <summary>How this works</summary>
          <ol class="rules-list how-it-works-steps">
            <li>Build the card above: edit the title, description, best for, CTA, and icon, then set tier, sort, and the popup fields.</li>
            <li>Click Copy row to copy the row it generates.</li>
            <li>Click Open sheet to paste, then paste it in as a new row in the Public Services tab.</li>
            <li>In the sheet, click Better Bodies &rarr; Publish services to site. Publish is live, so this step pushes the change to the website.</li>
          </ol>
          <p class="how-it-works-heading">Golden rules</p>
          <ul class="rules-list">
            <li>Only edit the Public Services tab. Other tabs are out of scope for this module.</li>
            <li>Never touch the header row.</li>
            <li>Pick icon and tier from the controls here, not by typing them directly in the sheet.</li>
            <li>This console cannot write to the sheet. Paste the generated row in yourself.</li>
          </ul>
        </details>
      </div>
    `;

    setupCardBuilder(root.querySelector("#card-builder-grid"));
    setupServicesPreview(root);
  }

  /* ---------------------------------------------------
   * Card builder: tier-reactive WYSIWYG mock + auto-generated key
   *
   * The tier 1 emphasis rule below (red outline, bolder title, tiers 2-4
   * calm/default) mirrors the live site's isFeatured logic in
   * src/components/homepage/ServiceTile.jsx (search "isFeatured" there for
   * the border/background classes and the title font-weight classes). If
   * that rule ever changes on the site, update .mock-card here to match.
   * ------------------------------------------------- */

  function setupCardBuilder(container) {
    const values = {
      key: "",
      active: "TRUE",
      tier: 1,
      sort: 1,
      title: "",
      icon: window.Icons.FALLBACK_ICON,
      description: "",
      who: "",
      cta: "",
      lead_intent: "",
      modal_title: "",
      modal_description: "",
    };

    let keyMode = "auto"; // "auto" | "manual"

    container.innerHTML = `
      <div class="mock-card-wrap">
        <div class="mock-card" id="mock-card" data-tier="1">
          <button type="button" class="mock-icon-btn" id="mock-icon-btn" title="Change icon" aria-label="Change icon"></button>

          <div class="mock-field">
            ${fieldLabel("Title", HELP_TEXT.title).outerHTML}
            <input type="text" class="edit-inline mock-title-input" id="mock-title-input" placeholder="Service title" />
          </div>

          <div class="mock-field">
            ${fieldLabel("Description", HELP_TEXT.description).outerHTML}
            <textarea class="edit-inline mock-desc-input" id="mock-desc-input" rows="3" placeholder="A sentence or two about this service."></textarea>
          </div>

          <div class="mock-field">
            ${fieldLabel("Best for", HELP_TEXT.who).outerHTML}
            <input type="text" class="edit-inline mock-who-input" id="mock-who-input" placeholder="Who this is for" />
          </div>

          <div class="mock-field">
            ${fieldLabel("CTA", HELP_TEXT.cta).outerHTML}
            <div class="mock-cta">
              <input type="text" class="edit-inline mock-cta-input" id="mock-cta-input" placeholder="Request Info" />
            </div>
          </div>
        </div>

        <div class="icon-popover hidden" id="icon-popover"></div>
      </div>

      <div class="builder-controls">
        <div class="field" id="key-field">
          <span class="field-label">Generated ID</span>
          <div class="generated-id" id="generated-id-display">Generated ID: <code id="generated-id-value">(type a title)</code></div>
          <input type="text" class="hidden" id="manual-key-input" />
          <div class="key-mode-actions">
            <button type="button" class="link-btn" id="override-key-btn">Override manually</button>
            <button type="button" class="link-btn hidden" id="reset-key-btn">Reset to auto</button>
          </div>
          <p class="helper-text">A live service's key should not change once it is in use.</p>
        </div>

        <div class="field">
          ${fieldLabel("Tier", HELP_TEXT.tier).outerHTML}
          <div class="segmented" id="tier-segmented" role="group" aria-label="Tier">
            <button type="button" class="segmented-btn selected" data-tier="1">1</button>
            <button type="button" class="segmented-btn" data-tier="2">2</button>
            <button type="button" class="segmented-btn" data-tier="3">3</button>
            <button type="button" class="segmented-btn" data-tier="4">4</button>
          </div>
        </div>

        <div class="field">
          ${fieldLabel("Sort", HELP_TEXT.sort).outerHTML}
          <input type="number" id="sort-input" value="1" />
        </div>

        <div class="field checkbox-field">
          ${fieldLabel("Active", HELP_TEXT.active).outerHTML}
          <input type="checkbox" id="active-input" checked />
        </div>

        <div class="field">
          ${fieldLabel("Lead intent", HELP_TEXT.lead_intent).outerHTML}
          <input type="text" id="lead-intent-input" placeholder="service_interest" />
        </div>

        <div class="field">
          ${fieldLabel("Modal title", HELP_TEXT.modal_title).outerHTML}
          <input type="text" id="modal-title-input" placeholder="Request this service" />
        </div>

        <div class="field">
          ${fieldLabel("Modal description", HELP_TEXT.modal_description).outerHTML}
          <textarea id="modal-description-input" rows="2" placeholder="Tell us what you need and we will follow up."></textarea>
        </div>
      </div>
    `;

    const els = {
      mockCard: container.querySelector("#mock-card"),
      mockIconBtn: container.querySelector("#mock-icon-btn"),
      titleInput: container.querySelector("#mock-title-input"),
      descInput: container.querySelector("#mock-desc-input"),
      whoInput: container.querySelector("#mock-who-input"),
      ctaInput: container.querySelector("#mock-cta-input"),
      iconPopover: container.querySelector("#icon-popover"),
      generatedIdValue: container.querySelector("#generated-id-value"),
      manualKeyInput: container.querySelector("#manual-key-input"),
      overrideKeyBtn: container.querySelector("#override-key-btn"),
      resetKeyBtn: container.querySelector("#reset-key-btn"),
      tierSegmented: container.querySelector("#tier-segmented"),
      sortInput: container.querySelector("#sort-input"),
      activeInput: container.querySelector("#active-input"),
      leadIntentInput: container.querySelector("#lead-intent-input"),
      modalTitleInput: container.querySelector("#modal-title-input"),
      modalDescInput: container.querySelector("#modal-description-input"),
    };

    function updateRowOutput() {
      document.getElementById("csv-result").value = buildTsvRow(values);
    }

    function renderMockIcon() {
      els.mockIconBtn.innerHTML = window.Icons.getIcon(values.icon);
    }

    function renderKeyDisplay() {
      els.generatedIdValue.textContent = values.key || "(type a title)";
    }

    // --- Auto key -------------------------------------------------------

    function regenerateKeyFromTitle() {
      values.key = slugify(values.title);
      renderKeyDisplay();
      updateRowOutput();
    }

    els.overrideKeyBtn.addEventListener("click", () => {
      keyMode = "manual";
      els.manualKeyInput.value = values.key;
      els.manualKeyInput.classList.remove("hidden");
      document.getElementById("generated-id-display").classList.add("hidden");
      els.overrideKeyBtn.classList.add("hidden");
      els.resetKeyBtn.classList.remove("hidden");
      els.manualKeyInput.focus();
    });

    els.resetKeyBtn.addEventListener("click", () => {
      keyMode = "auto";
      els.manualKeyInput.classList.add("hidden");
      document.getElementById("generated-id-display").classList.remove("hidden");
      els.overrideKeyBtn.classList.remove("hidden");
      els.resetKeyBtn.classList.add("hidden");
      regenerateKeyFromTitle();
    });

    els.manualKeyInput.addEventListener("input", () => {
      const cursor = els.manualKeyInput.selectionStart;
      const sanitized = sanitizeToSlugChars(els.manualKeyInput.value);
      els.manualKeyInput.value = sanitized;
      if (cursor !== null) {
        els.manualKeyInput.setSelectionRange(cursor, cursor);
      }
      values.key = sanitized;
      updateRowOutput();
    });

    els.manualKeyInput.addEventListener("blur", () => {
      values.key = values.key.replace(/^_+|_+$/g, "");
      els.manualKeyInput.value = values.key;
      updateRowOutput();
    });

    // --- Card fields (edit-in-place) ------------------------------------

    els.titleInput.addEventListener("input", () => {
      values.title = els.titleInput.value;
      if (keyMode === "auto") regenerateKeyFromTitle();
      updateRowOutput();
    });

    els.descInput.addEventListener("input", () => {
      values.description = els.descInput.value;
      updateRowOutput();
    });

    els.whoInput.addEventListener("input", () => {
      values.who = els.whoInput.value;
      updateRowOutput();
    });

    els.ctaInput.addEventListener("input", () => {
      values.cta = els.ctaInput.value;
      updateRowOutput();
    });

    // --- Icon (edit-in-place via popover on the card) -------------------

    let iconPicker = null;

    els.mockIconBtn.addEventListener("click", () => {
      const isHidden = els.iconPopover.classList.contains("hidden");
      if (isHidden) {
        if (!iconPicker) {
          iconPicker = createIconPicker({
            selected: values.icon,
            onChange: (name) => {
              values.icon = name;
              renderMockIcon();
              updateRowOutput();
              els.iconPopover.classList.add("hidden");
            },
          });
          els.iconPopover.appendChild(iconPicker.el);
        }
        els.iconPopover.classList.remove("hidden");
      } else {
        els.iconPopover.classList.add("hidden");
      }
    });

    document.addEventListener("click", (event) => {
      if (
        !els.iconPopover.classList.contains("hidden") &&
        !els.iconPopover.contains(event.target) &&
        !els.mockIconBtn.contains(event.target)
      ) {
        els.iconPopover.classList.add("hidden");
      }
    });

    // --- Tier (reacts live on the mock card) ----------------------------

    els.tierSegmented.addEventListener("click", (event) => {
      const btn = event.target.closest(".segmented-btn");
      if (!btn) return;
      values.tier = Number(btn.dataset.tier);
      els.mockCard.dataset.tier = String(values.tier);
      els.tierSegmented
        .querySelectorAll(".segmented-btn")
        .forEach((b) => b.classList.toggle("selected", b === btn));
      updateRowOutput();
    });

    // --- Remaining side controls ----------------------------------------

    els.sortInput.addEventListener("input", () => {
      values.sort = els.sortInput.value;
      updateRowOutput();
    });

    els.activeInput.addEventListener("change", () => {
      values.active = els.activeInput.checked ? "TRUE" : "FALSE";
      updateRowOutput();
    });

    els.leadIntentInput.addEventListener("input", () => {
      values.lead_intent = els.leadIntentInput.value;
      updateRowOutput();
    });

    els.modalTitleInput.addEventListener("input", () => {
      values.modal_title = els.modalTitleInput.value;
      updateRowOutput();
    });

    els.modalDescInput.addEventListener("input", () => {
      values.modal_description = els.modalDescInput.value;
      updateRowOutput();
    });

    // --- Copy -------------------------------------------------------------

    document.getElementById("copy-csv-btn").addEventListener("click", () => {
      const csvBox = document.getElementById("csv-result");
      copyToClipboard(csvBox.value)
        .then(() => showToast("Row copied to clipboard."))
        .catch(() => showToast("Couldn't copy automatically. Select and copy the row manually.", "error"));
    });

    renderMockIcon();
    renderKeyDisplay();
    updateRowOutput();
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
