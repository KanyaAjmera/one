import { Edit3, CheckCircle2 } from "lucide-react";

export default function ProfileCard({ user, stats }: { user: any; stats: any }) {
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="bg-white/3 backdrop-blur-2xl border border-white/8 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {getInitials(user?.name)}
          </div>
          <button className="absolute bottom-0 right-0 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full p-2 transition-all">
            <Edit3 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Username & Badge */}
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold text-white">{user?.name || "Loading..."}</h2>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          GAMER
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 my-6" />

      {/* Smart Score */}
      <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          Total Arcade Games
        </p>
        <p className="text-3xl font-bold text-white">{stats?.totalGamesPlayed || 0}</p>
      </div>
    </div>
  );
}
