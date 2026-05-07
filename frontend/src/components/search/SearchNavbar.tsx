import { ArrowLeft, RotateCcw, User } from "lucide-react";

interface SearchNavbarProps {
  onBack: () => void;
}

export default function SearchNavbar({ onBack }: SearchNavbarProps) {
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-3">
        {/* Left Icons */}
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh"
          >
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Right Profile */}
        <div className="ml-auto">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
