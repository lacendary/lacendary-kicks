import { notFound } from "next/navigation";
import SneakerSpinner from "@/components/SneakerSpinner";

async function getSneaker(slug: string) {
  const query = `
    query GetSneaker($slug: ID!) {
      sneaker(id: $slug, idType: SLUG) {
        title
        slug

        sneakerDetails {
  sku
  colorway
  retailPrice
  overview
  designer
  videoUrl
  lacendaryNotes

  heroImage {
    node {
      sourceUrl
    }
  }

  spinImages(first: 200) {
    nodes {
      sourceUrl
    }
  }
}

        featuredImage {
          node {
            sourceUrl
          }
        }
      }
    }
  `;
console.log("WP URL:", process.env.NEXT_PUBLIC_WORDPRESS_URL);
console.log("Slug being sent:", slug);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { slug },
      }),
      next: { revalidate: 60 },
    }
  );

  const json = await res.json();

console.log(JSON.stringify(json, null, 2));

console.log("GRAPHQL RESPONSE:");
console.log(JSON.stringify(json, null, 2));

return json?.data?.sneaker;console.log("GRAPHQL:");
console.log(JSON.stringify(json, null, 2));

return json?.data?.sneaker;
}

export default async function SneakerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const sneaker = await getSneaker(slug);

  if (!sneaker) {
    notFound();
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="grid md:grid-cols-2 gap-12">

        <div>
          {sneaker.sneakerDetails?.heroImage?.node?.sourceUrl && (
  <img
    src={sneaker.sneakerDetails.heroImage.node.sourceUrl}
    alt={sneaker.title}
    className="w-full rounded-xl shadow-2xl"
  />
)}
        </div>
<SneakerSpinner
  images={sneaker.sneakerDetails.spinImages.nodes}
/>
        <div>
          <h1 className="text-4xl font-bold mb-4">
            {sneaker.title}
          </h1>

          <div className="space-y-2">
            <p>
              <strong>SKU:</strong>{" "}
              {sneaker.sneakerDetails?.sku}
            </p>

            <p>
              <strong>Colorway:</strong>{" "}
              {sneaker.sneakerDetails?.colorway}
            </p>

            <p>
              <strong>Retail:</strong> $
              {sneaker.sneakerDetails?.retailPrice}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">
          Overview
        </h2>

        <div
          dangerouslySetInnerHTML={{
            __html:
              sneaker.sneakerDetails?.overview || "",
          }}
        />
      </section>
    </main>
  );
}