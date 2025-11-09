import Card from "./ui/card";
import { ScrollText, Dices, Copy } from "lucide-react";
import { motion } from "framer-motion";

interface LogEntry {
  type: "CHANCE" | "EVENT";
  message: string;
  timestamp?: string;
}

export function GameLog({ logs }: { logs: LogEntry[] }) {
  const getTypeColor = (type: "CHANCE" | "EVENT") => {
    switch (type) {
      case "CHANCE":
        return "bg-primary";
      case "EVENT":
        return "bg-primary";
    }
  };

  const getIcon = (type: "CHANCE" | "EVENT") => {
    switch (type) {
      case "CHANCE":
        return <Copy className="w-5 h-5" />;
      case "EVENT":
        return <Dices className="w-5 h-5" />;
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
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className={`rounded-lg p-3 ${getTypeColor(log.type)}`}
              >
                <div className="flex items-center gap-2">
                  <div className="shrink-0 mt-0.5 text-primary-content">
                    {getIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm text-primary-content wrap-break-word">
                        {log.message}
                      </span>
                      <span className="text-xs text-base-content shrink-0">
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
