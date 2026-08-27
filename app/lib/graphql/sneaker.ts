/* ==========================================================================
   Single Sneaker Query
   ========================================================================== */

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
      editorialStatus

      cardImage {
        node {
          sourceUrl
        }
      }

      # Details Panel

      retroReleaseDate
      sku
      retailPrice
      stockxUrl
      goatUrl
      colorway
      designer
      category

      # Market Tracking

      marketTrackingEnabled
      kicksdbProductId
      marketTrackingStatus
      marketLastSuccessfulSyncAt
      marketNotes

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

      # Original Soundtrack

      trackTitle
      artistName
      spotifyUrl
      appleMusicUrl
      youtubeUrl

      albumArtwork {
        node {
          sourceUrl
        }
      }

      audioFile {
        node {
          mediaItemUrl
        }
      }

      # Timeline

      timelineEvents {
        eventDate
        timelineLabel
        eventTitle
        eventDescription
        badge
        source
        sourceUrl

        image {
          node {
            sourceUrl
            altText
          }
        }
      }

      # Future

      originalReleaseDate
      originalReleaseYear

    }

  }

}
`;

/* ==========================================================================
   Recently Archived Query
   ========================================================================== */

export const GET_RECENT_SNEAKERS = `
query GetRecentSneakers {

  sneakers(first: 4) {

    nodes {

      title
      slug

      sneakerDetails {

        brand {
          nodes {
            name
          }
        }

        model
        nickname
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
