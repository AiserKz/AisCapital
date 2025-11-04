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
    <div className="container mx-auto flex flex-col lg:flex-row gap-6">
      <CreateRoomDialog
        open={isCreateRoomModalOpen}
        onOpenChange={setIsCreateRoomModalOpen}
        onCreateRoom={() => {}}
      />
      {/* Левая колонка статы и лидерборд */}
      <div className="flex flex-col gap-6 lg:w-1/3">
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <PlayerState />
        </motion.div>
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <MiniLeaderboard onShowFull={() => navigate("/leaderboard")} />
        </motion.div>
      </div>

      {/* Правая колонка список комнат */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-5 h-5 text-base-content/60" />
            <h2 className="text-base-content/80 font-medium">
              Игровые комнаты
            </h2>
          </div>
          <Button
            className="gap-2"
            onClick={() => setIsCreateRoomModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Создать комнату
          </Button>
        </div>

        {/* Контент справа список комнат */}
        <div className=" overflow-y-auto rounded-box bg-base-200 p-4">
          <RoomList />
        </div>
      </motion.div>
    </div>
  );
}
