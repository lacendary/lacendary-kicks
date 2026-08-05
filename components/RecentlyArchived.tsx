import SneakerCard from "./SneakerCard";

/* ==========================================================================
   Recently Archived
   ========================================================================== */

type Props = {
  sneakers: any[];
};

export default function RecentlyArchived({ sneakers }: Props) {
  return (
    <section className="panel p-8">

      {/* ================================================================
          Section Heading
      ================================================================ */}

      <p className="font-bebas text-[1.8rem] uppercase tracking-[0.08em] text-red-600">
        Latest Sneakers
      </p>

      <h2 className="font-bebas text-[4.5rem] uppercase leading-none text-white">
        Recently Added
      </h2>

      {/* ================================================================
          Sneaker Grid
      ================================================================ */}

      <div className="mt-8 grid grid-cols-4 gap-6">

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