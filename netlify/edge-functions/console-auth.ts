import type { Context, Config } from "@netlify/edge-functions";

function unauthorized(): Response {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Better Bodies Admin", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

async function digest(value: string): Promise<Uint8Array> {
  const bytes = new TextEncoder().encode(value);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

// Constant-time comparison of SHA-256 digests, so failures do not leak
// how much of the credential was correct via response timing.
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([digest(a), digest(b)]);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export default async (req: Request, context: Context) => {
  const expectedUser = Netlify.env.get("CONSOLE_USER");
  const expectedPass = Netlify.env.get("CONSOLE_PASS");

  // Fail closed. If credentials are not configured, the console is never
  // served, rather than silently falling through to public access.
  if (!expectedUser || !expectedPass) {
    return new Response("Console is not configured.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const header = req.headers.get("authorization");
  if (!header || !header.toLowerCase().startsWith("basic ")) {
    return unauthorized();
  }

  let decoded: string;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return unauthorized();
  }

  const separator = decoded.indexOf(":");
  if (separator === -1) return unauthorized();

  const [userOk, passOk] = await Promise.all([
    safeEqual(decoded.slice(0, separator), expectedUser),
    safeEqual(decoded.slice(separator + 1), expectedPass),
  ]);

  if (!userOk || !passOk) return unauthorized();

  // Authenticated. Serve the console, but never let it be cached at the
  // edge or indexed by a crawler that somehow acquires the credentials.
  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const config: Config = {
  path: ["/console-8b3f2c", "/console-8b3f2c/*"],
};
