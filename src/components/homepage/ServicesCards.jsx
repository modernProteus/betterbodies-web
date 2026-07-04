import React, { useState } from "react";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServicesByTier, DELIVERY_MODES } from "@/data/services";
import { getServiceIcon } from "@/lib/serviceIcons";

const TIER_GROUPS = [
  { tier: 1, label: "Start here" },
  { tier: 2, label: "Where BetterBodies began" },
  { tier: 3, label: "Go further" },
];

export default function ServicesCards({ onRequestTraining }) {
  const [activeKey, setActiveKey] = useState(null);

  const requestService = (service) =>
    onRequestTraining?.({
      topic: service.key,
      sourceSection: "services",
      leadIntent: service.leadIntent,
      serviceNeeded: service.title,
      ctaLabel: service.cta,
    });

  const requestGroupTraining = () => {
    const group = DELIVERY_MODES.group;

    onRequestTraining?.({
      topic: "group",
      sourceSection: "services",
      leadIntent: group.leadIntent,
      serviceNeeded: group.title,
      ctaLabel: group.cta,
    });
  };

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-3xl reveal-on-scroll">
          <p className="text-sm font-bold uppercase tracking-wide text-red-600">
            Training Paths
          </p>

          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
            Practical training for real-life readiness.
          </h2>

          <p className="mt-4 text-slate-700">
            BetterBodies brings together fitness training, emergency response,
            CPR/BLS certification, personal safety, and group-ready training
            so people leave more confident, capable, and prepared.
          </p>
        </div>

        {TIER_GROUPS.map(({ tier, label }) => {
          const tierServices = getServicesByTier(tier);

          if (tierServices.length === 0) return null;

          return (
            <div key={tier} className="mt-12">
              <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                {label}
              </p>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {tierServices.map((service) => {
                  const Icon = getServiceIcon(service.icon);
                  const isActive = activeKey === service.key;

                  return (
                    <article
                      key={service.key}
                      className="reveal-on-scroll flex min-h-[300px] flex-col rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                      onMouseEnter={() => setActiveKey(service.key)}
                      onMouseLeave={() => setActiveKey(null)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600 text-white">
                          <Icon className="h-6 w-6" />
                        </div>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                          {isActive ? "Ready" : "Training"}
                        </span>
                      </div>

                      <h3 className="mt-5 text-xl font-extrabold text-slate-950">
                        {service.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {service.description}
                      </p>

                      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Best for
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {service.who}
                      </p>

                      <div className="mt-auto pt-6">
                        <Button
                          className="w-full bg-slate-950 hover:bg-red-600"
                          onClick={() => requestService(service)}
                        >
                          {service.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {tier === 3 && (
                <div className="mt-5 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white">
                      <Users className="h-6 w-6" />
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-slate-950">
                        {DELIVERY_MODES.group.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Bring any of the above to your workplace, school,
                        church, gym, agency, or community organization.
                      </p>
                    </div>
                  </div>

                  <Button
                    className="bg-slate-950 hover:bg-red-600 sm:shrink-0"
                    onClick={requestGroupTraining}
                  >
                    {DELIVERY_MODES.group.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
