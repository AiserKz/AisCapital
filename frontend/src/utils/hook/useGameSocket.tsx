import { io } from "socket.io-client";
import { API_BASE_URL } from "../../config";
import { useEffect, useRef } from "react";
import type { CurrentPaymentType, RoomDetailType } from "../../types/types";

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
  BUY_CELL: "buy_cell",
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
} as const;

export type MoveResponse = {
  success: boolean;
  value: number;
  position: number;
  dice1: number;
  dice2: number;
  message?: string;
};

export default function useGameSocket(
  roomId: string | undefined,
  playerId: string | undefined,
  handleRollDice: (dice1: number, dice2: number) => void,
  onRoomUpdate?: (
    updater: (prev: RoomDetailType | null) => RoomDetailType | null
  ) => void,
  setCurrentPayment?: (payment: CurrentPaymentType) => void,
  onMessage?: (message: any) => void,
  roomClosed?: (message: string) => void
) {
  const hasJoinedRef = useRef(false);
  useEffect(() => {
    if (!roomId || !playerId || hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    console.log("Подключение к комнате");
    socket.emit(GAME_EVENTS.JOIN_ROOM, roomId);

    socket.on(GAME_EVENTS.PLAYER_JOINED, (playerInRoom) => {
      onRoomUpdate?.((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: [...prev.players, playerInRoom],
        };
      });
    });

    socket.on(GAME_EVENTS.PLAYER_LEFT, (playerId) => {
      onRoomUpdate?.((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.filter((p) => p.playerId !== playerId),
        };
      });
    });

    socket.on(GAME_EVENTS.ROOM_UPDATE, (room) => {
      console.log(GAME_EVENTS.ROOM_UPDATE, room);
      onRoomUpdate?.((_prev) => room);
    });

    socket.on(GAME_EVENTS.PLAYER_HAS_MOVED, (dice1, dice2) => {
      handleRollDice(dice1, dice2);
      console.log(GAME_EVENTS.PLAYER_HAS_MOVED, dice1, dice2);
    });

    socket.on(GAME_EVENTS.RENT_REQUIRED, (data) => {
      console.log(GAME_EVENTS.RENT_REQUIRED, data);
      setCurrentPayment?.(data.text);
    });

    socket.on(GAME_EVENTS.MESSAGE, (message) => {
      console.log(GAME_EVENTS.MESSAGE, message);
      onMessage?.(message);
    });

    socket.on(GAME_EVENTS.HOST_LEAVE, (message) => {
      console.log(GAME_EVENTS.HOST_LEAVE, message);
      roomClosed?.(message);
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
    socket.emit(GAME_EVENTS.BUY_CELL, { roomId });
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
  };
}
