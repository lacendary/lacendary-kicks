import { gql } from "graphql-request";
import { client } from "./lib/wordpress";

async function getSneakers() {
  const query = gql`
    query GetSneakers {
      sneakers {
        nodes {
          title
          sneakerDetails {
            model
            nickname
            colorway
            originalReleaseDate
            retroReleaseDate
            originalReleaseYear
            retroReleaseYear
            retailPrice
            sku
            designer
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

      {data.sneakers.nodes.map((sneaker: any) => (
        <div
          key={sneaker.title}
          style={{
            marginBottom: "2rem",
            border: "1px solid #333",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <h2>{sneaker.title}</h2>

          <p>
            <strong>Model:</strong>{" "}
            {sneaker.sneakerDetails?.model}
          </p>

          <p>
            <strong>Nickname:</strong>{" "}
            {sneaker.sneakerDetails?.nickname}
          </p>

          <p>
            <strong>Colorway:</strong>{" "}
            {sneaker.sneakerDetails?.colorway}
          </p>

          <p>
            <strong>Original Release Date:</strong>{" "}
            {sneaker.sneakerDetails?.originalReleaseDate}
          </p>

          <p>
            <strong>Retro Release Date:</strong>{" "}
            {sneaker.sneakerDetails?.retroReleaseDate}
          </p>

          <p>
            <strong>Original Release Year:</strong>{" "}
            {sneaker.sneakerDetails?.originalReleaseYear}
          </p>

          <p>
            <strong>Retro Release Year:</strong>{" "}
            {sneaker.sneakerDetails?.retroReleaseYear}
          </p>

          <p>
            <strong>Retail Price:</strong> $
            {sneaker.sneakerDetails?.retailPrice}
          </p>

          <p>
            <strong>SKU:</strong>{" "}
            {sneaker.sneakerDetails?.sku}
          </p>

          <p>
            <strong>Designer:</strong>{" "}
            {sneaker.sneakerDetails?.designer}
          </p>
        </div>
      ))}
    </main>
  );
}