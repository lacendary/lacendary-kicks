import TimelineEvent from "@/components/sneaker/TimelineEvent";

export type TimelineEventData = {
  id: number;
  date: string;
  timelineLabel: string;
  title: string;
  description: string;
  badge: string;
  source: string;
  sourceUrl?: string;
  image?: string;
};

type TimelinePanelProps = {
  events: TimelineEventData[];
};

export default function TimelinePanel({
  events,
}: TimelinePanelProps) {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-wide">
            The Timeline
          </h2>

          <p className="mt-2 max-w-2xl text-zinc-400">
            Every key moment in the history of this sneaker—from early leaks and
            official announcements to release day, market changes, and its place
            in sneaker culture.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full border border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white">
            All Events
          </button>

          <button className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500">
            Releases
          </button>

          <button className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500">
            Market
          </button>

          <button className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500">
            Culture
          </button>

          <button className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500">
            Lacendary
          </button>
        </div>

        {/* Timeline */}
        <div className="space-y-10">
          {events.map((event) => (
            <TimelineEvent
              key={event.id}
              {...event}
            />
          ))}
        </div>
      </div>
    </section>
  );
}