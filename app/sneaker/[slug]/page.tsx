import { GET_SNEAKER } from "@/app/lib/graphql/sneaker";
import { GET_RELATED_SNEAKERS } from "@/app/lib/graphql/relatedSneakers";
import { GET_COMPARE_SNEAKERS } from "@/app/lib/graphql/compare";

import { request } from "graphql-request";
import { notFound } from "next/navigation";

import SneakerExperience from "@/components/SneakerExperience";

async function getSneaker(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_SNEAKER,
        variables: { slug },
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status}`);
  }

  const json = await res.json();

  return json?.data?.sneaker;
}

async function getRelatedSneakers() {
  const endpoint = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

  const data: any = await request(endpoint, GET_RELATED_SNEAKERS);

  return data.sneakers.nodes;
}

async function getAllSneakers() {
  const endpoint = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

  const data: any = await request(endpoint, GET_COMPARE_SNEAKERS);

  return data.sneakers.nodes;
}

export default async function SneakerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [sneaker, relatedSneakers, allSneakers] = await Promise.all([
    getSneaker(slug),
    getRelatedSneakers(),
    getAllSneakers(),
  ]);

  if (!sneaker) {
    notFound();
  }

  return (
    <SneakerExperience
      sneaker={sneaker}
      relatedSneakers={relatedSneakers}
      allSneakers={allSneakers}
    />
  );
}