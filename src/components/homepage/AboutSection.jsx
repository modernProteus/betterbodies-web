import React from "react";
import {
  ArrowRight,
  Dumbbell,
  Building2,
  Heart,
  ShieldCheck,
  Award,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/useUpcomingClasses";

const sheldonImage = `${
  import.meta.env.BASE_URL
}assets/images/sheldon/Sheldon.png`;

// Dated, verifiable facts only. No round-number tenure claims: the old
// sources disagree with each other, so dates are what carry the story.
const credentials = [
  { icon: Dumbbell, year: "1994", text: "Master Personal Trainer" },
  {
    icon: Heart,
    year: "2014",
    text: "American Red Cross CPR Instructor (Adult, Child, Infant, AED)",
  },
  {
    icon: ShieldCheck,
    year: "2018",
    text: "Active Shooter Evacuation & Personal Protection / Self-Defense certified",
  },
  { icon: Award, year: null, text: "CPI Crisis Prevention certified" },
  { icon: Languages, year: null, text: "Bilingual instruction available" },
  { icon: Building2, year: "2008", text: "BetterBodies established" },
];

// Text only, no logos, until permission is confirmed for each organization.
const partners = [
  "Austin Urban League",
  "Worksource",
  "Child Inc",
  "Boys & Girls Clubs",
  "Manor ISD",
  "Elgin ISD",
  "Texas Empowerment Charter School",
  "Southwest Keys",
  "East Austin College Prep",
  "Habits Group LLC",
  "24 Hour Fitness",
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white scroll-mt-28">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr] lg:items-start">
          <div className="reveal-on-scroll mx-auto w-full max-w-[220px] lg:mx-0">
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-red-600/10 blur-xl" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-lg">
                <img
                  src={sheldonImage}
                  alt="Sheldon Williams, BetterBodies TX founder and lead instructor"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <p className="mt-3 text-center text-sm font-bold text-slate-950 lg:text-left">
              Sheldon Williams
            </p>
            <p className="text-center text-xs text-slate-500 lg:text-left">
              Founder & Lead Instructor
            </p>
          </div>

          <div className="reveal-on-scroll">
            <p className="text-sm font-bold uppercase tracking-wide text-red-600">
              Meet Sheldon
            </p>

            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950">
              For Sheldon Williams, BetterBodies is a calling, not a business.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              Sheldon started BetterBodies to bring his training to more of
              the community, on his own terms. He wanted people to be coached
              by someone who takes their health personally and who pushes
              them to, and past, what they thought they could do. That is
              still the whole idea today.
            </p>

            <p className="mt-4 text-lg leading-8 text-slate-700">
              He takes it personally. Every class is built to be a
              no-judgment, safe space, because helping and healing his
              community is not a slogan to Sheldon, it is the job. Energetic,
              direct, and honest in the room, he wants every person who
              trains with him to leave knowing they can do anything they put
              their mind to.
            </p>

            <blockquote className="mt-6 border-l-4 border-red-600 pl-5">
              <p className="text-xl font-bold italic leading-relaxed text-slate-950">
                "This is personal to me. It's embedded in my spirit and my
                heart to help others."
              </p>
              <cite className="mt-2 block text-sm font-semibold not-italic text-slate-500">
                Sheldon Williams
              </cite>
            </blockquote>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Dated & Verifiable
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {credentials.map((credential) => (
                  <li
                    key={credential.text}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                  >
                    <credential.icon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <span className="text-sm text-slate-700">
                      {credential.year && (
                        <span className="font-bold text-slate-950">
                          Since {credential.year}:{" "}
                        </span>
                      )}
                      {credential.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Trusted By
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {partners.join(" · ")}
              </p>
            </div>

            <Button
              className="mt-8 bg-red-600 hover:bg-red-700"
              onClick={() => scrollToSection("#contact")}
            >
              Request Class Info
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
