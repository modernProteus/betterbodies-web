import React from "react";
import { ArrowRight, ExternalLink, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const HOMSTED_URL = "https://homsted.com";

export default function WellnessResources({ onRequestTraining }) {
  return (
    <section className="bg-slate-50 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Beyond Training
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
            Wellness &amp; community resources
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            Alongside CPR and safety training, Sheldon also offers holistic
            wellness services and points people toward a wider circle of
            resources he personally trusts.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Leaf className="h-5 w-5" aria-hidden="true" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-800">
              Holistic Wellness &amp; Apothecary
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              A personal offering from Sheldon: holistic remedies,
              loose-leaf herbs, essential oils, and artisanal wellness goods,
              informed by over 1,000 hours of holistic and herbal study. This
              is a wellness service, not part of our CPR or safety
              certifications.
            </p>

            <div className="mt-5">
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
                onClick={() =>
                  onRequestTraining?.({
                    sourceSection: "wellness",
                    leadIntent: "wellness_interest",
                    serviceNeeded: "Holistic Wellness / Apothecary",
                    ctaLabel: "Ask About Wellness",
                  })
                }
              >
                Ask About Wellness
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Leaf className="h-5 w-5" aria-hidden="true" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-800">
              Homsted
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              An apothecary and natural-remedy shop run by Sheldon's own
              teacher and mentor. It's not a BetterBodies service, but it's a
              resource Sheldon trusts and refers people to directly.
            </p>

            <p className="mt-3 text-xs text-slate-400">
              A trusted partner, independent from BetterBodies.
            </p>

            <div className="mt-5">
              <a
                href={HOMSTED_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-800"
              >
                Visit Homsted
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
