import { motion } from "framer-motion";
import Card from "./ui/card";
import { Badge } from "./ui/badge";
import Button from "./ui/button";
import { Users, Lock, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatTime } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";
import type { RoomType } from "../types/types";
import { useState } from "react";
import Dialog from "./ui/dialog";
import Input from "./ui/input";
import Label from "./ui/label";
import apiFetch from "../utils/apiFetch";

export function RoomList() {
  const { roomList } = useApp();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [error, setError] = useState<string>("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WAITING":
        return (
          <Badge
            variant="ghost"
            className="bg-green-50 text-green-700 border-green-200 w-25"
          >
            Ожидание
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge
            variant="ghost"
            className="bg-blue-50 text-blue-700 border-blue-200 w-25"
          >
            Игра идёт
          </Badge>
        );
      case "FINISHED":
        return (
          <Badge
            variant="ghost"
            className="bg-slate-50 text-slate-700 border-slate-200 w-25"
          >
            Заполнена
          </Badge>
        );
    }
  };

  const handleEnterRoom = (room: RoomType) => {
    if (room.isPrivate) {
      setShowPasswordModal(true);
      setSelectedRoom(room);
      return;
    }
    navigate(`/room/${room.id}`);
  };

  const handleEnterRoomWithPassword = async (room: RoomType) => {
    if (!password) {
      setError("Поле пароля не может быть пустым");
      return;
    }
    setError("");
    await apiFetch
      .get(`/api/rooms/${room.id}`, {
        params: { password },
      })
      .then(() => {
        navigate(`/room/${room.id}`);
        sessionStorage.setItem(`room-access-${room.id}`, password);
      })
      .catch((err) => {
        setError(err.response.data.message);
      });
  };

  return (
    <div className="space-y-3">
      {roomList.map((room, index) => (
        <motion.div
          key={room.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.01 }}
        >
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Иконка комнаты */}
                  <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>

                  {/* Информация о комнате */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-foreground truncate">{room.name}</h3>
                      {room.isPrivate && (
                        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {room.players.length}/{room.maxPlayer}
                        </span>
                      </div>
                      <span>•</span>
                      <span>Хост: {room.host.name}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(room.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Статус */}
                    <div className="flex justify-center items-center">
                      {getStatusBadge(room.status)}
                    </div>

                    {/* Кнопка Войти */}
                    <div className="flex justify-center items-center">
                      <Button
                        className="w-full"
                        onClick={() => handleEnterRoom(room)}
                        variant={
                          room.status === "WAITING" ? "default" : "ghost"
                        }
                        size="small"
                      >
                        {room.status === "WAITING"
                          ? "Войти"
                          : room.status === "IN_PROGRESS"
                          ? "Наблюдать"
                          : "Заполнена"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}

      {showPasswordModal && (
        <Dialog isOpen={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <div className="w-full max-w-sm mx-auto rounded-lg space-y-4 shadow-lg">
            <Label className="text-sm font-medium">Введите пароль</Label>

            <Input
              type="password"
              placeholder="Введите пароль"
              className="w-full"
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowPasswordModal(false)}
                className=""
              >
                Отмена
              </Button>
              <Button
                onClick={() => handleEnterRoomWithPassword(selectedRoom!)}
                className=""
                variant="info"
              >
                Войти
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {roomList.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Нет доступных комнат</p>
          <p className="text-sm">Создайте новую комнату, чтобы начать игру</p>
        </div>
      )}
    </div>
  );
}
