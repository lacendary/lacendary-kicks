import { request } from "graphql-request";

import { GET_COMPARE_SNEAKERS } from "@/app/lib/graphql/compare";
import CompareClient from "@/components/CompareClient";

async function getCompareSneakers() {
  const endpoint = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

  const data = await request(endpoint, GET_COMPARE_SNEAKERS);

  return data;
}

export default async function ComparePage() {
  const data: any = await getCompareSneakers();

  const sneakers = data.sneakers.nodes;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-6xl font-black uppercase text-white">
        Tale of the Tape
      </h1>

      <p className="mt-2 mb-10 text-zinc-400">
        Compare two sneakers side by side.
      </p>

      <CompareClient sneakers={sneakers} />
    </main>
  );
}