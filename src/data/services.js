// Generated at build time by scripts/fetch-services.mjs from the "Public
// Services" Google Sheet. Nobody hand-edits services here anymore; the sheet
// is the source of truth. See scripts/fetch-services.mjs for the fail-safe
// fetch/normalize logic and code.gs for the Apps Script `services` endpoint.
import SERVICES_GENERATED from "./services.generated.json";

export const SERVICES = SERVICES_GENERATED;

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
  SERVICES.filter((service) => service.active && service.tier === tier).sort(
    (a, b) => (a.sort ?? 0) - (b.sort ?? 0)
  );

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
