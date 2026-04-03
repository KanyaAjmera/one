import {
  Settings,
  Lock,
  CreditCard,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

export default function SettingsList() {
  const settings = [
    {
      icon: Settings,
      title: "General Settings",
      subtitle: "Manage your profile and basic preferences",
    },
    {
      icon: Lock,
      title: "Privacy & Security",
      subtitle: "Control your privacy and security settings",
    },
    {
      icon: CreditCard,
      title: "Card Security",
      subtitle: "Manage your saved cards and payment methods",
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "Get help and contact support",
    },
  ];

  return (
    <div className="bg-white/3 backdrop-blur-2xl border border-white/8 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <h3 className="text-lg font-bold text-white mb-6">ACCOUNT SETTINGS</h3>

      <div className="space-y-2">
        {settings.map((setting, idx) => {
          const IconComponent = setting.icon;
          return (
            <button
              key={idx}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-colors">
                <IconComponent className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">{setting.title}</p>
                <p className="text-xs text-gray-400">{setting.subtitle}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
