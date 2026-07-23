"use client";

import { useState } from "react";
import OverviewPanel from "@/components/sneaker/OverviewPanel";
import SneakerHero from "@/components/SneakerHero";
import SneakerMiniNav from "@/components/SneakerMiniNav";

type SneakerExperienceProps = {
  sneaker: any;
  relatedSneakers: any[];
};

export default function SneakerExperience({
  sneaker,
  relatedSneakers,
}: SneakerExperienceProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      {/* Hero */}
      <section className="w-full border-b border-zinc-800 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <SneakerHero sneaker={sneaker} />
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        <SneakerMiniNav
          sneaker={sneaker}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-8">
          {activeTab === "overview" && (
            <OverviewPanel
              sneaker={sneaker}
              relatedSneakers={relatedSneakers}
            />
          )}

          {activeTab === "photography" && (
            <div className="text-white">Photography Panel</div>
          )}

          {activeTab === "timeline" && (
            <div className="text-white">Timeline Panel</div>
          )}

          {activeTab === "soundtrack" && (
            <div className="text-white">Soundtrack Panel</div>
          )}

          {activeTab === "compare" && (
            <div className="text-white">Compare Panel</div>
          )}
        </div>
      </main>
    </>
  );
}