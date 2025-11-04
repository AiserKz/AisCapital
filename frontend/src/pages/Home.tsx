import { AnimatePresence, motion } from "framer-motion";
import Lobby from "../components/page/Lobby";

export type Screen = "lobby" | "game";

export default function HomePage() {
  return (
    <div className="">
      <AnimatePresence mode="wait">
        <motion.div
          key="lobby"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Lobby />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
