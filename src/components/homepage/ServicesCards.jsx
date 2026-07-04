import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  Heart,
  RotateCcw,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    title: "CPR Certification",
    serviceNeeded: "CPR Certification",
    icon: Heart,
    description:
      "Hands-on CPR training for individuals, caregivers, teachers, and professionals who need practical emergency response skills.",
    who: "Individuals, teachers, childcare providers, caregivers",
    cta: "Request CPR Training",
  },
  {
    title: "BLS Certification",
    serviceNeeded: "BLS Certification",
    icon: Shield,
    description:
      "Basic Life Support training for healthcare workers and professionals who need a higher level of emergency response readiness.",
    who: "Healthcare workers, care teams, professional responders",
    cta: "Request BLS Info",
  },
  {
    title: "AED + First Aid",
    serviceNeeded: "AED / First Aid",
    icon: RotateCcw,
    description:
      "Practical first aid and AED-focused training that helps people respond calmly and effectively before help arrives.",
    who: "Teams, workplaces, schools, churches, community groups",
    cta: "Ask About First Aid",
  },
  {
    title: "Crisis Readiness",
    serviceNeeded: "Crisis Readiness",
    icon: AlertTriangle,
    description:
      "Situational awareness and response skills for real-world moments that call for calm thinking and confident action.",
    who: "Organizations, agencies, mixed-role teams",
    cta: "Request Readiness Training",
  },
  {
    title: "Personal Safety",
    serviceNeeded: "Personal Safety / Self-Defense",
    icon: Eye,
    description:
      "Body awareness, personal safety, and self-defense-informed instruction rooted in practical confidence and prevention.",
    who: "Individuals, staff teams, gyms, community groups",
    cta: "Ask About Safety Training",
  },
  {
    title: "Personal & Event Protection",
    serviceNeeded: "Personal / Event Protection",
    icon: ShieldCheck,
    description:
      "Personal and event protection, plus active-shooter evacuation planning, delivered calmly and professionally to keep people and gatherings safe.",
    who: "Individuals, events, organizations, and teams needing on-site protection",
    cta: "Ask About Protection",
  },
  {
    title: "Group / On-Site Training",
    serviceNeeded: "Group / On-Site Training",
    icon: Shield,
    description:
      "Bring BetterBodies training to your workplace, school, church, gym, agency, or community organization.",
    who: "Businesses, schools, churches, gyms, nonprofits",
    cta: "Request Group Training",
  },
];

export default function ServicesCards({ onRequestTraining }) {
  const [activeIndex, setActiveIndex] = useState(null);

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
            BetterBodies brings together emergency response, CPR/BLS
            certification, personal safety, and group-ready training so people
            leave more confident, capable, and prepared.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isActive = activeIndex === index;

            return (
              <article
                key={service.title}
                className="reveal-on-scroll flex min-h-[300px] flex-col rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
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

                <p className="mt-1 text-sm text-slate-600">{service.who}</p>

                <div className="mt-auto pt-6">
                  <Button
                    className="w-full bg-slate-950 hover:bg-red-600"
                    onClick={() =>
                      onRequestTraining?.({
                        sourceSection: "services",
                        leadIntent:
                          service.serviceNeeded === "Group / On-Site Training"
                            ? "group_training"
                            : "service_interest",
                        serviceNeeded: service.serviceNeeded,
                        ctaLabel: service.cta,
                      })
                    }
                  >
                    {service.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
