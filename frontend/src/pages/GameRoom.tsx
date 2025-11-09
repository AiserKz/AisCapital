import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Settings, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "../components/ui/button";
import { PlayerList } from "../components/PlayerList";
import { ChatPanel } from "../components/ChatPanel";
import { ActionPanel } from "../components/ActionPanel";
import { GameLog } from "../components/GameLog";
import Dialog from "../components/ui/dialog";
import { GameBoard } from "../components/GameBoard";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import apiFetch from "../utils/apiFetch";
import type {
  CurrentPaymentType,
  CellState,
  RoomDetailType,
  PendingChanceType,
} from "../types/types";
import { useApp } from "../context/AppContext";
import useGameSocket from "../utils/hook/useGameSocket";
import { cells } from "../test/data";
import { GameMessage } from "../components/modal/GameMessage";
import { GameMessageEvent } from "../components/modal/GameMessageEvent";

export function GameRoom() {
  const { roomId } = useParams();
  const { user } = useApp();

  const [currentRoom, setCurrentRoom] = useState<RoomDetailType | null>(null);

  const [showLeaveDialog, setShowLeaveDialog] = useState<boolean>(false);
  const [showRulesDialog, setShowRulesDialog] = useState<boolean>(false);

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [cellState, setCellState] = useState<CellState[]>([]);

  const [isMortage, setIsMortage] = useState<boolean>(false);
  const [currentChance, setCurrentChance] =
    useState<PendingChanceType | null>();

  const [message, setMessage] = useState<string | null>(null);
  const messageTimeout = useRef<number | null>(null);

  const [logs, setLogs] = useState<
    { message: string; type: "CHANCE" | "EVENT" }[]
  >([]);

  const navigate = useNavigate();

  const [dice, setDice] = useState<{ dice1: number; dice2: number }>({
    dice1: 1,
    dice2: 1,
  });

  const [currentPayment, setCurrentPayment] =
    useState<CurrentPaymentType | null>(null);

  const handleRollDice = async (
    dice1: number,
    dice2: number,
    playerId: string
  ) => {
    setDice({ dice1, dice2 });
  };

  const onMessage = (message: {
    playerId: string;
    text: string;
    type: "CHANCE" | "EVENT";
  }) => {
    if (message.type === "CHANCE") {
      setCurrentChance(message);
      writeLogs(message.text, "CHANCE");
    } else if (message.type === "EVENT") {
      if (messageTimeout.current) {
        clearTimeout(messageTimeout.current);
      }
      writeLogs(message.text, "EVENT");
      setMessage(message.text);
      messageTimeout.current = setTimeout(() => {
        setMessage(null);
      }, 7000);
    }
  };

  const writeLogs = async (message: string, type: "CHANCE" | "EVENT") => {
    let _logs = logs;
    console.log("Записаваю логи");
    if (_logs.length > 5) {
      _logs = _logs.slice(0, 5);
      console.log("обрезаю логи");
    }

    setLogs([..._logs, { message, type }]);
  };

  const roomClosed = (message: string) => {
    toast.error(message);
    navigate("/");
  };

  const {
    movePlayer,
    buyCell,
    payRent,
    mortagetCell,
    unMortagetCell,
    confrimChance,
    handleJailAction,
    handleBuyHouse,
    handleIsReady,
  } = useGameSocket(
    roomId,
    user?.id,
    handleRollDice,
    setCurrentRoom,
    setCurrentPayment,
    onMessage,
    roomClosed
  );

  useEffect(() => {
    return () => {
      if (messageTimeout.current) {
        clearTimeout(messageTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchRoom = async () => {
      const savedPassword =
        sessionStorage.getItem(`room-access-${roomId}`) || "";
      const res = await apiFetch.get(`/api/rooms/${roomId}`, {
        params: { password: savedPassword },
      });

      if (res.status === 403) {
        navigate("/");
        toast.error("Комната приватная. Введите пароль снова.");
        return;
      }
      if (res.status !== 200) {
        navigate("/");
        toast.error("Комната не найдена");
        return;
      }
      setCurrentRoom(res.data);
      setCellState(res.data.cellState);
    };
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (currentRoom) {
      setCellState(currentRoom.cellState);
      setCurrentPayment(currentRoom?.currentPayment || null);
      setCurrentChance(currentRoom?.pendingChance || null);
    }
  }, [currentRoom]);

  const handleLeave = async () => {
    setShowLeaveDialog(false);
    navigate("/");
    toast.success("Вы покинули комнату");
  };

  const handleBuyCell = async () => {
    buyCell();
  };

  const handleUpgradeCell = async (cellId: number, type: "house" | "hotel") => {
    handleBuyHouse(cellId, type);
  };

  const handleMortgaged = async () => {
    setIsMortage(!isMortage);
  };

  if (!currentRoom) return <div>Загрузка</div>;

  const currentUser = currentRoom.players.find(
    (p) => p.player.id === user?.id
  )!;

  const isMyPayment = currentPayment?.payerId === user?.id;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        className="bg-base-200 shadow-sm border-b border-base-300 backdrop-blur-sm flex justify-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="small"
                onClick={() => setShowLeaveDialog(true)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Выйти
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h2 className="text-base-content">Комната #{roomId}</h2>
                <p className="text-xs text-base-content/60">
                  Раунд {currentRound}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="small"
                onClick={() => setShowRulesDialog(true)}
                className="gap-2"
              >
                <Info className="w-4 h-4" />
                Правила
              </Button>
              <Button variant="ghost" size="small" className="gap-2">
                <Settings className="w-4 h-4" />
                Настройки
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {currentPayment && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
        >
          <div className="bg-base-200 shadow-md border border-base-300 p-6 rounded-2xl w-[320px] text-center relative shadow-warning/30">
            <h3 className="text-lg font-semibold text-base-content mb-3">
              💸 Оплата ренты
            </h3>

            <p className="text-base text-base-content/80">
              {isMyPayment ? (
                <>
                  Вы должны заплатить{" "}
                  <span className="text-primary font-bold text-lg">
                    {currentPayment.rent}$
                  </span>
                </>
              ) : (
                <>
                  Игрок{" "}
                  <span className="font-semibold text-base-content">
                    {
                      currentRoom.players.find(
                        (p) => p.playerId === currentPayment.payerId
                      )?.player.name
                    }
                  </span>{" "}
                  должен заплатить{" "}
                  <span className="text-primary font-bold text-lg">
                    {currentPayment.rent}$
                  </span>
                </>
              )}
            </p>

            <p className="text-sm text-base-content/70 mt-2">
              Владелец:{" "}
              <span className="font-medium text-base-content">
                {currentRoom.players.find(
                  (p) => p.playerId === currentPayment.ownerId
                )?.player.name || "Неизвестный игрок"}
              </span>
            </p>

            <p className="text-xs text-base-content/50 mt-2">
              Клетка №{currentPayment.cellId}
            </p>
            {isMyPayment && (
              <div className="mt-5 flex justify-center gap-3">
                <Button
                  variant="ghost"
                  size="medium"
                  className="flex-1"
                  onClick={() => setIsMortage(true)}
                >
                  Заложить
                </Button>
                <Button
                  variant="default"
                  size="medium"
                  className="flex-1"
                  onClick={() => payRent()}
                >
                  Оплатить
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
      <AnimatePresence mode="wait">
        {currentChance && (
          <GameMessageEvent
            title={`Шанс: ${
              currentRoom.players.find(
                (p) => p.playerId === currentChance.playerId
              )?.player.name
            }`}
            description={currentChance.text}
            isShowEvent={currentChance.playerId === currentUser.playerId}
            onConfirm={confrimChance}
            onClose={confrimChance}
          />
        )}

        {!currentChance && message && !currentPayment && (
          <GameMessage message={message} onClose={() => setMessage(null)} />
        )}
      </AnimatePresence>

      {/* Главное содержимое */}
      <div className="p-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Игроки & Чат */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <PlayerList
              players={currentRoom.players || []}
              user={user}
              cellState={cellState}
              isCurrentTrunPlayerId={currentRoom.currentTurnPlayerId}
              currentRoom={currentRoom}
            />
            {/* <ChatPanel /> */}
          </motion.div>

          {/* Center Column Игровое поле */}
          <motion.div
            className="lg:col-span-3"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <GameBoard
              players={currentRoom.players}
              cellState={cellState}
              isMortage={isMortage}
              handleMortage={mortagetCell}
              handleUnMortage={unMortagetCell}
              currentUser={currentUser}
              handleBuyHouse={handleUpgradeCell}
              isCurrentTurn={currentRoom.currentTurnPlayerId === user?.id}
            />
          </motion.div>

          {/* Right column - Действия & Журнал */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ActionPanel
              currentRoom={currentRoom}
              movePlayer={movePlayer}
              isCurrentTurn={currentRoom.currentTurnPlayerId === user?.id}
              isCurrentTrunUser={currentRoom.players.find(
                (p) => p.playerId == currentRoom.currentTurnPlayerId
              )}
              currentUser={currentUser}
              dice={dice}
              buyCell={handleBuyCell}
              isBuying={
                cells.find((c) => c.id === currentUser?.positionOnBoard)
                  ?.isBuying &&
                (cells.find((c) => c.id === currentUser?.positionOnBoard)
                  ?.price || 10) <= currentUser?.money
              }
              cellState={cellState}
              isBlocked={currentPayment !== null}
              isMortage={isMortage}
              handleMortgaged={handleMortgaged}
              handleJailAction={handleJailAction}
              handleReady={handleIsReady}
            />
            <GameLog logs={logs} />
          </motion.div>
        </div>
      </div>

      {/* Модалки */}
      <Dialog isOpen={showLeaveDialog} onOpenChange={setShowLeaveDialog} isBlur>
        <div className="space-y-6 max-w-lg">
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Покинуть комнату?</h2>
            <div className="space-y-2 text-base-content/60">
              Вы уверены, что хотите выйти из игры? Ваш прогресс не будет
              сохранен.
            </div>
          </div>
          <div className="flex justify-end w-full gap-2">
            <Button variant="ghost" onClick={() => setShowLeaveDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleLeave} variant="error">
              Выйти
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog isOpen={showRulesDialog} onOpenChange={setShowRulesDialog} isBlur>
        <div className="space-y-3 min-w-lg">
          <div className="space-y-2">
            <h2>Правила игры</h2>
            <div className="space-y-2 text-base-content/60">
              <p>1. Бросайте кубик, чтобы передвигаться по полю</p>
              <p>2. Покупайте недвижимость, на которую попадаете</p>
              <p>3. Стройте дома и отели на своих улицах</p>
              <p>4. Собирайте ренту с других игроков</p>
              <p>5. Побеждает последний не обанкротившийся игрок</p>
            </div>
          </div>
          <div className="w-full justify-end flex">
            <Button onClick={() => setShowRulesDialog(false)} variant="default">
              Понятно
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
