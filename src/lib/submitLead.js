const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzXq9f6f1MCbmrZeocsYdWXHeKFx0BWpIaExA-rqAOGw4YuJAn7d9Ruaq48rokRreBV/exec";

// Single source of truth for the lead payload shape sent to the Google Sheet.
// Both TrainingRequestModal (generic entry points) and the in-tile service
// form call this so the sheet keeps working no matter which UI triggered it.
export async function submitLead({ context = {}, form = {} }) {
  const payload = {
    form_type: "training_request",
    form_title: "Training Request",
    project_key: "betterbodies-feedback-2026",

    lead_type: context.leadIntent || "general_training",
    lead_intent: context.leadIntent || "general_training",
    lead_source: context.sourceSection || "",
    source_section: context.sourceSection || "",
    cta_label: context.ctaLabel || "",

    service_needed: form.service_needed || context.serviceNeeded || "",
    selected_class: context.selectedClass || "",
    selected_class_id: context.selectedClassId || "",

    name: form.name || "",
    email: form.email || "",
    phone: form.phone || "",
    preferred_contact_method: form.preferred_contact_method || "No preference",
    preferred_timing: form.preferred_timing || "",
    group_size: form.group_size || "",
    organization: form.organization || "",
    location: form.location || "",
    message: form.message || "",

    page_url: window.location.href,
    submitted_at: new Date().toISOString(),
    user_agent: navigator.userAgent,
  };

  await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  return payload;
}
