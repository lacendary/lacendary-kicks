import { createHash, createHmac, randomUUID } from "node:crypto";
import type { MarketRefreshSummary, TrackedSneaker } from "./market-refresh.ts";

export type MarketRunType = "scheduled_full" | "manual_full" | "manual_single";
export type MarketRunRecord = { runType: MarketRunType; summary: MarketRefreshSummary; requestedProductId?: string; sneakerDatabaseId?: number };

export function createMarketOperationsClient(wordpressUrl: string, secret: string, fetchImpl: typeof fetch = fetch) {
  const root = `${wordpressUrl.replace(/\/$/, "")}/wp-json/lacendary-market/v1`;
  async function request<T>(path: string, body: unknown): Promise<T> {
    const raw = JSON.stringify(body);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const requestId = randomUUID();
    const route = `/wp-json/lacendary-market/v1${path}`;
    const canonical = ["POST", route, timestamp, requestId, createHash("sha256").update(raw).digest("hex")].join("\n");
    const signature = createHmac("sha256", secret).update(canonical).digest("hex");
    const response = await fetchImpl(`${root}${path}`, { method: "POST", headers: { "Content-Type": "application/json", "X-Lacendary-Timestamp": timestamp, "X-Lacendary-Request-Id": requestId, "X-Lacendary-Signature": signature }, body: raw, cache: "no-store" });
    const payload = await response.json().catch(() => null) as T | { message?: string } | null;
    if (!response.ok) throw new Error(`Market operations API ${response.status}: ${payload && typeof payload === "object" && "message" in payload ? payload.message : "request failed"}`);
    return payload as T;
  }
  return {
    claimWorkerRequest(requestId: string) { return request<{ ok: true }>("/worker/nonce", { requestId }); },
    acquireLock(key: string, ttlSeconds = 360) { return request<{ acquired: true }>("/locks/acquire", { key, ttlSeconds }); },
    releaseLock(key: string) { return request<{ released: true }>("/locks/release", { key }); },
    saveRun(run: MarketRunRecord) { return request<{ id: number }>("/runs", run); },
    getAutomationSettings() { return request<{ enabled: boolean; refreshTime: string; timezone: string; nextRunAt: string | null }>("/automation/settings", {}); },
  };
}

export type MarketWorkerRequest =
  | { action: "full"; runType: "scheduled_full" | "manual_full" }
  | { action: "single"; runType: "manual_single"; sneaker: TrackedSneaker }
  | { action: "mapping_review"; databaseId: number; sku: string; storedProductId?: string }
  | { action: "mapping_validate"; databaseId: number; productId: string }
  | { action: "mapping_override"; databaseId: number; productId: string; reason: string; hydrate: boolean; sneaker: TrackedSneaker };
