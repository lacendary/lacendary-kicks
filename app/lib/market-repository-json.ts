import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { MARKET_SNAPSHOT_STORE, type MarketDataRecord } from "./market.ts";
import { validateProductId, type MarketRepository } from "./market-repository.ts";

async function readStore(): Promise<Record<string, MarketDataRecord>> {
  try { return JSON.parse(await readFile(MARKET_SNAPSHOT_STORE, "utf8")); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

export function createJsonMarketRepository(storePath = MARKET_SNAPSHOT_STORE): MarketRepository {
  async function read() {
    if (storePath === MARKET_SNAPSHOT_STORE) return readStore();
    try { return JSON.parse(await readFile(storePath, "utf8")) as Record<string, MarketDataRecord>; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return {}; throw error; }
  }
  return {
    async upsertProductRefresh(record) {
      const productId = validateProductId(record.snapshot.productId);
      const store = await read();
      const existing = store[productId];
      const dates = new Set(record.overallDaily.map((point) => point.date));
      const sizeKeys = new Set(record.sizeDaily.map((point) => `${point.size}\0${point.date}`));
      store[productId] = {
        snapshot: record.snapshot,
        overallDaily: [...(existing?.overallDaily ?? []).filter((point) => !dates.has(point.date)), ...record.overallDaily],
        sizeDaily: [...(existing?.sizeDaily ?? []).filter((point) => !sizeKeys.has(`${point.size}\0${point.date}`)), ...record.sizeDaily],
      };
      await mkdir(path.dirname(storePath), { recursive: true });
      await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
    },
    async getMarketSnapshot(productId) { return (await read())[validateProductId(productId)]?.snapshot ?? null; },
    async getSizeSnapshots(productId) { return (await read())[validateProductId(productId)]?.snapshot.sizes ?? []; },
    async getOverallHistory(productId) { return (await read())[validateProductId(productId)]?.overallDaily ?? []; },
    async getSizeHistory(productId, size) {
      const points = (await read())[validateProductId(productId)]?.sizeDaily ?? [];
      return size === undefined ? points : points.filter((point) => point.size === size);
    },
    async getMarketHistory(productId) { return (await read())[validateProductId(productId)] ?? null; },
  };
}
