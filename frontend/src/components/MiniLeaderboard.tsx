import { Trophy, Medal, Award, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Card from "./ui/card";
import Button from "./ui/button";
import { Badge } from "./ui/badge";
import AvatarCircle from "./ui/avatarCircle";
import { useApp } from "../context/AppContext";
import type { LeaderboardPlayer } from "../types/types";

interface MiniLeaderboardProps {
  onShowFull?: () => void;
}

export function MiniLeaderboard({ onShowFull }: MiniLeaderboardProps) {
  const { leader } = useApp();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-muted-foreground text-sm">#{rank}</span>;
    }
  };

  if (!leader) return null;

  return (
    <Card className="p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base-content">
            <Trophy className="w-5 h-5" />
            Топ игроков
          </h2>
          {onShowFull && (
            <Button
              variant="ghost"
              size="small"
              onClick={onShowFull}
              className="gap-1 text-base-content/60 hover:text-base-content"
            >
              Все
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {leader.map((player: LeaderboardPlayer, index: number) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02, x: 4 }}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              player.elo <= 3
                ? "bg-linear-to-r from-yellow-500/10 to-transparent border border-yellow-500/20"
                : "bg-muted/50 hover:bg-muted"
            }`}
          >
            {/* Ранг */}
            <div className="w-6 flex items-center justify-center">
              {getRankIcon(player.elo)}
            </div>

            {/* аватар */}
            <AvatarCircle
              name={player.name}
              className="w-9 h-9"
              textSize={"sm"}
            />

            {/* инфо */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm text-base-content truncate">
                  {player.name}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  Ур. {player.level}
                </Badge>
              </div>
              <p className="text-xs text-base-content/60">
                {player.wins} побед
              </p>
            </div>

            {/* Рейтинг */}
            <div className="text-right">
              <p className="text-sm text-base-content">{player.elo}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
