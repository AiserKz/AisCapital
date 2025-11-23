import { Server } from "socket.io";
import { RoomWithPlayers } from "../../../types/types.js";
import { saveRoomToDB } from "../../../services/gameService.js";
import { roomUpdate, sendRoomMessage } from "../../utils/roomUtils.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import { AUCTION_BID_TIMEOUT } from "../../../config/gameConstants.js";
import { cells } from "../../../data/ceil.js";

/**
 * Сервис для аукционов
 * Когда игрок отказывается покупать клетку, она выставляется на аукцион
 */

/** Интерфейс ставки на аукционе */
export interface AuctionBid {
  /** ID игрока */
  playerId: string;
  /** Сумма ставки */
  amount: number;
  /** Время ставки */
  timestamp: number;
}

/** Интерфейс аукциона */
export interface Auction {
  /** ID аукциона */
  id: string;
  /** ID комнаты */
  roomId: string;
  /** ID клетки */
  cellId: number;
  /** Текущая максимальная ставка */
  currentBid: number;
  /** ID игрока с максимальной ставкой */
  currentBidder: string | null;
  /** История ставок */
  bids: AuctionBid[];
  /** Статус аукциона */
  status: "active" | "completed" | "cancelled";
  /** Время начала */
  startedAt: number;
  /** Время окончания */
  endsAt: number;
}

// Хранилище активных аукционов
const activeAuctions = new Map<string, Auction>();

/**
 * Начать аукцион для клетки
 * @param room - Комната с игроками
 * @param cellId - ID клетки
 * @returns Созданный аукцион
 */
export const startAuction = (
  room: RoomWithPlayers,
  cellId: number
): Auction => {
  const auctionId = `auction_${room.id}_${cellId}_${Date.now()}`;

  const auction: Auction = {
    id: auctionId,
    roomId: room.id,
    cellId,
    currentBid: 30,
    currentBidder: null,
    bids: [],
    status: "active",
    startedAt: Date.now(),
    endsAt: Date.now() + AUCTION_BID_TIMEOUT,
  };

  activeAuctions.set(auctionId, auction);

  // Блокируем ходы во время аукциона
  (room as any).activeAuction = auctionId;

  console.log(`🔨 Аукцион начался для клетки ${cellId} в комнате ${room.name}`);

  return auction;
};

/**
 * Сделать ставку на аукционе
 * @param io - Socket.IO сервер
 * @param room - Комната с игроками
 * @param auctionId - ID аукциона
 * @param playerId - ID игрока
 * @param amount - Сумма ставки
 * @returns true если ставка принята
 */
export const placeBid = async (
  io: Server,
  room: RoomWithPlayers,
  auctionId: string,
  playerId: string,
  amount: number
): Promise<boolean> => {
  const auction = activeAuctions.get(auctionId);
  if (!auction || auction.status !== "active") {
    console.log("⭕ Аукцион не найден или уже завершен");
    return false;
  }

  const player = room.players.find((p) => p.playerId === playerId);
  if (!player) {
    console.log("⭕ Игрок не найден");
    return false;
  }

  // Проверка: ставка должна быть больше текущей
  if (amount <= auction.currentBid) {
    console.log("⭕ Ставка должна быть выше текущей");
    return false;
  }

  // Проверка: достаточно ли денег у игрока
  if (player.money < amount) {
    console.log("⭕ Недостаточно денег для ставки");
    return false;
  }

  // Проверка: не истекло ли время
  if (Date.now() > auction.endsAt) {
    console.log("⭕ Время аукциона истекло");
    await endAuction(io, room, auctionId);
    return false;
  }

  const cellState = room.cellState as any[];
  const existingCell = cellState?.find((c: any) => c.id === auction.cellId);
  if (existingCell && existingCell.ownerId) {
    console.log(
      `❌ Клетка ${existingCell.name} уже принадлежит другому игроку`
    );
    activeAuctions.delete(auctionId);
    return false;
  }

  // Обновляем аукцион
  auction.currentBid = amount;
  auction.currentBidder = playerId;
  auction.bids.push({
    playerId,
    amount,
    timestamp: Date.now(),
  });

  console.log(`💰 ${player.player.name} сделал ставку ${amount}$ на аукционе`);

  // Уведомляем всех о новой ставке
  io.to(room.id).emit(GAME_EVENTS.AUCTION_BID, {
    auctionId,
    playerId,
    amount,
    playerName: player.player.name,
  });

  return true;
};

/**
 * Завершить аукцион и передать клетку победителю
 * @param io - Socket.IO сервер
 * @param room - Комната с игроками
 * @param auctionId - ID аукциона
 */
export const endAuction = async (
  io: Server,
  room: RoomWithPlayers,
  auctionId: string
): Promise<void> => {
  const auction = activeAuctions.get(auctionId);
  if (!auction || auction.status !== "active") {
    return;
  }

  auction.status = "completed";

  // Разблокируем ходы после аукциона
  (room as any).activeAuction = null;

  // Если есть победитель
  if (auction.currentBidder && auction.currentBid > 0) {
    const winner = room.players.find(
      (p) => p.playerId === auction.currentBidder
    );

    if (!winner) {
      console.log("⭕ Победитель не найден");
      activeAuctions.delete(auctionId);
      return;
    }

    // === ПРОВЕРКА ПОКУПАЕМОСТИ КЛЕТКИ ===
    const targetCell = cells.find((c) => c.id === auction.cellId);

    if (
      !targetCell ||
      targetCell.isBuying === false ||
      targetCell.price === undefined
    ) {
      console.log(
        `❌ Клетка ${targetCell?.name} не может быть куплена на аукционе`
      );
      sendRoomMessage(
        io,
        room.id,
        "",
        `❌ Аукцион отменен - клетка не может быть продана`,
        "EVENT"
      );
      activeAuctions.delete(auctionId);
      return;
    }

    // === Проверка достаточности денег ===
    if (winner.money < auction.currentBid) {
      console.log(`❌ У победителя ${winner.player.name} недостаточно денег`);
      sendRoomMessage(
        io,
        room.id,
        "",
        `❌ У ${winner.player.name} недостаточно денег для покупки`,
        "EVENT"
      );
      activeAuctions.delete(auctionId);
      return;
    }

    // Списываем деньги
    winner.money -= auction.currentBid;

    // Инициализируем cellState, если он null
    if (!room.cellState) {
      room.cellState = [];
    }

    // Проверяем, не куплена ли клетка уже
    const cellState = room.cellState as any[];
    const existingCell = cellState?.find((c: any) => c.id === auction.cellId);
    if (existingCell && existingCell.ownerId) {
      console.log(
        `❌ Клетка ${targetCell.name} уже принадлежит другому игроку`
      );
      winner.money += auction.currentBid; // Возвращаем деньги
      activeAuctions.delete(auctionId);
      return;
    }

    let updatedCellState = [...cellState] as any[];

    // === СОЗДАНИЕ НОВОЙ КЛЕТКИ В СОСТОЯНИИ ===
    const newCellState = {
      id: auction.cellId,
      ownerId: auction.currentBidder,
      ownerPosition: winner.position || 0,
      currentRent: targetCell.rent || 0,
      mortgaged: false,
      baseRent: targetCell.rent || 0,
      houses: 0,
      hotels: 0,
      housePrice: targetCell.housePrice || 50,
      hotelPrice: targetCell.hotelPrice || 150,
    };

    // Обновляем или добавляем клетку
    if (existingCell) {
      Object.assign(existingCell, newCellState);
    } else {
      updatedCellState.push(newCellState);
    }

    // === ОБРАБОТКА ЖЕЛЕЗНЫХ ДОРОГ ===
    const trainCeil = [5, 15, 25, 35];
    const playerTrainCells = updatedCellState.filter(
      (c) => trainCeil.includes(c.id) && c.ownerId === auction.currentBidder
    );

    if (playerTrainCells.length > 0) {
      const rentMultiplierMap: Record<number, number> = {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
      };
      const multiplier = rentMultiplierMap[playerTrainCells.length];

      updatedCellState = updatedCellState.map((cell) => {
        if (playerTrainCells.find((st) => st.id === cell.id)) {
          const origCell = cells.find((c) => c.id === cell.id);
          if (origCell && origCell.rent) {
            return { ...cell, currentRent: origCell.rent * multiplier };
          }
        }
        return cell;
      });
    }

    // === ПРОВЕРКА И ОБРАБОТКА МОНОПОЛИЙ ===
    const { getCellColor, hasMonopoly, calculateMonopolyRent } = await import(
      "./monopolyService.js"
    );

    const cellColor = getCellColor(auction.cellId);

    // Если клетка имеет цвет
    if (cellColor) {
      const playerHasMonopoly = hasMonopoly(
        auction.currentBidder,
        cellColor,
        updatedCellState
      );

      if (playerHasMonopoly) {
        console.log(
          `🎯 ${winner.player.name} получил монополию на ${cellColor}!`
        );

        // Обновляем ренты для всех клеток этого цвета
        updatedCellState = updatedCellState.map((cell) => {
          const cellColorCheck = getCellColor(cell.id);

          if (
            cellColorCheck === cellColor &&
            cell.ownerId === auction.currentBidder
          ) {
            const baseRent = cell.baseRent || 0;
            const newRent = calculateMonopolyRent(
              cell,
              updatedCellState,
              baseRent
            );
            return { ...cell, baseRent: newRent, currentRent: newRent };
          }

          return cell;
        });

        sendRoomMessage(
          io,
          room.id,
          auction.currentBidder,
          `🎯 ${winner.player.name} получил монополию на ${cellColor}! Рента удвоена!`,
          "EVENT"
        );
      }
    }

    // === СОХРАНЕНИЕ ===
    room.cellState = updatedCellState;

    console.log(
      `🔨 ${winner.player.name} выиграл аукцион за ${auction.currentBid}$ и купил ${targetCell.name}`
    );

    sendRoomMessage(
      io,
      room.id,
      auction.currentBidder,
      `🏆 ${winner.player.name} выиграл аукцион за ${auction.currentBid}$ и купил ${targetCell.name}!`,
      "EVENT"
    );
  } else {
    console.log("⭕ Аукцион закончился без ставок");
    sendRoomMessage(
      io,
      room.id,
      "",
      `⭕ Аукцион закончился без ставок`,
      "EVENT"
    );
  }

  // Уведомляем всех о завершении аукциона
  io.to(room.id).emit(GAME_EVENTS.AUCTION_ENDED, {
    auctionId,
    winnerId: auction.currentBidder,
    winnerName: room.players.find((p) => p.playerId === auction.currentBidder)
      ?.player.name,
    finalBid: auction.currentBid,
  });

  // Удаляем аукцион из активных
  activeAuctions.delete(auctionId);

  await saveRoomToDB(room);
  roomUpdate(io, room.id, room);
};

/**
 * Отменить аукцион (например, если игра завершилась)
 * @param auctionId - ID аукциона
 */
export const cancelAuction = (auctionId: string): void => {
  const auction = activeAuctions.get(auctionId);
  if (auction) {
    auction.status = "cancelled";
    activeAuctions.delete(auctionId);
    console.log(`🚫 Аукцион ${auctionId} отменен`);
  }
};

/**
 * Получить активный аукцион
 * @param auctionId - ID аукциона
 * @returns Аукцион или undefined
 */
export const getAuction = (auctionId: string): Auction | undefined => {
  return activeAuctions.get(auctionId);
};

/**
 * Получить все активные аукционы в комнате
 * @param roomId - ID комнаты
 * @returns Массив аукционов
 */
export const getRoomAuctions = (roomId: string): Auction[] => {
  return Array.from(activeAuctions.values()).filter(
    (a) => a.roomId === roomId && a.status === "active"
  );
};
