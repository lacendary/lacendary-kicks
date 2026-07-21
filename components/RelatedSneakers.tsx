import { request } from "graphql-request";

import SneakerGrid from "./SneakerGrid";

import { GET_RELATED_SNEAKERS } from "@/app/lib/graphql/relatedSneakers";

interface RelatedSneakersProps {
  sneaker: any;
}

async function getRelatedSneakers() {
  const endpoint = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

  const data = await request(endpoint, GET_RELATED_SNEAKERS);

  return data.sneakers.nodes;
}

export default async function RelatedSneakers({
  sneaker,
}: RelatedSneakersProps) {
  const relatedSneakers = await getRelatedSneakers();

  if (!relatedSneakers.length) return null;

  return (
    <section className="h-full rounded-xl border border-zinc-800 bg-[#111111] p-6 flex flex-col">
      <h2 className="mb-5 text-lg font-bold uppercase tracking-wide text-white">
        Related Sneakers
      </h2>

      <div className="flex-1">
        <SneakerGrid sneakers={relatedSneakers} />
      </div>
    </section>
  );
}