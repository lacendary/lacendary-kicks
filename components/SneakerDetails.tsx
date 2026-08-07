type SneakerDetailsProps = {
  sneaker: any;
};

export default function SneakerDetails({
  sneaker,
}: SneakerDetailsProps) {
  const details = sneaker.sneakerDetails;

  /* ================================================================
      Helpers
  ================================================================ */

  const formatDate = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  /* ================================================================
      Detail Items
  ================================================================ */

  const detailItems = [
    {
      label: "Release Date",
      value: formatDate(details.retroReleaseDate),
    },
    {
      label: "Original Release",
      value: formatDate(details.originalReleaseDate),
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
    <section className="panel panel-padding">

      {/* ================================================================
          Heading
      ================================================================ */}

      <header className="panel-header-spacing">
        <h2 className="panel-heading">
          Sneaker Details
        </h2>
      </header>

      {/* ================================================================
          Detail List
      ================================================================ */}

      <div className="panel-content-spacing">
        {detailItems.map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between border-b border-zinc-800 pb-3"
          >
            <span className="meta-text">
              {item.label}
            </span>

            <span className="value-text text-right">
              {item.value}
            </span>
          </div>
        ))}
      </div>

    </section>
  );
}