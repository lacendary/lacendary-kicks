"use client";

import { useState } from "react";

export default function SneakerSpinner({
  images,
}: {
  images: { sourceUrl: string }[];
}) {
  if (!images || images.length === 0) {
    return null;
  }

  const [frame, setFrame] = useState(0);

  return (
    <div className="space-y-5">
      {/* Spinner Image */}
      <div className="overflow-hidden border border-zinc-700 bg-black">
        <img
          src={images[frame].sourceUrl}
          alt="360° Sneaker View"
          className="block w-full select-none"
          draggable={false}
        />
      </div>

      {/* Slider */}
      <div className="px-2">
        <input
          type="range"
          min="0"
          max={images.length - 1}
          value={frame}
          onChange={(e) => setFrame(Number(e.target.value))}
          className="w-full accent-white"
        />
      </div>
    </div>
  );
}