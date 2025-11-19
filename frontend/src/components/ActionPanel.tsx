import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Home,
  SkipForward,
  DollarSign,
  Clock,
  Check,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import Button from "./ui/button";
import Card from "./ui/card";
import { ProgressBar } from "./ui/progress";
import type { PlayerInRoomType, RoomStateType } from "../types/types";
import useCellActions from "../utils/hook/useCellActions";

interface ActionPanelProps {
  roomState: RoomStateType;
  currentUser?: PlayerInRoomType;
  movePlayer: () => void;
  dice: { dice1: number; dice2: number };
  buyCell: () => void;
  skipTurn: () => void;
  isBuying?: boolean;
  isBlocked?: boolean;
  isMortage?: boolean;
  handleMortgaged: () => void;
  handleJailAction: (action: "roll" | "pay" | "wait") => void;
  handleReady: () => void;
  timer: number;
}

export function ActionPanel({
  roomState,
  currentUser,
  movePlayer,
  dice,
  buyCell,
  skipTurn,
  isBuying,
  isBlocked,
  isMortage,
  handleMortgaged,
  handleJailAction,
  handleReady,
  timer,
}: ActionPanelProps) {
  if (!currentUser) return null;
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  const currentRoom = roomState.currentRoom;
  const cellState = roomState.cellState;
  const isCurrentTurn = useMemo(
    () => currentRoom?.currentTurnPlayerId === currentUser.playerId,
    [currentRoom?.currentTurnPlayerId, currentUser.playerId]
  );

  const isCurrentTrunUser = useMemo(
    () =>
      currentRoom?.players.find(
        (p) => p.playerId == currentRoom.currentTurnPlayerId
      ),
    [currentRoom?.players, currentRoom?.currentTurnPlayerId]
  );

  const [displayDice] = useState<{
    dice1: number;
    dice2: number;
  }>({ dice1: 0, dice2: 0 });

  const { canBuy, isOwnerByPlayer } = useCellActions(
    cellState,
    currentUser,
    isCurrentTurn,
    isBuying
  );

  const getDiceIcon = useCallback((value: number) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[value - 1] || Dice1;
    return Icon;
  }, []);

  const handleRollDice = useCallback(async () => {
    if (!isCurrentTurn || isRolling || isBlocked) return;
    movePlayer();
  }, [isCurrentTurn, isRolling, isBlocked]);

  const rollDiceAnimation = useCallback((onFinish: () => void) => {
    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      count++;

      if (count > 2) {
        clearInterval(interval);
        onFinish();
      }
    }, 100);
  }, []);

  const handleBuyProperty = useCallback(() => {
    if (!isCurrentTurn) return;
    buyCell();
  }, [isCurrentTurn]);

  const handleEndTurn = useCallback(() => {
    if (!isCurrentTurn) return;
    skipTurn();
  }, [isCurrentTurn]);

  useEffect(() => {
    if (!dice?.dice1 || !dice?.dice2) return;

    setIsRolling(true);

    rollDiceAnimation(() => {
      setDiceValue(dice.dice1 + dice.dice2);
      setIsRolling(false);
    });
  }, [dice.dice1, dice.dice2]);

  const timeProgress = (timer / 30) * 100;
  const DiceIcon1 = useMemo(
    () => getDiceIcon(isRolling ? displayDice.dice1 : dice.dice1),
    [isRolling, displayDice.dice1, dice.dice1, getDiceIcon]
  );

  const DiceIcon2 = useMemo(
    () => getDiceIcon(isRolling ? displayDice.dice2 : dice.dice2),
    [isRolling, displayDice.dice2, dice.dice2, getDiceIcon]
  );

  const gameIsReady = currentRoom?.status === "WAITING";

  const PendingBlocked = currentUser.pendingAction === null;

  const renderButtons = useMemo(() => {
    if (canBuy) {
      return (
        <Button
          disabled={PendingBlocked}
          variant="secondary"
          className="w-full gap-2 justify-start"
          onClick={handleBuyProperty}
        >
          <Home className="w-4 h-4" />
          Купить недвижимость
        </Button>
      );
    } else if (isOwnerByPlayer) {
      return (
        <Button
          variant="secondary"
          disabled
          className="w-full gap-2 justify-start"
        >
          <Home className="w-4 h-4" />
          Ваша собственность
        </Button>
      );
    }
  }, [canBuy, isOwnerByPlayer, PendingBlocked, handleBuyProperty]);

  const TurnBlocked = useMemo(
    () =>
      !isCurrentTurn ||
      isBlocked ||
      currentUser.isFrozen ||
      (currentRoom!.comboTurn === 0 && currentUser.pendingAction !== null),
    [
      isCurrentTurn,
      isBlocked,
      currentUser.isFrozen,
      currentRoom?.comboTurn,
      currentUser.pendingAction,
    ]
  );

  const ownerCells = useMemo(
    () =>
      cellState?.filter((cell) => cell.ownerId === currentUser.playerId) ?? [],
    [cellState]
  );

  return (
    <Card className="shadow-sm p-6">
      <div>
        <div className="flex items-center justify-between text-base-content">
          <span>
            {isCurrentTurn
              ? "Ваш ход"
              : `Ход ${isCurrentTrunUser?.player.name}`}
          </span>
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <Clock className="w-4 h-4" />
            <span>{timer}с</span>
          </div>
        </div>
        <ProgressBar value={timeProgress} className="h-1" />
      </div>
      <div className="space-y-3">
        {/* Кубик */}
        <div className="flex flex-col items-center gap-3 p-6 bg-linear-to-br from-blue-50 to-purple-50 rounded-lg">
          <div className="flex gap-2">
            <motion.div
              key="dice1"
              animate={
                isRolling
                  ? {
                      rotate: [0, 90, 180, 270, 360],
                      scale: [1, 1, 0.9, 1],
                      y: [0, -1, 0],
                    }
                  : {
                      rotate: 0,
                      scale: 1,
                      y: 0,
                    }
              }
              transition={{
                duration: 0.6,
                repeat: isRolling ? Infinity : 0,
                ease: "easeInOut",
              }}
              className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center"
            >
              {DiceIcon1 && <DiceIcon1 className="w-12 h-12 text-black" />}
            </motion.div>
            <motion.div
              key="dice2"
              animate={
                isRolling
                  ? {
                      rotate: [0, 90, 180, 270, 360],
                      scale: [1, 1, 0.9, 1],
                      y: [0, -1, 0],
                    }
                  : {
                      rotate: 0,
                      scale: 1,
                      y: 0,
                    }
              }
              transition={{
                duration: 0.6,
                repeat: isRolling ? Infinity : 0,
                ease: "easeInOut",
                delay: 0.2,
              }}
              className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center"
            >
              {DiceIcon2 && <DiceIcon2 className="w-12 h-12 text-black" />}
            </motion.div>
          </div>
          <span className="text-black/80 font-bold text-lg">
            {isRolling
              ? "Бросаем..."
              : diceValue
              ? `Выпало: ${diceValue}`
              : "Бросить кубик"}
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              disabled={TurnBlocked}
              variant="secondary"
              className="w-full gap-2 justify-start"
              onClick={
                currentUser.jailed
                  ? () => handleJailAction("roll")
                  : handleRollDice
              }
            >
              <Dice1 className="w-4 h-4" />
              {isRolling
                ? "Бросаем..."
                : currentUser.jailed
                ? "Попробовать бросить дубль"
                : "Бросить кубик"}
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {renderButtons}
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {currentUser.jailed && currentUser.money > 100 ? (
              <Button
                disabled={!isCurrentTurn || isBlocked}
                variant="secondary"
                className="w-full gap-2 justify-start"
                onClick={() => handleJailAction("pay")}
              >
                <DollarSign className="w-4 h-4" />
                Оплатить 100$
              </Button>
            ) : isMortage ? (
              <Button
                disabled={!isCurrentTurn || isBlocked}
                variant="warning"
                className="w-full gap-2 justify-start"
                onClick={handleMortgaged}
              >
                <DollarSign className="w-4 h-4" />
                Снять залог
              </Button>
            ) : (
              <Button
                disabled={!isCurrentTurn || isBlocked}
                variant="secondary"
                className="w-full gap-2 justify-start"
                onClick={handleMortgaged}
              >
                <DollarSign className="w-4 h-4" />
                Заложить имущество
              </Button>
            )}
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {currentUser.jailed ? (
              <Button
                disabled={!isCurrentTurn || isBlocked}
                variant="secondary"
                className="w-full gap-2 justify-start"
                onClick={() => handleJailAction("wait")}
              >
                <SkipForward className="w-4 h-4" />
                Пропустить ход
              </Button>
            ) : (
              <Button
                disabled={
                  !isCurrentTurn ||
                  isBlocked ||
                  currentUser.isFrozen ||
                  currentUser.pendingAction === null
                }
                variant="secondary"
                className="w-full gap-2 justify-start"
                onClick={handleEndTurn}
              >
                <SkipForward className="w-4 h-4" />
                Завершить ход
              </Button>
            )}
          </motion.div>
          {gameIsReady && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {!currentUser.isReady ? (
                <Button
                  variant="success"
                  className="w-full gap-2 justify-start"
                  onClick={handleReady}
                >
                  <Check className="w-4 h-4" />
                  Готов
                </Button>
              ) : (
                <Button
                  variant="error"
                  className="w-full gap-2 justify-start"
                  onClick={handleReady}
                >
                  <X className="w-4 h-4" />
                  Не готов
                </Button>
              )}
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-base-300">
          <div className="bg-base-200 rounded-lg p-3">
            <p className="text-xs text-base-content/60 mb-1">Баланс</p>
            <p className="text-base-content">${currentUser.money}</p>
          </div>
          <div className="bg-base-200 rounded-lg p-3">
            <p className="text-xs text-base-content/60 mb-1">Объектов</p>
            <p className="text-base-content">
              {ownerCells?.length || 0} / {cellState?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
