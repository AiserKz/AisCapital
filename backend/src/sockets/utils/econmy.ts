import { Server } from "socket.io";
import { RoomWithPlayers } from "../../types/types.js";
import { getCellState, roomUpdate, sendRoomMessage } from "./roomUtils.js";
import { GAME_EVENTS } from "../game/events/gameEvents.js";
import { saveRoomToDB } from "../../services/gameService.js";
import { prisma } from "../../prisma.js";

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
