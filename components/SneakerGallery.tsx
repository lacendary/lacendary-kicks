"use client";

import { useRef, useState } from "react";
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

  const galleryRef = useRef<HTMLDivElement>(null);

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

  const scrollLeft = () => {
    galleryRef.current?.scrollBy({
      left: -450,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    galleryRef.current?.scrollBy({
      left: 450,
      behavior: "smooth",
    });
  };

  return (
    <>
      <section>
        <div className="panel panel-padding">

          {/* ================================================================
              Header
          ================================================================ */}

          <div className="panel-header-spacing flex items-center justify-between">

            <h2 className="panel-heading">
              Lacendary Photography
            </h2>

            <div className="flex items-center gap-4">

              <button
                onClick={scrollLeft}
                aria-label="Previous images"
                className="text-2xl text-zinc-500 transition-fast hover:text-white"
              >
                ◀
              </button>

              <button
                onClick={scrollRight}
                aria-label="Next images"
                className="text-2xl text-zinc-500 transition-fast hover:text-white"
              >
                ▶
              </button>

            </div>

          </div>

          {/* ================================================================
              Gallery
          ================================================================ */}

          <div
            ref={galleryRef}
            className="gallery-row"
          >
            {images.map((image: any, index: number) => (
              <div
                key={index}
                onClick={() => openLightbox(index)}
                className="
                  relative
                  h-24
                  w-40
                  flex-shrink-0
                  cursor-pointer
                  overflow-hidden
                  rounded
                  border
                  border-zinc-800
                "
              >
                <Image
                  src={image.sourceUrl}
                  alt={`Gallery Image ${index + 1}`}
                  fill
                  className="
                    image-cover
                    image-hover
                    transition-medium
                  "
                />
              </div>
            ))}
          </div>

        </div>
      </section>

      <ImageLightbox
        images={images}
        currentIndex={currentIndex}
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
        onPrevious={previousImage}
        onNext={nextImage}
      />
    </>
  );
}