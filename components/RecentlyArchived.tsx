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
      className="
        panel

        p-6
        lg:p-8
      "
    >
      {/* ================================================================
          Section Heading
      ================================================================ */}

      <h2
        className="
          font-bebas
          uppercase
          leading-none
          text-white

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
          gap-6

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