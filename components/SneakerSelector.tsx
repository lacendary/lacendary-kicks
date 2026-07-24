"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";

type Sneaker = {
  slug: string;
  sneakerDetails: {
    model: string;
    nickname: string;
    cardImage?: {
      node?: {
        sourceUrl: string;
      };
    };
  };
};

type Props = {
  sneaker: Sneaker;
  sneakers: Sneaker[];
  onSelect: (shoe: Sneaker) => void;
  locked?: boolean;
  label?: string;
};

export default function SneakerSelector({
  sneaker,
  sneakers,
  onSelect,
  locked = false,
  label,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      {label && (
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-red-500">
          {label}
        </div>
      )}

      {/* Selected Shoe */}
      <button
        onClick={() => {
          if (!locked) {
            setOpen(!open);
          }
        }}
        disabled={locked}
        className={`flex w-full items-center justify-between rounded-xl border-2 bg-[#111111] px-6 py-5 transition-all duration-200 ${
          locked
            ? "cursor-default border-zinc-700"
            : "border-zinc-700 hover:border-red-500 hover:shadow-lg"
        }`}
      >
        <div className="flex items-center gap-4">
          {locked ? (
            <Lock size={22} className="text-red-500" />
          ) : (
            <span
              className={`text-lg text-white transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          )}

          <span className="text-2xl font-black uppercase leading-tight text-white lg:text-3xl">
            {sneaker.sneakerDetails.model}{" "}
            {sneaker.sneakerDetails.nickname}
          </span>
        </div>

        {sneaker.sneakerDetails.cardImage?.node?.sourceUrl && (
          <Image
            src={sneaker.sneakerDetails.cardImage.node.sourceUrl}
            alt={sneaker.sneakerDetails.nickname}
            width={120}
            height={72}
            className="rounded-lg object-cover"
          />
        )}
      </button>

      {/* Dropdown */}
      {!locked && open && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl">
          {sneakers.map((shoe) => {
            const isSelected = shoe.slug === sneaker.slug;

            return (
              <button
                key={shoe.slug}
                onClick={() => {
                  onSelect(shoe);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between border-b border-zinc-800 px-5 py-4 text-left transition last:border-b-0 hover:bg-zinc-900 ${
                  isSelected
                    ? "border-l-4 border-l-red-500 bg-zinc-900"
                    : ""
                }`}
              >
                <div className="text-lg font-bold uppercase text-white">
                  {shoe.sneakerDetails.model}{" "}
                  {shoe.sneakerDetails.nickname}
                </div>

                {shoe.sneakerDetails.cardImage?.node?.sourceUrl && (
                  <Image
                    src={shoe.sneakerDetails.cardImage.node.sourceUrl}
                    alt={shoe.sneakerDetails.nickname}
                    width={90}
                    height={55}
                    className="rounded-lg object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}