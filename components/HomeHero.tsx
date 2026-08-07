import Image from "next/image";

/* ==========================================================================
   Home Hero
   ========================================================================== */

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-zinc-800 bg-black">

      {/* ================================================================
          Background Gradient
      ================================================================ */}

      <div className="absolute inset-0 hero-gradient" />

      {/* Red Glow */}

      <div className="absolute right-[-120px] top-1/2 h-[700px] w-[700px] -translate-y-1/2 rounded-full bg-red-700/30 blur-[160px]" />

      {/* Dark Vignette */}

      <div className="absolute inset-0 hero-vignette" />

      {/* ================================================================
          Hero Content
      ================================================================ */}

      <div
        className="
          relative
          grid
          grid-cols-1

          py-8

          lg:grid-cols-[52%_48%]
          lg:min-h-[515px]
          lg:py-0
        "
      >

        {/* ================================================================
            Left Side
        ================================================================ */}

        <div
          className="
            flex
            flex-col
            justify-start

            px-8

            sm:px-10

            lg:justify-center
            lg:pl-10
            lg:pr-0
            lg:py-0
          "
        >

          {/* Hero Label */}

          <p
            className="
              section-label
              mb-4

              text-[1.35rem]
              sm:text-[1.8rem]
              lg:text-[35px]
            "
          >
            THE INTERACTIVE SNEAKER ARCHIVE
          </p>

          {/* Hero Title */}

          <h1
            className="
              font-bebas
              uppercase
              leading-[0.82]
              tracking-normal
              text-white

              text-[4.5rem]
              sm:text-[6rem]
              md:text-[7rem]
              lg:text-[10.5rem]
            "
          >
            Lacendary
            <br />
            Kicks
          </h1>

          {/* Hero Description */}

          <p
            className="
              mt-5
              max-w-[620px]

              text-[1.15rem]
              sm:text-[1.3rem]
              lg:text-[1.55rem]

              leading-[1.45]
              text-zinc-200
            "
          >
            Explore sneakers through original photography,
            360° spinners, videos, timelines, comparisons,
            market data and original soundtracks.
          </p>

        </div>

        {/* ================================================================
            Right Side
        ================================================================ */}

        <div
          className="
            relative
            flex
            justify-center
            items-start

            mt-2
            pb-4

            lg:mt-0
            lg:items-center
            lg:pb-0

            overflow-visible
          "
        >

          <Image
            src="/images/bloodline-home.png"
            alt="Bloodline 12"
            width={1080}
            height={720}
            priority
            className="
              transition-medium

              w-full
              max-w-[330px]

              sm:max-w-[430px]

              lg:w-auto
              lg:max-w-none

              h-auto

              translate-y-0
              lg:translate-y-8

              select-none
              drop-shadow-[0_50px_100px_rgba(0,0,0,.95)]
            "
          />

        </div>

      </div>

    </section>
  );
}