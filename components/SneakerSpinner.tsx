"use client";

import Image from "next/image";

type Props = {
  images: {
    sourceUrl: string;
  }[];
  frame: number;
  onFrameChange: (frame: number) => void;
};

export default function SneakerSpinner({
  images,
  frame,
  onFrameChange,
}: Props) {
  if (!images || images.length === 0) {
    return null;
  }

  // Prevent invalid frame indexes
  const safeFrame = Math.min(frame, images.length - 1);

  return (
    <div className="space-y-5">
      {/* Spinner */}
      <div className="overflow-hidden rounded-xl border border-zinc-700 bg-black shadow-lg">
        <Image
          src={images[safeFrame].sourceUrl}
          alt="360° Sneaker View"
          width={1200}
          height={675}
          priority
          draggable={false}
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
          onChange={(e) => onFrameChange(Number(e.target.value))}
          className="w-full cursor-pointer accent-white"
        />
      </div>
    </div>
  );
}