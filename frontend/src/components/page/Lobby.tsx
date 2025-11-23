import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Plus } from "lucide-react";
import Button from "../ui/button";
import { PlayerState } from "../PlayerState";
import { RoomList } from "../RoomList";
import { MiniLeaderboard } from "../MiniLeaderboard";
import { CreateRoomDialog } from "../modal/CreateRoomModal";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export default function Lobby() {
  const navigate = useNavigate();
  const { fetchRoomList } = useApp();
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] =
    useState<boolean>(false);

  useEffect(() => {
    fetchRoomList();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-8xl">
      <CreateRoomDialog
        open={isCreateRoomModalOpen}
        onOpenChange={setIsCreateRoomModalOpen}
        onCreateRoom={(roomId: string) => navigate(`/room/${roomId}`)}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Левая колонка: Статистика и Лидерборд */}
        <div className="w-full lg:w-80 xl:w-100 flex flex-col gap-6 shrink-0">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <PlayerState />

            <MiniLeaderboard onShowFull={() => navigate("/leaderboard")} />
          </motion.div>
        </div>

        {/* Правая колонка: Список комнат */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Gamepad2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-base-content">
                  Игровые комнаты
                </h2>
                <p className="text-sm text-base-content/60">
                  Присоединяйтесь к игре или создайте свою
                </p>
              </div>
            </div>
            <Button
              className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              onClick={() => setIsCreateRoomModalOpen(true)}
              size="large"
            >
              <Plus className="w-5 h-5" />
              Создать комнату
            </Button>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-1 min-h-[500px]">
            <div className="h-full overflow-y-auto p-4 custom-scrollbar">
              <RoomList />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
