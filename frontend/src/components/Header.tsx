import { motion } from "framer-motion";
import { Gamepad2, Home, Settings, Trophy, User } from "lucide-react";
import Button from "./ui/button";
import ThemeToggle from "./ui/themetoggle";
import { useNavigate } from "react-router-dom";
import { useRoutePage } from "../context/RouteContext";
import Outbuton from "./ui/outbuton";
import { useApp } from "../context/AppContext";

export default function Header() {
  const navigate = useNavigate();
  const { page } = useRoutePage();
  const { LogOut } = useApp();

  return (
    <motion.header
      className="bg-base-100 shadow-sm border-b border-base-200 backdrop-blur-sm justify-center flex"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container w-full px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Gamepad2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base-content">AisCapital</h1>
              <p className="text-base-content/60">Играй и побеждай</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex gap-2 w-full">
              <Button
                variant={page === "home" ? "default" : "ghost"}
                size="small"
                className="gap-2"
                onClick={() => navigate("/")}
              >
                <Home className="w-4 h-4" />
                Главная
              </Button>
              <Button
                variant={page === "leaderboard" ? "default" : "ghost"}
                size="small"
                className="gap-2"
                onClick={() => navigate("/leaderboard")}
              >
                <Trophy className="w-4 h-4" />
                Лидерборд
              </Button>
              <Button
                variant={page === "profile" ? "default" : "ghost"}
                size="small"
                className="gap-2"
                onClick={() => navigate("/profile")}
              >
                <User className="w-4 h-4" />
                Профиль
              </Button>
              <Button
                variant={page === "settings" ? "default" : "ghost"}
                size="small"
                className="gap-2"
                onClick={() => navigate("/settings")}
              >
                <Settings className="w-4 h-4" />
                Настройки
              </Button>
            </nav>
            <div className="h-6 w-px border-r border-base-300" />
            <ThemeToggle />

            <Outbuton onClick={() => LogOut()} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
