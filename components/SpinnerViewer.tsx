"use client";

import { useState } from "react";
import SneakerSpinner from "./SneakerSpinner";

type Props = {
  images: {
    sourceUrl: string;
  }[];
};

export default function SpinnerViewer({ images }: Props) {
  const [frame, setFrame] = useState(0);

  return (
    <SneakerSpinner
      images={images}
      frame={frame}
      onFrameChange={setFrame}
    />
  );
}