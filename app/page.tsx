import { gql } from "graphql-request";
import { client } from "./lib/wordpress";

async function getSneakers() {
  const query = gql`
  query GetSneakers {
    sneakers {
      nodes {
        title
        sneakerDetails {
          brand
          model
          colorway
          releaseDate
          retailPrice
          sku
          videoUrl
        }
      }
    }
  }
`;

  const data = await client.request(query);
  return data;
}

export default async function Home() {
  const data = await getSneakers();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Lacendary Kicks</h1>

      <h2>Sneakers</h2>

     <ul>
  {data.sneakers.nodes.map((sneaker: any) => (
    <li key={sneaker.title}>
      <h2>{sneaker.title}</h2>
      <p>Brand: {sneaker.sneakerDetails?.brand}</p>
      <p>Model: {sneaker.sneakerDetails?.model}</p>
      <p>Colorway: {sneaker.sneakerDetails?.colorway}</p>
    </li>
  ))}
</ul>
    </main>
  );
}