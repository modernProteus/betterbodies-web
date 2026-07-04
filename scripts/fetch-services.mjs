import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(
  __dirname,
  "../src/data/services.generated.json"
);

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

function normalizeService(raw) {
  if (!raw || typeof raw !== "object") return null;

  const key = String(raw.key || "").trim();
  const title = String(raw.title || "").trim();

  if (!key || !title) return null;

  return {
    key,
    tier: Number(raw.tier) || 0,
    active: raw.active !== false,
    title,
    icon: raw.icon || "MessageSquare",
    description: raw.description || "",
    who: raw.who || "",
    cta: raw.cta || "",
    leadIntent: raw.leadIntent || raw.lead_intent || "service_interest",
    modal: {
      title: raw.modal?.title || title,
      description: raw.modal?.description || "",
    },
    sort: Number(raw.sort) || 0,
  };
}

async function fetchServices() {
  if (!APPS_SCRIPT_URL) {
    console.warn(
      "[fetch-services] APPS_SCRIPT_URL is not set. Keeping the existing services.generated.json."
    );
    return;
  }

  const response = await fetch(`${APPS_SCRIPT_URL}?action=services`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  const rawServices = Array.isArray(data?.services) ? data.services : null;

  if (!rawServices || rawServices.length === 0) {
    throw new Error("Response did not include a non-empty services array.");
  }

  const services = rawServices.map(normalizeService).filter(Boolean);

  if (services.length === 0) {
    throw new Error("No valid services (key + title) found in the response.");
  }

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(services, null, 2)}\n`);

  console.log(
    `[fetch-services] Wrote ${services.length} services to services.generated.json`
  );
}

fetchServices().catch((error) => {
  console.warn(
    `[fetch-services] Fetch failed, keeping the existing services.generated.json: ${error.message}`
  );
});
