"use client";

import Image from "next/image";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { useRef, useState } from "react";
import { IoPlay, IoPause } from "react-icons/io5";
import EqualizerBars from "@/components/EqualizerBars";

type SneakerSoundtrackProps = {
  sneaker: any;
};

export default function SneakerSoundtrack({
  sneaker,
}: SneakerSoundtrackProps) {
  const details = sneaker.sneakerDetails;

  const trackTitle = details.trackTitle;
  const artistName = details.artistName;
  const albumArtwork = details.albumArtwork?.node?.sourceUrl;
  const audioFile = details.audioFile?.node?.mediaItemUrl;
  const audioRef = useRef<HTMLAudioElement>(null);
const [isPlaying, setIsPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);

const togglePlayback = () => {
  if (!audioRef.current) return;

  if (isPlaying) {
    audioRef.current.pause();
  } else {
    audioRef.current.play();
  }
};

const formatTime = (time: number) => {
  if (!Number.isFinite(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const progress =
  duration > 0 ? (currentTime / duration) * 100 : 0;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-white">
        Soundtrack
      </h2>

      <div className="flex items-center gap-5">
      {/* Album Artwork */}
<div
  className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900"
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  {albumArtwork ? (
    <Image
      src={albumArtwork}
      alt={trackTitle || "Album Artwork"}
      fill
      className={`object-cover transition-all duration-500 ${
  isPlaying ? "scale-[1.03]" : "scale-100"
}`}
    />
  ) : (
    <div className="flex h-full items-center justify-center text-xs text-zinc-500">
      No Artwork
    </div>
  )}

 {/* Overlay */}
<div
  onClick={togglePlayback}
  className={`absolute inset-0 flex cursor-pointer items-center justify-center transition-all duration-300 ${
    isPlaying
      ? isHovered
        ? "bg-black/40"
        : "bg-black/5"
      : "bg-black/35"
  }`}
>
{/* =========================
    Playback Control
========================= */}
<div className="relative flex h-12 w-12 items-center justify-center">

  {/* Play / Pause Circle */}
  <div
    className={`absolute flex h-12 w-12 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all duration-500 ${
      !isPlaying || isHovered
        ? "opacity-100 scale-100"
        : "opacity-0 scale-90"
    }`}
  >
    {isPlaying ? (
      <IoPause className="text-2xl text-white" />
    ) : (
      <IoPlay className="ml-1 text-2xl text-white" />
    )}
  </div>

  {/* Equalizer Bars */}
  <div
    className={`absolute transition-all duration-300 ${
      isPlaying && !isHovered
        ? "opacity-100 scale-175"
        : "opacity-0 scale-90"
    }`}
  >
    <EqualizerBars />
  </div>

</div>
</div>
</div> {/* Close Album Artwork */}         

        {/* Song Info */}
        <div className="flex flex-1 flex-col justify-center">
          <h3 className="text-base font-bold leading-tight text-white">
            {trackTitle || "No soundtrack assigned"}
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            {artistName || "Unknown Artist"}
          </p>

          <div className="mt-4">
  <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
    <div
      className="h-full rounded-full bg-red-600 transition-[width] duration-100"
      style={{ width: `${progress}%` }}
    />
  </div>

  <p className="text-sm font-medium text-zinc-500">
    {formatTime(currentTime)} / {formatTime(duration)}
  </p>
</div>

          {/* Streaming Icons Placeholder */}
          <div className="mt-5 flex items-center gap-5 text-zinc-500">
  <FaSpotify className="text-xl transition hover:text-white" />
  <FaApple className="text-xl transition hover:text-white" />
  <FaYoutube className="text-xl transition hover:text-white" />
</div>
        </div>
      </div>
    <audio
  ref={audioRef}
  src={audioFile}
  onPlay={() => setIsPlaying(true)}
  onPause={() => setIsPlaying(false)}
  onEnded={() => setIsPlaying(false)}
  onLoadedMetadata={() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }}
  onTimeUpdate={() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }}
/>
    </section>
  );
}