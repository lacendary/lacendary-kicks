import { refreshAllMarketData } from "@/app/lib/market-refresh";
import { createMarketRepository } from "@/app/lib/market-repository-factory";
import { createMarketOperationsClient, type MarketWorkerRequest } from "@/app/lib/market-operations";
import { verifyWorkerRequest } from "@/app/lib/market-worker-auth";
import { createWordPressMarketAdmin } from "@/app/lib/wordpress-market-admin";

export const runtime = "nodejs";
export const maxDuration = 300;

const required = (name: string) => { const value = process.env[name]?.trim(); if (!value) throw new Error(`${name} is required`); return value; };

export async function POST(request: Request) {
  const raw = await request.text();
  const secret = required("LACENDARY_MARKET_API_SECRET");
  const auth = verifyWorkerRequest(request, raw, secret);
  if (!auth.ok) return Response.json({ error: auth.reason }, { status: auth.status });
  const wordpressUrl = required("NEXT_PUBLIC_WORDPRESS_URL");
  const operations = createMarketOperationsClient(wordpressUrl, secret);
  try { await operations.claimWorkerRequest(auth.requestId); }
  catch { return Response.json({ error: "replayed_request" }, { status: 409 }); }
  let input: MarketWorkerRequest;
  try { input = JSON.parse(raw) as MarketWorkerRequest; }
  catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }

  const kicksDbApiKey = required("KICKSDB_API_KEY");
  const authorization = { Authorization: `Bearer ${kicksDbApiKey}` };
  if (input.action === "mapping_review") {
    const sku = input.sku.trim();
    if (!sku || sku.length > 80) return Response.json({ error: "invalid_sku" }, { status: 400 });
    const response = await fetch(`https://api.kicks.dev/v3/stockx/products?query=${encodeURIComponent(sku)}`, { headers: authorization, cache: "no-store" });
    const body = await response.json().catch(() => null) as { data?: Array<{ id: string; title?: string; name?: string; sku?: string; style_id?: string }> } | null;
    if (!response.ok) return Response.json({ error: "kicksdb_request_failed", status: response.status }, { status: 502 });
    const candidates = Array.isArray(body?.data) ? body.data.map((item) => ({ productId: item.id, title: item.title ?? item.name ?? "Unknown", sku: item.sku ?? item.style_id ?? "" })) : [];
    const normalized = sku.toUpperCase();
    const exact = candidates.filter((item) => item.sku.trim().toUpperCase() === normalized);
    const combined = candidates.filter((item) => item.sku.toUpperCase().split(/\s*\/\s*/).includes(normalized));
    const classification = exact.length === 1 ? "exact_match" : exact.length > 1 ? "ambiguous" : combined.length === 1 ? "combined_sku_match" : candidates.length ? "review_required" : "no_match";
    return Response.json({ classification, storedMappingValid: Boolean(input.storedProductId && candidates.some((item) => item.productId === input.storedProductId)), candidates });
  }

  if (input.action === "mapping_validate") {
    if (!/^[A-Za-z0-9-]{8,128}$/.test(input.productId)) return Response.json({ error: "invalid_product_id" }, { status: 400 });
    const response = await fetch(`https://api.kicks.dev/v3/stockx/products/${input.productId}`, { headers: authorization, cache: "no-store" });
    const body = await response.json().catch(() => null) as { data?: { id?: string; title?: string; name?: string; sku?: string; style_id?: string } } | null;
    if (!response.ok || body?.data?.id !== input.productId) return Response.json({ error: "invalid_product_id" }, { status: 400 });
    return Response.json({ valid: true, candidate: { productId: body.data.id, title: body.data.title ?? body.data.name ?? "Unknown", sku: body.data.sku ?? body.data.style_id ?? "" }, confirmationRequired: true });
  }

  const wordpressAdmin = createWordPressMarketAdmin({ wordpressUrl, username: required("WORDPRESS_API_USERNAME"), applicationPassword: required("WORDPRESS_API_PASSWORD") });
  if (input.action === "mapping_override") {
    if (!/^[A-Za-z0-9-]{8,128}$/.test(input.productId) || !input.reason.trim()) return Response.json({ error: "invalid_override" }, { status: 400 });
    const productResponse = await fetch(`https://api.kicks.dev/v3/stockx/products/${input.productId}`, { headers: authorization, cache: "no-store" });
    const productBody = await productResponse.json().catch(() => null) as { data?: { id?: string; title?: string; name?: string; sku?: string } } | null;
    if (!productResponse.ok || productBody?.data?.id !== input.productId) return Response.json({ error: "invalid_product_id" }, { status: 400 });
    await wordpressAdmin.updateSneakerMarketAdminFields(input.databaseId, { kicksdbProductId: input.productId, marketTrackingStatus: "mapped", marketNotes: `Mapping method: manual_override. ${input.reason.trim()}` });
    if (!input.hydrate) return Response.json({ validated: true, applied: true, candidate: productBody.data });
  }

  const sneaker = input.action === "single" || input.action === "mapping_override" ? input.sneaker : undefined;
  const lockKey = sneaker ? `single:${sneaker.productId}` : "full";
  try { await operations.acquireLock(lockKey, 360); }
  catch { return Response.json({ status: "already_running" }, { status: 409 }); }
  try {
    const summary = await refreshAllMarketData({ wordpressUrl, kicksDbApiKey, wordpressAdmin, marketRepository: createMarketRepository(), trackedSneakers: sneaker ? [sneaker] : undefined, circuitBreakerEnabled: !sneaker, circuitBreakerThreshold: Number(process.env.MARKET_REFRESH_CIRCUIT_BREAKER_THRESHOLD ?? 3) });
    const runType = sneaker ? "manual_single" : input.action === "full" ? input.runType : "manual_single";
    await operations.saveRun({ runType, summary, requestedProductId: sneaker?.productId, sneakerDatabaseId: sneaker?.databaseId });
    return Response.json(summary);
  } finally { await operations.releaseLock(lockKey).catch(() => undefined); }
}
