import { request } from "graphql-request";

import SneakerGrid from "@/components/SneakerGrid";
import { GET_LACENDARY_PICKS } from "@/app/lib/graphql/lacendaryPicks";

async function getLacendaryPicks() {
  const endpoint = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

  const data = await request(endpoint, GET_LACENDARY_PICKS);

  return data;
}

export default async function LacendaryPicksPage() {
  const data: any = await getLacendaryPicks();

  const pickSneakers = data.sneakers.nodes.filter(
    (shoe: any) =>
      shoe.sneakerDetails?.editorialStatus?.[0] === "Lacendary Pick"
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-6xl font-black uppercase text-white">
        Lacendary Picks
      </h1>

      <h2 className="mt-2 text-3xl font-bold uppercase text-zinc-400">
        Shoes We Think Deserve Your Attention.
      </h2>

    

      <p className="mb-12 text-xl text-zinc-300">
        <span className="font-bold text-red-500">
          {pickSneakers.length}
        </span>{" "}
        Lacendary Picks.
      </p>

      <SneakerGrid sneakers={pickSneakers} />
    </main>
  );
}