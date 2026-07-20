type SneakerMiniNavProps = {
  sneaker: any;
};

export default function SneakerMiniNav({
  sneaker,
}: SneakerMiniNavProps) {
  const details = sneaker.sneakerDetails;

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      show: true,
    },
    {
      id: "gallery",
      label: "Gallery",
      show:
        details.lacendaryImages?.nodes?.length > 0 ||
        details.officialImages?.nodes?.length > 0,
    },
    {
      id: "on-foot",
      label: "On-Foot",
      show: details.onFootImages?.nodes?.length > 0,
    },
    {
      id: "timeline",
      label: "Timeline",
      show: details.timelineEvents?.length > 0,
    },
    {
      id: "tale-of-the-tape",
      label: "Tale of the Tape",
      show: true,
    },
  ];

  return (
    <nav className="mt-12 border-b border-zinc-800">
      <ul className="flex items-center gap-10 overflow-x-auto">
        {navItems
          .filter((item) => item.show)
          .map((item, index) => (
            <li key={item.id}>
              <button
                className={`pb-4 whitespace-nowrap text-sm font-semibold uppercase tracking-wider transition-colors ${
                  index === 0
                    ? "border-b-2 border-red-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
      </ul>
    </nav>
  );
}