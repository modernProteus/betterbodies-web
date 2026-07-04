/*******************************************************
 * BetterBodies Feedback Intake + Status API
 *
 * POST:
 *   Custom HTML forms submit JSON payloads here.
 *
 * GET:
 *   /exec
 *   /exec?action=status
 *   /exec?action=status&callback=myCallback
 *   /exec?action=events
 *   /exec?action=services
 *
 * Notes:
 *   - Submissions are written to tabs based on form_type.
 *   - Status checks read whether each tab has one or more response rows.
 *   - JSONP is supported for browser-side status board loading.
 *******************************************************/

/*******************************************************
 * REQUIRED CONFIG
 *******************************************************/

// Paste your target Google Sheet ID here. It is the long ID in:
// https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
const SPREADSHEET_ID = "1eRYpgwoA449EjPJLRcZdxxl0-Gvfhe5sVFA-kCseY3c";

// Must match the hidden project_key field in every HTML form.
const EXPECTED_PROJECT_KEY = "betterbodies-feedback-2026";

/*******************************************************
 * FORM ROUTING CONFIG
 *
 * KNOWN BUG (preserved, not fixed here): the key "Feedback Submissions" is
 * repeated below. JS object literals silently let a later duplicate key
 * overwrite an earlier one, so only the LAST "Feedback Submissions" entry
 * (Voice Messaging Review) survives at runtime; Operations Booking Workflow,
 * Logo Concept Feedback, and Photo Content Inventory are unreachable by key.
 * Each entry's key should be its form's real form_type slug. Fix this in a
 * separate, deliberate pass once the exact form_type values are confirmed
 * against the HTML forms. This file only repairs the earlier syntax corruption.
 *******************************************************/
const FORM_CONFIG = {
  brand_website_direction: {
    sheetName: "Feedback Submissions",
    title: "Brand + Website Direction",
    required: true,
    url: "/feedback/brand-website-direction.html"
  },
  "Feedback Submissions": {
    sheetName: "Operations Booking Workflow",
    title: "Operations + Booking Workflow",
    required: true,
    url: "/feedback/operations-booking-workflow.html"
  },
  "Feedback Submissions": {
    sheetName: "Logo Concept Feedback",
    title: "Logo Concept Review",
    required: true,
    url: "/feedback/betterbodies-logo-concepts.html"
  },
  "Feedback Submissions": {
    sheetName: "Photo Content Inventory",
    title: "Photo + Content Inventory",
    required: false,
    url: "/feedback/photo-content-inventory.html"
  },
  "Feedback Submissions": {
    sheetName: "Voice Messaging Review",
    title: "Voice + Messaging Review",
    required: false,
    url: "/feedback/voice-messaging-review.html"
  },
  "Change Requests": {
    sheetName: "Site Update Requests",
    title: "Website Update Request",
    required: false,
    url: "/feedback/site-update-request.html"
  }
};

/*******************************************************
 * SHEET COLUMNS
 *
 * Keep this generic because each form has different fields and you expect
 * only 1-2 submissions per form.
 *******************************************************/
const GENERIC_HEADERS = [
  "Timestamp",
  "Form Type",
  "Form Title",
  "Submitted By",
  "Contact",
  "Page URL",
  "Summary",
  "Processed?",
  "Profile Updated?",
  "Notes",
  "Raw JSON"
];

/*******************************************************
 * GET HANDLER
 *******************************************************/
function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = params.action || "";
  const callback = params.callback || "";
  let payload;

  try {
    if (action === "status") {
      payload = getFeedbackStatus();
    } else if (action === "events") {
      payload = getUpcomingEvents();
    } else if (action === "services") {
      payload = getPublicServices();
    } else {
      payload = {
        ok: true,
        message: "BetterBodies feedback endpoint is live.",
        availableActions: ["status", "events", "services"]
      };
    }
  } catch (error) {
    payload = { ok: false, error: error.message, stack: error.stack };
  }

  if (callback) {
    return javascriptResponse(callback, payload);
  }

  return jsonResponse(payload);
}

/*******************************************************
 * POST HANDLER
 *******************************************************/
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "No postData received." });
    }

    const data = parseIncomingPayload(e);

    if (data.project_key !== EXPECTED_PROJECT_KEY) {
      return jsonResponse({
        ok: false,
        error: "Unauthorized submission. Project key mismatch."
      });
    }

    const formType = normalizeFormType(data.form_type);
    const config = getFormConfig(formType);
    const spreadsheet = getSpreadsheet();
    const sheet = getOrCreateSheet(spreadsheet, config.sheetName);

    ensureHeaders(sheet, GENERIC_HEADERS);

    const timestamp = new Date();
    const row = buildGenericRow(timestamp, formType, config, data);
    sheet.appendRow(row);

    return jsonResponse({
      ok: true,
      message: "Submission saved.",
      formType,
      sheetName: config.sheetName
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: error.message, stack: error.stack });
  }
}

/*******************************************************
 * PAYLOAD PARSING
 *******************************************************/
function parseIncomingPayload(e) {
  const raw = e.postData.contents || "";

  // Current frontend sends JSON as text/plain to avoid CORS preflight issues.
  // Apps Script supports doPost, but not custom doOptions handling, so avoiding
  // application/json preflight is usually safer for static frontend forms.
  try {
    return JSON.parse(raw);
  } catch (jsonError) {
    // Fallback for traditional form-encoded submissions.
    const params = e.parameter || {};
    const data = {};
    Object.keys(params).forEach((key) => {
      data[key] = params[key];
    });

    if (Object.keys(data).length > 0) {
      return data;
    }

    throw new Error("Could not parse POST body as JSON or form parameters.");
  }
}

function normalizeFormType(value) {
  if (Array.isArray(value)) {
    return value[0] || "unknown";
  }
  return value || "unknown";
}

function getFormConfig(formType) {
  if (FORM_CONFIG[formType]) {
    return FORM_CONFIG[formType];
  }
  return {
    sheetName: "Other Submissions",
    title: "Other Submission",
    required: false,
    url: ""
  };
}

/*******************************************************
 * ROW BUILDING
 *******************************************************/
function buildGenericRow(timestamp, formType, config, data) {
  const submittedBy =
    data.name ||
    data.submitted_by ||
    data.contact_name ||
    data.requester_name ||
    "";
  const contact =
    data.email || data.contact || data.phone || data.preferred_contact || "";

  return [
    timestamp,
    formType,
    data.form_title || config.title || "",
    cleanCellValue(submittedBy),
    cleanCellValue(contact),
    cleanCellValue(data.page_url || ""),
    cleanCellValue(buildSummary(data)),
    "",
    "",
    "",
    JSON.stringify(data)
  ];
}

function buildSummary(data) {
  const candidates = [
    data.request_title,
    data.title,
    data.what_is_betterbodies,
    data.homepage_focus,
    data.main_booking_action,
    data.show_upcoming_classes,
    data.google_sheet_fit,
    data.favorite_concept,
    data.hero_reaction,
    data.tagline_notes,
    data.asset_locations,
    data.requested_change,
    data.overall_feedback,
    data.notes,
    data.message,
    data.anything_else,
    data.final_notes,
    data.operations_notes
  ];

  for (let i = 0; i < candidates.length; i += 1) {
    const value = candidates[i];
    if (value === undefined || value === null) {
      continue;
    }
    const normalized = cleanCellValue(value);
    if (normalized.trim().length > 0) {
      return normalized.slice(0, 240);
    }
  }

  return "";
}

function cleanCellValue(value) {
  if (Array.isArray(value)) {
    return value.map(cleanCellValue).join(", ");
  }
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
}

/*******************************************************
 * STATUS API
 *******************************************************/
function getFeedbackStatus() {
  const spreadsheet = getSpreadsheet();
  const forms = Object.keys(FORM_CONFIG).map((formType) => {
    const config = FORM_CONFIG[formType];
    const sheet = spreadsheet.getSheetByName(config.sheetName);
    const lastRow = sheet ? sheet.getLastRow() : 0;
    const submittedCount = Math.max(lastRow - 1, 0);
    const submitted = submittedCount > 0;
    let lastSubmittedAt = "";
    if (submitted) {
      lastSubmittedAt = sheet.getRange(lastRow, 1).getDisplayValue();
    }
    return {
      formType,
      label: config.title,
      sheetName: config.sheetName,
      url: config.url,
      required: config.required,
      submitted,
      submittedCount,
      lastSubmittedAt,
      status: submitted ? "submitted" : "not_submitted"
    };
  });

  const requiredForms = forms.filter((item) => item.required);
  const requiredSubmitted = requiredForms.filter((item) => item.submitted);
  const optionalForms = forms.filter((item) => !item.required);
  const optionalSubmitted = optionalForms.filter((item) => item.submitted);

  return {
    ok: true,
    updatedAt: new Date().toISOString(),
    summary: {
      totalForms: forms.length,
      submittedForms: forms.filter((item) => item.submitted).length,
      requiredForms: requiredForms.length,
      requiredSubmitted: requiredSubmitted.length,
      optionalForms: optionalForms.length,
      optionalSubmitted: optionalSubmitted.length
    },
    forms
  };
}

/*******************************************************
 * SHEET HELPERS
 *******************************************************/
function getSpreadsheet() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === "PASTE_YOUR_SPREADSHEET_ID_HERE") {
    throw new Error("SPREADSHEET_ID is not configured.");
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  return sheet;
}

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() > 0) {
    return;
  }
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);

  // Optional formatting polish.
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#f4f4f5");
}

/*******************************************************
 * RESPONSES
 *******************************************************/
function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function javascriptResponse(callback, payload) {
  const safeCallback = sanitizeCallbackName(callback);
  return ContentService.createTextOutput(
    `${safeCallback}(${JSON.stringify(payload)});`
  ).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function sanitizeCallbackName(callback) {
  const value = String(callback || "");

  // Allows callback names like: betterBodiesStatus_123, app.statusCallback
  if (/^[A-Za-z_$][0-9A-Za-z_$]*(\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(value)) {
    return value;
  }
  return "callback";
}

/*******************************************************
 * UPCOMING EVENTS API
 *******************************************************/
const PUBLIC_CLASSES_SHEET_NAME = "Public Classes";

function getUpcomingEvents() {
  const spreadsheet = getSpreadsheet();
  const sheet = spreadsheet.getSheetByName(PUBLIC_CLASSES_SHEET_NAME);

  if (!sheet) {
    return {
      ok: true,
      updatedAt: new Date().toISOString(),
      events: []
    };
  }

  const values = sheet.getDataRange().getDisplayValues();

  if (values.length <= 1) {
    return {
      ok: true,
      updatedAt: new Date().toISOString(),
      events: []
    };
  }

  const headers = values[0].map(normalizeHeader);
  const rows = values.slice(1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events = rows
    .map((row, index) => {
      const item = rowToObject(headers, row);

      return {
        id: `class-${index + 1}`,
        status: item.status || "",
        title: item.class_title || "",
        classType: item.class_type || "",
        date: item.date || "",
        startTime: item.start_time || "",
        endTime: item.end_time || "",
        locationLabel: item.location_label || "",
        address: item.address || "",
        price: item.price || "",
        seatsAvailable: item.seats_available || "",
        registrationUrl: item.registration_url || "",
        notes: item.notes || "",
        public: item.public || "",
        sortOrder: item.sort_order || ""
      };
    })
    .filter((event) => {
      const isPublished = event.status.toLowerCase() === "published";
      const isPublic = ["yes", "true", "y"].includes(
        String(event.public).toLowerCase()
      );

      if (!isPublished || !isPublic || !event.date) {
        return false;
      }

      const eventDate = new Date(event.date);

      if (Number.isNaN(eventDate.getTime())) {
        return true;
      }

      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .sort((a, b) => {
      const aSort = Number(a.sortOrder || 9999);
      const bSort = Number(b.sortOrder || 9999);

      if (aSort !== bSort) {
        return aSort - bSort;
      }

      return new Date(a.date) - new Date(b.date);
    });

  return {
    ok: true,
    updatedAt: new Date().toISOString(),
    events
  };
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function rowToObject(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index] || "";
  });

  return obj;
}

/*******************************************************
 * PUBLIC SERVICES API
 *******************************************************/
const PUBLIC_SERVICES_SHEET_NAME = "Public Services";

function getPublicServices() {
  const spreadsheet = getSpreadsheet();
  const sheet = spreadsheet.getSheetByName(PUBLIC_SERVICES_SHEET_NAME);

  if (!sheet) {
    return {
      ok: true,
      updatedAt: new Date().toISOString(),
      services: []
    };
  }

  const values = sheet.getDataRange().getDisplayValues();

  if (values.length <= 1) {
    return {
      ok: true,
      updatedAt: new Date().toISOString(),
      services: []
    };
  }

  const headers = values[0].map(normalizeHeader);
  const rows = values.slice(1);

  const services = rows
    .map((row) => rowToObject(headers, row))
    .filter((item) => {
      const isActive = ["true", "yes", "1"].includes(
        String(item.active).trim().toLowerCase()
      );

      return isActive && item.key && item.title;
    })
    .map((item) => ({
      key: item.key,
      tier: Number(item.tier) || 0,
      active: true,
      title: item.title,
      icon: item.icon || "MessageSquare",
      description: item.description || "",
      who: item.who || "",
      cta: item.cta || "",
      leadIntent: item.lead_intent || "service_interest",
      modal: {
        title: item.modal_title || item.title,
        description: item.modal_description || ""
      },
      sort: Number(item.sort) || 0
    }))
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.sort - b.sort;
    });

  return {
    ok: true,
    updatedAt: new Date().toISOString(),
    services
  };
}

/*******************************************************
 * PUBLISH MENU
 *
 * Adds "Better Bodies > Publish services to site" to the sheet's UI.
 * publishToSite() fires a GitHub repository_dispatch event, which triggers the
 * deploy workflow (on: repository_dispatch: types: [publish-services]). This
 * keeps the whole prototype on GitHub (no Netlify dependency yet).
 *
 * Script Properties required (Project Settings > Script Properties):
 *   GITHUB_TOKEN  - fine-grained PAT scoped to THIS repo only, with
 *                   Contents: read/write (or Actions: read/write). It is a real
 *                   credential: treat as a secret and rotate if it ever leaks.
 *   GITHUB_REPO   - "owner/repo", e.g. "modernProteus/betterbodies-web"
 *
 * IMPORTANT: PUBLISH_EVENT_TYPE below MUST match the repository_dispatch
 * "types" value in .github/workflows/deploy.yml. If you named it differently
 * there, change it here to match.
 *
 * When you later migrate to Netlify, swap this function back to a build-hook
 * POST and remove the repository_dispatch trigger from the workflow.
 *******************************************************/

const PUBLISH_EVENT_TYPE = "publish-services";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Better Bodies")
    .addItem("Publish services to site", "publishToSite")
    .addToUi();
}

function publishToSite() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("GITHUB_TOKEN");
  const repo = props.getProperty("GITHUB_REPO");

  if (!token || !repo) {
    SpreadsheetApp.getActive().toast(
      "GITHUB_TOKEN or GITHUB_REPO is not set in Script Properties. Publish canceled.",
      "Better Bodies",
      8
    );
    return;
  }

  const response = UrlFetchApp.fetch(
    "https://api.github.com/repos/" + repo + "/dispatches",
    {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      payload: JSON.stringify({ event_type: PUBLISH_EVENT_TYPE }),
      muteHttpExceptions: true
    }
  );

  const code = response.getResponseCode();

  // GitHub's dispatches endpoint returns 204 No Content on success.
  if (code === 204) {
    SpreadsheetApp.getActive().toast(
      "Publishing. Site updates in a few minutes.",
      "Better Bodies",
      8
    );
  } else {
    SpreadsheetApp.getActive().toast(
      "Publish failed (HTTP " + code + "). Check GITHUB_TOKEN and GITHUB_REPO.",
      "Better Bodies",
      10
    );
  }
}
