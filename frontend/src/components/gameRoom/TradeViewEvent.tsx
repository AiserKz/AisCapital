import Button from "../ui/button";
import Card from "../ui/card";
import { cells } from "../../test/data";
import type {
  PlayerInRoomType,
  RoomStateType,
  TradeOffer,
} from "../../types/types";

interface TradeObj extends TradeOffer {
  id?: string;
  fromPlayerId?: string;
  status?: string;
  createdAt?: number;
}

interface TradeViewEventProps {
  trade: TradeObj;
  roomState: RoomStateType;
  currentUser: PlayerInRoomType | null;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onCancel: (id: string) => void;
}

export function TradeViewEvent({
  trade,
  roomState,
  currentUser,
  onAccept,
  onReject,
  onCancel,
}: TradeViewEventProps) {
  if (!trade) return null;

  const getColorClass = (color?: string) => {
    const colors: Record<string, string> = {
      brown: "bg-amber-800",
      lightblue: "bg-sky-400",
      pink: "bg-pink-400",
      orange: "bg-orange-500",
      red: "bg-red-500",
      yellow: "bg-yellow-400",
      green: "bg-green-500",
      darkblue: "bg-blue-700",
    };
    return color ? colors[color] || "bg-slate-300" : "bg-slate-300";
  };

  const fromPlayer = roomState.currentRoom?.players.find(
    (p) => p.playerId === trade.fromPlayerId
  );
  const toPlayer = roomState.currentRoom?.players.find(
    (p) => p.playerId === trade.toPlayerId
  );

  const renderCellsJSX = (ids: number[]) => {
    if (!ids || ids.length === 0) return <span>—</span>;
    return (
      <div className="flex flex-wrap gap-2">
        {ids.map((id) => {
          const found = cells.find((c) => c.id === id);
          return (
            <div
              key={id}
              className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded text-sm"
            >
              <div
                className={`w-4 h-4 rounded-sm ${getColorClass(
                  found?.color
                )} border border-black/5`}
              />
              <span>{found?.name || `#${id}`}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const isInitiator = currentUser?.playerId === trade.fromPlayerId;
  const isRecipient = currentUser?.playerId === trade.toPlayerId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card>
          <div className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">Предложение обмена</h3>
                <p className="text-sm text-base-content/60">
                  От: {fromPlayer?.player.name || trade.fromPlayerId} → К:{" "}
                  {toPlayer?.player.name || trade.toPlayerId}
                </p>
                <p className="text-xs text-base-content/50">Id: {trade.id}</p>
              </div>
              <div className="text-sm text-base-content/60">
                {new Date(trade?.createdAt || 0).toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-base-200 p-3 rounded">
                <p className="text-sm text-base-content/60">
                  Отдаёт ({fromPlayer?.player.name || "Игрок"})
                </p>
                <div className="mt-2 text-sm">
                  {renderCellsJSX(trade.fromCells)}
                </div>
                <p className="mt-1 text-sm">Деньги: ${trade.fromMoney}</p>
              </div>
              <div className="bg-base-200 p-3 rounded">
                <p className="text-sm text-base-content/60">
                  Просит ({toPlayer?.player.name || "Игрок"})
                </p>
                <div className="mt-2 text-sm">
                  {renderCellsJSX(trade.toCells)}
                </div>
                <p className="mt-1 text-sm">Деньги: ${trade.toMoney}</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              {isInitiator && (
                <Button
                  variant="ghost"
                  onClick={() => onCancel(trade.id || "")}
                >
                  Отменить
                </Button>
              )}

              {isRecipient && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => onReject(trade.id || "")}
                  >
                    Отклонить
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => onAccept(trade.id || "")}
                  >
                    Принять
                  </Button>
                </>
              )}

              {!isInitiator && !isRecipient && (
                <Button variant="ghost" disabled>
                  Ожидание ответа
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
