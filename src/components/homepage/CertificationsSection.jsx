import React from "react";
import {
  ShieldCheck,
  Award,
  BadgeCheck,
  Heart,
  Dumbbell,
  Building2,
  Languages,
} from "lucide-react";

const instructorCredentials = [
  {
    icon: Dumbbell,
    year: "1994",
    text: "Master Personal Trainer",
  },
  {
    icon: Building2,
    year: "2008",
    text: "BetterBodies established",
  },
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
  {
    icon: Award,
    year: null,
    text: "CPI Crisis Prevention certified",
  },
  {
    icon: Languages,
    year: null,
    text: "Bilingual instruction available",
  },
];

const certs = [
  {
    icon: Heart,
    title: "CPR / AED — Heartsaver",
    issuer: "American Heart Association",
    who: "Individuals, Teachers, Parents, Coaches, Childcare Providers",
    detail: "AHA-recognized certification valid for 2 years. Covers adult, child, and infant CPR, plus AED operation.",
  },
  {
    icon: ShieldCheck,
    title: "Basic Life Support (BLS)",
    issuer: "American Heart Association",
    who: "Nurses, EMTs, Medical & Dental Professionals",
    detail: "Required certification for healthcare providers. Covers team-based CPR, high-quality BLS skills, and AED use in clinical settings.",
  },
  {
    icon: Award,
    title: "Additional Certifications",
    issuer: "Better Bodies TX",
    who: "Based on class completion",
    detail: "Completion certificates issued for Self Awareness, Crisis Management, and Self-Defense courses. Custom documentation available for organizations.",
  },
];

export default function CertificationsSection() {
  return (
    <section className="bg-[#f7f7f7] px-5 py-16 md:py-24" id="certifications">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Certifications Offered</p>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#111] leading-tight">
            Leave With Proof
          </h2>
          <p className="text-[#666] text-sm mt-3 max-w-md mx-auto">
            Every class ends with a recognized certification you can use professionally or keep for your own peace of mind.
          </p>
        </div>

        <div className="space-y-4">
          {certs.map((cert) => (
            <div
              key={cert.title}
              className="flex gap-5 items-start bg-white border border-[#e8e8e8] rounded-lg p-5 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-md bg-primary/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                <cert.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h3 className="font-heading font-bold text-[#111] text-sm md:text-base">{cert.title}</h3>
                  <span className="text-[10px] font-bold text-primary border border-primary/30 bg-primary/5 rounded px-2 py-0.5 uppercase tracking-wider">
                    {cert.issuer}
                  </span>
                </div>
                <p className="text-[#888] text-xs mb-1.5">{cert.who}</p>
                <p className="text-[#555] text-sm leading-relaxed">{cert.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AHA badge placeholder */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 bg-white border border-[#e8e8e8] rounded-lg px-5 py-4">
          <div className="flex gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="w-14 h-14 rounded-md border border-[#e0e0e0] bg-[#f5f5f5] flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 text-[#ccc]" />
              </div>
            ))}
          </div>
          <div>
            <p className="text-[#888] text-xs font-semibold">AHA Training Site Badge + Partner Logos</p>
            <p className="text-[#aaa] text-xs">Add official badge images here when available</p>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
            Dated &amp; Verifiable
          </p>
          <h3 className="font-heading text-xl md:text-2xl font-extrabold text-[#111]">
            Sheldon's Credentials
          </h3>
          <p className="text-[#666] text-sm mt-2 max-w-md">
            No fuzzy claims — just dated, verifiable training and certification
            history.
          </p>

          <ul className="mt-5 space-y-3">
            {instructorCredentials.map((credential) => (
              <li
                key={credential.text}
                className="flex items-center gap-4 bg-white border border-[#e8e8e8] rounded-lg px-4 py-3"
              >
                <div className="w-9 h-9 rounded-md bg-primary/8 flex items-center justify-center flex-shrink-0">
                  <credential.icon className="w-4 h-4 text-primary" />
                </div>
                {credential.year && (
                  <span className="text-xs font-bold text-primary border border-primary/30 bg-primary/5 rounded px-2 py-0.5 flex-shrink-0">
                    Since {credential.year}
                  </span>
                )}
                <p className="text-[#333] text-sm leading-relaxed">
                  {credential.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}