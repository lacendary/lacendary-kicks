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
      <ul
        className="
          flex
          items-center
          gap-8
          overflow-x-auto
          hide-scrollbar
        "
      >
        {navItems
          .filter((item) => item.show)
          .map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`
                  nav-text
                  whitespace-nowrap
                  border-b-2
                  pb-3
                  transition-fast
                  ${
                    activeTab === item.id
                      ? "border-red-600 text-white"
                      : "border-transparent text-zinc-600 hover:text-zinc-300"
                  }
                `}
              >
                {item.label}
              </button>
            </li>
          ))}
      </ul>
    </nav>
  );
}