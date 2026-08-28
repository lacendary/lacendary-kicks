import type { MarketDataRecord, MarketSnapshot, SizeMarketSnapshot, MarketHistoryPoint, SizeMarketHistoryPoint } from "./market.ts";

export type MarketRepository = {
  upsertProductRefresh(record: MarketDataRecord): Promise<void>;
  getMarketSnapshot(productId: string): Promise<MarketSnapshot | null>;
  getSizeSnapshots(productId: string): Promise<SizeMarketSnapshot[]>;
  getOverallHistory(productId: string): Promise<MarketHistoryPoint[]>;
  getSizeHistory(productId: string, size?: string): Promise<SizeMarketHistoryPoint[]>;
  getMarketHistory(productId: string): Promise<MarketDataRecord | null>;
};

export function validateProductId(productId: string) {
  const value = productId.trim();
  if (!/^[A-Za-z0-9-]{8,128}$/.test(value)) throw new Error("Invalid market product ID");
  return value;
}
