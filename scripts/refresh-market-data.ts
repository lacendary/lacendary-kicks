import nextEnv from "@next/env";
import { refreshAllMarketData } from "../app/lib/market-refresh.ts";
import { createWordPressMarketAdmin } from "../app/lib/wordpress-market-admin.ts";
import { createMarketRepository } from "../app/lib/market-repository-factory.ts";

nextEnv.loadEnvConfig(process.cwd());

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const positiveInteger = (name: string, fallback: number) => {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 2) throw new Error(`${name} must be an integer of at least 2`);
  return value;
};

const wordpressUrl = required("NEXT_PUBLIC_WORDPRESS_URL");
const wordpressAdmin = createWordPressMarketAdmin({
  wordpressUrl,
  username: required("WORDPRESS_API_USERNAME"),
  applicationPassword: required("WORDPRESS_API_PASSWORD"),
});

const summary = await refreshAllMarketData({
  wordpressUrl,
  kicksDbApiKey: required("KICKSDB_API_KEY"),
  wordpressAdmin,
  marketRepository: createMarketRepository(),
  circuitBreakerThreshold: positiveInteger("MARKET_REFRESH_CIRCUIT_BREAKER_THRESHOLD", 3),
});

console.log("\nMarket refresh summary");
console.log(`Run status: ${summary.status}`);
console.log(`Started: ${summary.startedAt}`);
console.log(`Finished: ${summary.finishedAt}`);
console.log(`Eligible sneakers: ${summary.totalEligible}`);
console.log(`Attempted: ${summary.attemptedRefreshes}`);
console.log(`Successful: ${summary.successfulRefreshes}`);
console.log(`Failed: ${summary.failedRefreshes}`);
console.log(`Skipped: ${summary.skippedRefreshes}`);
console.log(`Retries: ${summary.retriesUsed}`);
console.log(`KicksDB requests: ${summary.kicksDbRequests}`);
console.log(`Quota current: ${summary.quotaCurrent ?? "not returned"}`);
console.log(`Overall observations upserted: ${summary.overallObservationsPersisted}`);
console.log(`Size observations upserted: ${summary.sizeObservationsPersisted}`);
console.log(`WordPress updates: ${summary.wordpressUpdates}`);
console.log(`Circuit breaker: ${summary.circuitBreakerTripped ? "TRIPPED" : "not tripped"}`);
if (summary.circuitBreakerReason) console.log(`Circuit reason: ${summary.circuitBreakerReason}`);
console.log(`Elapsed: ${(summary.elapsedMs / 1000).toFixed(1)}s`);

if (summary.failures.length > 0) {
  for (const failure of summary.failures) {
    console.error(`- ${failure.sneaker.title}: ${failure.error}`);
  }
  process.exitCode = 1;
}
if (summary.skipped.length > 0) {
  console.error(`Skipped because upstream was unavailable: ${summary.skipped.map((item) => item.title).join(", ")}`);
}
if (summary.status === "aborted_internal_error") process.exitCode = 1;
