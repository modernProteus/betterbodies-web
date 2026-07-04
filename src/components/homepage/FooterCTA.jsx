import React from "react";
import { ArrowRight, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandLogo from "./BrandLogo";
import { scrollToSection } from "@/lib/useUpcomingClasses";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/betterbodiescpr/",
    icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/BetterBodiesATX",
    icon: Facebook,
  },
];

export default function FooterCTA({ onRequestTraining }) {
  return (
    <footer className="bg-[#0f0f0f] pb-24 pt-16 text-white md:pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <BrandLogo size="md" />

            <h2 className="mt-8 text-3xl font-extrabold tracking-tight md:text-4xl">
              Ready to train, prepare, and protect your community?
            </h2>

            <p className="mt-4 max-w-2xl text-white/70">
              Request CPR, BLS, first aid, personal safety, or group training
              information and Sheldon or Juana will follow up with available
              options.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() =>
                  onRequestTraining?.({
                    sourceSection: "footer_cta",
                    leadIntent: "general_training",
                    serviceNeeded: "Not sure yet",
                    ctaLabel: "Request Training",
                  })
                }
              >
                Request Training
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => scrollToSection("#schedule")}
              >
                View Schedule
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-xl font-extrabold">BetterBodies TX</h3>

            <div className="mt-5 space-y-4 text-sm text-white/70">
              <p className="flex gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-red-400" />
                <span>Austin, Texas and surrounding communities</span>
              </p>

              <p className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-red-400" />
                <a href="tel:5126630733" className="hover:text-white">
                  (512) 663-0733
                </a>
              </p>

              <p className="flex gap-3">
                <Mail className="h-5 w-5 shrink-0 text-red-400" />
                <a
                  href="mailto:betterbodiescpr@gmail.com"
                  className="hover:text-white"
                >
                  betterbodiescpr@gmail.com
                </a>
              </p>
            </div>

            <div className="mt-6 flex gap-3 border-t border-white/10 pt-5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/30 hover:text-white"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <p className="mt-5 text-xs text-white/45">
              Preview site prepared for BetterBodies brand, website, and
              workflow review.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
