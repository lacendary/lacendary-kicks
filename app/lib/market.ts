import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type SizeMarketSnapshot = {
  size: string;
  variantId: string;
  lowestAsk: number | null;
  totalAsks: number | null;
  salesCount15Days: number | null;
  salesCount30Days: number | null;
  salesCount60Days: number | null;
  identifiers: Array<{ identifier: string; identifierType: string }>;
  currency: string | null;
  market: string | null;
  sourceUpdatedAt: string | null;
};

export type MarketSnapshot = {
  productId: string;
  retrievedAt: string;
  sourceUpdatedAt: string | null;
  last90Days: { averagePrice: number | null; salesCount: number | null; high: number | null; low: number | null };
  annual: { averagePrice: number | null; salesCount: number | null; high: number | null; low: number | null; rangeHigh: number | null; rangeLow: number | null; volatility: number | null; pricePremium: number | null; totalDollars: number | null };
  sizes: SizeMarketSnapshot[];
};

export type MarketHistoryPoint = {
  productId: string;
  date: string;
  marketAveragePrice: number | null;
  last90Days: MarketSnapshot["last90Days"];
  annual: MarketSnapshot["annual"];
  source: "kicksdb.standard.product-detail";
  sourceUpdatedAt: string | null;
  retrievedAt: string;
};

export type SizeMarketHistoryPoint = {
  productId: string;
  size: string;
  variantId: string;
  date: string;
  lowestAsk: number | null;
  totalAsks: number | null;
  salesCount15Days: number | null;
  salesCount30Days: number | null;
  salesCount60Days: number | null;
  source: "kicksdb.standard.product-detail";
  sourceUpdatedAt: string | null;
  retrievedAt: string;
};

export type MarketDataRecord = {
  snapshot: MarketSnapshot;
  overallDaily: MarketHistoryPoint[];
  sizeDaily: SizeMarketHistoryPoint[];
};

export type KicksDbProduct = {
  id: string;
  avg_price?: number;
  updated_at?: string;
  variants?: Array<{
    id: string; size: string; lowest_ask?: number; total_asks?: number;
    sales_count_15_days?: number; sales_count_30_days?: number; sales_count_60_days?: number;
    identifiers?: Array<{ identifier?: string; identifier_type?: string }>;
    currency?: string; market?: string; updated_at?: string;
  }>;
  statistics?: Record<string, number | undefined>;
};

export const MARKET_SNAPSHOT_STORE = path.join(process.cwd(), "data", "market-snapshots.json");
const n = (value: number | undefined) => value ?? null;

export function normalizeMarketSnapshot(product: KicksDbProduct, retrievedAt = new Date().toISOString()): MarketSnapshot {
  const s = product.statistics ?? {};
  return {
    productId: product.id, retrievedAt, sourceUpdatedAt: product.updated_at ?? null,
    last90Days: { averagePrice: n(s.last_90_days_average_price), salesCount: n(s.last_90_days_sales_count), high: n(s.last_90_days_range_high), low: n(s.last_90_days_range_low) },
    annual: { averagePrice: n(s.annual_average_price), salesCount: n(s.annual_sales_count), high: n(s.annual_high), low: n(s.annual_low), rangeHigh: n(s.annual_range_high), rangeLow: n(s.annual_range_low), volatility: n(s.annual_volatility), pricePremium: n(s.annual_price_premium), totalDollars: n(s.annual_total_dollars) },
    sizes: (product.variants ?? []).map((v) => ({
      size: v.size, variantId: v.id, lowestAsk: n(v.lowest_ask), totalAsks: n(v.total_asks),
      salesCount15Days: n(v.sales_count_15_days), salesCount30Days: n(v.sales_count_30_days), salesCount60Days: n(v.sales_count_60_days),
      identifiers: (v.identifiers ?? []).flatMap((i) => i.identifier ? [{ identifier: i.identifier, identifierType: i.identifier_type ?? "unknown" }] : []),
      currency: v.currency ?? null, market: v.market ?? null, sourceUpdatedAt: v.updated_at ?? null,
    })),
  };
}

export function normalizeMarketDataRecord(
  product: KicksDbProduct,
  retrievedAt = new Date().toISOString(),
  date = retrievedAt.slice(0, 10),
): MarketDataRecord {
  const snapshot = normalizeMarketSnapshot(product, retrievedAt);
  const source = "kicksdb.standard.product-detail" as const;
  return {
    snapshot,
    overallDaily: [{
      productId: product.id,
      date,
      marketAveragePrice: n(product.avg_price),
      last90Days: snapshot.last90Days,
      annual: snapshot.annual,
      source,
      sourceUpdatedAt: product.updated_at ?? null,
      retrievedAt,
    }],
    sizeDaily: snapshot.sizes.map((size) => ({
      productId: product.id,
      size: size.size,
      variantId: size.variantId,
      date,
      lowestAsk: size.lowestAsk,
      totalAsks: size.totalAsks,
      salesCount15Days: size.salesCount15Days,
      salesCount30Days: size.salesCount30Days,
      salesCount60Days: size.salesCount60Days,
      source,
      sourceUpdatedAt: size.sourceUpdatedAt,
      retrievedAt,
    })),
  };
}

export async function saveMarketSnapshot(snapshot: MarketSnapshot) {
  let stored: Record<string, MarketDataRecord> = {};
  try { stored = JSON.parse(await readFile(MARKET_SNAPSHOT_STORE, "utf8")); } catch { /* first write */ }
  const existing = stored[snapshot.productId];
  stored[snapshot.productId] = existing?.snapshot
    ? { ...existing, snapshot }
    : { snapshot, overallDaily: [], sizeDaily: [] };
  await mkdir(path.dirname(MARKET_SNAPSHOT_STORE), { recursive: true });
  await writeFile(MARKET_SNAPSHOT_STORE, `${JSON.stringify(stored, null, 2)}\n`, "utf8");
}

export async function getMarketSnapshot(productId: string) {
  const stored: Record<string, MarketDataRecord | MarketSnapshot> = JSON.parse(await readFile(MARKET_SNAPSHOT_STORE, "utf8"));
  const record = stored[productId];
  return record && "snapshot" in record ? record.snapshot : record ?? null;
}

export async function appendDailyMarketObservations(
  product: KicksDbProduct,
  retrievedAt = new Date().toISOString(),
  date = retrievedAt.slice(0, 10)
) {
  let stored: Record<string, MarketDataRecord> = {};
  try { stored = JSON.parse(await readFile(MARKET_SNAPSHOT_STORE, "utf8")); } catch { /* first write */ }

  const current = stored[product.id] ?? {
    snapshot: normalizeMarketSnapshot(product, retrievedAt),
    overallDaily: [],
    sizeDaily: [],
  };
  const source = "kicksdb.standard.product-detail" as const;
  const overallPoint: MarketHistoryPoint = {
    productId: product.id, date, marketAveragePrice: n(product.avg_price),
    last90Days: { averagePrice: n(product.statistics?.last_90_days_average_price), salesCount: n(product.statistics?.last_90_days_sales_count), high: n(product.statistics?.last_90_days_range_high), low: n(product.statistics?.last_90_days_range_low) },
    annual: { averagePrice: n(product.statistics?.annual_average_price), salesCount: n(product.statistics?.annual_sales_count), high: n(product.statistics?.annual_high), low: n(product.statistics?.annual_low), rangeHigh: n(product.statistics?.annual_range_high), rangeLow: n(product.statistics?.annual_range_low), volatility: n(product.statistics?.annual_volatility), pricePremium: n(product.statistics?.annual_price_premium), totalDollars: n(product.statistics?.annual_total_dollars) },
    source, sourceUpdatedAt: product.updated_at ?? null, retrievedAt,
  };
  const sizePoints: SizeMarketHistoryPoint[] = (product.variants ?? []).map((v) => ({
    productId: product.id, size: v.size, variantId: v.id, date,
    lowestAsk: n(v.lowest_ask), totalAsks: n(v.total_asks), salesCount15Days: n(v.sales_count_15_days), salesCount30Days: n(v.sales_count_30_days), salesCount60Days: n(v.sales_count_60_days), source,
    sourceUpdatedAt: v.updated_at ?? null, retrievedAt,
  }));

  current.overallDaily = [...current.overallDaily.filter((p) => p.date !== date), overallPoint];
  const sizesForDate = new Set(sizePoints.map((p) => p.size));
  current.sizeDaily = [
    ...current.sizeDaily.filter((p) => !(p.date === date && sizesForDate.has(p.size))),
    ...sizePoints,
  ];
  stored[product.id] = current;
  await mkdir(path.dirname(MARKET_SNAPSHOT_STORE), { recursive: true });
  await writeFile(MARKET_SNAPSHOT_STORE, `${JSON.stringify(stored, null, 2)}\n`, "utf8");
  return current;
}

export async function getMarketHistory(productId: string) {
  const stored: Record<string, MarketDataRecord> = JSON.parse(await readFile(MARKET_SNAPSHOT_STORE, "utf8"));
  return stored[productId] ?? null;
}

export async function migrateMarketHistory() {
  const stored: Record<string, MarketDataRecord> = JSON.parse(await readFile(MARKET_SNAPSHOT_STORE, "utf8"));
  for (const record of Object.values(stored)) {
    record.overallDaily = record.overallDaily.map((point) => {
      const legacy = point as MarketHistoryPoint & { averageSalePrice?: number | null; salesCount?: number | null };
      const { averageSalePrice: _averageSalePrice, salesCount: _salesCount, ...cleanPoint } = legacy;
      return {
        ...cleanPoint,
        marketAveragePrice: legacy.marketAveragePrice ?? legacy.averageSalePrice ?? null,
        last90Days: legacy.last90Days ?? record.snapshot.last90Days,
        annual: legacy.annual ?? record.snapshot.annual,
      };
    });
    record.sizeDaily = record.sizeDaily.map((point) => {
      const size = record.snapshot.sizes.find((item) => item.size === point.size);
      return {
        ...point,
        salesCount15Days: point.salesCount15Days ?? size?.salesCount15Days ?? null,
        salesCount30Days: point.salesCount30Days ?? size?.salesCount30Days ?? null,
        salesCount60Days: point.salesCount60Days ?? size?.salesCount60Days ?? null,
      };
    });
  }
  await writeFile(MARKET_SNAPSHOT_STORE, `${JSON.stringify(stored, null, 2)}\n`, "utf8");
}
