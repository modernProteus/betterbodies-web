import React, { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServiceIcon } from "@/lib/serviceIcons";

const CONTENT_VARIANTS = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

function getTeaser(service) {
  if (service.who) return service.who;

  const firstSentence = service.description?.split(".")[0];

  return firstSentence ? `${firstSentence}.` : "";
}

export default function ServiceAccordionRow({
  service,
  isOpen,
  onToggle,
  onRequestPrimary,
  onRequestSecondary,
}) {
  const shouldReduceMotion = useReducedMotion();
  const headerId = useId();
  const panelId = useId();
  const Icon = getServiceIcon(service.icon);
  const duration = shouldReduceMotion ? 0 : 0.3;
  const staggerChildren = shouldReduceMotion ? 0 : 0.06;

  return (
    <div>
      <button
        type="button"
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-5 text-left md:px-6"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-600 text-white">
          <Icon className="h-5 w-5" />
        </div>

        <span className="min-w-0 flex-1">
          <span className="block text-base font-extrabold text-slate-950 md:text-lg">
            {service.title}
          </span>
          <span className="mt-0.5 block truncate text-sm text-slate-500">
            {getTeaser(service)}
          </span>
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          className="shrink-0 text-slate-400"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren } },
              }}
              className="px-5 pb-6 pl-[4.5rem] pr-2 md:px-6 md:pl-[4.75rem]"
            >
              <motion.p
                variants={CONTENT_VARIANTS}
                transition={{ duration }}
                className="text-sm leading-6 text-slate-700"
              >
                {service.description}
              </motion.p>

              <motion.p
                variants={CONTENT_VARIANTS}
                transition={{ duration }}
                className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Best for
              </motion.p>

              <motion.p
                variants={CONTENT_VARIANTS}
                transition={{ duration }}
                className="mt-1 text-sm text-slate-600"
              >
                {service.who}
              </motion.p>

              <motion.div
                variants={CONTENT_VARIANTS}
                transition={{ duration }}
                className="mt-5 flex flex-wrap gap-3"
              >
                <Button
                  className="bg-slate-950 hover:bg-red-600"
                  onClick={onRequestPrimary}
                >
                  {service.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {service.secondaryCta && (
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                    onClick={onRequestSecondary}
                  >
                    {service.secondaryCta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
