export default function ImpactCard({ stats }: { stats: any }) {
  const impacts = [
    { label: "Streak", value: `${stats?.currentStreak || 0} 🔥` },
    { label: "Games", value: `${stats?.totalGamesPlayed || 0}` },
    { label: "Active", value: `${stats?.lastPlayedDate || 'N/A'}` },
  ];

  return (
    <div className="bg-white/3 backdrop-blur-2xl border border-white/8 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <h3 className="text-lg font-bold text-white mb-6">GAMING IMPACT</h3>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {impacts.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center p-2 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors text-center"
          >
            <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mb-2 truncate max-w-full">
              {item.label}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-white truncate max-w-full">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
