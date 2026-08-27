import { client } from "./wordpress";
import { GET_RECENT_SNEAKERS } from "./graphql/sneaker";

/* ==========================================================================\n+   Sneaker Data Model\n+   ========================================================================== */

export type SneakerMarketTracking = {
  marketTrackingEnabled: boolean | null;
  kicksdbProductId: string | null;
  marketTrackingStatus: string[] | null;
  marketLastSuccessfulSyncAt: string | null;
  marketNotes: string | null;
};

export type SneakerDetails = SneakerMarketTracking & {
  [key: string]: unknown;
};

export type Sneaker = {
  title: string;
  slug: string;
  sneakerDetails: SneakerDetails | null;
};

export type GetSneakerResponse = {
  sneaker: Sneaker | null;
};

/* ========================================================================== */
/*   Sneaker Data Model                                                       */
/* ========================================================================== */
/* ========================================================================== */
/*   Types                                                                    */
/* ========================================================================== */

type RecentSneakersResponse = {
  sneakers: {
    nodes: Sneaker[];
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
