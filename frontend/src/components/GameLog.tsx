import Card from "./ui/card";
import {
  ScrollText,
  Dice1,
  Home,
  DollarSign,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

interface LogEntry {
  id: string;
  type: "roll" | "buy" | "pay" | "trade" | "event";
  player: string;
  message: string;
  timestamp: string;
}

export function GameLog() {
  const logs: LogEntry[] = [
    {
      id: "1",
      type: "roll",
      player: "Александр",
      message: "бросил кубик: выпало 6",
      timestamp: "14:35",
    },
    {
      id: "2",
      type: "buy",
      player: "Александр",
      message: "купил Арбат за $60",
      timestamp: "14:35",
    },
    {
      id: "3",
      type: "roll",
      player: "Мария",
      message: "бросила кубик: выпало 4",
      timestamp: "14:36",
    },
    {
      id: "4",
      type: "pay",
      player: "Мария",
      message: "заплатила аренду $15",
      timestamp: "14:36",
    },
    {
      id: "5",
      type: "roll",
      player: "Дмитрий",
      message: "бросил кубик: выпало 8",
      timestamp: "14:37",
    },
    {
      id: "6",
      type: "event",
      player: "Дмитрий",
      message: "попал на шанс: получил $100",
      timestamp: "14:37",
    },
    {
      id: "7",
      type: "roll",
      player: "Вы",
      message: "бросили кубик: выпало 5",
      timestamp: "14:38",
    },
    {
      id: "8",
      type: "buy",
      player: "Вы",
      message: "купили Невский за $100",
      timestamp: "14:38",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "roll":
        return <Dice1 className="w-4 h-4 text-blue-500" />;
      case "buy":
        return <Home className="w-4 h-4 text-green-500" />;
      case "pay":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "trade":
        return <DollarSign className="w-4 h-4 text-yellow-500" />;
      case "event":
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "roll":
        return "bg-blue-50 border-blue-200";
      case "buy":
        return "bg-green-50 border-green-200";
      case "pay":
        return "bg-red-50 border-red-200";
      case "trade":
        return "bg-yellow-50 border-yellow-200";
      case "event":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  return (
    <Card className="shadow-sm p-6 overflow-hidden">
      <div>
        <div className="flex items-center gap-2 text-base-content/60">
          <ScrollText className="w-5 h-5" />
          История игры
        </div>
      </div>
      <div>
        <div className="h-80 overflow-scroll hidden-scrollbar">
          <div className="space-y-2 pb-4">
            {logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className={`border rounded-lg p-3 ${getTypeColor(log.type)}`}
              >
                <div className="flex items-start gap-2">
                  <div className="shrink-0 mt-0.5">{getIcon(log.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm text-slate-900 wrap-break-word">
                        <span className="font-medium">{log.player}</span>{" "}
                        {log.message}
                      </span>
                      <span className="text-xs text-slate-500 shrink-0">
                        {log.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
