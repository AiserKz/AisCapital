import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp, Gamepad2 } from "lucide-react";
import Card from "../components/ui/card";
import Button from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import AvatarCircle from "../components/ui/avatarCircle";
import apiFetch from "../utils/apiFetch";
import type { LeaderboardPlayer } from "../types/types";

type SortField = "rating" | "wins" | "winRate" | "level";

export function Leaderboard() {
  const [sortBy, setSortBy] = useState<SortField>("rating");
  const [topUsers, setTopUsers] = useState<LeaderboardPlayer[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await apiFetch.get("/api/player/leaderboard").then((res) => {
        setTopUsers(res.data);
      });
    };
    if (topUsers.length === 0) {
      fetchData();
    }
  }, []);

  const sortedPlayers = useMemo(() => {
    return topUsers.sort((a, b) => {
      if (sortBy === "rating") {
        return a.elo - b.elo;
      } else if (sortBy === "wins") {
        return b.wins - a.wins;
      } else if (sortBy === "winRate") {
        return b.winRate - a.winRate;
      } else if (sortBy === "level") {
        return b.level - a.level;
      }
      return 0;
    });
  }, [sortBy, topUsers]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-slate-500 text-sm">#{rank}</span>;
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-base-content">Лидерборд</h2>
      </div>
      <Card className="shadow-sm">
        <div className="p-6">
          {/* фильтр */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 px-4">
            <Button
              variant={sortBy === "rating" ? "default" : "secondary"}
              size="small"
              onClick={() => setSortBy("rating")}
              className="gap-2 whitespace-nowrap"
            >
              <TrendingUp className="w-4 h-4" />
              Рейтинг
            </Button>
            <Button
              variant={sortBy === "wins" ? "default" : "secondary"}
              size="small"
              onClick={() => setSortBy("wins")}
              className="gap-2 whitespace-nowrap"
            >
              <Trophy className="w-4 h-4" />
              Победы
            </Button>
            <Button
              variant={sortBy === "winRate" ? "default" : "secondary"}
              size="small"
              onClick={() => setSortBy("winRate")}
              className="gap-2 whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              Винрейт
            </Button>
            <Button
              variant={sortBy === "level" ? "default" : "secondary"}
              size="small"
              onClick={() => setSortBy("level")}
              className="gap-2 whitespace-nowrap"
            >
              <Gamepad2 className="w-4 h-4" />
              Уровень
            </Button>
          </div>

          {/* список игроков */}
          <div className="space-y-2 max-h-[70dvh] overflow-y-auto hidden-scrollbar px-4">
            {sortedPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                whileHover={{ scale: 1.01, x: 4 }}
              >
                <div
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    player.elo <= 3
                      ? "bg-linear-to-r from-yellow-500/10 to-transparent border border-yellow-500/20"
                      : "bg-base-200 hover:bg-base-300"
                  }`}
                >
                  {/* ранг */}
                  <div className="w-8 flex items-center justify-center">
                    {getRankIcon(player.elo)}
                  </div>

                  {/* аватар */}
                  <AvatarCircle
                    name={player.name}
                    textSize="md"
                    className="w-11 h-11"
                  />

                  {/* инфо */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-foreground truncate">
                        {player.name}
                      </h4>
                      <Badge variant="accent" className="text-xs">
                        Ур. {player.level}
                      </Badge>
                    </div>
                    <div className="text-sm text-base-content/60">
                      {player.wins} побед из {player.totalGames} игр
                    </div>
                  </div>

                  {/* статистика */}
                  <div className="flex gap-6">
                    <div className="text-right">
                      <div className="text-xs text-base-content/60 mb-1">
                        Рейтинг
                      </div>
                      <div className="text-base-content">{player.elo}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-base-content/60 mb-1">
                        Винрейт
                      </div>
                      <div className="text-base-content">{player.winRate}%</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
