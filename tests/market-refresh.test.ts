import test from "node:test";
import assert from "node:assert/strict";
import { refreshAllMarketData } from "../app/lib/market-refresh.ts";
import type { MarketDataRecord } from "../app/lib/market.ts";
import type { MarketRepository } from "../app/lib/market-repository.ts";
import type { WordPressMarketAdmin } from "../app/lib/wordpress-market-admin.ts";

const sneakers = Array.from({ length: 5 }, (_, index) => ({
  databaseId: index + 1,
  title: `Sneaker ${index + 1}`,
  slug: `sneaker-${index + 1}`,
  productId: `product-${index + 1}`,
}));

function product(id: string) {
  return {
    id,
    avg_price: 200,
    updated_at: "2026-08-27T00:00:00.000Z",
    statistics: { last_90_days_average_price: 190, annual_average_price: 180 },
    variants: [{ id: `${id}-variant`, size: "10", lowest_ask: 210, total_asks: 5 }],
  };
}

function harness(outcomes: Record<string, number[]>) {
  const records = new Map<string, MarketDataRecord | { marker: string }>(
    sneakers.map((item) => [item.productId, { marker: `preserved-${item.productId}` }]),
  );
  let writes = 0;
  let wordpressUpdates = 0;
  const repository: MarketRepository = {
    async upsertProductRefresh(record) { writes += 1; records.set(record.snapshot.productId, record); },
    async getMarketHistory(id) { const value = records.get(id); return value && "snapshot" in value ? value : null; },
    async getMarketSnapshot(id) { const value = records.get(id); return value && "snapshot" in value ? value.snapshot : null; },
    async getSizeSnapshots(id) { return (await this.getMarketSnapshot(id))?.sizes ?? []; },
    async getOverallHistory(id) { return (await this.getMarketHistory(id))?.overallDaily ?? []; },
    async getSizeHistory(id, size) { const points = (await this.getMarketHistory(id))?.sizeDaily ?? []; return size ? points.filter((point) => point.size === size) : points; },
  };
  const wordpressAdmin: WordPressMarketAdmin = {
    async getSneaker(id) { return { id, slug: `sneaker-${id}`, acf: {} }; },
    async updateSneakerMarketAdminFields(id) { wordpressUpdates += 1; return { id, slug: `sneaker-${id}`, acf: {} }; },
  };
  const queues = new Map(Object.entries(outcomes).map(([id, values]) => [id, [...values]]));
  const fetchImpl: typeof fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/graphql")) {
      return Response.json({ data: { sneakers: { nodes: sneakers.map((item) => ({
        databaseId: item.databaseId,
        title: item.title,
        slug: item.slug,
        sneakerDetails: { marketTrackingEnabled: true, kicksdbProductId: item.productId, marketTrackingStatus: ["active"] },
      })) } } });
    }
    const id = sneakers.find((item) => url.includes(item.productId))?.productId;
    assert.ok(id);
    const status = queues.get(id)?.shift() ?? 200;
    return Response.json(status === 200 ? { data: product(id) } : { detail: status >= 500 ? "cannot fetch product" : "not found" }, {
      status,
      headers: { "x-quota-current": "test-quota" },
    });
  };
  return { repository, wordpressAdmin, fetchImpl, records, get writes() { return writes; }, get wordpressUpdates() { return wordpressUpdates; } };
}

async function run(h: ReturnType<typeof harness>) {
  return refreshAllMarketData({
    wordpressUrl: "https://wordpress.test",
    kicksDbApiKey: "test-key",
    wordpressAdmin: h.wordpressAdmin,
    marketRepository: h.repository,
    fetchImpl: h.fetchImpl,
    delayMs: 0,
    circuitBreakerThreshold: 3,
    sleepImpl: async () => {},
    logger: { info() {}, warn() {} },
  });
}

test("healthy run completes without tripping the circuit breaker", async () => {
  const h = harness({});
  const summary = await run(h);
  assert.equal(summary.status, "completed");
  assert.equal(summary.circuitBreakerTripped, false);
  assert.equal(summary.attemptedRefreshes, 5);
  assert.equal(summary.successfulRefreshes, 5);
  assert.equal(summary.kicksDbRequests, 5);
  assert.equal(h.writes, 5);
});

test("one isolated exhausted transient failure does not stop later products", async () => {
  const h = harness({ "product-1": [500, 500, 500] });
  const summary = await run(h);
  assert.equal(summary.status, "completed_with_failures");
  assert.equal(summary.circuitBreakerTripped, false);
  assert.equal(summary.failedRefreshes, 1);
  assert.equal(summary.successfulRefreshes, 4);
  assert.equal(summary.attemptedRefreshes, 5);
});

test("broad outage trips after three exhausted products and preserves failed/skipped data", async () => {
  const h = harness({
    "product-1": [500, 500, 500],
    "product-2": [500, 500, 500],
    "product-3": [500, 500, 500],
  });
  const before = JSON.stringify([...h.records]);
  const summary = await run(h);
  assert.equal(summary.status, "upstream_unavailable");
  assert.equal(summary.circuitBreakerTripped, true);
  assert.equal(summary.attemptedRefreshes, 3);
  assert.equal(summary.failedRefreshes, 3);
  assert.equal(summary.skippedRefreshes, 2);
  assert.equal(summary.kicksDbRequests, 9);
  assert.equal(summary.retriesUsed, 6);
  assert.equal(h.writes, 0);
  assert.equal(h.wordpressUpdates, 0);
  assert.equal(JSON.stringify([...h.records]), before);
});

test("a success resets the consecutive transient outage streak", async () => {
  const h = harness({
    "product-1": [500, 500, 500],
    "product-3": [500, 500, 500],
    "product-4": [500, 500, 500],
  });
  const summary = await run(h);
  assert.equal(summary.status, "completed_with_failures");
  assert.equal(summary.circuitBreakerTripped, false);
  assert.equal(summary.attemptedRefreshes, 5);
  assert.equal(summary.failedRefreshes, 3);
  assert.equal(summary.successfulRefreshes, 2);
});

test("ordinary 4xx fails once and does not count toward the outage breaker", async () => {
  const h = harness({ "product-1": [404], "product-2": [404], "product-3": [404] });
  const summary = await run(h);
  assert.equal(summary.status, "completed_with_failures");
  assert.equal(summary.circuitBreakerTripped, false);
  assert.equal(summary.attemptedRefreshes, 5);
  assert.equal(summary.failedRefreshes, 3);
  assert.equal(summary.successfulRefreshes, 2);
  assert.equal(summary.kicksDbRequests, 5);
  assert.equal(summary.retriesUsed, 0);
  assert.ok(summary.failures.every((failure) => failure.transientClass === null));
});
