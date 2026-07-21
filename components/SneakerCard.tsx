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
          flex-col
          bg-[#030303]
          border
          border-zinc-600
          rounded-lg
          transition-all
          duration-300
          ease-out
          overflow-hidden
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
        <div className="absolute top-3 left-3 z-10">
          {isArchive && (
            <span className="bg-[#B58A2C] text-black text-[10px] font-bold px-2 py-1 uppercase">
              Archived
            </span>
          )}

          {isPick && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase">
              Lacendary Pick
            </span>
          )}
        </div>

        {/* Year */}
        <div className="absolute top-3 right-3 text-zinc-500 text-xs font-semibold">
          {year}
        </div>

        {/* Hero Image */}
        <div className="aspect-[915/743] relative p-4">
          <Image
            src={image}
            alt={sneaker.title}
            fill
            className="object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        </div>

        {/* Text */}
        <div className="px-4 pb-4 mt-auto">
          <p className="text-[11px] uppercase tracking-wide text-zinc-400">
            {details?.brand?.nodes?.[0]?.name}
          </p>

          <h3 className="mt-1 text-sm font-semibold uppercase text-white leading-tight">
            {details?.model}
          </h3>

          <h4 className="mt-1 text-xl font-black uppercase leading-none text-white">
            {details?.nickname}
          </h4>
        </div>
      </article>
    </Link>
  );
}