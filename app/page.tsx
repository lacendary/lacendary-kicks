import HomeHero from "@/components/HomeHero";
import HomeFeatureSection from "@/components/HomeFeatureSection";
import RecentlyArchived from "@/components/RecentlyArchived";

import { getRecentSneakers } from "@/app/lib/sneaker";

/* ==========================================================================
   Home Page
   ========================================================================== */

export default async function Home() {
  const sneakers = await getRecentSneakers();

  return (
    <main className="page-width py-6 space-y-6">

      {/* ================================================================
          Hero
      ================================================================ */}

      <HomeHero />

      {/* ================================================================
          Feature Cards
      ================================================================ */}

      <HomeFeatureSection />

      {/* ================================================================
          Recently Archived
      ================================================================ */}

      <RecentlyArchived sneakers={sneakers} />

    </main>
  );
}