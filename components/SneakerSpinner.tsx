"use client";

import { useState, useEffect } from "react";

type Props = {
  images: {
    sourceUrl: string;
  }[];
  frame?: number;
  onFrameChange?: (frame: number) => void;
};

export default function SneakerSpinner({
  images,
  frame,
  onFrameChange,
}: Props) {
  if (!images || images.length === 0) {
    return null;
  }

  // Internal state for standalone use
  const [internalFrame, setInternalFrame] = useState(0);

  // Use external state if provided, otherwise internal state
  const currentFrame = frame ?? internalFrame;
  const setCurrentFrame = onFrameChange ?? setInternalFrame;

  // Prevent invalid frame indexes
  const safeFrame = Math.min(currentFrame, images.length - 1);
useEffect(() => {
  images.forEach((image) => {
    const img = new window.Image();
    img.src = image.sourceUrl;
  });
}, [images]);
  return (
    <div className="space-y-5">
      {/* Spinner */}
      <div className="overflow-hidden rounded-xl border border-zinc-700 bg-black shadow-lg">
        <img
          src={images[safeFrame].sourceUrl}
          alt="360° Sneaker View"
          draggable={false}
          loading="eager"
          className="block h-auto w-full select-none"
        />
      </div>

      {/* Slider */}
      <div className="px-2">
        <input
          type="range"
          min={0}
          max={images.length - 1}
          value={safeFrame}
          onChange={(e) => setCurrentFrame(Number(e.target.value))}
          className="w-full cursor-pointer accent-white"
        />
      </div>
    </div>
  );
}