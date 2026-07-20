import { getYouTubeEmbedUrl } from "@/app/lib/youtube";

type SneakerHeroProps = {
  sneaker: any;
};

export default function SneakerHero({
  sneaker,
}: SneakerHeroProps) {
  const details = sneaker.sneakerDetails;
  const brandName = details.brand?.nodes?.[0]?.name ?? "";

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 items-center">
      {/* Left Side - Hero Video */}
      <div>
        <div className="aspect-video overflow-hidden rounded-xl shadow-2xl">
          <iframe
            className="w-full h-full"
            src={getYouTubeEmbedUrl(details.videoUrl)}
            title={sneaker.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      {/* Right Side - Hero Content */}
      <div className="flex flex-col justify-center h-full">
      {brandName && (
  <p className="text-red-500 font-bold uppercase tracking-wider text-lg">
    {brandName} {details.model}
  </p>
)}

        <h1 className="text-5xl lg:text-6xl font-extrabold uppercase leading-none mt-2">
          {details.nickname || sneaker.title}
        </h1>

        {details.retroReleaseYear && (
          <p className="mt-4 text-2xl font-semibold text-gray-300">
            {details.retroReleaseYear}
          </p>
        )}

        <div
          className="mt-6 text-gray-300 leading-7 line-clamp-6"
          dangerouslySetInnerHTML={{
            __html: details.overview || "",
          }}
        />

        <button className="mt-6 self-start text-sm font-semibold uppercase tracking-wider hover:underline">
          Read More
        </button>
      </div>
    </section>
  );
}