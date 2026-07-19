export const GET_SNEAKER = `
query GetSneaker($slug: ID!) {

  sneaker(id: $slug, idType: SLUG) {

    title
    slug

    sneakerDetails {

      # Identity
      sku
      colorway
      retailPrice
      designer

      # Content
      overview
      lacendaryNotes

      # Media
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

      # Video
      videoUrl
    }

    featuredImage {
      node {
        sourceUrl
      }
    }
  }
}
`;