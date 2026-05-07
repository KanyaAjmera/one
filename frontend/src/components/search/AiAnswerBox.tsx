import { Sparkles } from "lucide-react";

interface AiAnswerBoxProps {
  query: string;
  answer: string;
}

export default function AiAnswerBox({ query, answer }: AiAnswerBoxProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 mb-8">
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI Answer</h2>
        </div>

        {/* Query */}
        <p className="text-sm text-gray-600 mb-3">
          <span className="font-medium">Question:</span> {query}
        </p>

        {/* Answer */}
        <p className="text-gray-800 leading-relaxed text-base">{answer}</p>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-emerald-200">
          This is an AI-generated response based on search results.
        </p>
      </div>
    </div>
  );
}
