import Image from "next/image";

type SneakerGalleryProps = {
  sneaker: any;
};

export default function SneakerGallery({
  sneaker,
}: SneakerGalleryProps) {
  const details = sneaker.sneakerDetails;

  const images =
    details.lacendaryImages?.nodes?.length > 0
      ? details.lacendaryImages.nodes
      : details.officialImages?.nodes ?? [];

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="lk-card p-4">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-white">
            Lacendary Photography
          </h2>

          <div className="text-zinc-500 text-xl">
            ◀ ▶
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image: any, index: number) => (
            <div
              key={index}
              className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded border border-zinc-800"
            >
              <Image
                src={image.sourceUrl}
                alt={`Gallery Image ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}