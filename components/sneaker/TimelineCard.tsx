type TimelineCardProps = {
  title: string;
  description: string;
  badge: string;
  source: string;
  sourceUrl?: string;
  image?: string;
};

export default function TimelineCard({
  title,
  description,
  badge,
  source,
  sourceUrl,
  image,
}: TimelineCardProps) {
  return (
    <div className="group relative ml-10 rounded-2xl border border-white/5 bg-zinc-900/80 p-5 transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-900">

      {/* Connector from timeline */}
      <div className="absolute -left-14 top-12 h-px w-14 bg-zinc-600 transition-colors duration-300 group-hover:bg-red-500" />

      <div className="flex gap-6">

        {/* Thumbnail */}
        <div className="h-[90px] w-[160px] flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">

          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-wider text-zinc-500">
              16:9 Preview
            </div>
          )}

        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">

          <h3 className="text-2xl font-bold uppercase tracking-wide text-white">
            {title}
          </h3>

          <p className="mt-3 leading-relaxed text-zinc-400">
            {description}
          </p>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between pt-5">

            <span className="rounded-md bg-blue-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-200">
              {badge}
            </span>

            {source && (
              sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 transition-colors hover:text-white"
                >
                  {source} ↗
                </a>
              ) : (
                <span className="text-sm text-zinc-500">
                  {source}
                </span>
              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}