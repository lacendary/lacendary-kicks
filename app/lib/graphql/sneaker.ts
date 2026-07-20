export const GET_SNEAKER = `
query GetSneaker($slug: ID!) {

  sneaker(id: $slug, idType: SLUG) {

    title
    slug

    sneakerDetails {

      # Hero
      brand {
        nodes {
          name
          slug
        }
      }
      model
      nickname
      retroReleaseYear
      overview
      videoUrl

      # Details Panel
      retroReleaseDate
      sku
      retailPrice
      colorway
      designer
      category

      # Editorial
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

      lacendaryImages {
        nodes {
          sourceUrl
        }
      }

      officialImages {
        nodes {
          sourceUrl
        }
      }

      onFootImages {
        nodes {
          sourceUrl
        }
      }

      # Future
      originalReleaseDate
      originalReleaseYear
    }

    featuredImage {
      node {
        sourceUrl
      }
    }
  }
}
`;