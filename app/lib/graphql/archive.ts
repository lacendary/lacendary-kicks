export const GET_ARCHIVE = `
query GetArchive {

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