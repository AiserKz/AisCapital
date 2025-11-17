import { io } from "socket.io-client";
import { API_BASE_URL } from "../../config";
import { useEffect, useRef } from "react";
import type { CurrentPaymentType, RoomDetailType } from "../../types/types";
import type { RoomAction } from "../../pages/GameRoom";

const socket = io(API_BASE_URL, {
  auth: {
    token: localStorage.getItem("accessToken"),
  },
});
const GAME_EVENTS = {
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  PLAYER_MOVE: "player_move",
  PAY_RENT: "pay_rent",
  MORTAGE_CELL: "mortage_cell",
  UN_MORTAGE_CELL: "un-mortage_cell",
  ROOM_UPDATE: "room_updated",
  RENT_REQUIRED: "rent_required",
  PLAYER_JOINED: "player_joined",
  PLAYER_LEFT: "player_left",
  PLAYER_HAS_MOVED: "player_has_moved",
  PAYMENT_COMPLETE: "payment_completed",
  MESSAGE: "game_message",
  CONFIRM_CHANCE: "confirm_chance",
  JAIL_ACTION: "jail_action",
  BUY_HOUSE: "buy_house",
  GAME_OVER: "game_over",
  IS_READY: "is_ready",
  HOST_LEAVE: "host_leave",
  PENDING_ACTION: "pending_action",
  TURN_ENDED: "turn_ended",
  ROOM_MESSAGE: "room_message",
} as const;

export default function useGameSocket(
  roomId: string | undefined,
  playerId: string | undefined,
  handleRollDice: (dice1: number, dice2: number) => void,
  dispatch: React.Dispatch<RoomAction>,

  onMessage?: (message: any) => void,
  roomClosed?: (message: string) => void,
  startTimer?: (time: number) => void,
  chatMessage?: (data: {
    playerId: string;
    text: string;
    username: string;
    time: number;
  }) => void
) {
  const hasJoinedRef = useRef(false);
  useEffect(() => {
    if (!roomId || !playerId || hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    console.log("Подключение к комнате");
    socket.emit(GAME_EVENTS.JOIN_ROOM, roomId);

    socket.on(GAME_EVENTS.PLAYER_JOINED, (playerInRoom) => {});

    socket.on(GAME_EVENTS.PLAYER_LEFT, (playerId) => {});

    socket.on(GAME_EVENTS.ROOM_UPDATE, (room) => {
      console.log(GAME_EVENTS.ROOM_UPDATE, room);
      dispatch({ type: "SET_ROOM", payload: room });
    });

    socket.on(GAME_EVENTS.PLAYER_HAS_MOVED, (dice1, dice2) => {
      handleRollDice(dice1, dice2);
      console.log(GAME_EVENTS.PLAYER_HAS_MOVED, dice1, dice2);
    });

    socket.on(GAME_EVENTS.RENT_REQUIRED, (data) => {
      dispatch({ type: "SET_CURRENT_PAYMENT", payload: data.text });
    });

    socket.on(GAME_EVENTS.MESSAGE, (message) => {
      onMessage?.(message);
    });

    socket.on(GAME_EVENTS.HOST_LEAVE, (message) => {
      console.log(GAME_EVENTS.HOST_LEAVE, message);
      roomClosed?.(message);
    });

    socket.on(GAME_EVENTS.TURN_ENDED, () => {
      startTimer?.(0);
    });

    socket.on(GAME_EVENTS.PENDING_ACTION, ({ playerId, action }) => {
      if (action.type === "BUY_OR_PAY" && playerId) {
        startTimer?.(action.expiresAt);
      }
    });

    socket.on(GAME_EVENTS.ROOM_MESSAGE, (message) => {
      console.log(GAME_EVENTS.ROOM_MESSAGE, message);
      chatMessage?.(message);
    });

    return () => {
      socket.emit(GAME_EVENTS.LEAVE_ROOM, roomId);
      socket.off(GAME_EVENTS.PLAYER_JOINED);
      socket.off(GAME_EVENTS.ROOM_UPDATE);
      socket.off(GAME_EVENTS.PLAYER_LEFT);
      socket.off(GAME_EVENTS.PLAYER_HAS_MOVED);
      socket.off(GAME_EVENTS.RENT_REQUIRED);
      socket.off(GAME_EVENTS.MESSAGE);
    };
  }, [roomId, playerId]);

  useEffect(() => {
    hasJoinedRef.current = false;
  }, [roomId]);

  const movePlayer = () => {
    socket.emit(GAME_EVENTS.PLAYER_MOVE, { roomId });
  };

  const buyCell = () => {
    socket.emit(GAME_EVENTS.PENDING_ACTION, {
      roomId,
      playerId,
      action: "BUY_OR_SKIP",
      buy: true,
    });
  };

  const skipTurn = () => {
    socket.emit(GAME_EVENTS.PENDING_ACTION, {
      roomId,
      playerId,
      action: "BUY_OR_SKIP",
      buy: false,
    });
  };

  const payRent = () => {
    socket.emit(GAME_EVENTS.PAY_RENT, { roomId });
  };

  const mortagetCell = async (cellId: number) => {
    socket.emit(GAME_EVENTS.MORTAGE_CELL, { roomId, cellId });
  };

  const unMortagetCell = async (cellId: number) => {
    socket.emit(GAME_EVENTS.UN_MORTAGE_CELL, { roomId, cellId });
  };

  const confrimChance = () => {
    socket.emit(GAME_EVENTS.CONFIRM_CHANCE, { roomId });
  };

  const handleJailAction = async (action: "roll" | "pay" | "wait") => {
    socket.emit(GAME_EVENTS.JAIL_ACTION, { roomId, action });
  };

  const handleBuyHouse = (cellId: number, type: "house" | "hotel") => {
    socket.emit(GAME_EVENTS.BUY_HOUSE, { roomId, cellId, type });
  };

  const handleIsReady = () => {
    socket.emit(GAME_EVENTS.IS_READY, roomId);
  };

  const sendMessage = (text: string) => {
    socket.emit(GAME_EVENTS.ROOM_MESSAGE, { roomId, text });
  };

  return {
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
  };
}
