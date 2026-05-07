interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  const tabs = [
    "ALL",
    "SEARCH",
    "IMAGES",
    "VIDEOS",
    "MAPS",
    "NEWS",
    "COPILOT",
    "MORE",
  ];

  return (
    <div className="sticky top-14 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto flex gap-6 px-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`pb-3 pt-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
