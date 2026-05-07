import { Moon, Bell } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";

interface PreferencesCardProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
}

export default function PreferencesCard({
  darkMode,
  setDarkMode,
  notifications,
  setNotifications,
}: PreferencesCardProps) {
  const preferences = [
    {
      icon: Moon,
      label: "Dark Mode",
      subtitle: "Use dark theme for the app",
      value: darkMode,
      onChange: setDarkMode,
    },
    {
      icon: Bell,
      label: "Notifications",
      subtitle: "Receive app notifications",
      value: notifications,
      onChange: setNotifications,
    },
  ];

  return (
    <div className="bg-white/3 backdrop-blur-2xl border border-white/8 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <h3 className="text-lg font-bold text-white mb-6">PREFERENCES</h3>

      <div className="space-y-4">
        {preferences.map((pref, idx) => {
          const IconComponent = pref.icon;
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <IconComponent className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{pref.label}</p>
                  <p className="text-xs text-gray-400">{pref.subtitle}</p>
                </div>
              </div>
              <ToggleSwitch enabled={pref.value} onChange={pref.onChange} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
