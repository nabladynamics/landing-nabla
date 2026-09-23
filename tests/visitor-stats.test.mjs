import assert from "node:assert/strict";
import test from "node:test";
import {
  createVisitorStatsHandler,
  londonDayStart,
  parseTodayPageviews,
  parseTotalPageviews,
} from "../lib/visitor-stats.ts";

const PASSWORD = "test-only-password";
const ORIGIN = "https://example.test";
const NOW = new Date("2026-09-23T12:34:56.000Z");
const ENV = {
  VISITOR_STATS_PASSWORD: PASSWORD,
  VISITOR_STATS_VERCEL_TOKEN: "test-only-token",
  VISITOR_STATS_PROJECT_ID: "test-project",
  VISITOR_STATS_TEAM_ID: "test-team",
};

function request(body = { password: PASSWORD }, headers = {}) {
  return new Request(`${ORIGIN}/api/visits`, {
    method: "POST",
    headers: { origin: ORIGIN, "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function setup(overrides = {}) {
  const calls = [];
  const handler = createVisitorStatsHandler({
    env: () => ENV,
    now: () => NOW,
    fetch: async (url, init) => {
      calls.push({ url, init });
      return Response.json({
        version: 1,
        data: url.pathname.endsWith("/count")
          ? { pageviews: 4321, visitors: 1234 }
          : [
              { timestamp: "2026-09-22T23:00:00.000Z", pageviews: 7, visitors: 5 },
              { timestamp: "2026-09-23T12:00:00.000Z", pageviews: 8, visitors: 4 },
            ],
      });
    },
    ...overrides,
  });
  return { handler, calls };
}

test("only authenticated requests fetch counts, with no response caching", async () => {
  const { handler, calls } = setup();
  const response = await handler(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    total: 4321,
    today: 15,
    since: "2026-09-23",
    updatedAt: NOW.toISOString(),
    timezone: "Europe/London",
  });
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.equal(response.headers.get("vercel-cdn-cache-control"), "no-store");
  assert.equal(calls.length, 2);
  const count = calls.find(({ url }) => url.pathname.endsWith("/count"));
  const today = calls.find(({ url }) => url.pathname.endsWith("/aggregate"));
  assert.equal(count.url.searchParams.has("since"), false);
  assert.equal(count.url.searchParams.has("until"), false);
  assert.equal(today.url.searchParams.get("since"), "2026-09-22T23:00:00.000Z");
  assert.equal(today.url.searchParams.get("until"), NOW.toISOString());
  assert.equal(today.url.searchParams.get("by"), "hour");
  assert.equal(today.url.searchParams.get("filter"), "environment eq 'production'");
  for (const { url, init } of calls) {
    assert.equal(url.origin, "https://api.vercel.com");
    assert.equal(url.searchParams.get("projectId"), ENV.VISITOR_STATS_PROJECT_ID);
    assert.equal(url.searchParams.get("teamId"), ENV.VISITOR_STATS_TEAM_ID);
    assert.equal(init.headers.Authorization, `Bearer ${ENV.VISITOR_STATS_VERCEL_TOKEN}`);
    assert.equal(init.cache, "no-store");
    assert.equal(init.redirect, "error");
    assert.ok(init.signal instanceof AbortSignal);
  }
});

test("wrong passwords cannot make upstream requests or discover API configuration", async () => {
  const { handler, calls } = setup({ env: () => ({ VISITOR_STATS_PASSWORD: PASSWORD }) });
  const response = await handler(request({ password: "wrong" }));
  assert.equal(response.status, 401);
  assert.equal(calls.length, 0);
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.deepEqual(await response.json(), { error: "Incorrect password." });
});

test("missing configuration fails closed", async () => {
  for (const env of [{}, { VISITOR_STATS_PASSWORD: PASSWORD }]) {
    const { handler, calls } = setup({ env: () => env });
    assert.equal((await handler(request())).status, 503);
    assert.equal(calls.length, 0);
  }
});

test("rejects missing passwords and invalid JSON shapes without fetching", async () => {
  for (const body of [{}, null, [], "password", { password: 123 }, { password: "" }]) {
    const { handler, calls } = setup();
    assert.equal((await handler(request(body))).status, 400);
    assert.equal(calls.length, 0);
  }
  const { handler, calls } = setup();
  const malformed = new Request(`${ORIGIN}/api/visits`, {
    method: "POST",
    headers: { origin: ORIGIN, "content-type": "application/json" },
    body: '{"password":',
  });
  assert.equal((await handler(malformed)).status, 400);
  assert.equal(calls.length, 0);
});

test("enforces byte limits even without Content-Length", async () => {
  const { handler, calls } = setup();
  assert.equal((await handler(request({ password: "x".repeat(5000) }))).status, 413);
  assert.equal((await handler(request({ password: "🔒".repeat(129) }))).status, 400);
  assert.equal((await handler(request({}, { "content-length": "99999" }))).status, 413);
  assert.equal(calls.length, 0);
});

test("blocks cross-origin, missing-origin, and non-JSON requests", async () => {
  for (const headers of [
    { origin: "https://attacker.test" },
    { origin: "null" },
    { origin: "" },
    { "sec-fetch-site": "cross-site" },
  ]) {
    const { handler, calls } = setup();
    assert.equal((await handler(request(undefined, headers))).status, 403);
    assert.equal(calls.length, 0);
  }
  const { handler, calls } = setup();
  assert.equal((await handler(request(undefined, { "content-type": "text/plain" }))).status, 415);
  assert.equal(calls.length, 0);
});

test("limits five failed attempts per client and expires the local limit", async () => {
  let current = NOW;
  const { handler, calls } = setup({ now: () => current });
  for (let attempt = 0; attempt < 5; attempt += 1) {
    assert.equal((await handler(request({ password: "wrong" }))).status, 401);
  }
  const limited = await handler(request());
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "900");
  assert.equal(calls.length, 0);
  current = new Date(NOW.getTime() + 15 * 60 * 1000);
  assert.equal((await handler(request())).status, 200);
});

test("allows same-port loopback aliases only in development", async () => {
  const loopbackRequest = (origin) => new Request("http://localhost:3000/api/visits", {
    method: "POST",
    headers: { origin, "content-type": "application/json", "sec-fetch-site": "same-origin" },
    body: JSON.stringify({ password: PASSWORD }),
  });
  for (const nodeEnv of ["development", "production", undefined]) {
    const { handler } = setup({ env: () => ({ ...ENV, NODE_ENV: nodeEnv }) });
    const response = await handler(loopbackRequest("http://127.0.0.1:3000"));
    assert.equal(response.status, nodeEnv === "development" ? 200 : 403);
    assert.equal((await handler(loopbackRequest("http://127.0.0.1:3001"))).status, 403);
    assert.equal((await handler(loopbackRequest("https://127.0.0.1:3000"))).status, 403);
    assert.equal((await handler(loopbackRequest("http://attacker.test:3000"))).status, 403);
  }
});

test("parallel incorrect-password requests cannot bypass the local limit", async () => {
  const { handler, calls } = setup();
  const responses = await Promise.all(
    Array.from({ length: 20 }, () => handler(request({ password: "wrong" }))),
  );
  assert.equal(responses.filter(({ status }) => status === 401).length, 5);
  assert.equal(responses.filter(({ status }) => status === 429).length, 15);
  assert.equal(calls.length, 0);
});

test("ignores untrusted forwarded IPs outside Vercel", async () => {
  const { handler, calls } = setup();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await handler(request({ password: "wrong" }, { "x-vercel-forwarded-for": `192.0.2.${attempt}` }));
  }
  assert.equal((await handler(request(undefined, { "x-vercel-forwarded-for": "192.0.2.99" }))).status, 429);
  assert.equal(calls.length, 0);
});

test("uses Vercel-provided addresses to separate client limits on Vercel", async () => {
  const { handler } = setup({ env: () => ({ ...ENV, VERCEL: "1" }) });
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await handler(request({ password: "wrong" }, { "x-vercel-forwarded-for": "192.0.2.1" }));
  }
  assert.equal((await handler(request(undefined, { "x-vercel-forwarded-for": "192.0.2.1" }))).status, 429);
  assert.equal((await handler(request(undefined, { "x-vercel-forwarded-for": "192.0.2.2" }))).status, 200);
});

test("upstream failure, invalid response, and network errors never turn into zero", async () => {
  const failures = [
    async () => new Response("provider details including test-only-token", { status: 403 }),
    async () => new Response("service unavailable", { status: 503 }),
    async () => new Response("not json", { status: 200 }),
    async () => Response.json({ version: 1, data: {} }),
    async () => { throw new Error("private network details"); },
  ];
  for (const fetch of failures) {
    const { handler } = setup({ fetch });
    const response = await handler(request());
    assert.equal(response.status, 502);
    const body = await response.json();
    assert.equal(typeof body.error, "string");
    assert.equal("total" in body, false);
    assert.equal("today" in body, false);
    assert.doesNotMatch(JSON.stringify(body), /test-only-token|network details|provider details/);
  }
});

test("accepts real zeros only from valid analytics responses", async () => {
  const { handler } = setup({
    fetch: async (url) => Response.json({
      version: 1,
      data: url.pathname.endsWith("/count") ? { pageviews: 0, visitors: 0 } : [],
    }),
  });
  const response = await handler(request());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.total, 0);
  assert.equal(body.today, 0);
});

test("supports team slugs and personal projects", async () => {
  for (const slug of ["test-team-slug", undefined]) {
    const { handler, calls } = setup({ env: () => ({
      ...ENV,
      VISITOR_STATS_TEAM_ID: undefined,
      VISITOR_STATS_TEAM_SLUG: slug,
    }) });
    assert.equal((await handler(request())).status, 200);
    for (const { url } of calls) {
      assert.equal(url.searchParams.has("teamId"), false);
      assert.equal(url.searchParams.get("slug"), slug ?? null);
    }
  }
});

test("total parser reads page views, not unique visitors, and rejects invalid counts", () => {
  assert.equal(parseTotalPageviews({ version: 1, data: { pageviews: 1250, visitors: 980 } }), 1250);
  for (const pageviews of [undefined, null, "1250", -1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => parseTotalPageviews({ version: 1, data: { pageviews } }));
  }
  assert.throws(() => parseTotalPageviews({ version: 2, data: { pageviews: 1 } }));
  assert.throws(() => parseTotalPageviews({ version: 1, data: [] }));
});

test("hourly parser includes the London midnight hour and rejects corrupt rows", () => {
  const since = new Date("2026-09-22T23:00:00.000Z");
  const row = { timestamp: since.toISOString(), pageviews: 7 };
  assert.equal(parseTodayPageviews({ version: 1, data: [row] }, since, NOW), 7);
  for (const data of [
    [row, row],
    [{ ...row, timestamp: "invalid" }],
    [{ ...row, timestamp: "2026-09-22T22:00:00.000Z" }],
    [{ ...row, timestamp: "2026-09-23T13:00:00.000Z" }],
    [{ ...row, timestamp: "2026-09-23T12:30:00.000Z" }],
    [{ ...row, pageviews: null }],
  ]) {
    assert.throws(() => parseTodayPageviews({ version: 1, data }, since, NOW));
  }
});

test("London midnight is correct in winter, summer, and both DST transitions", () => {
  const cases = [
    ["2026-01-20T18:00:00Z", "2026-01-20T00:00:00.000Z"],
    ["2026-09-23T12:00:00Z", "2026-09-22T23:00:00.000Z"],
    ["2026-09-23T23:30:00Z", "2026-09-23T23:00:00.000Z"],
    ["2026-03-29T12:00:00Z", "2026-03-29T00:00:00.000Z"],
    ["2026-03-30T12:00:00Z", "2026-03-29T23:00:00.000Z"],
    ["2026-10-25T12:00:00Z", "2026-10-24T23:00:00.000Z"],
    ["2026-10-26T12:00:00Z", "2026-10-26T00:00:00.000Z"],
  ];
  for (const [instant, midnight] of cases) {
    assert.equal(londonDayStart(new Date(instant)).toISOString(), midnight);
  }
});
