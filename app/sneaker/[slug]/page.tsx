import { GET_SNEAKER } from "@/app/lib/graphql/sneaker";
import { GET_RELATED_SNEAKERS } from "@/app/lib/graphql/relatedSneakers";
import { GET_COMPARE_SNEAKERS } from "@/app/lib/graphql/compare";
import type { GetSneakerResponse } from "@/app/lib/sneaker";
import { getMarketHistory } from "@/app/lib/market";

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

  const json: { data?: GetSneakerResponse; errors?: unknown[] } =
    await res.json();

  console.log("========== GRAPHQL RESPONSE ==========");
  console.log(JSON.stringify(json, null, 2));
  console.log("======================================");

  if (json.errors) {
    return {
      __graphqlErrors: json.errors,
    };
  }

  return json.data?.sneaker;
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

  const sneaker = await getSneaker(slug);

  if (!sneaker || "__graphqlErrors" in sneaker) {
    return (
      <pre style={{ whiteSpace: "pre-wrap", padding: "2rem", color: "white" }}>
        {JSON.stringify(sneaker, null, 2)}
      </pre>
    );
  }

  const productId = typeof sneaker.sneakerDetails?.kicksdbProductId === "string"
    ? sneaker.sneakerDetails.kicksdbProductId.trim()
    : null;
  const [relatedSneakers, allSneakers, marketData] = await Promise.all([
    getRelatedSneakers(),
    getAllSneakers(),
    productId ? getMarketHistory(productId) : Promise.resolve(null),
  ]);

  return (
    <SneakerExperience
      sneaker={sneaker}
      relatedSneakers={relatedSneakers}
      allSneakers={allSneakers}
      marketData={marketData}
    />
  );
}
