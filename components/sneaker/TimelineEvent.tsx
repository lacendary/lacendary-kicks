import TimelineMarker from "@/components/sneaker/TimelineMarker";
import TimelineCard from "@/components/sneaker/TimelineCard";

type TimelineEventProps = {
  date: string;
  timelineLabel: string;
  title: string;
  description: string;
  badge: string;
  source: string;
  sourceUrl?: string;
  image?: string;
};

export default function TimelineEvent({
  date,
  timelineLabel,
  title,
  description,
  badge,
  source,
  sourceUrl,
  image,
}: TimelineEventProps) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-8">
      <TimelineMarker
        date={date}
        label={timelineLabel}
      />

      <TimelineCard
        title={title}
        description={description}
        badge={badge}
        source={source}
        sourceUrl={sourceUrl}
        image={image}
      />
    </div>
  );
}