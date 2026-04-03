import { Mail, Phone, MapPin, Calendar } from "lucide-react";

export default function InfoCard() {
  const infoItems = [
    {
      icon: Mail,
      label: "Email Address",
      value: "demo@example.com",
    },
    {
      icon: Phone,
      label: "Phone Number",
      value: "+1 (555) 000-0000",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "San Francisco, CA",
    },
    {
      icon: Calendar,
      label: "Member Since",
      value: "January 2024",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {infoItems.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className="bg-white/3 backdrop-blur-2xl border border-white/8 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <IconComponent className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                {item.label}
              </p>
            </div>
            <p className="text-lg font-semibold text-white">{item.value}</p>
          </div>
        );
      })}
    </div>
  );
}
