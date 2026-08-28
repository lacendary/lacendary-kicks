import test from "node:test";
import assert from "node:assert/strict";
import { classifyMarketMapping } from "../app/lib/market-mapping.ts";

const candidate = (productId: string, sku: string) => ({ productId, sku, title: `Product ${productId}` });

test("classifies an exact SKU match", () => assert.equal(classifyMarketMapping(" DD0587-002 ", [candidate("one", "DD0587-002")]), "exact_match"));
test("classifies duplicate exact SKU records as ambiguous", () => assert.equal(classifyMarketMapping("DM7866-104", [candidate("one", "DM7866-104"), candidate("two", "DM7866-104")]), "ambiguous"));
test("classifies a combined SKU as reviewable, not exact", () => assert.equal(classifyMarketMapping("IU7240-300", [candidate("one", "IU7240-300 / IU7239-300")]), "combined_sku_match"));
test("classifies unrelated results and no results", () => {
  assert.equal(classifyMarketMapping("SKU-1", [candidate("one", "SKU-2")]), "review_required");
  assert.equal(classifyMarketMapping("SKU-1", []), "no_match");
});
