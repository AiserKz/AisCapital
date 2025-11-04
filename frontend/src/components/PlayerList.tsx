import Card from "./ui/card";
import { Badge } from "./ui/badge";
import { Users, Home, DollarSign, Crown } from "lucide-react";
import { motion } from "framer-motion";
import type { CellState, PlayerInRoomType, UserType } from "../types/types";

interface PlayerListProps {
  players: PlayerInRoomType[];
  user: UserType | null;
  isCurrentTrunPlayerId?: string;
  cellState?: CellState[];
}

export function PlayerList({
  players,
  user,
  isCurrentTrunPlayerId,
  cellState,
}: PlayerListProps) {
  const richPlayers = players.reduce((prev, curr) => {
    return curr.money > prev.money ? curr : prev;
  }, players[0]);

  const getColorClass = (position: number) => {
    const colors: Record<string, string> = {
      1: "from-blue-500 to-blue-600",
      2: "from-red-500 to-red-600",
      3: "from-green-500 to-green-600",
      4: "from-yellow-500 to-yellow-600",
    };
    return colors[position] || "from-slate-500 to-slate-600";
  };

  return (
    <Card className="shadow-sm p-6">
      <div>
        <h2 className="flex items-center gap-2 text-foreground">
          <Users className="w-5 h-5" />
          Игроки ({players.length})
        </h2>
      </div>
      <div className="space-y-2">
        {players.map((_player, index) => {
          const ownerCells =
            cellState?.filter((cell) => cell.ownerId === _player.playerId) ??
            [];
          const totalOwned = ownerCells.length;
          const isDisconnected = _player.disconnected;
          return (
            <motion.div
              key={_player.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className={`p-3 rounded-lg border-2 transition-all ${
                _player.player.id === isCurrentTrunPlayerId
                  ? "border-blue-500 bg-blue-500/10 shadow-md"
                  : "border-base-300 bg-base-200"
              }`}
            >
              <div
                className={`flex items-start gap-3  ${
                  isDisconnected ? "opacity-50" : ""
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center bg-linear-to-br ${getColorClass(
                      _player.position
                    )} ${
                      _player.player.id === user?.id
                        ? "ring-2 ring-offset-2 ring-offset-base-100 ring-blue-500"
                        : ""
                    }`}
                  >
                    <span className="text-white text-xs font-medium">
                      {_player.player.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  {richPlayers.id === _player.id && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Crown className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-foreground truncate">
                      {_player.player.name}
                    </h4>
                    {_player.player.id === isCurrentTrunPlayerId && (
                      <Badge variant="default" className="text-xs">
                        Ход
                      </Badge>
                    )}
                  </div>

                  {/* статус */}
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span className="font-medium text-foreground">
                        {_player.money}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Home className="w-3.5 h-3.5" />
                      <span>
                        {totalOwned} {totalOwned === 1 ? "объект" : "объектов"}
                      </span>
                    </div>
                  </div>

                  {/* дома */}
                  {totalOwned > 0 && (
                    <div className="flex gap-1 mt-2">
                      {ownerCells.slice(0, 5).map((cell) => (
                        <div
                          key={cell.id}
                          className={`w-5 h-5 rounded bg-linear-to-br ${getColorClass(
                            _player.position
                          )} opacity-70`}
                          title={`Объект #${cell.id}`}
                        />
                      ))}
                      {totalOwned > 5 && (
                        <div className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          +{totalOwned - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
