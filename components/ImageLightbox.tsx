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
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrevious();
          break;
        case "ArrowRight":
          onNext();
          break;
      }
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
      onClick={onClose}
      className="
        fixed
        inset-0
        z-[9999]

        flex
        items-center
        justify-center

        bg-black/95
        backdrop-blur-md

        animate-in
        fade-in
        duration-300
      "
    >
      {/* ================================================================
          Previous
      ================================================================ */}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrevious();
        }}
        aria-label="Previous Image"
        className="
          absolute
          left-8
          top-1/2
          -translate-y-1/2

          flex
          h-14
          w-14
          items-center
          justify-center

          rounded-full

          bg-white/10
          backdrop-blur

          text-4xl
          text-white

          transition-all
          duration-300

          hover:bg-red-600
          hover:scale-110
        "
      >
        ‹
      </button>

      {/* ================================================================
          Image
      ================================================================ */}

      <img
        key={image.sourceUrl}
        src={image.sourceUrl}
        alt={image.altText ?? ""}
        onClick={(e) => e.stopPropagation()}
        className="
          max-h-[90vh]
          max-w-[90vw]

          rounded-xl

          object-contain

          shadow-[0_35px_100px_rgba(0,0,0,.85)]

          animate-in
          fade-in
          zoom-in-95

          duration-300
        "
      />

      {/* ================================================================
          Next
      ================================================================ */}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next Image"
        className="
          absolute
          right-8
          top-1/2
          -translate-y-1/2

          flex
          h-14
          w-14
          items-center
          justify-center

          rounded-full

          bg-white/10
          backdrop-blur

          text-4xl
          text-white

          transition-all
          duration-300

          hover:bg-red-600
          hover:scale-110
        "
      >
        ›
      </button>

      {/* ================================================================
          Close
      ================================================================ */}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        className="
          absolute
          top-8
          right-8

          flex
          h-12
          w-12
          items-center
          justify-center

          rounded-full

          bg-white/10
          backdrop-blur

          text-2xl
          text-white

          transition-all
          duration-300

          hover:bg-red-600
          hover:rotate-90
        "
      >
        ✕
      </button>

      {/* ================================================================
          Counter
      ================================================================ */}

      <div
        className="
          absolute
          bottom-8

          rounded-full

          bg-black/60
          backdrop-blur

          px-5
          py-2

          font-inter
          text-sm
          text-white
        "
      >
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}