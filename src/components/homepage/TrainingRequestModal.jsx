import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzXq9f6f1MCbmrZeocsYdWXHeKFx0BWpIaExA-rqAOGw4YuJAn7d9Ruaq48rokRreBV/exec";

const DEFAULT_CONTEXT = {
  sourceSection: "",
  leadIntent: "general_training",
  serviceNeeded: "Not sure yet",
  selectedClass: "",
  selectedClassId: "",
  ctaLabel: "Request Training",
};

const SERVICE_OPTIONS = [
  "Not sure yet",
  "CPR Certification",
  "BLS Certification",
  "AED / First Aid",
  "Group / On-Site Training",
  "Personal Safety / Self-Defense",
  "Crisis Readiness",
  "Personal / Event Protection",
  "Holistic Wellness / Apothecary",
  "Other",
];

const CONTACT_METHODS = ["No preference", "Email", "Phone", "Text"];

function buildInitialForm(context) {
  return {
    name: "",
    email: "",
    phone: "",
    preferred_contact_method: "No preference",
    service_needed: context.serviceNeeded || "Not sure yet",
    preferred_timing: "",
    group_size: "",
    organization: "",
    location: "",
    message: "",
  };
}

function getModalTitle(context) {
  if (context.leadIntent === "specific_class") return "Request this class";
  if (context.leadIntent === "group_training") {
    return "Request group or on-site training";
  }
  if (context.serviceNeeded && context.serviceNeeded !== "Not sure yet") {
    return `Request ${context.serviceNeeded}`;
  }
  return "Request BetterBodies training";
}

function getModalDescription(context) {
  if (context.leadIntent === "specific_class") {
    return "Send your contact info and Sheldon or Juana will follow up about this class.";
  }

  if (context.leadIntent === "group_training") {
    return "Tell us about your group, organization, timing, and training needs.";
  }

  return "Tell us what kind of training you are looking for, and Sheldon or Juana will follow up.";
}

export default function TrainingRequestModal({ open, context = {}, onClose }) {
  const requestContext = useMemo(
    () => ({
      ...DEFAULT_CONTEXT,
      ...context,
    }),
    [context]
  );

  const [form, setForm] = useState(() => buildInitialForm(requestContext));
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm(buildInitialForm(requestContext));
    setStatus("idle");
    setStatusMessage("");
  }, [open, requestContext]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setStatus("sending");
    setStatusMessage("Sending request...");

    const payload = {
      form_type: "training_request",
      form_title: "Training Request",
      project_key: "betterbodies-feedback-2026",

      lead_type: requestContext.leadIntent || "general_training",
      lead_intent: requestContext.leadIntent || "general_training",
      lead_source: requestContext.sourceSection || "",
      source_section: requestContext.sourceSection || "",
      cta_label: requestContext.ctaLabel || "",

      service_needed: form.service_needed || requestContext.serviceNeeded || "",
      selected_class: requestContext.selectedClass || "",
      selected_class_id: requestContext.selectedClassId || "",

      name: form.name,
      email: form.email,
      phone: form.phone,
      preferred_contact_method: form.preferred_contact_method,
      preferred_timing: form.preferred_timing,
      group_size: form.group_size,
      organization: form.organization,
      location: form.location,
      message: form.message,

      page_url: window.location.href,
      submitted_at: new Date().toISOString(),
      user_agent: navigator.userAgent,
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      setStatus("sent");
      setStatusMessage(
        "Request sent. Sheldon or Juana will follow up with you soon."
      );
      setForm(buildInitialForm(requestContext));
    } catch (error) {
      console.error("Training request failed:", error);
      setStatus("error");
      setStatusMessage(
        "Sorry, the request could not be sent. Please try again or contact BetterBodies directly."
      );
    }
  };

  const isSending = status === "sending";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="training-request-title"
      onMouseDown={handleBackdropClick}
    >
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-red-600">
              BetterBodies TX
            </p>

            <h2
              id="training-request-title"
              className="mt-1 text-2xl font-extrabold text-slate-950"
            >
              {getModalTitle(requestContext)}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {getModalDescription(requestContext)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close request form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 p-5">
          {requestContext.selectedClass && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-extrabold text-red-800">
                    You’re asking about:
                  </p>
                  <p className="mt-1 text-sm text-red-950">
                    {requestContext.selectedClass}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-800">
              Name
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
                placeholder="Your name"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-800">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-800">
              Phone
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
                placeholder="Best phone number"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-800">
              Preferred contact method
              <select
                value={form.preferred_contact_method}
                onChange={(event) =>
                  updateField("preferred_contact_method", event.target.value)
                }
                className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
              >
                {CONTACT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-bold text-slate-800">
            I’m interested in
            <select
              value={form.service_needed}
              onChange={(event) =>
                updateField("service_needed", event.target.value)
              }
              className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
            >
              {SERVICE_OPTIONS.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-800">
              Preferred timing
              <input
                value={form.preferred_timing}
                onChange={(event) =>
                  updateField("preferred_timing", event.target.value)
                }
                className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
                placeholder="This week, next month, specific date..."
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-800">
              Group size
              <input
                value={form.group_size}
                onChange={(event) =>
                  updateField("group_size", event.target.value)
                }
                className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
                placeholder="1, 5, 20, not sure..."
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-800">
              Organization
              <input
                value={form.organization}
                onChange={(event) =>
                  updateField("organization", event.target.value)
                }
                className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
                placeholder="Company, school, church, group..."
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-800">
              Location
              <input
                value={form.location}
                onChange={(event) =>
                  updateField("location", event.target.value)
                }
                className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
                placeholder="Austin, on-site, online, TBD..."
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-bold text-slate-800">
            Message
            <textarea
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              className="min-h-28 rounded-xl border border-slate-300 px-3 py-2 font-normal"
              placeholder="Tell us what you need, who the training is for, or any questions you have."
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="text-sm text-slate-600"
              role="status"
              aria-live="polite"
            >
              {statusMessage || "Your request will be saved for follow-up."}
            </p>

            <Button
              type="submit"
              disabled={isSending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSending ? "Sending..." : "Send Request"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
