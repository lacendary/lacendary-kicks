"use client";

import { useState, useEffect } from "react";

import SneakerSelector from "./SneakerSelector";
import SneakerSpinner from "./SneakerSpinner";
import CompareTable from "./CompareTable";
import { Lock, ArrowLeftRight, Maximize2, X } from "lucide-react";

type CompareClientProps = {
  sneakers: any[];
};

export default function CompareClient({
  sneakers,
}: CompareClientProps) {
  const [leftShoe, setLeftShoe] = useState(sneakers[0]);
  const [rightShoe, setRightShoe] = useState(sneakers[1]);

  // Spinner frame state
  const [leftFrame, setLeftFrame] = useState(0);
  const [rightFrame, setRightFrame] = useState(0);

  // Lock state
  const [locked, setLocked] = useState(false);

  // Fullscreen state
  const [fullscreen, setFullscreen] = useState(false);

  // Safety: if a shoe ever has fewer frames than expected,
  // reset to frame 0 instead of crashing.
  useEffect(() => {
    const max =
      leftShoe.sneakerDetails.spinImages?.nodes?.length ?? 0;

    if (leftFrame >= max) {
      setLeftFrame(0);
    }
  }, [leftShoe, leftFrame]);

  useEffect(() => {
    const max =
      rightShoe.sneakerDetails.spinImages?.nodes?.length ?? 0;

    if (rightFrame >= max) {
      setRightFrame(0);
    }
  }, [rightShoe, rightFrame]);

  function swapShoes() {
    const left = leftShoe;
    const right = rightShoe;

    setLeftShoe(right);
    setRightShoe(left);

    // Keep viewing angle with the shoes
    const leftF = leftFrame;
    const rightF = rightFrame;

    setLeftFrame(rightF);
    setRightFrame(leftF);
  }

  function toggleLock() {
    if (!locked) {
      // Align both shoes before locking
      setRightFrame(leftFrame);
    }

    setLocked(!locked);
  }

  const spinnerSection = (
  <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
    <SneakerSpinner
      images={leftShoe.sneakerDetails.spinImages?.nodes ?? []}
      frame={leftFrame}
      onFrameChange={(frame) => {
        setLeftFrame(frame);

        if (locked) {
          setRightFrame(frame);
        }
      }}
    />

    <SneakerSpinner
      images={rightShoe.sneakerDetails.spinImages?.nodes ?? []}
      frame={rightFrame}
      onFrameChange={(frame) => {
        setRightFrame(frame);

        if (locked) {
          setLeftFrame(frame);
        }
      }}
    />
  </div>
);

  return (
    <div className="mt-10">
      {/* Selectors */}
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <SneakerSelector
          sneaker={leftShoe}
          sneakers={sneakers}
          onSelect={setLeftShoe}
        />

        <div className="text-center text-6xl font-black uppercase text-white">
          VS
        </div>

        <SneakerSelector
          sneaker={rightShoe}
          sneakers={sneakers}
          onSelect={setRightShoe}
        />
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={toggleLock}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
            locked
              ? "border-red-500 bg-red-500 text-white"
              : "border-zinc-700 bg-zinc-900 text-white hover:border-red-500"
          }`}
        >
          <Lock size={18} />
          {locked ? "Rotation Locked" : "Lock Rotation"}
        </button>

        <button
          onClick={swapShoes}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-500"
        >
          <ArrowLeftRight size={18} />
          Swap Shoes
        </button>

        <button
          onClick={() => setFullscreen(true)}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-500"
        >
          <Maximize2 size={18} />
          Fullscreen
        </button>
      </div>

      {fullscreen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
    <button
      onClick={() => setFullscreen(false)}
      className="absolute right-6 top-6 rounded-full bg-zinc-800 p-3 text-white hover:bg-zinc-700"
    >
      <X size={28} />
    </button>

    <div className="w-full max-w-7xl px-8">
  <div className="mb-8 text-center">
    <h2 className="text-4xl font-black uppercase text-white">
      Tale of the Tape
    </h2>
  </div>
<div className="mb-8 flex flex-wrap justify-center gap-4">
  <button
    onClick={toggleLock}
    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
      locked
        ? "border-red-500 bg-red-500 text-white"
        : "border-zinc-700 bg-zinc-900 text-white hover:border-red-500"
    }`}
  >
    <Lock size={18} />
    {locked ? "Rotation Locked" : "Lock Rotation"}
  </button>

  <button
    onClick={swapShoes}
    className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-500"
  >
    <ArrowLeftRight size={18} />
    Swap Shoes
  </button>
</div>
  {spinnerSection}
</div>
  </div>
)}

  {!fullscreen && spinnerSection}    

      <CompareTable
        leftShoe={leftShoe}
        rightShoe={rightShoe}
      />
    </div>
  );
}