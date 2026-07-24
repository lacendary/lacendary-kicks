type TimelineMarkerProps = {
  date: string;
  label: string;
};

export default function TimelineMarker({
  date,
  label,
}: TimelineMarkerProps) {
  return (
    <div className="grid grid-cols-[150px_70px] gap-6">

      {/* Date / Label */}
      <div className="pt-2 text-right">

        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-red-500">
          {date}
        </p>

        <p className="mt-4 text-xl font-light uppercase tracking-wide text-white">
          {label}
        </p>

      </div>

      {/* Timeline */}
      <div className="relative flex justify-center">

        {/* Vertical Spine */}
        <div className="absolute inset-y-0 w-px bg-zinc-700" />

        {/* Outer Ring */}
        <div className="absolute top-6 flex h-10 w-10 items-center justify-center rounded-full border border-red-900/60 bg-zinc-950">

          {/* Glow Ring */}
          <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.18)]" />

          {/* Inner Ring */}
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-red-500 bg-zinc-950">

            {/* Core */}
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />

          </div>

        </div>

      </div>

    </div>
  );
}