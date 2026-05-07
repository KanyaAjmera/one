import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isLightMode?: boolean;
}

export default function ChatInput({ onSendMessage, isLoading, isLightMode }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newRows = Math.min(Math.max(textareaRef.current.scrollHeight / 24, 1), 6);
      setRows(Math.ceil(newRows));
      textareaRef.current.style.height = newRows * 24 + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      setRows(1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-4xl px-4 pb-6"
    >
      <div className="relative">
        <div 
          className={cn(
            "flex items-end gap-3 rounded-2xl backdrop-blur-sm px-4 py-3 border transition-all duration-500",
            isLightMode
              ? "bg-white/90 text-black border-gray-200 shadow-2xl hover:border-blue-400"
              : "bg-gray-900/50 text-white border-gray-700/50 hover:border-gray-600 shadow-lg"
          )}
        >
          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message ChatBot..."
            rows={rows}
            className={cn(
              "flex-1 bg-transparent placeholder-gray-500 resize-none focus:outline-none text-base leading-6 max-h-48 overflow-y-auto transition-colors",
              isLightMode ? "text-gray-900" : "text-white"
            )}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "p-2 rounded-lg transition-all opacity-60 hover:opacity-100",
                isLightMode ? "text-gray-600 hover:bg-gray-100 hover:text-black" : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "p-2 rounded-lg transition-all opacity-60 hover:opacity-100",
                isLightMode ? "text-gray-600 hover:bg-gray-100 hover:text-black" : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
              title="Voice input"
            >
              <Mic className="w-5 h-5" />
            </motion.button>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className={cn(
                "p-2 rounded-lg transition-all shadow-md",
                message.trim() && !isLoading
                  ? isLightMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : isLightMode ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" : "bg-gray-800 text-gray-600 cursor-not-allowed shadow-none"
              )}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Hint Text */}
        <p className={cn(
          "text-xs mt-2 text-center transition-colors",
          isLightMode ? "text-gray-500 font-medium" : "text-gray-500"
        )}>
          Use Shift + Enter for new line
        </p>
      </div>
    </motion.div>
  );
}
