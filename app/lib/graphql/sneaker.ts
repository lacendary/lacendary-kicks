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
      songTitle
      artist
      streamingUrl

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
        eventTitle
        eventDescription
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