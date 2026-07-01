import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { CheckCheck } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
  isLightMode?: boolean;
}

export default function ChatMessage({
  role,
  content,
  isTyping,
  isLightMode,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-2xl px-4 py-3 rounded-2xl shadow-sm ${
          isUser
            ? isLightMode ? "bg-blue-600 text-white rounded-br-none" : "bg-emerald-500/80 text-white rounded-br-none"
            : isLightMode ? "bg-white text-gray-900 rounded-bl-none border border-gray-200" : "bg-gray-800 text-gray-100 rounded-bl-none"
        }`}
      >
        {isTyping ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        ) : (
          <div className={`prose prose-sm max-w-none ${isUser ? "prose-invert" : isLightMode ? "prose-neutral" : "prose-invert"}`}>
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p className="mb-2 last:mb-0" {...props} />
                ),
                code: ({ node, inline, children, ...props }: any) =>
                  inline ? (
                    <code
                      className="bg-black/30 px-2 py-1 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      className="block bg-black/30 p-3 rounded-lg overflow-auto text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-2" {...props} />
                ),
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                strong: ({ node, ...props }) => (
                  <strong className="font-bold" {...props} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {isUser && (
          <div className="flex items-center justify-end gap-1 mt-2">
            <CheckCheck className="w-3 h-3 opacity-70" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
