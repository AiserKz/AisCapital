import { useState } from "react";
import Button from "../ui/button";
import Dialog from "../ui/dialog";
import Input from "../ui/input";
import Label from "../ui/label";
import SelectInput from "../ui/selectInput";
import Switch from "../ui/switch";
import apiFetch from "../../utils/apiFetch";

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRoom: (roomName: string) => void;
}

export function CreateRoomDialog({
  open,
  onOpenChange,
  onCreateRoom,
}: CreateRoomDialogProps) {
  const [roomName, setRoomName] = useState<string>("");
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleCreate = async () => {
    await apiFetch
      .post("/api/rooms", {
        name: roomName,
        maxPlayer: maxPlayers,
        isPrivate,
        password,
      })
      .then((res) => {
        onCreateRoom(res.data.id);
      })
      .catch((e) => setError(e.response.data.message));
  };

  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange}>
      <div className="sm:max-w-md space-y-4 min-w-sm">
        <div>
          <h2 className="text-lg font-semibold text-base-content">
            Создать новую комнату
          </h2>
          <p className="text-base-content/60">
            Настройте параметры игровой комнаты
          </p>
        </div>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Название комнаты</Label>
            <Input
              id="room-name"
              placeholder="Введите название..."
              value={roomName}
              className="w-full"
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-players">Максимум игроков</Label>
            <SelectInput
              id="max-players"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value) || 4)}
            >
              <option value={2}>2 игрока</option>
              <option value={3}>3 игрока</option>
              <option value={4}>4 игрока</option>
              <option value={5}>5 игрока</option>
              <option value={6}>6 игрока</option>
            </SelectInput>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="private-room">Приватная комната</Label>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              size="small"
            />
          </div>

          {isPrivate && (
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль..."
                value={password}
                className="w-full"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          {error && (
            <p className="text-red-500 text-center font-bold">{error}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!roomName.trim() || loading}
            className="flex-1"
          >
            Создать
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
