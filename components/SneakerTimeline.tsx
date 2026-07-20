type SneakerTimelineProps = {
  sneaker: any;
};

export default function SneakerTimeline({
  sneaker,
}: SneakerTimelineProps) {
  const events = sneaker.sneakerDetails.timelineEvents || [];

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="mb-8 text-lg font-bold uppercase tracking-wide text-white">
        Timeline
      </h2>

      <div className="relative pt-10 pb-4">
        {/* Timeline Line */}
        <div className="absolute left-4 right-4 top-[58px] h-[2px] bg-zinc-300" />

        {/* Timeline Events */}
        <div className="relative flex justify-between">
          {events.map((event: any, index: number) => (
            <div
              key={index}
              className="group relative flex flex-col items-center text-center"
            >
              {/* Hover Card */}
              <div
                className="
                  invisible
                  absolute
                  bottom-28
                  left-1/2
                  z-20
                  w-80
                  -translate-x-1/2
                  rounded-xl
                  border
                  border-zinc-800
                  bg-black
                  p-5
                  opacity-0
                  shadow-2xl
                  transition-all
                  duration-300
                  ease-out
                  group-hover:visible
                  group-hover:-translate-y-2
                  group-hover:opacity-100
                "
              >
                <h3 className="text-base font-bold uppercase tracking-wide text-white">
                  {event.eventTitle}
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {event.eventDescription}
                </p>

                <div className="mt-4 border-t border-zinc-800 pt-3 text-xs uppercase tracking-widest text-red-500">
                  View Full Timeline →
                </div>

                {/* Arrow */}
                <div className="absolute bottom-[-10px] left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-r border-b border-zinc-800 bg-black" />
              </div>

              {/* Timeline Marker */}
              <div
                className="
                  z-10
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  transition-all
                  duration-300
                  group-hover:scale-110
                "
              >
                {/* Black Gap */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950">
                  {/* Red Circle */}
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600">
                    {/* Center Dot */}
                    <div className="h-2 w-2 rounded-full bg-red-900" />
                  </div>
                </div>
              </div>

              {/* Date */}
              <p className="mt-4 text-sm font-semibold text-red-500">
                {new Date(event.eventDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}