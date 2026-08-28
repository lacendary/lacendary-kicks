import { readFile } from "node:fs/promises";
import {
  appendDailyMarketObservations,
  getMarketHistory,
  normalizeMarketSnapshot,
  saveMarketSnapshot,
} from "../app/lib/market.ts";

type EnabledSneaker = {
  databaseId: number;
  title: string;
  slug: string;
  sneakerDetails: {
    marketTrackingEnabled: boolean | null;
    kicksdbProductId: string | null;
  };
};

const envFile = await readFile(".env.local", "utf8");
const apiKey =
  process.env.KICKSDB_API_KEY ??
  envFile.match(/^KICKSDB_API_KEY=(.*)$/m)?.[1]?.trim();
const wordpressUrl =
  process.env.NEXT_PUBLIC_WORDPRESS_URL ??
  envFile.match(/^NEXT_PUBLIC_WORDPRESS_URL=(.*)$/m)?.[1]?.trim();

if (!apiKey) throw new Error("KICKSDB_API_KEY is required");
if (!wordpressUrl) throw new Error("NEXT_PUBLIC_WORDPRESS_URL is required");

const inventoryResponse = await fetch(`${wordpressUrl}/graphql`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: `
      query EnabledMarketInventory {
        sneakers(first: 100) {
          nodes {
            databaseId
            title
            slug
            sneakerDetails {
              marketTrackingEnabled
              kicksdbProductId
            }
          }
        }
      }
    `,
  }),
});

if (!inventoryResponse.ok) {
  throw new Error(`WPGraphQL inventory request failed: ${inventoryResponse.status}`);
}

const inventoryJson = (await inventoryResponse.json()) as {
  data?: { sneakers?: { nodes?: EnabledSneaker[] } };
  errors?: unknown;
};
if (inventoryJson.errors) {
  throw new Error(`WPGraphQL inventory returned errors: ${JSON.stringify(inventoryJson.errors)}`);
}

const mapped = (inventoryJson.data?.sneakers?.nodes ?? []).filter(
  (sneaker) =>
    sneaker.sneakerDetails.marketTrackingEnabled === true &&
    Boolean(sneaker.sneakerDetails.kicksdbProductId?.trim()),
);

const results: Array<Record<string, unknown>> = [];
for (const sneaker of mapped) {
  const productId = sneaker.sneakerDetails.kicksdbProductId!.trim();
  const retrievedAt = new Date().toISOString();
  const productResponse = await fetch(
    `https://api.kicks.dev/v3/stockx/products/${productId}?display%5Bvariants%5D=true&display%5Bprices%5D=true&display%5Bstatistics%5D=true`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  );
  const quotaCurrent = productResponse.headers.get("x-quota-current");

  if (!productResponse.ok) {
    results.push({
      databaseId: sneaker.databaseId,
      title: sneaker.title,
      productId,
      status: productResponse.status,
      persisted: false,
      quotaCurrent,
    });
    continue;
  }

  const body = (await productResponse.json()) as { data?: Parameters<typeof normalizeMarketSnapshot>[0] };
  if (!body.data || body.data.id !== productId) {
    results.push({
      databaseId: sneaker.databaseId,
      title: sneaker.title,
      productId,
      status: productResponse.status,
      persisted: false,
      error: "Product-detail response did not contain the requested product ID",
      quotaCurrent,
    });
    continue;
  }

  const snapshot = normalizeMarketSnapshot(body.data, retrievedAt);
  await saveMarketSnapshot(snapshot);
  await appendDailyMarketObservations(body.data, retrievedAt);
  const readBack = await getMarketHistory(productId);
  if (!readBack || readBack.snapshot.retrievedAt !== retrievedAt) {
    throw new Error(`Market data read-back failed for ${productId}`);
  }

  results.push({
    databaseId: sneaker.databaseId,
    title: sneaker.title,
    slug: sneaker.slug,
    productId,
    status: productResponse.status,
    persisted: true,
    retrievedAt,
    sourceUpdatedAt: snapshot.sourceUpdatedAt,
    sizeSnapshots: snapshot.sizes.length,
    overallDaily: readBack.overallDaily.length,
    sizeDaily: readBack.sizeDaily.length,
    quotaCurrent,
  });
}

console.log(JSON.stringify({ detailRequests: mapped.length, results }, null, 2));
