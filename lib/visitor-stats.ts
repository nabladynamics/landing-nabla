import { createHash, timingSafeEqual } from "node:crypto";

export const VISITOR_STATS_SINCE = "2026-09-23";
export const VISITOR_STATS_TIMEZONE = "Europe/London";
const TRACKING_START = "2026-09-22T23:00:00.000Z";

const API_BASE = "https://api.vercel.com/v1/query/web-analytics/visits/";
const MAX_BODY_BYTES = 4096;
const MAX_PASSWORD_BYTES = 512;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const MAX_CLIENTS = 1000;
const HOUR_MS = 60 * 60 * 1000;

type Environment = Readonly<Record<string, string | undefined>>;
type HandlerOptions = {
  env?: () => Environment;
  now?: () => Date;
  fetch?: typeof globalThis.fetch;
};
type FailureWindow = { failures: number; expiresAt: number };

const londonClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: VISITOR_STATS_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function wallClock(date: Date): number {
  const parts = Object.fromEntries(
    londonClock.formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
}

// Re-evaluate the offset at midnight, rather than using the current offset:
// those differ on the two days when British Summer Time changes.
export function londonDayStart(now: Date): Date {
  const local = new Date(wallClock(now));
  const midnight = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate(),
  );
  let instant = midnight;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    instant = midnight - (wallClock(new Date(instant)) - instant);
  }
  return new Date(instant);
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pageviews(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error("Invalid analytics response");
  }
  return value;
}

export function parseTotalPageviews(payload: unknown): number {
  if (!record(payload) || payload.version !== 1 || !record(payload.data)) {
    throw new Error("Invalid analytics response");
  }
  return pageviews(payload.data.pageviews);
}

export function parseTodayPageviews(
  payload: unknown,
  since: Date,
  until: Date,
): number {
  if (!record(payload) || payload.version !== 1 || !Array.isArray(payload.data)) {
    throw new Error("Invalid analytics response");
  }

  const seen = new Set<number>();
  let total = 0;
  for (const row of payload.data) {
    if (!record(row) || typeof row.timestamp !== "string") {
      throw new Error("Invalid analytics response");
    }
    const timestamp = Date.parse(row.timestamp);
    if (
      !Number.isFinite(timestamp) ||
      timestamp % HOUR_MS !== 0 ||
      timestamp < since.getTime() ||
      timestamp > until.getTime() ||
      seen.has(timestamp)
    ) {
      throw new Error("Invalid analytics response");
    }
    seen.add(timestamp);
    total = pageviews(total + pageviews(row.pageviews));
  }
  return total;
}

function json(body: unknown, status = 200, retryAfter?: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
    },
  });
}

class InvalidBody extends Error {
  readonly status: number;

  constructor(status: number) {
    super("Invalid request body");
    this.status = status;
  }
}

async function readPassword(request: Request): Promise<string> {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    throw new InvalidBody(415);
  }
  const contentLength = request.headers.get("content-length");
  if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_BODY_BYTES)) {
    throw new InvalidBody(413);
  }

  const reader = request.body?.getReader();
  if (!reader) throw new InvalidBody(400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => {});
        throw new InvalidBody(413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  let body: unknown;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new InvalidBody(400);
  }
  if (
    !record(body) ||
    typeof body.password !== "string" ||
    body.password.length === 0 ||
    Buffer.byteLength(body.password, "utf8") > MAX_PASSWORD_BYTES
  ) {
    throw new InvalidBody(400);
  }
  return body.password;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function sameOrigin(request: Request, env: Environment): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  const origin = request.headers.get("origin");
  const expected = new URL(request.url);
  if (origin === expected.origin) return true;

  // Next's development server can normalize a 127.0.0.1 request URL to
  // localhost. Permit only loopback aliases on the same development port.
  if (env.NODE_ENV !== "development" || !origin) return false;
  try {
    const actual = new URL(origin);
    const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);
    return (
      origin === actual.origin &&
      loopback.has(actual.hostname) &&
      loopback.has(expected.hostname) &&
      actual.protocol === expected.protocol &&
      actual.port === expected.port
    );
  } catch {
    return false;
  }
}

function clientKey(request: Request, env: Environment): string {
  // Vercel overwrites this header at its edge. Do not trust forwarded IPs on
  // arbitrary hosts: those deployments use one shared local limit instead.
  const address = env.VERCEL === "1"
    ? request.headers.get("x-vercel-forwarded-for") ?? "unknown"
    : "local";
  return digest(address.slice(0, 256)).toString("hex");
}

export function createVisitorStatsHandler(options: HandlerOptions = {}) {
  // Best-effort protection for this function instance only. Instances and cold
  // starts do not share this state; use a Vercel Firewall rate limit as well.
  const failures = new Map<string, FailureWindow>();
  const now = options.now ?? (() => new Date());
  const environment = options.env ?? (() => process.env);

  return async function visitorStats(request: Request): Promise<Response> {
    const env = environment();
    if (!sameOrigin(request, env)) return json({ error: "Request not allowed." }, 403);

    const secret = env.VISITOR_STATS_PASSWORD;
    if (!secret || Buffer.byteLength(secret, "utf8") > MAX_PASSWORD_BYTES) {
      return json({ error: "Visitor statistics are not configured." }, 503);
    }

    const requestedAt = now();
    const time = requestedAt.getTime();
    for (const [key, value] of failures) {
      if (value.expiresAt <= time) failures.delete(key);
    }
    const key = clientKey(request, env);
    const previous = failures.get(key);
    if (previous && previous.failures >= MAX_FAILURES) {
      return json(
        { error: "Too many attempts. Please try again later." },
        429,
        Math.max(1, Math.ceil((previous.expiresAt - time) / 1000)),
      );
    }
    // Do not evict live entries when the map fills: that would let an attacker
    // reset another client's limit by cycling through source addresses.
    if (!previous && failures.size >= MAX_CLIENTS) {
      return json({ error: "Too many attempts. Please try again later." }, 429, 60);
    }

    // Reserve the attempt before awaiting the body. Parallel requests must
    // not all pass the limit before their passwords have been checked.
    failures.set(key, {
      failures: (previous?.failures ?? 0) + 1,
      expiresAt: previous?.expiresAt ?? time + FAILURE_WINDOW_MS,
    });

    let password: string;
    try {
      password = await readPassword(request);
    } catch (error) {
      return json({ error: "Invalid request body." }, error instanceof InvalidBody ? error.status : 400);
    }

    if (!timingSafeEqual(digest(password), digest(secret))) {
      return json({ error: "Incorrect password." }, 401);
    }
    failures.delete(key);

    const token = env.VISITOR_STATS_VERCEL_TOKEN;
    const projectId = env.VISITOR_STATS_PROJECT_ID;
    if (!token || !projectId) {
      return json({ error: "Visitor statistics are not configured." }, 503);
    }

    const since = londonDayStart(requestedAt);
    const countUrl = new URL("count", API_BASE);
    const todayUrl = new URL("aggregate", API_BASE);
    for (const url of [countUrl, todayUrl]) {
      url.searchParams.set("projectId", projectId);
      if (env.VISITOR_STATS_TEAM_ID) {
        url.searchParams.set("teamId", env.VISITOR_STATS_TEAM_ID);
      } else if (env.VISITOR_STATS_TEAM_SLUG) {
        url.searchParams.set("slug", env.VISITOR_STATS_TEAM_SLUG);
      }
    }
    // Count queries use the production lifetime dataset, with the launch date
    // as a lower bound. They cannot reconstruct visits before tracking began.
    countUrl.searchParams.set("since", TRACKING_START);
    countUrl.searchParams.set("until", requestedAt.toISOString());
    // Hourly buckets avoid UTC-day rounding when London is on summer time.
    todayUrl.searchParams.set("by", "hour");
    todayUrl.searchParams.set("since", since.toISOString());
    todayUrl.searchParams.set("until", requestedAt.toISOString());
    todayUrl.searchParams.set("limit", "100");
    todayUrl.searchParams.set("filter", "environment eq 'production'");

    try {
      const fetchStats = options.fetch ?? globalThis.fetch;
      const query = async (url: URL): Promise<unknown> => {
        const response = await fetchStats(url, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          cache: "no-store",
          redirect: "error",
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) throw new Error("Analytics unavailable");
        return response.json();
      };
      const [totalPayload, todayPayload] = await Promise.all([
        query(countUrl),
        query(todayUrl),
      ]);
      return json({
        total: parseTotalPageviews(totalPayload),
        today: parseTodayPageviews(todayPayload, since, requestedAt),
        since: VISITOR_STATS_SINCE,
        updatedAt: requestedAt.toISOString(),
        timezone: VISITOR_STATS_TIMEZONE,
      });
    } catch {
      // Never expose provider response bodies, tokens, or project identifiers.
      // A failed or malformed query must not be presented as zero visits.
      return json({ error: "Visitor statistics are temporarily unavailable. Please try again." }, 502);
    }
  };
}
