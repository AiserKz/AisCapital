import React from "react";
import { motion } from "framer-motion";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`bg-base-100 flex flex-col gap-6 rounded-xl border border-base-300 ${className}`}
      {...props}
    />
  );
}

interface CardSecondaryProps {
  className?: string;
  icon: React.ReactNode;
  text: string;
  value: string;
}

function CardSecondary({
  className,
  icon,
  text,
  value,
  ...props
}: CardSecondaryProps) {
  return (
    <motion.div
      className={`bg-base-200 rounded-lg p-4 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-base-content/60">{text}</span>
      </div>
      <p className="text-base-content">{value}</p>
    </motion.div>
  );
}

export default Card;
export { CardSecondary };
