import SneakerGrid from "@/components/SneakerGrid";
import { GET_ARCHIVE } from "@/app/lib/graphql/archive";

async function getArchive() {
  const endpoint = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GET_ARCHIVE,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status}`);
  }

  const text = await res.text();

console.log("Raw GraphQL response:", text);

const json = JSON.parse(text);

  console.log("Archive response:", JSON.stringify(json, null, 2));

  if (json.errors) {
    throw new Error(JSON.stringify(json.errors));
  }

  return json.data;
}

export default async function ArchivePage() {
  const data: any = await getArchive();

  const archiveSneakers = data.sneakers.nodes.filter(
    (shoe: any) =>
      shoe.sneakerDetails?.editorialStatus?.[0] === "Archived"
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-6xl font-black uppercase text-white">
        Sneaker Archive
      </h1>

      <h2 className="mt-2 text-3xl font-bold uppercase text-zinc-400">
        Explore. Discover. Compare.
      </h2>

      <p className="mt-6 text-xl text-zinc-300">
        The complete Lacendary Kicks archive.
      </p>

      <p className="mb-12 text-xl text-zinc-300">
        <span className="font-bold text-red-500">
          {archiveSneakers.length}
        </span>{" "}
        sneakers in the archive.
      </p>

      <SneakerGrid sneakers={archiveSneakers} />
    </main>
  );
}