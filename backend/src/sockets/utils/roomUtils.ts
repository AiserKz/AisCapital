import { Server, Socket } from "socket.io";
import { getRoomById } from "../../services/gameService.js";
import {
  CellState,
  CurrentPaymentType,
  PendingAction,
  RoomWithPlayers,
} from "../../types/types.js";
import { GAME_EVENTS } from "../game/events/gameEvents.js";
import { prisma } from "../../prisma.js";

interface Room {
  id: string;
  players: { playerId: string }[];
  cellState: CellState[];
}

export const findRoomAndPlayer = async (roomId: string, playerId: string) => {
  const room = await getRoomById(roomId);
  if (!room) throw new Error("Комната не найдена");

  const player = await findPlayerInRoom(room, playerId);
  return { room, player };
};

export const findPlayerInRoom = async (
  room: RoomWithPlayers,
  playerId: string
) => {
  const player = room.players.find((p) => p.playerId === playerId);
  if (!player) throw new Error("Игрок не найден в комнате");
  return player;
};

export const getCurrentPayments = async (room: any, callback: any) => {
  // Проверяем, есть ли активный платёж
  if (!room.currentPayment || typeof room.currentPayment !== "object") {
    return callback?.({ success: false, message: "Нет активного платежа" });
  }

  const currentPayment = room.currentPayment as unknown as CurrentPaymentType;
  return currentPayment;
};

export const getCellState = (
  room: any,
  cellId?: any
): { cellState: CellState[]; cell: CellState | null } => {
  const cellState: any[] = Array.isArray(room.cellState) ? room.cellState : [];
  const cell = cellState.find((c) => c.id === cellId) || null;
  return { cellState, cell };
};

export const calculateBuildingBonus = (cell: CellState): number => {
  const base = cell.baseRent ?? 100;

  const maxHotels = 3;
  let bonus = 0;

  // Бонус от домов
  if (cell.houses && cell.houses > 0) {
    bonus += Math.floor(base * 0.4 * cell.houses);
  }

  // Бонус от отелей
  if (cell.hotels && cell.hotels > 0) {
    const actualHotels = Math.min(cell.hotels, maxHotels);
    bonus += Math.floor(base * 0.5 * actualHotels);
  }

  return bonus;
};

export const getUserData = (socket: Socket) => {
  const playerId = socket.data.user.id;
  const username = socket.data.user.name;
  return { playerId, username };
};

export const sendRoomMessage = (
  io: Server,
  roomId: string,
  playerId: string,
  message: string,
  type: "CHANCE" | "EVENT"
) => {
  io.to(roomId).emit(GAME_EVENTS.MESSAGE, {
    playerId,
    text: message,
    type: type,
  });
};

export const roomUpdate = async (
  io: Server,
  roomId: string,
  data: RoomWithPlayers
) => {
  let winnerData = null;

  if (data.winnerId && data.status === "FINISHED") {
    winnerData = await prisma.player.findUnique({
      where: { id: data.winnerId },
      select: {
        id: true,
        name: true,
        avatar: true,
        level: true,
      },
    });
  }

  const room: any = {
    ...data,
    winner: winnerData,
  };

  io.to(roomId).emit(GAME_EVENTS.ROOM_UPDATE, room);
};

export const isBuyOrPayAction = (obj: any): obj is PendingAction => {
  return (
    obj && typeof obj === "object" && "type" in obj && obj.type === "BUY_OR_PAY"
  );
};
