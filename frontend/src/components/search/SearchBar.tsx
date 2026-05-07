import { Search, Mic, ImageIcon } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
}: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(value);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="relative flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
        {/* Search Icon */}
        <Search className="w-5 h-5 text-gray-600 flex-shrink-0" />

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search everything..."
          className="flex-1 outline-none text-lg text-gray-900 placeholder-gray-500"
        />

        {/* Right Icons */}
        <div className="flex gap-3 flex-shrink-0">
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Search by voice"
          >
            <Mic className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Search by image"
          >
            <ImageIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
