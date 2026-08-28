import nextEnv from "@next/env";
import { readFile } from "node:fs/promises";
import { MARKET_SNAPSHOT_STORE, type MarketDataRecord } from "../app/lib/market.ts";
import { createWordPressMarketRepository } from "../app/lib/market-repository-wordpress.ts";

nextEnv.loadEnvConfig(process.cwd());
const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};
const source = JSON.parse(await readFile(MARKET_SNAPSHOT_STORE, "utf8")) as Record<string, MarketDataRecord>;
const repository = createWordPressMarketRepository({
  wordpressUrl: required("NEXT_PUBLIC_WORDPRESS_URL"),
  secret: required("LACENDARY_MARKET_API_SECRET"),
});
let sizeSnapshots = 0;
let overall = 0;
let sizeHistory = 0;
for (const [productId, record] of Object.entries(source)) {
  await repository.upsertProductRefresh(record);
  const destination = await repository.getMarketHistory(productId);
  if (JSON.stringify(destination) !== JSON.stringify(record)) {
    throw new Error(`Migration parity failed for ${productId}`);
  }
  sizeSnapshots += record.snapshot.sizes.length;
  overall += record.overallDaily.length;
  sizeHistory += record.sizeDaily.length;
  console.log(`[market:migrate] ${productId}: verified`);
}
console.log(JSON.stringify({ products: Object.keys(source).length, sizeSnapshots, overallHistory: overall, sizeHistory }, null, 2));
