import { Server, Socket } from "socket.io";
import { saveRoomToDB } from "../../../services/gameService.js";
import {
  findRoomAndPlayer,
  getCellState,
  getUserData,
} from "../../utils/roomUtils.js";
import { nextTurn } from "../../utils/nextTurn.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import { cells, chanceCards } from "../../../data/ceil.js";
import { Ceil } from "../../../types/types.js";

export const handlePlayerMove = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.PLAYER_MOVE,
    safeSocket(async (data: any, callback: any) => {
      const { roomId } = data;
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const finalValue = dice1 + dice2;
      const { playerId, username } = getUserData(socket);

      const { room, player } = await findRoomAndPlayer(roomId, playerId);

      if (room.currentPayment) {
        return callback({
          success: false,
          message: "Нельзя перемещаться пока рента не оплачена",
        });
      }

      if (room.currentTurnPlayerId !== playerId) {
        console.log(`🎲 Сейчас не ваш ход!`);
        return callback({ success: false, message: "Сейчас не ваш ход!" });
      }

      if (player.jailed) {
        console.log(`🎲 Игрок ${playerId} в тюрьме!`);
        return callback({ success: false, message: "Игрок в тюрьме!" });
      }

      if (player.isFrozen) {
        console.log(`🎲 Игрок ${playerId} заморожен!`);
        return callback({
          success: false,
          message:
            "Вы не можете ходить, пока у вас долг! Заложите имущество или обанкротьтесь.",
        });
      }

      console.log(
        `🎲 Игрок ${username} бросил кубики: ${dice1} + ${dice2} = ${finalValue}`
      );
      socket
        .to(roomId)
        .emit(GAME_EVENTS.PLAYER_HAS_MOVED, playerId, dice1, dice2);

      // новое положение  с учётом цикла на 40 клеток
      const totalCells = cells.length;

      const newPosition = (player.positionOnBoard + finalValue) % totalCells;

      // если пересекли старт бонус
      if (player.positionOnBoard + finalValue >= totalCells) {
        player.money += 200;
        console.log(`💰 Игрок ${username} прошёл через старт и получил $200`);
      }

      player.positionOnBoard = newPosition;

      if (dice1 !== dice2) {
        room.currentTurnPlayerId = await nextTurn(room, playerId);
      }

      const currentCell = cells.find((c) => c.id === newPosition);
      switch (currentCell?.type.toUpperCase() as Ceil["type"]) {
        case "TAX":
          const taxAmount = Math.floor(player.money * 0.1) + 100;
          player.money -= taxAmount;
          console.log(`💸 Игрок ${username} заплатил налог $${taxAmount}`);
          break;
        case "CHANCE":
          const randomCard =
            chanceCards[Math.floor(Math.random() * chanceCards.length)];
          console.log(
            `🎴 Игрок ${username} взял карточку "Шанс" ${randomCard.text}`
          );

          room.pendingChance = {
            playerId,
            cardId: randomCard.id,
            timestamp: Date.now(),
            text: randomCard.text,
          };

          io.emit(GAME_EVENTS.MESSAGE, {
            playerId,
            text: randomCard.text,
            type: "CHANCE",
          });
          break;
        case "CORNER":
          if (currentCell?.id === 10 || currentCell?.id === 30) {
            player.jailed = true;
            console.log(`🚓 Игрок ${username} попал в тюрьму`);
            player.positionOnBoard = 10;
          }
          break;
      }

      const { cellState, cell } = getCellState(room, newPosition);

      if (
        cell &&
        cell.ownerId &&
        cell.ownerId !== playerId &&
        !cell.mortgaged
      ) {
        const rent = cell.currentRent || 0;
        const owner = room.players.find((p) => p.playerId === cell.ownerId);

        if (owner && !owner.jailed) {
          console.log(
            `💸 Игрок ${player.player.name} должен заплатить ${rent}$ игроку ${owner.playerId}`
          );
          const payment = {
            payerId: player.playerId,
            ownerId: owner.playerId,
            cellId: cell.id,
            rent,
          };
          room.currentPayment = payment;
          io.to(roomId).emit(GAME_EVENTS.RENT_REQUIRED, payment);
        }
      }
      await saveRoomToDB(room);

      io.to(roomId).emit(GAME_EVENTS.ROOM_UPDATE, room);

      if (callback)
        callback({
          success: true,
          value: finalValue,
          position: newPosition,
          dice1,
          dice2,
        });
    })
  );
};
