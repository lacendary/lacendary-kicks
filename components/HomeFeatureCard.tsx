import Link from "next/link";
import Image from "next/image";

/* ==========================================================================
   Home Feature Card
   ========================================================================== */

type Props = {
  title: string;
  description: string;
  button: string;
  href: string;
};

export default function HomeFeatureCard({
  title,
  description,
  button,
  href,
}: Props) {
  return (
    <Link
      href={href}
      className="
        group
        relative
        overflow-hidden
        rounded-xl
        border
        border-zinc-800
        transition-all
        duration-500
        hover:-translate-y-2
        hover:border-red-600
      "
    >
      {/* ================================================================
          Background Image
      ================================================================ */}

      <Image
        src="/images/fc-bg1.png"
        alt=""
        fill
        className="
          object-cover
          opacity-100
          transition-all
          duration-500
          group-hover:scale-105
          lg:group-hover:scale-110
          group-hover:brightness-110
        "
      />

      {/* ================================================================
          Dark Overlay
      ================================================================ */}

      <div className="absolute inset-0 bg-black/50" />

      {/* ================================================================
          Card Content
      ================================================================ */}

      <div
        className="
          relative
          flex
          h-full
          min-h-[280px]
          flex-col
          justify-between
          p-6

          lg:min-h-[330px]
          lg:p-8
        "
      >
        {/* ================================================================
            Top Content
        ================================================================ */}

        <div>
          {/* Card Title */}

          <h2
            className="
              font-bebas
              text-[3.3rem]
              sm:text-[3.7rem]
              lg:text-[4rem]

              uppercase
              leading-[0.88]
              text-white
            "
          >
            {title}
          </h2>

          {/* Description */}

          <p
            className="
              mt-4
              text-[1rem]
              leading-7
              text-zinc-200

              lg:mt-6
              lg:text-[1.15rem]
              lg:leading-8
            "
          >
            {description}
          </p>
        </div>

        {/* ================================================================
            CTA
        ================================================================ */}

        <p
          className="
            pt-6

            font-bebas
            text-[2rem]
            lg:text-[2.4rem]

            uppercase
            tracking-wide

            text-red-600

            transition-all
            duration-300

            group-hover:text-white
            group-hover:translate-x-1
          "
        >
          {button}
        </p>
      </div>
    </Link>
  );
}