"use client";

import { useState } from "react";
import Image from "next/image";
import ImageLightbox from "@/components/ImageLightbox";

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

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
const [currentIndex, setCurrentIndex] = useState(0);

const openLightbox = (index: number) => {
  setCurrentIndex(index);
  setIsLightboxOpen(true);
};

const closeLightbox = () => {
  setIsLightboxOpen(false);
};

const previousImage = () => {
  setCurrentIndex((prev) =>
    prev === 0 ? images.length - 1 : prev - 1
  );
};

const nextImage = () => {
  setCurrentIndex((prev) =>
    prev === images.length - 1 ? 0 : prev + 1
  );
};

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
  onClick={() => openLightbox(index)}
  className="relative h-24 w-40 flex-shrink-0 cursor-pointer overflow-hidden rounded border border-zinc-800"
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
    <ImageLightbox
  images={images}
  currentIndex={currentIndex}
  isOpen={isLightboxOpen}
  onClose={closeLightbox}
  onPrevious={previousImage}
  onNext={nextImage}
/>  
    </section>
  );
}