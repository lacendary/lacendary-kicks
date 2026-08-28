import type { MarketRepository } from "./market-repository.ts";
import { createJsonMarketRepository } from "./market-repository-json.ts";
import { createWordPressMarketRepository } from "./market-repository-wordpress.ts";

export function createMarketRepository(env: NodeJS.ProcessEnv = process.env): MarketRepository {
  const adapter = (env.MARKET_STORAGE_ADAPTER ?? "json").trim().toLowerCase();
  if (adapter === "json") return createJsonMarketRepository();
  if (adapter !== "wordpress") throw new Error(`Unsupported MARKET_STORAGE_ADAPTER: ${adapter}`);
  const wordpressUrl = env.NEXT_PUBLIC_WORDPRESS_URL?.trim();
  const secret = env.LACENDARY_MARKET_API_SECRET?.trim();
  if (!wordpressUrl) throw new Error("NEXT_PUBLIC_WORDPRESS_URL is required for WordPress market storage");
  if (!secret) throw new Error("LACENDARY_MARKET_API_SECRET is required for WordPress market storage");
  return createWordPressMarketRepository({ wordpressUrl, secret });
}
