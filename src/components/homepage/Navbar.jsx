import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import BrandLogo from "./BrandLogo";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Schedule", href: "#schedule" },
  { label: "Group Training", href: "#urgency" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar({ onRequestTraining }) {
  const [open, setOpen] = useState(false);

  const scrollTo = (href) => {
    setOpen(false);

    const el = document.querySelector(href);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const requestTraining = (sourceSection = "navbar") => {
    setOpen(false);

    onRequestTraining?.({
      sourceSection,
      leadIntent: "general_training",
      serviceNeeded: "Not sure yet",
      ctaLabel: "Request Training",
    });
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#111111]">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <button
          type="button"
          onClick={() => scrollTo("#hero")}
          aria-label="Back to top"
          className="inline-flex items-center"
        >
          <BrandLogo size="sm" />
        </button>

        {/* Desktop */}
        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => scrollTo(link.href)}
              className="text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </button>
          ))}

          <Button
            size="sm"
            onClick={() => requestTraining("navbar_desktop")}
            className="h-9 rounded-md bg-primary px-5 font-semibold text-white hover:bg-primary/90"
          >
            Request Training
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href="tel:5126630733"
            className="p-2 text-white/60 hover:text-white"
            aria-label="Call BetterBodies"
          >
            <Phone className="h-5 w-5" />
          </a>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="p-2 text-white"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-[#111111] md:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => scrollTo(link.href)}
                  className="block w-full border-b border-white/5 py-3 text-left text-base font-medium text-white/70 last:border-0 hover:text-white"
                >
                  {link.label}
                </button>
              ))}

              <Button
                onClick={() => requestTraining("navbar_mobile")}
                className="mt-3 h-12 w-full rounded-md bg-primary font-semibold text-white hover:bg-primary/90"
              >
                Request Training
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
