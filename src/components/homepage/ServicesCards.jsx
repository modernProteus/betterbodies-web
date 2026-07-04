import React, { useState } from "react";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServicesByTier, DELIVERY_MODES } from "@/data/services";
import ServiceTile from "./ServiceTile";

export default function ServicesCards({ onRequestTraining }) {
  const tier1Services = getServicesByTier(1);
  const tier2Services = getServicesByTier(2);
  const tier3Services = getServicesByTier(3);
  const allServices = [...tier1Services, ...tier2Services, ...tier3Services];

  const [expandedKey, setExpandedKey] = useState(
    () => tier1Services[0]?.key ?? null
  );

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

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {allServices.map((service) => (
            <ServiceTile
              key={service.key}
              service={service}
              isFeatured={service.tier === 1}
              isExpanded={expandedKey === service.key}
              onExpand={() => setExpandedKey(service.key)}
              onCollapse={() => setExpandedKey(null)}
            />
          ))}
        </div>

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
                Bring any of the above to your workplace, school, church, gym,
                agency, or community organization.
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
      </div>
    </section>
  );
}
