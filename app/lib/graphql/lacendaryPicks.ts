export const GET_LACENDARY_PICKS = `
query GetLacendaryPicks {
  sneakers(first: 100) {
    nodes {
      slug
      title

      sneakerDetails {
        model
        nickname
        retroReleaseDate
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
      }
    }
  }
}
`;