import Image from "next/image";
import Link from "next/link";

interface SneakerCardProps {
  sneaker: {
    slug: string;
    title: string;
    sneakerDetails?: {
      brand?: {
        nodes?: {
          name: string;
          slug: string;
        }[];
      };
      model?: string;
      nickname?: string;
      retroReleaseDate?: string;
      editorialStatus?: string[];
      cardImage?: {
        node?: {
          sourceUrl?: string;
        };
      };
    };
  };
}

export default function SneakerCard({ sneaker }: SneakerCardProps) {
  const details = sneaker.sneakerDetails;

  const image =
    details?.cardImage?.node?.sourceUrl ??
    "/images/placeholders/hero-card-placeholder.png";

  const year = details?.retroReleaseDate
    ? new Date(details.retroReleaseDate).getFullYear()
    : "";

  const status = details?.editorialStatus?.[0];

  const isArchive = status === "Archived";
  const isPick = status === "Lacendary Pick";

  return (
    <Link href={`/sneaker/${sneaker.slug}`}>
      <article
        className={`
          group
          relative
          flex
          h-[300px]
          flex-col
          overflow-hidden
          rounded-xl
          border
          border-zinc-800
          bg-[#030303]
          cursor-pointer
          transition-fast
          hover-lift
          ${
            isArchive
              ? "hover:border-[#B58A2C]"
              : isPick
              ? "hover:border-red-600"
              : "hover:border-zinc-600"
          }
        `}
      >
        {/* ================================================================
            Badge
        ================================================================ */}

        <div className="absolute left-4 top-4 z-20">
          {isArchive && (
            <span className="bg-[#B58A2C] px-3 py-1 font-bebas text-[1.05rem] uppercase tracking-wide text-black">
              Archived
            </span>
          )}

          {isPick && (
            <span className="bg-red-600 px-3 py-1 font-bebas text-[1.05rem] uppercase tracking-wide text-white">
              Lacendary Pick
            </span>
          )}
        </div>

        {/* ================================================================
            Year
        ================================================================ */}

        <div className="absolute right-4 top-4 z-20 font-bebas text-[2rem] leading-none text-zinc-700">
          {year}
        </div>

        {/* ================================================================
            Hero Image
        ================================================================ */}

        <div className="relative top-15 h-[165px]">
          <Image
            src={image}
            alt={sneaker.title}
            fill
            className="
              image-contain
              px-2
              transition-fast
              group-hover:-translate-y-1
              group-hover:scale-[1.04]
            "
          />
        </div>

        {/* ================================================================
            Text
        ================================================================ */}

        <div className="flex flex-1 flex-col px-4 pt-14 pb-4">

          {/* Brand + Model */}

          <div className="flex items-baseline gap-1 uppercase">

            <span className="font-bebas text-[0.95rem] tracking-normal text-white">
              {details?.brand?.nodes?.[0]?.name}
            </span>

            <span className="font-bebas text-[0.95rem] tracking-normal text-white">
              {details?.model}
            </span>

          </div>

          {/* Nickname */}

          <h4
            className="
              mt-1
              font-bebas
              text-[2.2rem]
              uppercase
              leading-[0.88]
              tracking-[-0.02em]
              text-white
            "
          >
            {details?.nickname}
          </h4>

        </div>
      </article>
    </Link>
  );
}