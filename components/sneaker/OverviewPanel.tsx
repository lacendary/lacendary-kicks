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
      {/* ================================================================
          Gallery
      ================================================================ */}

      <div className="section-spacing">
        <SneakerGallery sneaker={sneaker} />
      </div>

      {/* ================================================================
          Spinner + Sidebar
      ================================================================ */}

      <section className="section-spacing">
        <div
          className="
            grid
            grid-gap
            grid-cols-1

            lg:grid-cols-3
          "
        >
          {/* ================================================================
              Spinner
          ================================================================ */}

          <div className="lg:col-span-2">
            <section className="panel panel-padding">
             <div className="mb-5 flex flex-wrap items-center gap-3">

  <h2 className="panel-heading font-bebas text-[2rem] tracking-wide">
    360° Spinner
  </h2>

  <span className="text-zinc-600">|</span>

  <span className="panel-subheading font-bebas text-[1.4rem] tracking-wide">
    Drag to Spin
  </span>

</div>
              <SpinnerViewer
                images={sneaker.sneakerDetails.spinImages?.nodes ?? []}
              />
            </section>
          </div>

          {/* ================================================================
              Sidebar
          ================================================================ */}

          <div className="stack-spacing lg:col-span-1">
            <SneakerDetails sneaker={sneaker} />

            <SneakerSoundtrack sneaker={sneaker} />
          </div>
        </div>
      </section>

      {/* ================================================================
          Timeline
      ================================================================ */}

      <section className="section-spacing">
        <SneakerTimeline sneaker={sneaker} />
      </section>

      {/* ================================================================
          Related Sneakers + Market Data
      ================================================================ */}

      <section className="section-spacing">
        <div
          className="
            grid
            grid-gap
            grid-cols-1
            items-stretch

            lg:grid-cols-4
          "
        >
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