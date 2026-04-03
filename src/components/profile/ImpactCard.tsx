export default function ImpactCard() {
  const impacts = [
    { label: "Saved", value: "₹0" },
    { label: "Score", value: "0" },
    { label: "TXS", value: "0" },
  ];

  return (
    <div className="bg-white/3 backdrop-blur-2xl border border-white/8 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <h3 className="text-lg font-bold text-white mb-6">YOUR IMPACT</h3>

      <div className="grid grid-cols-3 gap-4">
        {impacts.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
          >
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              {item.label}
            </p>
            <p className="text-2xl font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
