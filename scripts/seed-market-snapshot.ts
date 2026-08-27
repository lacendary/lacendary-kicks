import { readFile } from "node:fs/promises";
import { appendDailyMarketObservations, getMarketHistory, normalizeMarketSnapshot, saveMarketSnapshot } from "../app/lib/market.ts";

const productId = "6d3e52de-9537-42d5-812d-e7871ff57b4b";
const envFile = await readFile(".env.local", "utf8");
const apiKey = process.env.KICKSDB_API_KEY ?? envFile.match(/^KICKSDB_API_KEY=(.*)$/m)?.[1];
if (!apiKey) throw new Error("KICKSDB_API_KEY is required");

const response = await fetch(`https://api.kicks.dev/v3/stockx/products/${productId}?display%5Bvariants%5D=true&display%5Bprices%5D=true&display%5Bstatistics%5D=true`, { headers: { Authorization: `Bearer ${apiKey}` } });
if (!response.ok) throw new Error(`KicksDB request failed: ${response.status}`);
const product = (await response.json()).data;
const snapshot = normalizeMarketSnapshot(product);
await saveMarketSnapshot(snapshot);
const history = await appendDailyMarketObservations(product);
const readBack = await getMarketHistory(productId);
if (!readBack) throw new Error("Market data read-back failed");
console.log(JSON.stringify({ store: "data/market-snapshots.json", productId, sizeCount: history.sizeDaily.length, overallDaily: readBack.overallDaily, sizeDailySample: readBack.sizeDaily.slice(0, 2) }, null, 2));
