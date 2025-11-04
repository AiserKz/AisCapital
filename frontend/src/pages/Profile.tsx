import { motion } from "framer-motion";
import Card from "../components/ui/card";
import Button from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import AvatarCircle from "../components/ui/avatarCircle";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  Calendar,
  Gamepad2,
  Target,
  Clock,
  CheckIcon,
} from "lucide-react";
import { ProgressBar } from "../components/ui/progress";
import { useApp } from "../context/AppContext";
import { formatDate } from "../utils/formatDate";

export function ProfilePage() {
  const { user } = useApp();
  if (!user) return null;

  const xpProgress = (user.currentXp / user.nextLevelXp) * 100;

  return (
    <motion.div
      className="max-w-6xl mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-linear-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <AvatarCircle
                  className="w-32 h-32"
                  ring
                  textSize="2xl"
                  ringColor="info"
                  name={user.name}
                />

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                    <h1 className="text-base-content">{user.name}</h1>
                    <Badge
                      variant="secondary"
                      className="gap-1 w-fit mx-auto md:mx-0"
                    >
                      <Crown className="w-4 h-4" />
                      {/* {playerData.rank} */}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-base-content/60 mb-4">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      <span>Уровень {user.level}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>Рейтинг {user.elo}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>С {formatDate(user.createdAt)}</span>
                    </div>
                  </div>

                  {/* XP прогресс */}
                  <div className="max-w-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-base-content/60">
                        Прогресс уровня
                      </span>
                      <span className="text-sm text-base-content">
                        {user.currentXp} / {user.nextLevelXp} XP
                      </span>
                    </div>
                    <ProgressBar value={xpProgress} className="h-3" />
                  </div>
                </div>

                <Button variant="accent" className="md:self-start">
                  Редактировать профиль
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Всего игр",
              value: user.totalGames,
              icon: Gamepad2,
              color: "text-blue-500",
            },
            {
              label: "Побед",
              value: user.wins,
              icon: Trophy,
              color: "text-yellow-500",
            },
            {
              label: "Винрейт",
              value: `${user.winRate}%`,
              icon: Target,
              color: "text-green-500",
            },
            {
              label: "Побед",
              value: user.wins,
              icon: Medal,
              color: "text-purple-500",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-base-200 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">
                        {stat.label}
                      </p>
                      <p className="text-xl text-base-content">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* достижения */}
          {/* <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="p-6">
              <div>
                <h2 className="flex items-center gap-2 text-base-content">
                  <Award className="w-5 h-5" />
                  Достижения (
                  {playerData.achievements.filter((a) => a.unlocked).length}/
                  {playerData.achievements.length})
                </h2>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-3">
                  {playerData.achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      className={`border rounded-lg p-4 text-center transition-all ${
                        achievement.unlocked
                          ? "bg-linear-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 hover:scale-105"
                          : "bg-base-200/50 border-border opacity-50"
                      }`}
                      whileHover={
                        achievement.unlocked ? { scale: 1.05, y: -2 } : {}
                      }
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <p className="text-sm text-base-content mb-1">
                        {achievement.name}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {achievement.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div> */}

          {/* история игр */}
          {/* <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="p-6">
              <div>
                <h2 className="flex items-center gap-2 text-base-content">
                  <Gamepad2 className="w-5 h-5" />
                  Последние игры
                </h2>
              </div>
              <div>
                <div className="space-y-3">
                  {playerData.recentGames.map((game) => (
                    <div
                      key={game.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        game.result === "win"
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-red-500/10 border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            game.result === "win"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {game.result === "win" ? (
                            <Trophy className="w-4 h-4 text-white" />
                          ) : (
                            <Medal className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-base-content">
                            {game.result === "win" ? "Победа" : "Поражение"} •{" "}
                            {game.position} место
                          </p>
                          <p className="text-xs text-base-content/60">
                            vs {game.opponent}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-base-content/60">
                        {game.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div> */}
        </div>
      </div>
    </motion.div>
  );
}
