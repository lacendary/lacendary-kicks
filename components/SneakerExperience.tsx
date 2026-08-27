"use client";

import { useState } from "react";
import OverviewPanel from "@/components/sneaker/OverviewPanel";
import PhotographyPanel from "@/components/sneaker/PhotographyPanel";
import TimelinePanel, {
  type TimelineEventData,
} from "@/components/sneaker/TimelinePanel";
import SneakerHero from "@/components/SneakerHero";
import SneakerMiniNav from "@/components/SneakerMiniNav";
import CompareClient from "@/components/CompareClient";
import MarketDataPanel from "@/components/sneaker/MarketDataPanel";
import type { MarketDataRecord } from "@/app/lib/market";

type SneakerExperienceProps = {
  sneaker: any;
  relatedSneakers: any[];
  allSneakers: any[];
  marketData: MarketDataRecord | null;
};

export default function SneakerExperience({
  sneaker,
  relatedSneakers,
  allSneakers,
  marketData,
}: SneakerExperienceProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const timelineEvents: TimelineEventData[] =
    sneaker.sneakerDetails?.timelineEvents?.map(
      (event: any, index: number) => ({
        id: index + 1,
        date: event.eventDate
          ? new Date(event.eventDate).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "",
        timelineLabel: event.timelineLabel ?? "",
        title: event.eventTitle ?? "",
        description: event.eventDescription ?? "",
        badge: event.badge ?? "",
        source: event.source ?? "",
        sourceUrl: event.sourceUrl ?? "",
        image: event.image?.node?.sourceUrl ?? "",
      })
    ) ?? [];

  return (
    <>
      {/* ================================================================
          Hero
      ================================================================ */}

      <section className="w-full border-b border-zinc-800 bg-[#0d0d0d]">
        <div className="page-width py-7">
          <SneakerHero sneaker={sneaker} />
        </div>
      </section>

      {/* ================================================================
          Main Content
      ================================================================ */}

      <main className="page-width py-1">
        <SneakerMiniNav
          sneaker={sneaker}
          hasMarketData={Boolean(marketData?.overallDaily.length || marketData?.sizeDaily.length)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div
          className={
            activeTab === "market"
              ? "relative mt-4 lg:left-1/2 lg:w-[min(1320px,calc(100vw-3rem))] lg:-translate-x-1/2"
              : "mt-4"
          }
        >
          {activeTab === "overview" && (
            <OverviewPanel
              sneaker={sneaker}
              relatedSneakers={relatedSneakers}
            />
          )}

          {activeTab === "market" && (
            <MarketDataPanel
              marketData={marketData}
              retailPrice={sneaker.sneakerDetails?.retailPrice}
              stockxUrl={sneaker.sneakerDetails?.stockxUrl}
              goatUrl={sneaker.sneakerDetails?.goatUrl}
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
            <TimelinePanel events={timelineEvents} />
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
