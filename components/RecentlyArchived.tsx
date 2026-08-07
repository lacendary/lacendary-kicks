import SneakerCard from "./SneakerCard";

/* ==========================================================================
   Recently Archived
   ========================================================================== */

type Props = {
  sneakers: any[];
};

export default function RecentlyArchived({ sneakers }: Props) {
  return (
    <section
     className="panel panel-padding"
    >
      {/* ================================================================
          Section Heading
      ================================================================ */}

      <h2
       className="
  section-title

  text-[3.2rem]
  sm:text-[4rem]
  lg:text-[4.5rem]
"
      >
        Recently Added
      </h2>

      {/* ================================================================
          Sneaker Grid
      ================================================================ */}

      <div
        className="
          mt-6
          grid
          grid-gap

          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4

          lg:mt-8
        "
      >
        {sneakers.map((sneaker) => (
          <SneakerCard
            key={sneaker.slug}
            sneaker={sneaker}
          />
        ))}
      </div>
    </section>
  );
}