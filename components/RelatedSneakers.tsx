import SneakerGrid from "./SneakerGrid";

interface RelatedSneakersProps {
  sneakers: any[];
}

export default function RelatedSneakers({
  sneakers,
}: RelatedSneakersProps) {
  if (!sneakers.length) return null;

  return (
    <section className="flex h-full flex-col rounded-xl border border-zinc-800 bg-[#111111] p-6">
      <h2 className="mb-5 text-lg font-bold uppercase tracking-wide text-white">
        Related Sneakers
      </h2>

      <div className="flex-1">
        <SneakerGrid sneakers={sneakers} />
      </div>
    </section>
  );
}