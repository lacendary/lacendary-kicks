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