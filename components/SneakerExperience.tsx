"use client";

import { useState } from "react";
import OverviewPanel from "@/components/sneaker/OverviewPanel";
import PhotographyPanel from "@/components/sneaker/PhotographyPanel";
import SneakerHero from "@/components/SneakerHero";
import SneakerMiniNav from "@/components/SneakerMiniNav";
import CompareClient from "@/components/CompareClient";


type SneakerExperienceProps = {
  sneaker: any;
  relatedSneakers: any[];
  allSneakers: any[];
};

export default function SneakerExperience({
  sneaker,
  relatedSneakers,
  allSneakers,
}: SneakerExperienceProps) {
  const [activeTab, setActiveTab] = useState("overview");
console.log("sneaker:", sneaker);

console.log("sneakerDetails:", sneaker.sneakerDetails);

console.log(
  "heroImage from sneakerDetails:",
  sneaker.sneakerDetails?.heroImage
);

console.log(
  "lacendaryImages from sneakerDetails:",
  sneaker.sneakerDetails?.lacendaryImages
);
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
 <PhotographyPanel
  photography={{
    heroImage: sneaker.sneakerDetails?.heroImage?.node,
    lacendaryImages:
      sneaker.sneakerDetails?.lacendaryImages?.nodes ?? [],
    officialImages:
      sneaker.sneakerDetails?.officialImages?.nodes ?? [],
    onFootImages:
      sneaker.sneakerDetails?.onFootImages?.nodes ?? [],
  }}
/>
)}

          {activeTab === "timeline" && (
            <div className="text-white">Timeline Panel</div>
          )}

          {activeTab === "soundtrack" && (
            <div className="text-white">Soundtrack Panel</div>
          )}

          {activeTab === "compare" && (
            <CompareClient
              sneakers={allSneakers}
              lockedSneaker={sneaker}
            />
          )}
        </div>
      </main>
    </>
  );
}