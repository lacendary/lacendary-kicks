"use client";

import { useEffect } from "react";

type ImageNode = {
  sourceUrl: string;
  altText?: string;
};

type ImageLightboxProps = {
  images: ImageNode[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

export default function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrevious,
  onNext,
}: ImageLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrevious();
      if (e.key === "ArrowRight") onNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, onPrevious, onNext]);

  if (!isOpen || images.length === 0) return null;

  const image = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Previous */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrevious();
        }}
        className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-4 text-3xl text-white transition hover:bg-white/20"
      >
        ‹
      </button>

      {/* Image */}
      <img
        src={image.sourceUrl}
        alt={image.altText ?? ""}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      />

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-4 text-3xl text-white transition hover:bg-white/20"
      >
        ›
      </button>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 rounded-full bg-white/10 px-4 py-2 text-2xl text-white transition hover:bg-white/20"
      >
        ✕
      </button>

      {/* Counter */}
      <div className="absolute bottom-6 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}