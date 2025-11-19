import { motion } from "framer-motion";
import Button from "./ui/button";
export function ErrorScreen({
  title = "404",
  description = "Страница не найдена",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center items-center space-y-2"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-8xl font-bold text-center"
        >
          {title}
        </motion.h1>
        <p className="text-xl text-base-content/60">{description}</p>
        <Button className="mt-4 " onClick={() => window.location.replace("/")}>
          На главную
        </Button>
      </motion.div>
    </div>
  );
}
