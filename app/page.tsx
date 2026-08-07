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
    <main className="page-width py-6">

      {/* ================================================================
          Hero
      ================================================================ */}

      <HomeHero />

      {/* ================================================================
          Feature Cards
      ================================================================ */}

      <div className="section-spacing">
        <HomeFeatureSection />
      </div>

      {/* ================================================================
          Recently Added
      ================================================================ */}

      <div className="section-spacing">
        <RecentlyArchived sneakers={sneakers} />
      </div>

    </main>
  );
}