"use client";

import { useState } from "react";

export default function SneakerSpinner({
  images,
}: {
  images: { sourceUrl: string }[];
}) {
  // Don't render if there are no spinner images
  if (!images || images.length === 0) {
    return null;
  }

  const [frame, setFrame] = useState(0);

  return (
    <div>
      <img
        src={images[frame].sourceUrl}
        alt="360 View"
        className="w-full rounded-xl shadow-2xl"
      />

      <input
        type="range"
        min="0"
        max={images.length - 1}
        value={frame}
        onChange={(e) => setFrame(Number(e.target.value))}
        className="w-full mt-4"
      />
    </div>
  );
}