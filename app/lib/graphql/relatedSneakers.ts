import { gql } from "graphql-request";

export const GET_RELATED_SNEAKERS = gql`
  query GetRelatedSneakers {
    sneakers(first: 4) {
      nodes {
        title
        slug

        sneakerDetails {
          brand {
            nodes {
              name
              slug
            }
          }

          model
          nickname
          retroReleaseDate
          editorialStatus

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