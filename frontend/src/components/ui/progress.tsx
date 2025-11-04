import { motion } from "framer-motion";

export function ProgressBar({
  className,
  value,
}: {
  className?: string;
  value: number;
}) {
  return (
    <div className="w-full bg-base-300 rounded-full overflow-hidden">
      <motion.div
        className={`bg-primary rounded-full overflow-hidden ${className}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
      />
    </div>
  );
}
