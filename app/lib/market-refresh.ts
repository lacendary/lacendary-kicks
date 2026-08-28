import {
  normalizeMarketDataRecord,
  type KicksDbProduct,
} from "./market.ts";
import type { MarketRepository } from "./market-repository.ts";
import type { WordPressMarketAdmin } from "./wordpress-market-admin.ts";

export type TrackedSneaker = {
  databaseId: number;
  title: string;
  slug: string;
  productId: string;
  status: string | null;
};

type RefreshFailure = {
  sneaker: TrackedSneaker;
  attempts: number;
  error: string;
  transientClass: TransientFailureClass | null;
};

type RefreshSuccess = {
  sneaker: TrackedSneaker;
  attempts: number;
  retrievedAt: string;
  sizeObservations: number;
};

export type MarketRefreshSummary = {
  status: "completed" | "completed_with_failures" | "upstream_unavailable" | "aborted_internal_error";
  startedAt: string;
  finishedAt: string;
  totalEligible: number;
  attemptedRefreshes: number;
  successfulRefreshes: number;
  failedRefreshes: number;
  skippedRefreshes: number;
  retriesUsed: number;
  kicksDbRequests: number;
  quotaCurrent: string | null;
  overallObservationsPersisted: number;
  sizeObservationsPersisted: number;
  wordpressUpdates: number;
  elapsedMs: number;
  circuitBreakerTripped: boolean;
  circuitBreakerReason: string | null;
  successes: RefreshSuccess[];
  failures: RefreshFailure[];
  skipped: TrackedSneaker[];
};

type RefreshAllMarketDataOptions = {
  wordpressUrl: string;
  kicksDbApiKey: string;
  wordpressAdmin: WordPressMarketAdmin;
  marketRepository: MarketRepository;
  fetchImpl?: typeof fetch;
  delayMs?: number;
  maxAttempts?: number;
  requestTimeoutMs?: number;
  circuitBreakerThreshold?: number;
  circuitBreakerEnabled?: boolean;
  logger?: Pick<Console, "info" | "warn">;
  sleepImpl?: (ms: number) => Promise<void>;
  trackedSneakers?: TrackedSneaker[];
};

export type TransientFailureClass =
  | "kicksdb_5xx"
  | "timeout"
  | "deadline_exceeded"
  | "network";

type InventoryNode = {
  databaseId: number;
  title: string;
  slug: string;
  sneakerDetails: {
    marketTrackingEnabled: boolean | null;
    kicksdbProductId: string | null;
    marketTrackingStatus: string[] | null;
  } | null;
};

const inventoryQuery = `
  query MarketRefreshInventory {
    sneakers(first: 100) {
      nodes {
        databaseId
        title
        slug
        sneakerDetails {
          marketTrackingEnabled
          kicksdbProductId
          marketTrackingStatus
        }
      }
    }
  }
`;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
const statusPriority = (status: string | null) =>
  status === "active" ? 0 : status === "mapped" ? 1 : 2;

function transientFailureClass(message: string): TransientFailureClass | null {
  if (message.includes("KicksDB HTTP 5")) return "kicksdb_5xx";
  if (/DeadlineExceeded/i.test(message)) return "deadline_exceeded";
  if (/timeout|aborted/i.test(message)) return "timeout";
  if (/fetch failed|ECONNRESET|ECONNREFUSED|EAI_AGAIN/i.test(message)) return "network";
  return null;
}

function isUsableProduct(value: unknown, productId: string): value is KicksDbProduct {
  if (!value || typeof value !== "object") return false;
  const product = value as KicksDbProduct;
  return (
    product.id === productId &&
    Array.isArray(product.variants) &&
    product.variants.length > 0 &&
    Boolean(product.statistics && typeof product.statistics === "object")
  );
}

async function discoverTrackedSneakers(
  wordpressUrl: string,
  fetchImpl: typeof fetch,
): Promise<TrackedSneaker[]> {
  const response = await fetchImpl(`${wordpressUrl.replace(/\/$/, "")}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: inventoryQuery }),
  });
  const body = (await response.json().catch(() => null)) as {
    data?: { sneakers?: { nodes?: InventoryNode[] } };
    errors?: unknown;
  } | null;
  if (!response.ok || !body || body.errors) {
    throw new Error(`WPGraphQL inventory request failed (${response.status})`);
  }

  return (body.data?.sneakers?.nodes ?? [])
    .flatMap((node) => {
      const details = node.sneakerDetails;
      const productId = details?.kicksdbProductId?.trim();
      if (details?.marketTrackingEnabled !== true || !productId) return [];
      return [{
        databaseId: node.databaseId,
        title: node.title,
        slug: node.slug,
        productId,
        status: details.marketTrackingStatus?.[0] ?? null,
      }];
    })
    .sort((a, b) => statusPriority(a.status) - statusPriority(b.status));
}

export async function refreshAllMarketData({
  wordpressUrl,
  kicksDbApiKey,
  wordpressAdmin,
  marketRepository,
  fetchImpl = fetch,
  delayMs = 250,
  maxAttempts = 3,
  requestTimeoutMs = 30_000,
  circuitBreakerThreshold = 3,
  circuitBreakerEnabled = true,
  logger = console,
  sleepImpl = sleep,
  trackedSneakers,
}: RefreshAllMarketDataOptions): Promise<MarketRefreshSummary> {
  const startedAtMs = Date.now();
  const startedAt = new Date(startedAtMs).toISOString();
  const successes: RefreshSuccess[] = [];
  const failures: RefreshFailure[] = [];
  const skipped: TrackedSneaker[] = [];
  let retriesUsed = 0;
  let kicksDbRequests = 0;
  let quotaCurrent: string | null = null;
  let overallObservationsPersisted = 0;
  let sizeObservationsPersisted = 0;
  let wordpressUpdates = 0;
  let attemptedRefreshes = 0;
  let circuitBreakerTripped = false;
  let circuitBreakerReason: string | null = null;
  let consecutiveExhaustedTransientFailures = 0;
  let sneakers: TrackedSneaker[] = [];

  const finish = (
    status: MarketRefreshSummary["status"],
  ): MarketRefreshSummary => {
    const finishedAt = new Date().toISOString();
    return {
      status,
      startedAt,
      finishedAt,
      totalEligible: sneakers.length,
      attemptedRefreshes,
      successfulRefreshes: successes.length,
      failedRefreshes: failures.length,
      skippedRefreshes: skipped.length,
      retriesUsed,
      kicksDbRequests,
      quotaCurrent,
      overallObservationsPersisted,
      sizeObservationsPersisted,
      wordpressUpdates,
      elapsedMs: Date.now() - startedAtMs,
      circuitBreakerTripped,
      circuitBreakerReason,
      successes,
      failures,
      skipped,
    };
  };

  if (!Number.isInteger(circuitBreakerThreshold) || circuitBreakerThreshold < 2) {
    circuitBreakerReason = "Circuit-breaker threshold must be an integer of at least 2";
    return finish("aborted_internal_error");
  }

  try {
    sneakers = trackedSneakers ?? await discoverTrackedSneakers(wordpressUrl, fetchImpl);
  } catch (error) {
    circuitBreakerReason = error instanceof Error ? error.message : String(error);
    return finish("aborted_internal_error");
  }

  for (const [index, sneaker] of sneakers.entries()) {
    if (index > 0 && delayMs > 0) await sleepImpl(delayMs);
    attemptedRefreshes += 1;
    let finalError = "Unknown refresh failure";
    let attempts = 0;
    let refreshed = false;
    let finalTransientClass: TransientFailureClass | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      attempts = attempt;
      kicksDbRequests += 1;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
      try {
        const response = await fetchImpl(
          `https://api.kicks.dev/v3/stockx/products/${sneaker.productId}?display%5Bvariants%5D=true&display%5Bprices%5D=true&display%5Bstatistics%5D=true`,
          { headers: { Authorization: `Bearer ${kicksDbApiKey}` }, signal: controller.signal },
        );
        quotaCurrent = response.headers.get("x-quota-current") ?? quotaCurrent;
        const body = (await response.json().catch(() => null)) as { data?: unknown; detail?: string } | null;
        if (!response.ok) {
          finalError = `KicksDB HTTP ${response.status}${body?.detail ? `: ${body.detail}` : ""}`;
          if (response.status < 500) {
            finalTransientClass = null;
            break;
          }
          throw new Error(finalError);
        }
        if (!isUsableProduct(body?.data, sneaker.productId)) {
          finalError = "KicksDB returned an empty or incomplete enriched product response";
          finalTransientClass = null;
          break;
        }

        const retrievedAt = new Date().toISOString();
        const record = normalizeMarketDataRecord(body.data, retrievedAt);
        const snapshot = record.snapshot;
        await marketRepository.upsertProductRefresh(record);
        const readBack = await marketRepository.getMarketHistory(sneaker.productId);
        if (!readBack || readBack.snapshot.retrievedAt !== retrievedAt) {
          throw new Error("Market persistence read-back failed");
        }
        await wordpressAdmin.updateSneakerMarketAdminFields(sneaker.databaseId, {
          marketTrackingStatus: "active",
          marketLastSuccessfulSyncAt: retrievedAt,
        });
        wordpressUpdates += 1;
        overallObservationsPersisted += 1;
        sizeObservationsPersisted += snapshot.sizes.length;
        successes.push({ sneaker, attempts, retrievedAt, sizeObservations: snapshot.sizes.length });
        refreshed = true;
        consecutiveExhaustedTransientFailures = 0;
        logger.info(`[market:refresh] ${sneaker.title}: refreshed (${snapshot.sizes.length} sizes)`);
        break;
      } catch (error) {
        finalError = error instanceof Error ? error.message : String(error);
        finalTransientClass = transientFailureClass(finalError);
        if (!finalTransientClass || attempt === maxAttempts) break;
        retriesUsed += 1;
        const backoffMs = 500 * 2 ** (attempt - 1);
        logger.warn(`[market:refresh] ${sneaker.title}: retrying in ${backoffMs}ms (${finalError})`);
        await sleepImpl(backoffMs);
      } finally {
        clearTimeout(timeout);
      }
    }

    if (!refreshed) {
      failures.push({ sneaker, attempts, error: finalError, transientClass: finalTransientClass });
      logger.warn(`[market:refresh] ${sneaker.title}: failed after ${attempts} attempt(s): ${finalError}`);
      if (finalTransientClass && attempts === maxAttempts) {
        consecutiveExhaustedTransientFailures += 1;
      } else {
        consecutiveExhaustedTransientFailures = 0;
      }
      if (circuitBreakerEnabled && consecutiveExhaustedTransientFailures >= circuitBreakerThreshold) {
        circuitBreakerTripped = true;
        circuitBreakerReason = `${consecutiveExhaustedTransientFailures} consecutive products exhausted transient KicksDB retries; latest class=${finalTransientClass}`;
        skipped.push(...sneakers.slice(index + 1));
        logger.warn(`[market:refresh] circuit breaker tripped; skipped ${skipped.length} remaining sneaker(s)`);
        break;
      }
    }
  }

  if (circuitBreakerTripped) return finish("upstream_unavailable");
  if (failures.length > 0) return finish("completed_with_failures");
  return finish("completed");
}
