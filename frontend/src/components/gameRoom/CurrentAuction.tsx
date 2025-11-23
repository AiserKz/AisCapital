import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gavel, Clock, DollarSign, TrendingUp, X } from "lucide-react";
import type { AuctionStateType, AuctionType } from "../../types/types";
import Button from "../ui/button";
import Card from "../ui/card";
import { cells } from "../../test/data";

interface CurrentAuctionProps {
  auction: AuctionType;
  auctionState?: AuctionStateType | null;
  onBid: (auctionId: string, amount: number) => void;
  onClose: () => void;
}

export function CurrentAuction({
  auction,
  auctionState,
  onBid,
  onClose,
}: CurrentAuctionProps) {
  const [bidAmount, setBidAmount] = useState(auction.currentBid + 10);
  const [timeLeft, setTimeLeft] = useState(0);

  // Находим информацию о клетке
  const cell = cells.find((c) => c.id === auction.cellId);

  // Обратный отсчет
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const remaining = Math.max(0, auction.endsAt - now);
      setTimeLeft(Math.floor(remaining / 1000));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [auction.endsAt]);

  const handleBid = () => {
    if (bidAmount > auction.currentBid) {
      onBid(auction.auctionId, bidAmount);
      setBidAmount(bidAmount + 10);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  useEffect(() => {
    if (auctionState) {
      setBidAmount((prev) => {
        const minNext = Math.max(
          auction.currentBid + 1,
          (auctionState?.amount || 0) + 1
        );
        if (prev < minNext) {
          return Math.max(prev, minNext + 9 - ((minNext - 1) % 10));
        }
        return prev;
      });
    }
  }, [auctionState]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl"
      >
        <Card className="bg-base-100 relative overflow-hidden">
          {/* Заголовок с анимацией */}
          <div className="bg-linear-to-r from-purple-600 to-blue-600 p-6 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-white/10"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [0, -15, 15, -15, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Gavel className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Аукцион</h2>
                  <p className="text-white/80 text-sm">Идут торги!</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Содержимое */}
          <div className="p-6 space-y-6">
            {/* Информация о клетке */}
            {cell && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-base-content/60 mb-1">
                      Продается
                    </p>
                    <h3 className="text-xl font-bold text-base-content">
                      {cell.name}
                    </h3>
                  </div>
                  {cell.color && (
                    <div
                      className={`w-16 h-16 ${getColorClass(
                        cell.color
                      )} rounded-lg shadow-lg`}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-base-200 rounded-lg p-3">
                    <p className="text-xs text-base-content/60 mb-1">
                      Базовая цена
                    </p>
                    <p className="text-lg font-semibold text-base-content flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-success" />
                      {cell.price}
                    </p>
                  </div>
                  <div className="bg-base-200 rounded-lg p-3">
                    <p className="text-xs text-base-content/60 mb-1">
                      Базовая рента
                    </p>
                    <p className="text-lg font-semibold text-base-content flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-info" />
                      {cell.rent}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Таймер */}
            <div className="bg-linear-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-base-content/80">
                    Осталось времени
                  </span>
                </div>
                <motion.div
                  animate={
                    timeLeft < 10
                      ? {
                          scale: [1, 1.1, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 1,
                    repeat: timeLeft < 10 ? Infinity : 0,
                  }}
                  className={`text-2xl font-bold ${
                    timeLeft < 10 ? "text-error" : "text-warning"
                  }`}
                >
                  {formatTime(timeLeft)}
                </motion.div>
              </div>

              {/* Прогресс-бар */}
              <div className="mt-3 h-2 bg-base-300 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-orange-500 to-red-500"
                  initial={{ width: "100%" }}
                  animate={{ width: `${(timeLeft / 15) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            {/* Текущая ставка */}
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60 mb-1">
                  Текущая ставка
                </p>
                <motion.p
                  key={auction.currentBid}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-success"
                >
                  ${auctionState?.amount || auction.currentBid}
                </motion.p>
              </div>
              {auctionState?.playerName && (
                <p className="text-lg font-semibold text-base-content mt-1">
                  Лидирует: {auctionState.playerName}
                </p>
              )}
            </div>

            {/* Форма ставки */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    min={Math.max(
                      auction.currentBid + 1,
                      (auctionState?.amount || 0) + 1
                    )}
                    step={10}
                    className="input input-bordered w-full"
                    placeholder="Введите ставку"
                    disabled={timeLeft === 0}
                  />
                  <p className="text-xs text-base-content/60 mt-1">
                    Минимальная следующая ставка: $
                    {Math.max(
                      auction.currentBid + 1,
                      (auctionState?.amount || 0) + 1
                    )}
                  </p>
                </div>
                <Button
                  onClick={handleBid}
                  disabled={
                    bidAmount <=
                      Math.max(auction.currentBid, auctionState?.amount || 0) ||
                    timeLeft === 0
                  }
                  variant="success"
                  className="gap-2"
                >
                  <Gavel className="w-4 h-4" />
                  Сделать ставку
                </Button>
              </div>

              {/* Быстрые ставки */}
              <div className="flex gap-2">
                {[10, 20, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => setBidAmount((prev) => prev + amount)}
                    variant="ghost"
                    size="small"
                    className="flex-1"
                  >
                    +${amount}
                  </Button>
                ))}
              </div>
            </div>

            {bidAmount <= auction.currentBid && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-error text-center"
              >
                ⚠️ Ставка должна быть выше текущей
              </motion.p>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
