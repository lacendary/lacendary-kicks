type SneakerDetailsProps = {
  sneaker: any;
};

export default function SneakerDetails({
  sneaker,
}: SneakerDetailsProps) {
  const details = sneaker.sneakerDetails;

  const detailItems = [
    {
      label: "Release Date",
      value: details.retroReleaseDate || "—",
    },
    {
      label: "Original Release",
      value: details.originalReleaseDate || "—",
    },
    {
      label: "SKU",
      value: details.sku || "—",
    },
    {
      label: "Retail",
      value: details.retailPrice
        ? `$${details.retailPrice}`
        : "—",
    },
    {
      label: "Designer",
      value: details.designer || "—",
    },
    {
      label: "Colorway",
      value: details.colorway || "—",
    },
    {
      label: "Category",
      value: details.category || "—",
    },
  ];

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="mb-6 text-lg font-bold uppercase tracking-wide text-white">
        Sneaker Details
      </h2>

      <div className="space-y-4">
        {detailItems.map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between border-b border-zinc-800 pb-3"
          >
            <span className="text-sm uppercase tracking-wide text-zinc-400">
              {item.label}
            </span>

            <span className="text-right text-sm font-medium text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}