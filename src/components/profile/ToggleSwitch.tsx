import { motion } from "framer-motion";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
}

export default function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
  return (
    <motion.button
      onClick={() => onChange(!enabled)}
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
        enabled ? "bg-emerald-500" : "bg-gray-700"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ x: enabled ? 28 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
      />
    </motion.button>
  );
}
