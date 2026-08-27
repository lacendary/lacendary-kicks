import { getMarketHistory, migrateMarketHistory } from "../app/lib/market.ts";

const productId = "6d3e52de-9537-42d5-812d-e7871ff57b4b";
await migrateMarketHistory();
const record = await getMarketHistory(productId);
if (!record) throw new Error("Market history read-back failed");
console.log(JSON.stringify({ productId, overallDaily: record.overallDaily, sizeDaily: record.sizeDaily }, null, 2));
