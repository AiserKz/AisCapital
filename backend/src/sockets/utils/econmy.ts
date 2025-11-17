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
import { cells } from "../../data/ceil.js";

export const checkBankruptcy = async (
  io: Server,
  room: RoomWithPlayers,
  playerId: string
) => {
  const player = room.players.find((p) => p.playerId === playerId);
  if (!player) return;

  const { cellState } = getCellState(room, 0);
  const ownedCells = cellState.filter((c) => c.ownerId === playerId);
  const mortgaged = ownedCells.filter((c) => c.mortgaged);
  const freeCells = ownedCells.filter((c) => !c.mortgaged);

  console.log(`💰 Игрок ${player.player.name} имеет ${player.money}$`);

  if (player.money >= 0) return;

  // ⚠️ Игрок в минусе, но есть имущество для залога
  if (freeCells.length > 0 && player.money < 0) {
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
  console.log(`💀 Игрок ${player.player.name} обанкротился и покидает игру`);
  io.to(room.id).emit(GAME_EVENTS.MESSAGE, {
    playerId,
    text: `💀 Игрок ${player.player.name} обанкротился и покидает игру!`,
    type: "EVENT",
  });

  // Освобождаем клетки
  //   for (const c of ownedCells) {
  //     c.ownerId = null;
  //     c.mortgaged = false;
  //   }

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

  await saveRoomToDB(room);
  roomUpdate(io, room.id, room);
};

export const buyCeil = async (io: Server, roomId: string, playerId: string) => {
  const { room, player } = await findRoomAndPlayer(roomId, playerId);

  const cellPos = player.positionOnBoard;
  const targetCell = cells.find((c) => c.id === cellPos) || null;
  if (
    !targetCell ||
    targetCell.isBuying === false ||
    targetCell.price === undefined
  )
    return console.log(
      `❌ Игрок ${player.player.name} не может купить клетку, ${targetCell?.name}`
    );

  const { cellState, cell } = getCellState(room, cellPos);

  if (cell)
    return console.log(
      `❌ Клетка ${targetCell.name} уже принадлежит ${player.player.name}`
    );

  if (player.jailed)
    return console.log(`⭕ Игрок ${player.player.name} в тюрьме!`);

  if (player.money < targetCell.price)
    return console.log(
      `❌ Игрок ${player.player.name} не имеет достаточно денег для покупки клетки ${targetCell.name}`
    );

  player.money -= targetCell.price;

  const newCellState: CellState = {
    id: cellPos,
    ownerId: playerId,
    ownerPosition: player.position || 0,
    currentRent: targetCell.rent,
    mortgaged: false,
    baseRent: targetCell.rent || 0,
    houses: 0,
    hotels: 0,
    housePrice: targetCell.housePrice || 50,
    hotelPrice: targetCell.hotelPrice || 150,
  };

  cellState.push(newCellState);

  room.cellState = cellState;

  // Сохраняем и уведомляем всех
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
