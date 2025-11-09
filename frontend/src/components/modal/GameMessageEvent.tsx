import { motion } from "framer-motion";
import Button from "../ui/button";
import { X } from "lucide-react";

interface GameMessageProps {
  title: string;
  description?: string;
  onClose?: () => void;
  onConfirm: () => void;
  isShowEvent: boolean;
}

export function GameMessageEvent({
  title,
  description,
  onClose,
  onConfirm,
  isShowEvent,
}: GameMessageProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20"
    >
      <div className="bg-base-200 shadow-sm border border-base-300 p-6 rounded-2xl w-[320px] text-center relative shadow-warning/30">
        <h3 className="text-lg font-semibold text-base-content mb-3">
          {title}
        </h3>
        <span className="text-primary font-bold text-lg">{description}</span>
        {isShowEvent && (
          <div className="mt-5 flex justify-center gap-3">
            <Button
              variant="success"
              size="medium"
              className="flex-1"
              onClick={onConfirm}
            >
              Принять
            </Button>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="small"
        className="absolute top-2 right-2"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </Button>
    </motion.div>
  );
}
