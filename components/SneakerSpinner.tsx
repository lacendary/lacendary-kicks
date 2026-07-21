"use client";

import { useState, useEffect, useRef } from "react";

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
  const spinnerImages = images ?? [];

  const [internalFrame, setInternalFrame] = useState(0);

  const currentFrame = frame ?? internalFrame;
  const setCurrentFrame = onFrameChange ?? setInternalFrame;

  const dragStartX = useRef(0);
  const dragStartFrame = useRef(0);
  const dragging = useRef(false);

  // Preload all images
  useEffect(() => {
    spinnerImages.forEach((image) => {
      const img = new Image();
      img.src = image.sourceUrl;
    });
  }, [spinnerImages]);

  if (spinnerImages.length === 0) {
    return null;
  }

  const safeFrame = Math.min(currentFrame, spinnerImages.length - 1);

  const pixelsPerFrame = 12;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();

    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartFrame.current = safeFrame;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;

    const delta = e.clientX - dragStartX.current;

    let nextFrame =
      dragStartFrame.current + Math.round(delta / pixelsPerFrame);

    // Wrap around infinitely
    nextFrame =
      ((nextFrame % spinnerImages.length) + spinnerImages.length) %
      spinnerImages.length;

    setCurrentFrame(nextFrame);
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  const handlePointerLeave = () => {
    dragging.current = false;
  };

  return (
    <div className="space-y-5">
      <div
        className="overflow-hidden rounded-xl border border-zinc-700 bg-black shadow-lg cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <img
          src={spinnerImages[safeFrame].sourceUrl}
          alt="360° Sneaker View"
          draggable={false}
          loading="eager"
          className="block w-full h-auto select-none pointer-events-none"
        />
      </div>

      <div className="px-2">
        <input
          type="range"
          min={0}
          max={spinnerImages.length - 1}
          value={safeFrame}
          onChange={(e) => setCurrentFrame(Number(e.target.value))}
          className="w-full cursor-pointer accent-white"
        />
      </div>
    </div>
  );
}