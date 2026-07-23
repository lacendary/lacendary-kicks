import SneakerGallery from "@/components/SneakerGallery";
import SneakerDetails from "@/components/SneakerDetails";
import SneakerSoundtrack from "@/components/SneakerSoundtrack";
import SneakerTimeline from "@/components/SneakerTimeline";
import RelatedSneakers from "@/components/RelatedSneakers";
import SneakerMarketData from "@/components/SneakerMarketData";
import SpinnerViewer from "@/components/SpinnerViewer";

type OverviewPanelProps = {
  sneaker: any;
  relatedSneakers: any[];
};

export default function OverviewPanel({
  sneaker,
  relatedSneakers,
}: OverviewPanelProps) {
  return (
    <>
      <div className="mt-8">
        <SneakerGallery sneaker={sneaker} />
      </div>

      {/* Spinner + Sidebar */}
      <section className="mt-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Spinner */}
          <div className="lg:col-span-2">
            <section className="rounded-xl border border-zinc-800 bg-[#111111] p-6">
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-lg font-bold uppercase tracking-wide text-white">
                  360° Spinner
                </h2>

                <span className="text-zinc-500">|</span>

                <span className="text-lg font-bold uppercase tracking-wide text-zinc-400">
                  Drag to Spin
                </span>
              </div>

              <SpinnerViewer
                images={sneaker.sneakerDetails.spinImages?.nodes ?? []}
              />
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <SneakerDetails sneaker={sneaker} />
            <SneakerSoundtrack sneaker={sneaker} />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mt-12">
        <SneakerTimeline sneaker={sneaker} />
      </section>

      {/* Related Sneakers + Market Data */}
      <section className="mt-12">
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <RelatedSneakers sneakers={relatedSneakers} />
          </div>

          <div className="lg:col-span-1">
            <SneakerMarketData
              stockxUrl={sneaker.sneakerDetails.stockxUrl}
              goatUrl={sneaker.sneakerDetails.goatUrl}
            />
          </div>
        </div>
      </section>
    </>
  );
}