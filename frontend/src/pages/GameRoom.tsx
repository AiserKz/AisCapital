import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlayerList } from "../components/PlayerList";
import { ChatPanel } from "../components/ChatPanel";
import { ActionPanel } from "../components/ActionPanel";
import { GameLog } from "../components/GameLog";
import { GameBoard } from "../components/GameBoard";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import apiFetch from "../utils/apiFetch";
import type {
  CurrentPaymentType,
  CellState,
  RoomDetailType,
  PendingChanceType,
  RoomStateType,
  AuctionType,
  AuctionStateType,
} from "../types/types";
import { useApp } from "../context/AppContext";
import useGameSocket from "../utils/hook/useGameSocket";
import { cells } from "../test/data";
import { GameMessage } from "../components/modal/GameMessage";
import { GameMessageEvent } from "../components/modal/GameMessageEvent";
import { HeaderGameRoom } from "../components/HeaderGameRoom";
import CurrentPayment from "../components/gameRoom/CurrentPayment";
import { useGameMessage } from "../utils/hook/useGameMessage";
import { usePendingTimer } from "../utils/hook/usePendingTimer";
import { Loading } from "../components/Loading";
import { ErrorScreen } from "../components/Error";
import Button from "../components/ui/button";
import { CurrentAuction } from "../components/gameRoom/CurrentAuction";
import { TradeAction } from "../components/gameRoom/TradeAction";
import { TradeViewEvent } from "../components/gameRoom/TradeViewEvent";

export type RoomAction =
  | { type: "SET_ROOM"; payload: RoomDetailType }
  | { type: "SET_CELL_STATE"; payload: CellState[] }
  | { type: "SET_CURRENT_PAYMENT"; payload: CurrentPaymentType }
  | { type: "SET_PENDING_CHANCE"; payload: PendingChanceType }
  | { type: "SET_ROOM_STATE"; payload: Partial<RoomStateType> }
  | { type: "RESET_ROOM" };

const roomReducer = (
  state: RoomStateType,
  action: RoomAction
): RoomStateType => {
  switch (action.type) {
    case "SET_ROOM":
      return { ...state, currentRoom: action.payload };
    case "SET_CELL_STATE":
      return { ...state, cellState: action.payload };
    case "SET_CURRENT_PAYMENT":
      return { ...state, currentPayment: action.payload };
    case "SET_PENDING_CHANCE":
      return { ...state, pendingChance: action.payload };
    case "SET_ROOM_STATE":
      return { ...state, ...action.payload };
    case "RESET_ROOM":
      return {
        currentRoom: null,
        cellState: [],
        currentPayment: null,
        pendingChance: null,
      };
    default:
      return state;
  }
};

export function GameRoom() {
  const { roomId } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();

  const [roomState, dispatch] = useReducer(roomReducer, {
    currentRoom: null,
    cellState: [],
    currentPayment: null,
    pendingChance: null,
  });
  const [isMortage, setIsMortage] = useState<boolean>(false);
  const [dice, setDice] = useState<{ dice1: number; dice2: number }>({
    dice1: 1,
    dice2: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const handleRollDice = async (dice1: number, dice2: number) => {
    setDice({ dice1, dice2 });
    setIsMortage(false);
  };

  const {
    logs,
    message,
    addChatMessage,
    onGameMessage,
    chatMessages,
    clearMessage,
  } = useGameMessage(user?.id);

  const [auction, setAuction] = useState<AuctionType | null>(null);
  const [auctionState, setAuctionState] = useState<AuctionStateType | null>(
    null
  );
  const [isTradeOpen, setIsTradeOpen] = useState<boolean>(false);

  const roomClosed = useCallback((message: string) => {
    toast.error(message);
    navigate("/");
  }, []);

  const { timer, startTimer } = usePendingTimer();

  const auctionStart = useCallback((auction: AuctionType | null) => {
    setAuction(auction);
  }, []);

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
    skipTurn,
    sendMessage,
    handleAuctionStart,
    handleAuctionBid,
    handleTradeOffer,
    handleTradeAccept,
    handleTradeReject,
    handleTradeCancel,
  } = useGameSocket(
    roomId,
    user?.id,
    handleRollDice,
    dispatch,
    onGameMessage,
    roomClosed,
    startTimer,
    addChatMessage,
    auctionStart,
    setAuctionState
  );

  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;

    const fetchRoom = async () => {
      setLoading(true);
      const savedPassword =
        sessionStorage.getItem(`room-access-${roomId}`) || "";
      try {
        const res = await apiFetch.get(`/api/rooms/${roomId}`, {
          params: { password: savedPassword },
        });

        if (!isMounted) return;

        if (res.status === 403) {
          toast.error("Комната приватная. Введите пароль снова.");
          navigate("/");
          return;
        }

        if (res.status !== 200 || !res.data) {
          toast.error("Комната не найдена");
          navigate("/");
          return;
        }

        dispatch({ type: "SET_ROOM", payload: res.data });
      } catch (error) {
        if (!isMounted) return;

        toast.error("Ошибка при загрузке комнаты");
        navigate("/");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRoom();

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomState.currentRoom) return;

    dispatch({
      type: "SET_ROOM_STATE",
      payload: {
        cellState: roomState.currentRoom?.cellState,
        currentPayment: roomState.currentRoom?.currentPayment,
        pendingChance: roomState.currentRoom?.pendingChance,
      },
    });
  }, [roomState.currentRoom]);

  const handleLeave = useCallback(async () => {
    navigate("/");
    toast.success("Вы покинули комнату");
  }, []);

  const handleUpgradeCell = useCallback(
    async (cellId: number, type: "house" | "hotel") => {
      handleBuyHouse(cellId, type);
    },
    []
  );

  const handleMortgaged = useCallback(async () => {
    setIsMortage(!isMortage);
  }, [isMortage]);

  const currentUser = useMemo(() => {
    return (
      roomState.currentRoom?.players.find((p) => p.player.id === user?.id) ||
      null
    );
  }, [roomState.currentRoom, user?.id]);

  if (!roomState.currentRoom) return <Loading />;
  if (!roomState.currentRoom && !loading) return <ErrorScreen />;

  const currentRoom = roomState.currentRoom!;

  const currentCell = cells.find((c) => c.id === currentUser?.positionOnBoard);
  const isBuying =
    currentCell?.isBuying &&
    currentUser &&
    (currentCell?.price || 10) <= currentUser?.money;

  // console.log("Перерендер страницы");

  return (
    <div className="min-h-screen">
      <HeaderGameRoom
        currentRoom={roomState.currentRoom}
        handleLeave={handleLeave}
      />

      {roomState.currentPayment && (
        <CurrentPayment
          roomState={roomState}
          currentUser={currentUser}
          payRent={payRent}
          setIsMortage={setIsMortage}
        />
      )}
      <AnimatePresence mode="wait">
        {roomState.pendingChance && (
          <GameMessageEvent
            title={`Шанс: ${
              roomState.currentRoom.players.find(
                (p) => p.playerId === roomState.pendingChance?.playerId
              )?.player.name
            }`}
            description={roomState.pendingChance.text}
            isShowEvent={
              roomState.pendingChance.playerId === currentUser?.playerId
            }
            onConfirm={confrimChance}
            onClose={confrimChance}
          />
        )}

        {!roomState.pendingChance && message && !roomState.currentPayment && (
          <GameMessage message={message} onClose={clearMessage} />
        )}

        {currentRoom.winner && (
          <GameMessage>
            <div className="flex-col items-center justify-center space-y-3 min-w-lg">
              <h3 className="text-xl">Игра завершена! Победил 🎆</h3>
              <div className="flex space-x-2 items-center justify-center">
                {currentRoom.winner?.avatar ? (
                  <img
                    src={currentRoom.winner?.avatar}
                    alt={currentRoom.winner.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center bg-linear-to-br bg-amber-300 from-amber-400 to-amber-600`}
                  >
                    <span className="text-white text-xs font-medium">
                      {currentRoom.winner.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <p className="text-lg">{currentRoom.winner.name}</p>
              </div>
              <Button onClick={handleLeave}>Вернуться на главную</Button>
            </div>
          </GameMessage>
        )}
      </AnimatePresence>

      {auction && (
        <CurrentAuction
          auction={auction}
          auctionState={auctionState}
          onBid={handleAuctionBid}
          onClose={() => setAuction(null)}
        />
      )}

      <TradeAction
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        roomState={roomState}
        currentUser={currentUser}
        handleTradeOffer={handleTradeOffer}
      />

      {/* Показываем входящее/активное предложение обмена, если есть */}
      {(() => {
        const activeTrade = roomState.currentRoom.activeTrade;
        if (!activeTrade) return null;
        return (
          <TradeViewEvent
            trade={activeTrade}
            roomState={roomState}
            currentUser={currentUser}
            onAccept={() => handleTradeAccept()}
            onReject={() => handleTradeReject()}
            onCancel={() => handleTradeCancel()}
          />
        );
      })()}

      {/* Главное содержимое */}
      <div className="p-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column | Игроки & Чат */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <PlayerList roomState={roomState} />
            <ChatPanel messages={chatMessages} sendMessage={sendMessage} />
          </motion.div>

          {/* Center Column Игровое поле */}
          <motion.div
            className="lg:col-span-3"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <GameBoard
              roomState={roomState}
              isMortage={isMortage}
              handleMortage={mortagetCell}
              handleUnMortage={unMortagetCell}
              currentUser={currentUser}
              handleBuyHouse={handleUpgradeCell}
            />
          </motion.div>

          {/* Right column | Действия & Журнал */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {currentUser && (
              <ActionPanel
                roomState={roomState}
                movePlayer={movePlayer}
                currentUser={currentUser}
                dice={dice}
                buyCell={buyCell}
                skipTurn={skipTurn}
                isBuying={isBuying || false}
                isBlocked={roomState.currentPayment !== null}
                isMortage={isMortage}
                handleMortgaged={handleMortgaged}
                handleJailAction={handleJailAction}
                handleReady={handleIsReady}
                timer={timer}
                handleAuction={handleAuctionStart}
                onOpenTrade={() => setIsTradeOpen(true)}
              />
            )}
            <GameLog logs={logs} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
