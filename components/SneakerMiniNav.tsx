type SneakerMiniNavProps = {
  sneaker: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function SneakerMiniNav({
  sneaker,
  activeTab,
  onTabChange,
}: SneakerMiniNavProps) {
  const details = sneaker.sneakerDetails;

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      show: true,
    },
    {
      id: "photography",
      label: "Photography",
      show:
        details.lacendaryImages?.nodes?.length > 0 ||
        details.officialImages?.nodes?.length > 0 ||
        details.onFootImages?.nodes?.length > 0,
    },
    {
      id: "timeline",
      label: "Timeline",
      show: details.timelineEvents?.length > 0,
    },
    {
      id: "soundtrack",
      label: "Soundtrack",
      show: true,
    },
    {
      id: "compare",
      label: "Compare",
      show: true,
    },
  ];

  return (
    <nav className="mt-8">
      <ul className="flex items-center gap-10 overflow-x-auto">
        {navItems
          .filter((item) => item.show)
          .map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`whitespace-nowrap border-b-2 pb-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === item.id
                    ? "border-red-600 text-white"
                    : "border-transparent text-zinc-500 hover:text-white"
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