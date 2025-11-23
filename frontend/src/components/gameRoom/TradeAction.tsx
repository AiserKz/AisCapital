import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "../ui/card";
import Button from "../ui/button";
import { cells } from "../../test/data";
import type {
  RoomStateType,
  PlayerInRoomType,
  TradeOffer,
} from "../../types/types";

interface TradeActionProps {
  isOpen: boolean;
  onClose: () => void;
  roomState: RoomStateType;
  currentUser: PlayerInRoomType | null;
  handleTradeOffer: (offer: TradeOffer) => void;
}

export function TradeAction({
  isOpen,
  onClose,
  roomState,
  currentUser,
  handleTradeOffer,
}: TradeActionProps) {
  const [toPlayerId, setToPlayerId] = useState<string | "">("");
  const [fromCells, setFromCells] = useState<number[]>([]);
  const [toCells, setToCells] = useState<number[]>([]);
  const [fromMoney, setFromMoney] = useState<number>(0);
  const [toMoney, setToMoney] = useState<number>(0);

  const players = roomState.currentRoom?.players || [];

  const myProperties = useMemo(() => {
    if (!currentUser) return [] as number[];
    return roomState.cellState
      .filter((c) => c.ownerId === currentUser.playerId)
      .map((c) => c.id);
  }, [roomState.cellState, currentUser]);

  const targetProperties = useMemo(() => {
    if (!toPlayerId) return [] as number[];
    return roomState.cellState
      .filter((c) => c.ownerId === toPlayerId)
      .map((c) => c.id);
  }, [roomState.cellState, toPlayerId]);

  const toggleSelection = (
    id: number,
    list: number[],
    setList: (v: number[]) => void
  ) => {
    if (list.includes(id)) setList(list.filter((x) => x !== id));
    else setList([...list, id]);
  };

  const getCellInfo = (id: number) => cells.find((c) => c.id === id);

  const handleSend = () => {
    if (!toPlayerId) {
      alert("Выберите получателя");
      return;
    }

    if (fromCells.length === 0 && fromMoney === 0) {
      alert("Вы должны предложить хотя бы деньги или одну клетку");
      return;
    }

    const offer: TradeOffer = {
      toPlayerId,
      fromCells,
      fromMoney,
      toCells,
      toMoney,
    };

    handleTradeOffer(offer);
    onClose();
  };

  if (!isOpen) return null;

  //   const getColorClass = (color?: string) => {
  //     const colors: Record<string, string> = {
  //       brown: "bg-amber-800",
  //       lightblue: "bg-sky-400",
  //       pink: "bg-pink-400",
  //       orange: "bg-orange-500",
  //       red: "bg-red-500",
  //       yellow: "bg-yellow-400",
  //       green: "bg-green-500",
  //       darkblue: "bg-blue-700",
  //     };
  //     return color ? colors[color] || "bg-slate-300" : "bg-slate-300";
  //   };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl"
      >
        <Card className="bg-base-100">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Обмен</h3>
              <button onClick={onClose} className="text-sm text-muted">
                Отмена
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <p className="text-sm text-base-content/60 mb-2">Кому</p>
                <select
                  value={toPlayerId}
                  onChange={(e) => setToPlayerId(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">Выберите игрока</option>
                  {players
                    .filter((p) => p.playerId !== currentUser?.playerId)
                    .map((p) => (
                      <option key={p.playerId} value={p.playerId}>
                        {p.player.name}
                      </option>
                    ))}
                </select>

                <div className="mt-4">
                  <p className="text-sm text-base-content/60 mb-1">
                    Вы предлагаете
                  </p>
                  <div className="space-y-2 max-h-40 overflow-auto">
                    {myProperties.length === 0 && (
                      <p className="text-sm text-base-content/70">
                        Нет ваших свойств
                      </p>
                    )}
                    {myProperties.map((id) => {
                      const info = getCellInfo(id);
                      return (
                        <label key={id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={fromCells.includes(id)}
                            onChange={() =>
                              toggleSelection(id, fromCells, setFromCells)
                            }
                          />
                          <span>{info?.name || `#${id}`}</span>
                        </label>
                      );
                    })}

                    <div className="mt-2">
                      <p className="text-sm">Деньги</p>
                      <input
                        type="number"
                        min={0}
                        value={fromMoney}
                        onChange={(e) => setFromMoney(Number(e.target.value))}
                        className="input input-bordered w-full mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                <p className="text-sm text-base-content/60 mb-2">Просите</p>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {toPlayerId === "" && (
                    <p className="text-sm text-base-content/70">
                      Выберите игрока, чтобы посмотреть его свойства
                    </p>
                  )}
                  {targetProperties.map((id) => {
                    const info = getCellInfo(id);
                    return (
                      <label key={id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={toCells.includes(id)}
                          onChange={() =>
                            toggleSelection(id, toCells, setToCells)
                          }
                        />
                        <span>{info?.name || `#${id}`}</span>
                      </label>
                    );
                  })}

                  <div className="mt-2">
                    <p className="text-sm">Деньги</p>
                    <input
                      type="number"
                      min={0}
                      value={toMoney}
                      onChange={(e) => setToMoney(Number(e.target.value))}
                      className="input input-bordered w-full mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                <p className="text-sm text-base-content/60 mb-2">Сводка</p>
                <div className="bg-base-200 p-3 rounded">
                  <p className="text-sm">
                    От вас: {fromCells.length} клеток + ${fromMoney}
                  </p>
                  <p className="text-sm">
                    От них: {toCells.length} клеток + ${toMoney}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={onClose} variant="ghost" className="flex-1">
                    Закрыть
                  </Button>
                  <Button
                    onClick={handleSend}
                    variant="success"
                    className="flex-1"
                  >
                    Отправить предложение
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
