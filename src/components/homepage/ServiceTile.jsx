import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getServiceIcon } from "@/lib/serviceIcons";
import { submitLead } from "@/lib/submitLead";

function buildForm() {
  return { name: "", email: "", phone: "", message: "" };
}

function hasUnsavedInput(form) {
  return Object.values(form).some((value) => value.trim() !== "");
}

export default function ServiceTile({
  service,
  isExpanded,
  isFeatured,
  showHint = false,
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

  const tileRef = useRef(null);
  const pillButtonRef = useRef(null);
  const nameInputRef = useRef(null);
  const wasExpanded = useRef(isExpanded);

  // Mirrors of the latest mode/status/form for the IntersectionObserver
  // effect below, so typing doesn't tear down and recreate the observer
  // (which would reset its "has this been visible yet" memory) on every
  // keystroke.
  const modeRef = useRef(mode);
  const statusRef = useRef(status);
  const formRef = useRef(form);
  modeRef.current = mode;
  statusRef.current = status;
  formRef.current = form;

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
      pillButtonRef.current?.focus({ preventScroll: true });
    }

    if (!wasExpanded.current && isExpanded) {
      setMode("detail");
    }

    wasExpanded.current = isExpanded;
  }, [isExpanded]);

  useEffect(() => {
    if (mode === "form" && status !== "sent") {
      nameInputRef.current?.focus({ preventScroll: true });
    }
  }, [mode, status]);

  // Collapse an expanded tile once it scrolls fully out of view, so coming
  // back to the section is clean. Only fires on a visible -> not-visible
  // transition (never on mount for a tile that starts below the fold, like
  // the default-open CPR tile), never while any part is visible, and never
  // discards a half-typed form.
  useEffect(() => {
    if (!isExpanded) return;

    const node = tileRef.current;
    if (!node) return;

    let hasBeenVisible = false;
    let observer;
    let armed = false;

    // Wait a frame before arming: on mount (e.g. after a reload that
    // restores a scrolled position), layout is still settling and can
    // report a transient, meaningless intersection change. Only real
    // scroll-driven transitions after this point should count.
    const raf = requestAnimationFrame(() => {
      armed = true;
      const entries = observer.takeRecords();
      const latest = entries[entries.length - 1];
      if (latest?.isIntersecting) hasBeenVisible = true;
    });

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasBeenVisible = true;
          return;
        }
        if (!armed || !hasBeenVisible) return;
        if (
          modeRef.current === "form" &&
          statusRef.current !== "sent" &&
          hasUnsavedInput(formRef.current)
        ) {
          return;
        }
        onCollapse();
      },
      { threshold: 0 }
    );

    observer.observe(node);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [isExpanded, onCollapse]);

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

  const detailBlock = (
    <div>
      <p className="text-sm leading-6 text-slate-700">{service.description}</p>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
        Best for
      </p>
      <p className="mt-1 text-sm text-slate-600">{service.who}</p>
    </div>
  );

  return (
    <motion.div
      ref={tileRef}
      layout={!shouldReduceMotion && displayState !== "form"}
      transition={{ duration, layout: { duration } }}
      className={cn(
        "flex flex-col rounded-3xl p-6 text-slate-950 md:p-7",
        isFeatured
          ? "border-2 border-red-600 bg-white"
          : "border border-slate-200 bg-slate-50",
        isExpanded && "lg:col-span-3",
        !isExpanded && isFeatured && "sm:col-span-2 lg:col-span-2",
        !isExpanded && "min-h-[180px] justify-center",
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
        className={cn(
          "flex w-full text-left",
          !isExpanded
            ? "cursor-pointer flex-col items-center gap-2 text-center transition hover:-translate-y-0.5 hover:shadow-md rounded-2xl"
            : "items-center gap-4"
        )}
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-600 text-white">
          <Icon className="h-6 w-6" />
        </div>

        {!isExpanded ? (
          <>
            <span
              className={cn(
                "block text-base text-slate-950",
                isFeatured ? "font-black" : "font-extrabold"
              )}
            >
              {service.title}
            </span>
            <span className="line-clamp-2 block text-sm text-slate-500">
              {teaser}
            </span>
            <span className="mt-1 grid h-6 w-6 place-items-center rounded-full border border-slate-300 text-slate-400">
              <Plus className="h-3.5 w-3.5" />
            </span>
            {showHint && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-red-500/70">
                Tap to explore
              </span>
            )}
          </>
        ) : (
          <>
            <span
              className={cn(
                "min-w-0 flex-1 text-lg font-extrabold text-slate-950 md:text-xl",
                isFeatured && "font-black"
              )}
            >
              {service.title}
            </span>

            <motion.span
              animate={{ rotate: 180 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              className="shrink-0 text-slate-400"
            >
              <ChevronDown className="h-5 w-5" />
            </motion.span>
          </>
        )}
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
                  {detailBlock}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      onClick={handlePrimary}
                    >
                      {service.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    {service.secondaryCta && (
                      <Button
                        variant="outline"
                        className="border-slate-300 text-slate-700 hover:bg-slate-100"
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
                    <div className="rounded-2xl border border-dashed border-slate-300 p-5">
                      <p className="font-bold text-slate-950">
                        {statusMessage}
                      </p>
                      <button
                        type="button"
                        onClick={backToDetail}
                        className="mt-3 text-sm font-semibold text-slate-600 underline underline-offset-4"
                      >
                        Back to details
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Requesting: {activeRequest?.serviceNeeded}
                          </p>

                          <div className="mt-3">{detailBlock}</div>

                          <button
                            type="button"
                            onClick={backToDetail}
                            className="mt-4 text-sm font-semibold text-slate-600 underline underline-offset-4"
                          >
                            Back to details
                          </button>
                        </div>

                        <form
                          onSubmit={handleSubmit}
                          className="grid gap-4 md:border-l md:border-slate-200 md:pl-6"
                        >
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="grid gap-2 text-sm font-bold text-slate-800">
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

                            <label className="grid gap-2 text-sm font-bold text-slate-800">
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

                          <label className="grid gap-2 text-sm font-bold text-slate-800">
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

                          <label className="grid gap-2 text-sm font-bold text-slate-800">
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
                            <p
                              className="text-sm"
                              role="status"
                              aria-live="polite"
                            >
                              <span
                                className={
                                  status === "error"
                                    ? "font-semibold text-red-600"
                                    : "text-slate-500"
                                }
                              >
                                {statusMessage ||
                                  "We only use this to follow up."}
                              </span>
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

                      <button
                        type="button"
                        onClick={onCollapse}
                        className="mt-5 text-xs text-slate-400 underline underline-offset-4"
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
