import { useState, useEffect } from "react";
import axios from "axios";
import { NODE_API_URL } from "@/config";
import { useAuth } from "@/contexts/AuthContext";
import AnoAI from "@/components/ui/animated-shader-background";
import ProfileCard from "@/components/profile/ProfileCard";
import ImpactCard from "@/components/profile/ImpactCard";
import InfoCard from "@/components/profile/InfoCard";
import PreferencesCard from "@/components/profile/PreferencesCard";
import SettingsList from "@/components/profile/SettingsList";

export default function ProfilePage() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const { user } = useAuth();
  const [stats, setStats] = useState({ currentStreak: 0, totalGamesPlayed: 0, lastPlayedDate: '' });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${NODE_API_URL}/api/game/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (e) {
        console.error("Failed to load generic stats", e);
      }
    };
    if (user) {
      loadStats();
    }
  }, [user]);

  return (
    <div className="flex h-screen w-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <AnoAI />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex w-full h-full text-foreground">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col backdrop-blur-sm bg-background/60 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-12">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                Profile
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your account and preferences
              </p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-8">
                <ProfileCard user={user} stats={stats} />
                <ImpactCard stats={stats} />
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Info Cards */}
                <div>
                  <InfoCard user={user} />
                </div>

                {/* Preferences */}
                <PreferencesCard
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  notifications={notifications}
                  setNotifications={setNotifications}
                />

                {/* Settings */}
                <SettingsList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
