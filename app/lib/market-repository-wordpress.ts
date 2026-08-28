import { createHash, createHmac, randomUUID } from "node:crypto";
import type { MarketHistoryPoint, MarketSnapshot, SizeMarketHistoryPoint, SizeMarketSnapshot } from "./market.ts";
import { validateProductId, type MarketRepository } from "./market-repository.ts";

type Options = { wordpressUrl: string; secret: string; fetchImpl?: typeof fetch };

export function createWordPressMarketRepository({ wordpressUrl, secret, fetchImpl = fetch }: Options): MarketRepository {
  const base = `${wordpressUrl.replace(/\/$/, "")}/wp-json/lacendary-market/v1`;
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const method = (init.method ?? "GET").toUpperCase();
    const body = typeof init.body === "string" ? init.body : "";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const requestId = randomUUID();
    const canonical = [method, `/wp-json/lacendary-market/v1${path}`, timestamp, requestId, createHash("sha256").update(body).digest("hex")].join("\n");
    const signature = createHmac("sha256", secret).update(canonical).digest("hex");
    const response = await fetchImpl(`${base}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        "X-Lacendary-Timestamp": timestamp,
        "X-Lacendary-Request-Id": requestId,
        "X-Lacendary-Signature": signature,
        ...init.headers,
      },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null) as T | { message?: string } | null;
    if (!response.ok) throw new Error(`Market API ${response.status}: ${payload && typeof payload === "object" && "message" in payload ? payload.message : "request failed"}`);
    return payload as T;
  }
  const encoded = (value: string) => encodeURIComponent(validateProductId(value));
  return {
    async upsertProductRefresh(record) { await request("/refresh", { method: "POST", body: JSON.stringify(record) }); },
    getMarketSnapshot(productId) { return request<MarketSnapshot | null>(`/products/${encoded(productId)}`, { method: "POST" }); },
    getSizeSnapshots(productId) { return request<SizeMarketSnapshot[]>(`/products/${encoded(productId)}/sizes`, { method: "POST" }); },
    getOverallHistory(productId) { return request<MarketHistoryPoint[]>(`/products/${encoded(productId)}/history`, { method: "POST" }); },
    getSizeHistory(productId, size) {
      const suffix = size === undefined ? "" : `/${encodeURIComponent(size)}`;
      return request<SizeMarketHistoryPoint[]>(`/products/${encoded(productId)}/sizes${suffix}/history`, { method: "POST" });
    },
    async getMarketHistory(productId) {
      const [snapshot, overallDaily, sizeDaily] = await Promise.all([
        this.getMarketSnapshot(productId), this.getOverallHistory(productId), this.getSizeHistory(productId),
      ]);
      return snapshot ? { snapshot: { ...snapshot, sizes: await this.getSizeSnapshots(productId) }, overallDaily, sizeDaily } : null;
    },
  };
}
