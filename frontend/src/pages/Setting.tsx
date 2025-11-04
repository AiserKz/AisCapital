import { motion } from "framer-motion";
import Button from "../components/ui/button";

export default function SettingPage() {
  return (
    <motion.div
      className="max-w-2xl mx-auto bg-card rounded-xl p-8 shadow-sm border border-base-300"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-base-content mb-6">Настройки</h2>
      <div className="space-y-4 text-base-content">
        <div className="flex items-center justify-between py-3 border-b border-base-300">
          <span>Звуковые эффекты</span>
          <Button variant="ghost" size="small">
            Вкл
          </Button>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-base-300">
          <span>Музыка</span>
          <Button variant="ghost" size="small">
            Вкл
          </Button>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-base-300">
          <span>Анимации</span>
          <Button variant="ghost" size="small">
            Вкл
          </Button>
        </div>
        <div className="flex items-center justify-between py-3">
          <span>Язык</span>
          <Button variant="ghost" size="small">
            Русский
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
