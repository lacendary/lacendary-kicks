import Image from "next/image";

type SneakerSoundtrackProps = {
  sneaker: any;
};

export default function SneakerSoundtrack({
  sneaker,
}: SneakerSoundtrackProps) {
  const details = sneaker.sneakerDetails;

  const songTitle = details.songTitle;
  const artist = details.artist;
  const streamingUrl = details.streamingUrl;
  const albumArtwork = details.albumArtwork?.node?.sourceUrl;
  const audioFile = details.audioFile?.node?.mediaItemUrl;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="mb-6 text-lg font-bold uppercase tracking-wide text-white">
        Original Soundtrack
      </h2>

      {albumArtwork && (
        <div className="mb-5 overflow-hidden rounded-lg">
          <Image
            src={albumArtwork}
            alt={songTitle || "Album Artwork"}
            width={600}
            height={600}
            className="w-full h-auto"
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-500">
            Song
          </p>

          <p className="mt-1 text-white font-medium">
            {songTitle || "No soundtrack assigned"}
          </p>
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-500">
            Artist
          </p>

          <p className="mt-1 text-zinc-300">
            {artist || "—"}
          </p>
        </div>

        {audioFile ? (
          <audio controls className="w-full">
            <source src={audioFile} />
            Your browser does not support audio playback.
          </audio>
        ) : (
          <button
            disabled
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-500 cursor-not-allowed"
          >
            No Audio Uploaded
          </button>
        )}

        {streamingUrl && (
          <a
            href={streamingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-lg bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            Listen Everywhere
          </a>
        )}
      </div>
    </section>
  );
}