import Image from "next/image";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ImageItem = {
  sourceUrl: string;
};

type PhotographyPanelProps = {
  photography: {
    heroImage?: ImageItem;
    lacendaryImages: ImageItem[];
    officialImages: ImageItem[];
    onFootImages: ImageItem[];
  };
};

type ThumbnailRowProps = {
  title: string;
  images: ImageItem[];
  featuredImage?: ImageItem;
  onSelect: (image: ImageItem, gallery: ImageItem[]) => void;
};

function ThumbnailRow({
  title,
  images,
  featuredImage,
  onSelect,
}: ThumbnailRowProps) {
  if (!images || images.length === 0) return null;



  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold">{title}</h3>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onSelect(image, images)}
            className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
              featuredImage?.sourceUrl === image.sourceUrl
                ? "border-red-600"
                : "border-white/10 hover:border-white/30"
            }`}
          >
            <Image
  src={image.sourceUrl}
  alt={`${title} ${index + 1}`}
  fill
  sizes="96px"
  className="object-cover"
/>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function PhotographyPanel({
  photography,
}: PhotographyPanelProps) {



   const {
  heroImage,
  lacendaryImages = [],
  officialImages = [],
  onFootImages = [],
} = photography;
const [featuredImage, setFeaturedImage] = useState<ImageItem | undefined>(
  heroImage
);

useEffect(() => {
  setFeaturedImage(
    heroImage ??
      lacendaryImages[0] ??
      officialImages[0] ??
      onFootImages[0]
  );
}, [
  heroImage,
  lacendaryImages,
  officialImages,
  onFootImages,
]);

const [lightboxOpen, setLightboxOpen] = useState(false);

const [currentGallery, setCurrentGallery] = useState<ImageItem[]>(
  lacendaryImages.length
    ? lacendaryImages
    : officialImages.length
      ? officialImages
      : onFootImages
);

useEffect(() => {
  setCurrentGallery(lacendaryImages ?? []);
}, [lacendaryImages]);


const [currentGalleryName, setCurrentGalleryName] = useState(
  "Lacendary Photography"
);

const changeFeaturedImage = (
  image: ImageItem,
  gallery: ImageItem[]
) => {
  if (featuredImage?.sourceUrl === image.sourceUrl) return;

  setFeaturedImage(image);
  setCurrentGallery(gallery);

  if (gallery === lacendaryImages)
    setCurrentGalleryName("Lacendary Photography");

  if (gallery === officialImages)
    setCurrentGalleryName("Official Product Photography");

  if (gallery === onFootImages)
    setCurrentGalleryName("On-Foot");
};

const currentIndex = currentGallery.findIndex(
  (img) => img?.sourceUrl === featuredImage?.sourceUrl
);

const hasPrevious = currentIndex > 0;

const hasNext = currentIndex < currentGallery.length - 1;

const previousImage = () => {
  if (hasPrevious) {
    setFeaturedImage(currentGallery[currentIndex - 1]);
  }
};

const nextImage = () => {
  if (hasNext) {
    setFeaturedImage(currentGallery[currentIndex + 1]);
  }
};

useEffect(() => {
  if (!lightboxOpen) return;

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Escape":
        setLightboxOpen(false);
        break;

      case "ArrowLeft":
        previousImage();
        break;

      case "ArrowRight":
        nextImage();
        break;
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [
  lightboxOpen,
  currentIndex,
  currentGallery,
  featuredImage,
]);
 return (
  <div className="space-y-12 py-12">
    <h2 className="text-3xl font-bold">Photography</h2>

    {/* Featured Photograph */}
    <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
      <div className="relative aspect-[16/9] overflow-hidden">
        {!featuredImage && (
          <div className="flex h-full items-center justify-center">
            <p className="text-zinc-500">No Hero Image</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {featuredImage && (
            <motion.button
              key={featuredImage.sourceUrl}
              type="button"
              className="absolute inset-0 cursor-zoom-in transition-transform duration-300 hover:scale-[1.01]"
              onClick={() => setLightboxOpen(true)}
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{
                duration: 0.28,
                ease: "easeInOut",
              }}
            >
           <Image
  src={featuredImage.sourceUrl}
  alt="Featured Photograph"
  fill
  sizes="(max-width: 768px) 100vw, 1200px"
  className="object-cover"
  priority
/>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>

    <ThumbnailRow
      title="Lacendary Photography"
      images={lacendaryImages}
      featuredImage={featuredImage}
      onSelect={changeFeaturedImage}
    />

    <ThumbnailRow
      title="On-Foot"
      images={onFootImages}
      featuredImage={featuredImage}
      onSelect={changeFeaturedImage}
    />

    <ThumbnailRow
      title="Official Product Photography"
      images={officialImages}
      featuredImage={featuredImage}
      onSelect={changeFeaturedImage}
    />

    <AnimatePresence>
      {lightboxOpen && featuredImage && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setLightboxOpen(false);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative h-full w-full max-w-7xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute left-6 top-6 z-10">
              <h2 className="text-xl font-semibold text-white">
                {currentGalleryName}
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                {Math.max(currentIndex + 1, 1)} / {currentGallery.length}
              </p>
            </div>

            <Image
  src={featuredImage.sourceUrl}
  alt="Featured Photograph"
  fill
  sizes="100vw"
  className="object-contain"
  priority
/>

            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 px-4 py-2 text-white hover:bg-black"
            >
              ✕
            </button>

            <button
              onClick={previousImage}
              disabled={!hasPrevious}
              className={`absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full p-4 text-3xl transition ${
                hasPrevious
                  ? "bg-black/60 text-white hover:bg-black"
                  : "cursor-not-allowed bg-black/20 text-zinc-600"
              }`}
            >
              ‹
            </button>

            <button
              onClick={nextImage}
              disabled={!hasNext}
              className={`absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full p-4 text-3xl transition ${
                hasNext
                  ? "bg-black/60 text-white hover:bg-black"
                  : "cursor-not-allowed bg-black/20 text-zinc-600"
              }`}
            >
              ›
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
}