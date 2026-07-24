type Sneaker = {
  slug: string;
  title: string;
  sneakerDetails?: {
    nickname?: string;
    brand?: {
      nodes?: {
        name: string;
      }[];
    };
    cardImage?: {
      node?: {
        sourceUrl?: string;
      };
    };
  };
};

type ComparePanelProps = {
  currentSneaker: Sneaker;
  allSneakers: Sneaker[];
};

export default function ComparePanel({
  currentSneaker,
  allSneakers,
}: ComparePanelProps) {
  return (
    <section className="mt-16 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
      <h2 className="mb-8 text-center text-4xl font-black uppercase text-white">
        Compare
      </h2>

      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
        {/* Current Shoe */}
        <div className="rounded-xl border border-red-500 bg-zinc-950 p-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-red-500">
            Current Sneaker
          </p>

          {currentSneaker.sneakerDetails?.cardImage?.node?.sourceUrl && (
            <img
              src={currentSneaker.sneakerDetails.cardImage.node.sourceUrl}
              alt={currentSneaker.title}
              className="mx-auto mb-4 h-44 object-contain"
            />
          )}

          <h3 className="text-2xl font-black text-white">
            {currentSneaker.title}
          </h3>

          <p className="mt-2 text-zinc-400">
            {currentSneaker.sneakerDetails?.brand?.nodes?.[0]?.name}
          </p>

          <div className="mt-6 inline-flex rounded-full bg-red-600 px-4 py-1 text-sm font-bold uppercase text-white">
            🔒 Locked
          </div>
        </div>

        {/* VS */}
        <div className="text-center">
          <span className="text-5xl font-black text-red-500">VS</span>
        </div>

        {/* Comparison Shoe */}
        <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
            Compare With
          </p>

          <select className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white">
            <option>Select a sneaker...</option>

            {allSneakers
              .filter((shoe) => shoe.slug !== currentSneaker.slug)
              .map((shoe) => (
                <option key={shoe.slug} value={shoe.slug}>
                  {shoe.title}
                </option>
              ))}
          </select>

          <div className="mt-10 flex h-44 items-center justify-center rounded-lg border border-dashed border-zinc-700 text-zinc-500">
            Sneaker Preview
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-zinc-800 bg-zinc-950 p-8">
        <h3 className="mb-4 text-2xl font-black uppercase text-white">
          Tale of the Tape
        </h3>

        <p className="text-zinc-400">
          Select a sneaker to begin comparing specifications.
        </p>
      </div>
    </section>
  );
}