import { client } from "./wordpress";
import { GET_RECENT_SNEAKERS } from "./graphql/sneaker";

/* ==========================================================================
   Types
   ========================================================================== */

type RecentSneakersResponse = {
  sneakers: {
    nodes: any[];
  };
};

/* ==========================================================================
   Recently Archived
   ========================================================================== */

export async function getRecentSneakers() {
  const data = await client.request<RecentSneakersResponse>(
    GET_RECENT_SNEAKERS
  );

  return data.sneakers.nodes;
}