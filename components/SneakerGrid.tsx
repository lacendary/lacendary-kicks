import SneakerCard from "./SneakerCard";

interface SneakerGridProps {
  sneakers: any[];
}

export default function SneakerGrid({ sneakers }: SneakerGridProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {sneakers.map((sneaker) => (
        <SneakerCard
          key={sneaker.slug}
          sneaker={sneaker}
        />
      ))}
    </div>
  );
}