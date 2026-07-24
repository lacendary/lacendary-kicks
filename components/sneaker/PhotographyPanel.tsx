import Image from "next/image";
import { useState } from "react";
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
  if (images.length === 0) return null;



  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold">{title}</h3>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onSelect(image, images)}
            className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
              featuredImage?.sourceUrl === image.sourceUrl
                ? "border-red-600"
                : "border-white/10 hover:border-white/30"
            }`}
          >
            <Image
              src={image.sourceUrl}
              alt={`${title} ${index + 1}`}
              fill
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
    lacendaryImages,
    officialImages,
    onFootImages,
  } = photography;
const [featuredImage, setFeaturedImage] = useState<ImageItem | undefined>(
  heroImage
);

const [lightboxOpen, setLightboxOpen] = useState(false);

const [currentGallery, setCurrentGallery] = useState<ImageItem[]>(
  lacendaryImages
);

const changeFeaturedImage = (
  image: ImageItem,
  gallery: ImageItem[]
) => {
  if (featuredImage?.sourceUrl === image.sourceUrl) return;

  setFeaturedImage(image);
  setCurrentGallery(gallery);
};

const currentIndex = currentGallery.findIndex(
  (img) => img.sourceUrl === featuredImage?.sourceUrl
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
  return (
    <div className="space-y-12 py-12">
      <h2 className="text-3xl font-bold">
        Photography
      </h2>

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
  className="absolute inset-0 cursor-zoom-in"
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
      onClick={() => setLightboxOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative h-full w-full max-w-7xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={featuredImage.sourceUrl}
          alt="Featured Photograph"
          fill
          className="object-contain"
          priority
        />

        <button
          onClick={() => setLightboxOpen(false)}
          className="absolute right-4 top-4 rounded-full bg-black/60 px-4 py-2 text-white hover:bg-black"
        >
          ✕
        </button>
        {hasPrevious && (
  <button
    onClick={previousImage}
    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-4 text-3xl text-white hover:bg-black"
  >
    ‹
  </button>
)}
{hasNext && (
  <button
    onClick={nextImage}
    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-4 text-3xl text-white hover:bg-black"
  >
    ›
  </button>
)}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}
