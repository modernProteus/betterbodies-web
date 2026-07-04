export const SERVICES = [
  {
    key: "cpr",
    tier: 1,
    active: true,
    title: "CPR Certification",
    icon: "Heart",
    description:
      "Hands-on CPR training for individuals, caregivers, teachers, and professionals who need practical emergency response skills.",
    who: "Individuals, teachers, childcare providers, caregivers",
    cta: "Request CPR Training",
    leadIntent: "service_interest",
    modal: {
      title: "Request CPR Certification",
      description:
        "Tell us about your CPR training needs and Sheldon or Juana will follow up.",
    },
  },
  {
    key: "bls",
    tier: 1,
    active: true,
    title: "BLS Certification",
    icon: "Shield",
    description:
      "Basic Life Support training for healthcare workers and professionals who need a higher level of emergency response readiness.",
    who: "Healthcare workers, care teams, professional responders",
    cta: "Request BLS Info",
    leadIntent: "service_interest",
    modal: {
      title: "Request BLS Certification",
      description:
        "Tell us about your BLS training needs and Sheldon or Juana will follow up.",
    },
  },
  {
    key: "fitness",
    tier: 2,
    active: true,
    title: "Personal Training & Fitness",
    icon: "Dumbbell",
    description:
      "High-energy, personalized training that meets you where you are and pushes you past your limits. Where BetterBodies began.",
    who: "Individuals and groups chasing real, lasting results",
    cta: "Ask About Training",
    leadIntent: "service_interest",
    modal: {
      title: "Ask About Personal Training",
      description:
        "Tell us about your fitness goals and Sheldon or Juana will follow up.",
    },
  },
  {
    key: "aed_firstaid",
    tier: 3,
    active: true,
    title: "AED + First Aid",
    icon: "RotateCcw",
    description:
      "Practical first aid and AED-focused training that helps people respond calmly and effectively before help arrives.",
    who: "Teams, workplaces, schools, churches, community groups",
    cta: "Ask About First Aid",
    leadIntent: "service_interest",
    modal: {
      title: "Ask About AED + First Aid",
      description:
        "Tell us about your first aid needs and Sheldon or Juana will follow up.",
    },
  },
  {
    key: "crisis",
    tier: 3,
    active: true,
    title: "Crisis Readiness",
    icon: "AlertTriangle",
    description:
      "Situational awareness, de-escalation, and response skills for real-world moments that call for calm thinking, clear boundaries, and confident action.",
    who: "Organizations, agencies, mixed-role teams",
    cta: "Request Readiness Training",
    leadIntent: "service_interest",
    modal: {
      title: "Request Crisis Readiness Training",
      description:
        "Tell us about your readiness and de-escalation needs and Sheldon or Juana will follow up.",
    },
  },
  {
    key: "personal_safety",
    tier: 3,
    active: true,
    title: "Personal Safety",
    icon: "Eye",
    description:
      "Body awareness, personal safety, and self-defense-informed instruction rooted in practical confidence and prevention.",
    who: "Individuals, staff teams, gyms, community groups",
    cta: "Ask About Safety Training",
    leadIntent: "service_interest",
    modal: {
      title: "Ask About Personal Safety",
      description:
        "Tell us about your personal safety or self-defense goals and Sheldon or Juana will follow up.",
    },
  },
  {
    key: "protection",
    tier: 3,
    active: true,
    title: "Personal & Event Protection",
    icon: "ShieldCheck",
    description:
      "Personal and event protection, plus active-shooter evacuation planning, delivered calmly and professionally to keep people and gatherings safe.",
    who: "Individuals, events, organizations, and teams needing on-site protection",
    cta: "Ask About Protection",
    leadIntent: "service_interest",
    modal: {
      title: "Ask About Protection",
      description:
        "Tell us about your personal or event protection needs and Sheldon or Juana will follow up.",
    },
  },
  {
    key: "wellness",
    tier: 4,
    active: true,
    title: "Holistic Wellness & Apothecary",
    icon: "Leaf",
    description:
      "Holistic remedies, loose-leaf herbs, essential oils, and artisanal wellness goods, backed by 1,000 hours of holistic and herbal training.",
    who: "Anyone looking to round out their wellness",
    cta: "Ask About Wellness",
    leadIntent: "wellness_interest",
    modal: {
      title: "Ask About Wellness",
      description:
        "Tell us what you're looking for and Sheldon or Juana will follow up.",
    },
  },
];

// Group/on-site is a delivery mode, not a tier service. Kept separate so it
// doesn't render as a peer card, but it's still resolvable by the modal.
export const DELIVERY_MODES = {
  group: {
    title: "Group / On-Site Training",
    icon: "Users",
    leadIntent: "group_training",
    cta: "Request Group Training",
    modal: {
      title: "Request Group / On-Site Training",
      description:
        "Tell us about your team and location and Sheldon or Juana will follow up.",
    },
  },
};

export const GENERIC = {
  key: "generic",
  icon: "MessageSquare",
  title: "Let's connect",
  cta: "Contact Us",
  leadIntent: "general_inquiry",
  modal: {
    title: "Let's connect",
    description:
      "Tell us what you're looking for and Sheldon or Juana will follow up.",
  },
};

export const getServicesByTier = (tier) =>
  SERVICES.filter((service) => service.active && service.tier === tier);

export const getServiceByKey = (key) =>
  SERVICES.find((service) => service.key === key) ||
  DELIVERY_MODES[key] ||
  GENERIC;

export function getServiceKeyFromClassType(classType) {
  const value = String(classType || "").toLowerCase();

  if (value.includes("cpr")) return "cpr";
  if (value.includes("bls")) return "bls";
  if (value.includes("aid") || value.includes("aed")) return "aed_firstaid";
  if (value.includes("group")) return "group";
  if (value.includes("defense") || value.includes("safety")) {
    return "personal_safety";
  }

  return null;
}
