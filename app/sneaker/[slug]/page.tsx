import { GET_SNEAKER } from "@/app/lib/graphql/sneaker";
import { notFound } from "next/navigation";

import SneakerHero from "@/components/SneakerHero";
import SneakerMiniNav from "@/components/SneakerMiniNav";
import SneakerGallery from "@/components/SneakerGallery";
import SneakerSpinner from "@/components/SneakerSpinner";
import SneakerDetails from "@/components/SneakerDetails";

async function getSneaker(slug: string) {
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
        query: GET_SNEAKER,
        variables: { slug },
      }),
      next: { revalidate: 60 },
    }
  );

  const json = await res.json();

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
    <main className="max-w-7xl mx-auto px-6 py-12">
      <SneakerHero sneaker={sneaker} />

      <SneakerMiniNav sneaker={sneaker} />

      <SneakerGallery sneaker={sneaker} />

      <section id="spinner" className="mt-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Spinner */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold uppercase tracking-wide text-white">
              360° Spinner
            </h2>

            <SneakerSpinner
              images={sneaker.sneakerDetails.spinImages.nodes}
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <SneakerDetails sneaker={sneaker} />
          </div>
        </div>
      </section>
    </main>
  );
}