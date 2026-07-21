export const GET_COMPARE_SNEAKERS = `
query GetCompareSneakers {
  sneakers(first: 100) {
    nodes {
      slug
      title

      sneakerDetails {
        model
        nickname
        sku
        colorway
        retailPrice
        retroReleaseDate
        designer
        overview
        editorialStatus

        brand {
          nodes {
            name
            slug
          }
        }

        cardImage {
          node {
            sourceUrl
          }
        }

        heroImage {
          node {
            sourceUrl
          }
        }

        spinImages(first: 150) {
          nodes {
            sourceUrl
          }
        }
      }
    }
  }
}
`;