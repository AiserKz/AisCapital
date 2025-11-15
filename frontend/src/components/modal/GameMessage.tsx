import { motion } from "framer-motion";
import Button from "../ui/button";
import { X } from "lucide-react";
import type React from "react";

export function GameMessage({
  message,
  onClose,
  children,
}: {
  message?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
    >
      <div className="bg-base-200 shadow-sm border border-base-300 p-6 rounded-2xl w-fit text-center relative shadow-warning/30">
        <h3 className="text-lg font-semibold text-base-content mb-3">
          Оповещение 🔔
        </h3>

        <p className="text-base text-base-content/80">{message}</p>
        {children}
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="small"
          className="absolute top-2 right-2"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      )}
    </motion.div>
  );
}
