export type MarketMappingCandidate = { productId: string; title: string; sku: string };

export function classifyMarketMapping(sku: string, candidates: MarketMappingCandidate[]) {
  const normalized = sku.trim().toUpperCase();
  const exact = candidates.filter((item) => item.sku.trim().toUpperCase() === normalized);
  const combined = candidates.filter((item) => item.sku.toUpperCase().split(/\s*\/\s*/).includes(normalized));
  if (exact.length === 1) return "exact_match" as const;
  if (exact.length > 1) return "ambiguous" as const;
  if (combined.length === 1) return "combined_sku_match" as const;
  if (candidates.length > 0) return "review_required" as const;
  return "no_match" as const;
}
