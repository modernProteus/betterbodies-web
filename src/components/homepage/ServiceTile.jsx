import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getServiceIcon } from "@/lib/serviceIcons";
import { submitLead } from "@/lib/submitLead";

function buildForm() {
  return { name: "", email: "", phone: "", message: "" };
}

export default function ServiceTile({
  service,
  isExpanded,
  isFeatured,
  onExpand,
  onCollapse,
  sourceSection = "services",
}) {
  const shouldReduceMotion = useReducedMotion();
  const duration = shouldReduceMotion ? 0 : 0.3;

  const [mode, setMode] = useState(isExpanded ? "detail" : null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [form, setForm] = useState(buildForm);
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const pillButtonRef = useRef(null);
  const nameInputRef = useRef(null);
  const wasExpanded = useRef(isExpanded);

  const panelId = useId();
  const Icon = getServiceIcon(service.icon);

  // Collapsing back to a pill resets everything; expanding fresh starts at detail.
  useEffect(() => {
    if (wasExpanded.current && !isExpanded) {
      setMode(null);
      setActiveRequest(null);
      setForm(buildForm());
      setStatus("idle");
      setStatusMessage("");
      pillButtonRef.current?.focus();
    }

    if (!wasExpanded.current && isExpanded) {
      setMode("detail");
    }

    wasExpanded.current = isExpanded;
  }, [isExpanded]);

  useEffect(() => {
    if (mode === "form" && status !== "sent") {
      nameInputRef.current?.focus();
    }
  }, [mode, status]);

  const displayState = !isExpanded ? "pill" : mode;

  const handleToggle = () => {
    if (isExpanded) {
      onCollapse();
    } else {
      onExpand();
    }
  };

  const openForm = (request) => {
    setActiveRequest(request);
    setMode("form");
  };

  const handlePrimary = () =>
    openForm({
      topic: service.key,
      sourceSection,
      leadIntent: service.leadIntent,
      serviceNeeded: service.primaryServiceLabel ?? service.title,
      ctaLabel: service.cta,
    });

  const handleSecondary = () =>
    openForm({
      topic: service.key,
      sourceSection,
      leadIntent: service.secondaryLeadIntent,
      serviceNeeded: service.secondaryServiceLabel,
      ctaLabel: service.secondaryCta,
    });

  const backToDetail = () => {
    setMode("detail");
    setActiveRequest(null);
    setStatus("idle");
    setStatusMessage("");
  };

  const updateField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("sending");
    setStatusMessage("Sending...");

    try {
      await submitLead({ context: activeRequest, form });
      setStatus("sent");
      setStatusMessage("Thanks, we'll follow up soon.");
    } catch (error) {
      console.error("Service tile request failed:", error);
      setStatus("error");
      setStatusMessage(
        "Sorry, that didn't send. Please try again or contact us directly."
      );
    }
  };

  const isSending = status === "sending";
  const teaser = service.who || service.description?.split(".")[0];

  return (
    <motion.div
      layout={!shouldReduceMotion && displayState !== "form"}
      transition={{ duration, layout: { duration } }}
      className={cn(
        "flex flex-col rounded-3xl border p-6 md:p-7",
        isFeatured
          ? "border-red-700 bg-red-600 text-white"
          : "border-slate-200 bg-slate-50 text-slate-950",
        isExpanded && "lg:col-span-3",
        !isExpanded && isFeatured && "sm:col-span-2 lg:col-span-2",
        displayState === "form" &&
          "fixed inset-0 z-50 overflow-y-auto rounded-none p-5 md:static md:z-auto md:overflow-visible md:rounded-3xl md:p-7"
      )}
    >
      <button
        ref={pillButtonRef}
        type="button"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={handleToggle}
        className="flex w-full items-center gap-4 text-left"
      >
        <div
          className={cn(
            "grid shrink-0 place-items-center rounded-2xl",
            isFeatured ? "bg-white/15 text-white" : "bg-red-600 text-white",
            isExpanded ? "h-12 w-12" : "h-11 w-11"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <span className="min-w-0 flex-1">
          {isFeatured && !isExpanded && (
            <span className="mb-1 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white/80">
              Start here
            </span>
          )}
          <span
            className={cn(
              "block font-extrabold",
              isFeatured ? "text-white" : "text-slate-950",
              isExpanded ? "text-lg md:text-xl" : "text-base"
            )}
          >
            {service.title}
          </span>
          {!isExpanded && (
            <span
              className={cn(
                "mt-0.5 block truncate text-sm",
                isFeatured ? "text-white/75" : "text-slate-500"
              )}
            >
              {teaser}
            </span>
          )}
        </span>

        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          className={cn(
            "shrink-0",
            isFeatured ? "text-white/70" : "text-slate-400"
          )}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            id={panelId}
            role="region"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration, ease: "easeInOut" }}
            className={cn(
              "overflow-hidden",
              displayState === "form" && "md:overflow-visible"
            )}
          >
            {/* Plain conditional (not AnimatePresence) so detail<->form never
                relies on animating away from height:"auto" on exit, which
                framer-motion cannot resolve. `layout` smooths the resize. */}
            <motion.div layout={!shouldReduceMotion}>
              {displayState === "detail" && (
                <div className="pt-5">
                  <p
                    className={cn(
                      "text-sm leading-6",
                      isFeatured ? "text-white/90" : "text-slate-700"
                    )}
                  >
                    {service.description}
                  </p>

                  <p
                    className={cn(
                      "mt-4 text-xs font-bold uppercase tracking-wide",
                      isFeatured ? "text-white/60" : "text-slate-500"
                    )}
                  >
                    Best for
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm",
                      isFeatured ? "text-white/85" : "text-slate-600"
                    )}
                  >
                    {service.who}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      className={
                        isFeatured
                          ? "bg-white text-red-700 hover:bg-white/90"
                          : "bg-slate-950 hover:bg-red-600"
                      }
                      onClick={handlePrimary}
                    >
                      {service.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    {service.secondaryCta && (
                      <Button
                        variant="outline"
                        className={
                          isFeatured
                            ? "border-white/40 text-white hover:bg-white/10"
                            : "border-slate-300 text-slate-700 hover:bg-slate-100"
                        }
                        onClick={handleSecondary}
                      >
                        {service.secondaryCta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {displayState === "form" && (
                <div className="pt-5">
                  {status === "sent" ? (
                    <div className="rounded-2xl border border-dashed border-current/20 p-5">
                      <p
                        className={cn(
                          "font-bold",
                          isFeatured ? "text-white" : "text-slate-950"
                        )}
                      >
                        {statusMessage}
                      </p>
                      <button
                        type="button"
                        onClick={backToDetail}
                        className={cn(
                          "mt-3 text-sm font-semibold underline underline-offset-4",
                          isFeatured ? "text-white/90" : "text-slate-600"
                        )}
                      >
                        Back to details
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p
                          className={cn(
                            "text-xs font-bold uppercase tracking-wide",
                            isFeatured ? "text-white/70" : "text-slate-500"
                          )}
                        >
                          Requesting: {activeRequest?.serviceNeeded}
                        </p>

                        <button
                          type="button"
                          onClick={backToDetail}
                          className={cn(
                            "text-sm font-semibold underline underline-offset-4",
                            isFeatured ? "text-white/90" : "text-slate-600"
                          )}
                        >
                          Back to details
                        </button>
                      </div>

                      <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <label
                            className={cn(
                              "grid gap-2 text-sm font-bold",
                              isFeatured ? "text-white" : "text-slate-800"
                            )}
                          >
                            Name
                            <input
                              ref={nameInputRef}
                              required
                              value={form.name}
                              onChange={(event) =>
                                updateField("name", event.target.value)
                              }
                              className="rounded-xl border border-slate-300 px-3 py-2 font-normal text-slate-950"
                              placeholder="Your name"
                            />
                          </label>

                          <label
                            className={cn(
                              "grid gap-2 text-sm font-bold",
                              isFeatured ? "text-white" : "text-slate-800"
                            )}
                          >
                            Email
                            <input
                              type="email"
                              value={form.email}
                              onChange={(event) =>
                                updateField("email", event.target.value)
                              }
                              className="rounded-xl border border-slate-300 px-3 py-2 font-normal text-slate-950"
                              placeholder="you@example.com"
                            />
                          </label>
                        </div>

                        <label
                          className={cn(
                            "grid gap-2 text-sm font-bold",
                            isFeatured ? "text-white" : "text-slate-800"
                          )}
                        >
                          Phone
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(event) =>
                              updateField("phone", event.target.value)
                            }
                            className="rounded-xl border border-slate-300 px-3 py-2 font-normal text-slate-950"
                            placeholder="Best phone number"
                          />
                        </label>

                        <label
                          className={cn(
                            "grid gap-2 text-sm font-bold",
                            isFeatured ? "text-white" : "text-slate-800"
                          )}
                        >
                          Message
                          <textarea
                            value={form.message}
                            onChange={(event) =>
                              updateField("message", event.target.value)
                            }
                            className="min-h-24 rounded-xl border border-slate-300 px-3 py-2 font-normal text-slate-950"
                            placeholder="Anything Sheldon or Juana should know?"
                          />
                        </label>

                        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm" role="status" aria-live="polite">
                            <span
                              className={
                                status === "error"
                                  ? "font-semibold text-red-200"
                                  : isFeatured
                                  ? "text-white/70"
                                  : "text-slate-500"
                              }
                            >
                              {statusMessage || "We only use this to follow up."}
                            </span>
                          </p>

                          <Button
                            type="submit"
                            disabled={isSending}
                            className={
                              isFeatured
                                ? "bg-white text-red-700 hover:bg-white/90"
                                : "bg-red-600 hover:bg-red-700"
                            }
                          >
                            {isSending ? "Sending..." : "Send Request"}
                            <Send className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </form>

                      <button
                        type="button"
                        onClick={onCollapse}
                        className={cn(
                          "mt-4 text-xs underline underline-offset-4",
                          isFeatured ? "text-white/60" : "text-slate-400"
                        )}
                      >
                        Not what you meant? See all services
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
