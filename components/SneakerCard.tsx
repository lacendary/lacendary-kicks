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
          h-[285px]
          flex-col
          overflow-hidden
          rounded-lg
          border
          border-zinc-600
          bg-[#030303]
          transition-all
          duration-300
          ease-out
          cursor-pointer
          ${
            isArchive
              ? "hover:border-[#B58A2C]"
              : isPick
              ? "hover:border-red-600"
              : "hover:border-zinc-500"
          }
        `}
      >
        {/* Badge */}
        <div className="absolute left-3 top-3 z-10">
          {isArchive && (
            <span className="bg-[#B58A2C] px-2 py-1 text-[10px] font-bold uppercase text-black">
              Archived
            </span>
          )}

          {isPick && (
            <span className="bg-red-600 px-2 py-1 text-[10px] font-bold uppercase text-white">
              Lacendary Pick
            </span>
          )}
        </div>

        {/* Year */}
        <div className="absolute right-3 top-3 text-xs font-semibold text-zinc-500">
          {year}
        </div>

        {/* Hero Image */}
        <div className="relative h-[150px] pt-8">
          <Image
            src={image}
            alt={sneaker.title}
            fill
            className="object-contain px-4 pt-6 pb-1 transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        </div>

        {/* Text */}
        <div className="flex h-[115px] flex-col justify-start px-4 pt-1 pb-3">
          {/* Brand */}
          <p className="truncate text-[10px] uppercase tracking-wide text-zinc-400">
            {details?.brand?.nodes?.[0]?.name}
          </p>

          {/* Model */}
          <div className="mt-0.5 h-[30px] overflow-hidden">
            <h3 className="line-clamp-2 text-[13px] font-semibold uppercase leading-tight text-white">
              {details?.model}
            </h3>
          </div>

          {/* Nickname */}
          <div className="mt-1 h-[42px] overflow-hidden">
            <h4 className="line-clamp-2 text-lg font-black uppercase leading-tight text-white">
              {details?.nickname}
            </h4>
          </div>
        </div>
      </article>
    </Link>
  );
}