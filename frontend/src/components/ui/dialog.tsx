import type React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function Dialog({
  isOpen,
  onOpenChange,
  children,
  isBlur = false,
  className,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  isBlur?: boolean;
  className?: string;
}) {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 w-full h-full bg-black/50  flex items-center justify-center z-20 ${className} ${
        isBlur ? "backdrop-blur-xs" : ""
      }`}
    >
      <div className="p-6 bg-base-100 rounded-xl border border-base-300 shadow-sm relative">
        <div className="absolute top-5 right-5">
          <button
            className="hover:text-primary text-base-content/80 transition-all duration-300 ease-in-out hover:scale-110"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </motion.div>
  );
}
