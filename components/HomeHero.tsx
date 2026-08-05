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

      <div className="absolute inset-0 bg-gradient-to-r from-black via-[#220303] to-[#420606]" />

      {/* Red Glow Behind Shoe */}

      <div className="absolute right-[-120px] top-1/2 h-[700px] w-[700px] -translate-y-1/2 rounded-full bg-red-700/30 blur-[160px]" />

      {/* Dark Vignette */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,transparent_20%,rgba(0,0,0,.45)_100%)]" />

      {/* ================================================================
          Hero Content
      ================================================================ */}

     <div className="relative grid min-h-[515px] grid-cols-[52%_48%]">

        {/* ================================================================
            Left Side
        ================================================================ */}

       <div className="flex flex-col justify-center pl-10 pr-0">

          {/* Hero Label */}

          <p className="mb-5 font-bebas text-[35px] uppercase tracking-[0.08em] text-red-600">
            THE INTERACTIVE SNEAKER ARCHIVE
          </p>

          {/* Hero Title */}

          <h1
  className="
    font-bebas Neue
    text-[10.5rem]
    uppercase
    leading-[0.82]
    tracking-[-0.0em]
    text-white
  "
>
            Lacendary
            <br />
            Kicks
          </h1>

          {/* Hero Description */}

          <p
  className="
    mt-4
    max-w-[620px]
    font-inter
    text-[1.55rem]
    font-normal
    leading-[1.35]
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

        <div className="relative flex items-center justify-center overflow-visible">

          <Image
            src="/images/bloodline-home.png"
            alt="Bloodline 12"
            width={1080}
            height={720}
            priority
           className="
translate-x-0
translate-y-8
select-none
drop-shadow-[0_50px_100px_rgba(0,0,0,.95)]
"
          />

        </div>

      </div>

    </section>
  );
}