type Sneaker = {
  sneakerDetails: {
    model: string;
    nickname: string;
    sku?: string;
    colorway?: string;
    retailPrice?: string;
    retroReleaseDate?: string;
    designer?: string;
    brand?: {
      nodes?: {
        name: string;
      }[];
    };
  };
};

type Props = {
  leftShoe: Sneaker;
  rightShoe: Sneaker;
};

function Row({
  label,
  left,
  right,
}: {
  label: string;
  left: string;
  right: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-zinc-800 py-5 last:border-b-0">

      <div className="text-right text-lg font-semibold text-white">
        {left || "—"}
      </div>

      <div className="px-8 text-xs font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </div>

      <div className="text-left text-lg font-semibold text-white">
        {right || "—"}
      </div>

    </div>
  );
}

export default function CompareTable({
  leftShoe,
  rightShoe,
}: Props) {
  const left = leftShoe.sneakerDetails;
  const right = rightShoe.sneakerDetails;

  return (
    <div className="mt-14 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">

      

      <Row
        label="Brand"
        left={left.brand?.nodes?.[0]?.name ?? ""}
        right={right.brand?.nodes?.[0]?.name ?? ""}
      />

      <Row
        label="Model"
        left={left.model}
        right={right.model}
      />

      <Row
        label="Nickname"
        left={left.nickname}
        right={right.nickname}
      />

      <Row
        label="Release"
        left={left.retroReleaseDate ?? ""}
        right={right.retroReleaseDate ?? ""}
      />

      <Row
        label="Retail"
        left={left.retailPrice ?? ""}
        right={right.retailPrice ?? ""}
      />

      <Row
        label="Designer"
        left={left.designer ?? ""}
        right={right.designer ?? ""}
      />

      <Row
        label="Colorway"
        left={left.colorway ?? ""}
        right={right.colorway ?? ""}
      />

      <Row
        label="SKU"
        left={left.sku ?? ""}
        right={right.sku ?? ""}
      />

    </div>
  );
}