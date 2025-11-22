import { Server } from "socket.io";
import { CellState, RoomWithPlayers } from "../../types/types.js";
import {
  findRoomAndPlayer,
  getCellState,
  roomUpdate,
  sendRoomMessage,
} from "./roomUtils.js";
import { GAME_EVENTS } from "../game/events/gameEvents.js";
import { saveRoomToDB } from "../../services/gameService.js";
import { prisma } from "../../prisma.js";
import { cells, trainCeil } from "../../data/ceil.js";

export const checkBankruptcy = async (
  io: Server,
  room: RoomWithPlayers,
  playerId: string,
  debt: number = 0
) => {
  const player = room.players.find((p) => p.playerId === playerId);
  if (!player) return;

  const { cellState } = getCellState(room, 0);
  const ownedCells = cellState.filter((c) => c.ownerId === playerId);
  const mortgaged = ownedCells.filter((c) => c.mortgaged);
  const freeCells = ownedCells.filter((c) => !c.mortgaged);

  const remainingMoney = player.money - debt;

  console.log(
    `💰 Игрок ${player.player.name} имеет ${player.money}$, долг ${debt}$`
  );

  // ⚠️ Игрок в минусе, но есть имущество для залога
  if (freeCells.length > 0 && remainingMoney < 0) {
    player.isFrozen = true;
    console.log(`⚠️ Игрок ${player.player.name} на грани банкротства`);
    io.to(room.id).emit(GAME_EVENTS.MESSAGE, {
      playerId,
      text: `⚠️ Игрок ${player.player.name} должен заложить имущество, чтобы избежать банкротства!`,
      type: "EVENT",
    });

    await saveRoomToDB(room);
    roomUpdate(io, room.id, room);

    return;
  }

  // 💀 Игрок не имеет денег и нечего заложить — банкрот
  if (freeCells.length === 0 && remainingMoney < debt) {
    console.log(`💀 Игрок ${player.player.name} обанкротился и покидает игру`);
    io.to(room.id).emit(GAME_EVENTS.MESSAGE, {
      playerId,
      text: `💀 Игрок ${player.player.name} обанкротился и покидает игру!`,
      type: "EVENT",
    });

    // Освобождаем клетки
    for (const c of ownedCells) {
      cellState.splice(cellState.indexOf(c), 1);
    }

    player.bankrupt = true;
    player.money = 0;

    const alivePlayers = room.players.filter((p) => !p.bankrupt);

    if (alivePlayers.length === 1) {
      const winner = alivePlayers[0];
      console.log(`🏆 Победитель — ${winner.player.name}`);
      sendRoomMessage(
        io,
        room.id,
        winner.playerId,
        `🏆 Победитель — ${winner.player.name}!`,
        "EVENT"
      );
      room.status = "FINISHED";
      room.winnerId = winner.playerId;

      // Сохраняем историю и обновляем stats игроков
      for (const p of room.players) {
        const isWinner = p.playerId === winner.playerId;

        await prisma.playerGameHistory.create({
          data: {
            playerId: p.playerId,
            roomId: room.id,
            finalMoney: p.money,
            finalElo: p.player.level,
            result: isWinner ? "win" : "lose",
            joinedAt: p.joinedAt,
            leftAt: new Date(),
          },
        });

        await prisma.player.update({
          where: { id: p.playerId },
          data: {
            totalGames: { increment: 1 },
            wins: isWinner ? { increment: 1 } : undefined,
            elo: isWinner ? { increment: 10 } : { decrement: 1 },
          },
        });
      }
    }
  }
  room.cellState = cellState;

  await saveRoomToDB(room);
  roomUpdate(io, room.id, room);
  return room;
};

/**
 * Покупка клетки игроком
 * Обновлена для поддержки монополий и автоматического пересчета рент
 * @param io - Socket.IO сервер
 * @param roomId - ID комнаты
 * @param playerId - ID игрока
 */
export const buyCell = async (io: Server, roomId: string, playerId: string) => {
  const { room, player } = await findRoomAndPlayer(roomId, playerId);

  const cellPos = player.positionOnBoard;
  const targetCell = cells.find((c) => c.id === cellPos) || null;

  // === ПРОВЕРКА ВОЗМОЖНОСТИ ПОКУПКИ ===
  if (
    !targetCell ||
    targetCell.isBuying === false ||
    targetCell.price === undefined
  )
    return console.log(
      `❌ Игрок ${player.player.name} не может купить клетку, ${targetCell?.name}`
    );

  const { cellState, cell } = getCellState(room, cellPos);

  // Проверка, не куплена ли клетка уже
  if (cell)
    return console.log(
      `❌ Клетка ${targetCell.name} уже принадлежит другому игроку`
    );

  // Игрок в тюрьме не может покупать
  if (player.jailed)
    return console.log(`⭕ Игрок ${player.player.name} в тюрьме!`);

  // Проверка достаточности денег
  if (player.money < targetCell.price)
    return console.log(
      `❌ Игрок ${player.player.name} не имеет достаточно денег для покупки клетки ${targetCell.name}`
    );

  let updatedCellState = [...cellState];

  // === СОЗДАНИЕ НОВОЙ КЛЕТКИ В СОСТОЯНИИ ===
  const newCellState: CellState = {
    id: cellPos,
    ownerId: playerId,
    ownerPosition: player.position || 0,
    currentRent: targetCell.rent || 0,
    mortgaged: false,
    baseRent: targetCell.rent || 0,
    houses: 0,
    hotels: 0,
    housePrice: targetCell.housePrice || 50,
    hotelPrice: targetCell.hotelPrice || 150,
  };

  updatedCellState.push(newCellState);

  // === ОБРАБОТКА ЖЕЛЕЗНЫХ ДОРОГ ===
  // Получаем все железные дороги игрока
  const playerTrainCells = updatedCellState.filter(
    (c) => trainCeil.includes(c.id) && c.ownerId === playerId
  );

  // Обновляем ренты для поездов в зависимости от количества
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
  // Импортируем функции из monopolyService
  const {
    getCellColor,
    hasMonopoly,
    calculateMonopolyRent
  } = await import("../game/services/monopolyService.js");

  const cellColor = getCellColor(cellPos);

  // Если клетка имеет цвет (не железная дорога, не утилита)
  if (cellColor) {
    // Проверяем, получил ли игрок монополию после этой покупки
    const playerHasMonopoly = hasMonopoly(playerId, cellColor, updatedCellState);

    if (playerHasMonopoly) {
      console.log(`🎯 Игрок ${player.player.name} получил монополию на ${cellColor}!`);

      // Обновляем ренты для всех клеток этого цвета
      updatedCellState = updatedCellState.map((cell) => {
        const cellColorCheck = getCellColor(cell.id);

        // Если клетка того же цвета и принадлежит игроку
        if (cellColorCheck === cellColor && cell.ownerId === playerId) {
          const baseRent = cell.baseRent || 0;
          // Рассчитываем новую ренту с учетом монополии
          const newRent = calculateMonopolyRent(cell, updatedCellState, baseRent);
          return { ...cell, baseRent: newRent, currentRent: newRent };
        }

        return cell;
      });

      // Уведомляем всех о монополии
      sendRoomMessage(
        io,
        roomId,
        playerId,
        `🎯 Игрок ${player.player.name} получил монополию на ${cellColor}! Рента удвоена!`,
        "EVENT"
      );
    }
  }

  // === СОХРАНЕНИЕ И УВЕДОМЛЕНИЕ ===
  room.cellState = updatedCellState;
  player.money -= targetCell.price;

  await saveRoomToDB(room);
  console.log(`🏠 Игрок ${player.player.name} купил клетку ${targetCell.name}`);
  sendRoomMessage(
    io,
    roomId,
    playerId,
    `🏠 Игрок ${player.player.name} купил клетку ${targetCell.name}`,
    "EVENT"
  );
  roomUpdate(io, roomId, room);
};
