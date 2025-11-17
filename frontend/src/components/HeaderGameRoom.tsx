import { motion } from "framer-motion";
import Button from "./ui/button";
import Dialog from "./ui/dialog";
import { ArrowLeft, Info, Settings } from "lucide-react";
import type { RoomDetailType } from "../types/types";
import { useState } from "react";

interface HeaderGameRoomProps {
  currentRoom: RoomDetailType;
  handleLeave: () => void;
}

export const HeaderGameRoom = ({
  currentRoom,
  handleLeave,
}: HeaderGameRoomProps) => {
  const [showLeaveDialog, setShowLeaveDialog] = useState<boolean>(false);
  const [showRulesDialog, setShowRulesDialog] = useState<boolean>(false);
  return (
    <>
      <motion.header
        className="bg-base-200 shadow-sm border-b border-base-300 backdrop-blur-sm flex justify-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="small"
                onClick={() => setShowLeaveDialog(true)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Выйти
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h2 className="text-base-content">Комната #{currentRoom.id}</h2>
                <p className="text-xs text-base-content/60">
                  Хост: {currentRoom.host.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="small"
                onClick={() => setShowRulesDialog(true)}
                className="gap-2"
              >
                <Info className="w-4 h-4" />
                Правила
              </Button>
              <Button variant="ghost" size="small" className="gap-2">
                <Settings className="w-4 h-4" />
                Настройки
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Модалки */}
      <Dialog isOpen={showLeaveDialog} onOpenChange={setShowLeaveDialog} isBlur>
        <div className="space-y-6 max-w-lg">
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Покинуть комнату?</h2>
            <div className="space-y-2 text-base-content/60">
              Вы уверены, что хотите выйти из игры? Ваш прогресс не будет
              сохранен.
            </div>
          </div>
          <div className="flex justify-end w-full gap-2">
            <Button variant="ghost" onClick={() => setShowLeaveDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleLeave} variant="error">
              Выйти
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog isOpen={showRulesDialog} onOpenChange={setShowRulesDialog} isBlur>
        <div className="space-y-3 min-w-lg">
          <div className="space-y-2">
            <h2>Правила игры</h2>
            <div className="space-y-2 text-base-content/60">
              <p>1. Бросайте кубик, чтобы передвигаться по полю</p>
              <p>2. Покупайте недвижимость, на которую попадаете</p>
              <p>3. Стройте дома и отели на своих улицах</p>
              <p>4. Собирайте ренту с других игроков</p>
              <p>5. Побеждает последний не обанкротившийся игрок</p>
            </div>
          </div>
          <div className="w-full justify-end flex">
            <Button onClick={() => setShowRulesDialog(false)} variant="default">
              Понятно
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};
