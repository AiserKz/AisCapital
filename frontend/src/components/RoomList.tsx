import { motion } from "framer-motion";
import Card from "./ui/card";
import { Badge } from "./ui/badge";
import Button from "./ui/button";
import { Users, Lock, Clock, Play, Eye, User } from "lucide-react";
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
  const { roomList, user } = useApp();
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
            className="bg-success/10 text-success border-success/20 px-3 py-1"
          >
            Ожидание
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge
            variant="ghost"
            className="bg-info/10 text-info border-info/20 px-3 py-1"
          >
            Игра идёт
          </Badge>
        );
      case "FINISHED":
        return (
          <Badge
            variant="ghost"
            className="bg-base-300 text-base-content/60 border-base-content/10 px-3 py-1"
          >
            Заполнена
          </Badge>
        );
    }
  };

  const handleEnterRoom = (room: RoomType) => {
    if (room.isPrivate && room.host.id !== user?.id) {
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
    <div className="space-y-4">
      {(roomList || []).map((room, index) => (
        <motion.div
          key={room.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          whileHover={{ scale: 1.005 }}
          className="group"
        >
          <Card
            className={`transition-all duration-200 border-l-4 ${room.host.id === user?.id
              ? "border-l-primary border-y-base-200 border-r-base-200"
              : "border-l-transparent border-base-200"
              } hover:shadow-md hover:border-l-primary/50 bg-base-100`}
          >
            <div className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Иконка комнаты */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  {room.isPrivate && (
                    <div className="absolute -top-1 -right-1 bg-base-100 rounded-full p-1 shadow-sm border border-base-200">
                      <Lock className="w-3 h-3 text-warning" />
                    </div>
                  )}
                </div>

                {/* Информация о комнате */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-base-content truncate pr-4 group-hover:text-primary transition-colors">
                      {room.name}
                    </h3>
                    <div className="sm:hidden">
                      {getStatusBadge(room.status)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-base-content/60">
                    <div className="flex items-center gap-1.5 bg-base-200/50 px-2 py-1 rounded-md">
                      <User className="w-4 h-4" />
                      <span className="font-medium">
                        {room.players.length} / {room.maxPlayer}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base-content/40">Хост:</span>
                      <span className="font-medium text-base-content/80">{room.host.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTime(room.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Действия и статус (Desktop) */}
                <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end">
                  <div className="hidden sm:block">
                    {getStatusBadge(room.status)}
                  </div>

                  <Button
                    className="w-full sm:w-auto gap-2 min-w-[120px]"
                    onClick={() => handleEnterRoom(room)}
                    variant={
                      room.status === "WAITING" ? "default" : "secondary"
                    }
                    size="medium"
                  >
                    {room.status === "WAITING" ? (
                      <>
                        <Play className="w-4 h-4" /> Войти
                      </>
                    ) : room.status === "IN_PROGRESS" ? (
                      <>
                        <Eye className="w-4 h-4" /> Наблюдать
                      </>
                    ) : (
                      "Заполнена"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}

      {showPasswordModal && (
        <Dialog isOpen={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <div className="w-full max-w-sm mx-auto rounded-xl space-y-6 shadow-xl bg-base-100 p-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-lg font-semibold">Приватная комната</h3>
              <p className="text-sm text-base-content/60">
                Введите пароль для доступа к этой комнате
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Пароль</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="w-full text-center tracking-widest"
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {error && (
                <p className="text-error text-sm font-medium text-center animate-pulse">{error}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={() => handleEnterRoomWithPassword(selectedRoom!)}
                className="flex-1"
                variant="default"
              >
                Войти
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {roomList.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-base-300 bg-base-100/50"
        >
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-base-content/40" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-1">Нет активных комнат</h3>
          <p className="text-base-content/60 max-w-xs mx-auto">
            Создайте новую комнату, чтобы начать игру и пригласить друзей
          </p>
        </motion.div>
      )}
    </div>
  );
}
