import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, MapPin, Shield, Users } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { scrollToSection } from "@/lib/useUpcomingClasses";

export default function HeroSection({ heroImage, onRequestTraining }) {
  return (
    <section className="relative overflow-hidden bg-[#0f0f0f]" id="hero">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Hands-on BetterBodies training in Austin"
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f]/75 via-[#0f0f0f]/65 to-[#0f0f0f]" />
      </div>

      <div className="absolute left-0 right-0 top-0 h-1 bg-primary" />

      <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-28 md:pb-24 md:pt-36">
        <div className="mb-7">
          <BrandLogo size="lg" />
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/15 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_5px_rgba(215,25,32,0.22)]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Austin, Texas
          </span>
        </div>

        <h1 className="mb-5 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-6xl">
          Train your body.
          <br />
          <span className="text-primary">Prepare your mind.</span>
          <br />
          Protect your community.
        </h1>

        <p className="mb-4 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
          BetterBodies TX provides hands-on CPR, BLS, AED, first aid, crisis
          readiness, and personal safety training for individuals, workplaces,
          schools, churches, gyms, and community groups.
        </p>

        <p className="mb-8 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
          Helping Austin become safer, stronger, and more prepared.
        </p>

        <div className="mb-10 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() =>
              onRequestTraining?.({
                topic: "cpr",
                sourceSection: "hero",
                leadIntent: "general_training",
                serviceNeeded: "Not sure yet",
                ctaLabel: "Request Training",
              })
            }
            className="h-13 gap-2 rounded-md bg-primary px-7 text-base font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90"
          >
            Request Training
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollToSection("#schedule")}
            className="h-13 gap-2 rounded-md border-white/20 px-7 text-base font-medium text-white hover:bg-white/10"
          >
            <CalendarDays className="h-4 w-4" />
            View Upcoming Classes
          </Button>
        </div>

        <div className="flex flex-wrap gap-x-7 gap-y-2.5 text-sm text-white/55">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Austin-based</span>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Certified instruction</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>Individual + group options</span>
          </div>
        </div>
      </div>
    </section>
  );
}
