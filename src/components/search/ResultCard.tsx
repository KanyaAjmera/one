import { ExternalLink } from "lucide-react";

interface ResultCardProps {
  title: string;
  url: string;
  description: string;
}

export default function ResultCard({
  title,
  url,
  description,
}: ResultCardProps) {
  return (
    <div className="hover:bg-gray-50 p-3 rounded-lg transition-colors group cursor-pointer">
      <a href="#" className="flex items-start gap-2 hover:no-underline">
        <div className="flex-1">
          <h3 className="text-lg text-blue-600 group-hover:underline font-normal">
            {title}
          </h3>
          <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
            {url}
            <ExternalLink className="w-3 h-3" />
          </p>
          <p className="text-gray-700 mt-2 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </a>
    </div>
  );
}
