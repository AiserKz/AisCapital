import { Gamepad2, Target, TrendingUp, Trophy, User } from "lucide-react";
import Card, { CardSecondary } from "./ui/card";
import { Badge } from "./ui/badge";
import { ProgressBar } from "./ui/progress";
import AvatarCircle from "./ui/avatarCircle";
import { useApp } from "../context/AppContext";

export function PlayerState() {
  const { user } = useApp();

  if (!user) return null;

  const xpProgress = (user.currentXp / user.nextLevelXp) * 100;

  return (
    <Card className="shadow-sm p-6">
      <div className="flex items-center gap-2">
        <User className="w-6 h-6 text-base-content/60" />
        Моя статистика
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <AvatarCircle
            name={user?.name || ""}
            className="w-16 h-16"
            ring
            textSize="3xl"
          />

          <div className="flex-1">
            <h3 className="text-base-content">{user.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="accent" className="gap-1">
                <Trophy className="w-3 h-3" />
                Уровень {user.level}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-base-content/60">Опыт</span>
            <span className="text-sm text-base-content">
              {user.currentXp} / {user.nextLevelXp} XP
            </span>
          </div>
          <ProgressBar value={xpProgress} className="h-2" />
        </div>

        {/* статистика */}
        <div className="grid grid-cols-2 gap-4">
          <CardSecondary
            icon={<Gamepad2 className="w-4 h-4 text-blue-500" />}
            text="Игры"
            value={user.totalGames?.toString()}
          />
          <CardSecondary
            icon={<Trophy className="w-4 h-4 text-yellow-500" />}
            text="Победы"
            value={user.wins?.toString()}
          />
          <CardSecondary
            icon={<Target className="w-4 h-4 text-green-500" />}
            text="Винрейт"
            value={`${user?.winRate}%`}
          />
          <CardSecondary
            icon={<TrendingUp className="w-4 h-4 text-purple-500" />}
            text="Рейтинг"
            value={user.elo?.toString()}
          />
        </div>

        {/* достижения */}
        <div>
          {/* <h4 className="text-sm text-muted-foreground mb-3">Достижения</h4>
          <div className="flex gap-2 flex-wrap">
            {user.achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                className="bg-linear-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-3 flex-1 min-w-20 text-center"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <p className="text-xs text-foreground">{achievement.name}</p>
              </motion.div>
            ))}
          </div> */}
        </div>
      </div>
    </Card>
  );
}
