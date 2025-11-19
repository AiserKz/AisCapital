import { Server, Socket } from "socket.io";
import { saveRoomToDB } from "../../../services/gameService.js";
import {
  findRoomAndPlayer,
  getCellState,
  getUserData,
  isBuyOrPayAction,
  roomUpdate,
  sendRoomMessage,
} from "../../utils/roomUtils.js";
import { nextTurn } from "../../utils/nextTurn.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import { cells, chanceCards } from "../../../data/ceil.js";
import { Ceil } from "../../../types/types.js";
import { checkBankruptcy } from "../../utils/econmy.js";

const timers: Record<string, NodeJS.Timeout> = {};

export const handlePlayerMove = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.PLAYER_MOVE,
    safeSocket(async (data: any) => {
      const { roomId } = data;
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const totalMove = dice1 + dice2;
      const { playerId, username } = getUserData(socket);

      const { room, player } = await findRoomAndPlayer(roomId, playerId);

      if (room.status === "WAITING") {
        console.log(
          `🎲 Игра в комнате ${room.name} еще не началась или же уже окончена!`
        );
        sendRoomMessage(
          io,
          roomId,
          playerId,
          "Игра в комнате еще не началась или же уже окончена!",
          "EVENT"
        );
        return;
      }

      if (room.currentPayment) {
        console.log(`🎲 Нельзя перемещаться пока рента не оплачена`);
        return;
      }
      if (room.status === "FINISHED") {
        console.log(`🎲 Игра в комнате ${room.name} уже окончена!`);
        return;
      }

      if (room.currentTurnPlayerId !== playerId) {
        console.log(`🎲 Сейчас не ваш ход!`);
        return;
      }

      if (player.jailed) {
        console.log(`🎲 Игрок ${username} в тюрьме!`);
        return;
      }

      if (player.isFrozen) {
        console.log(`🎲 Игрок ${username} заморожен!`);
        return;
      }

      if (player.pendingAction && room.comboTurn === 0) {
        console.log(
          `Игрок ${username} должен завершить действие прежде чем бросать кубики`
        );
        return;
      }

      console.log(
        `🎲 Игрок ${username} бросил кубики: ${dice1} + ${dice2} = ${totalMove}`
      );

      if (room.comboTurn >= 3) {
        room.comboTurn = 0;
        player.jailed = true;
        player.positionOnBoard = 10;
        sendRoomMessage(
          io,
          roomId,
          playerId,
          `🚓 Игрок ${username} получил тройной дубль ${dice1} + ${dice2}, и попал в тюрьму`,
          "EVENT"
        );
        room.currentTurnPlayerId = await nextTurn(room, playerId);
        await saveRoomToDB(room);

        await roomUpdate(io, roomId, room);
        return;
      }

      io.to(roomId).emit(GAME_EVENTS.PLAYER_HAS_MOVED, dice1, dice2);

      // новое положение  с учётом цикла на 40 клеток
      const totalCells = cells.length;

      const newPosition = (player.positionOnBoard + totalMove) % totalCells;

      // если пересекли старт бонус
      if (player.positionOnBoard + totalMove >= totalCells) {
        player.money += 200;
        console.log(`💰 Игрок ${username} прошёл через старт и получил $200`);
        sendRoomMessage(
          io,
          roomId,
          playerId,
          `💰 Игрок ${username} прошёл через старт и получил $200`,
          "EVENT"
        );
      }

      player.positionOnBoard = newPosition;

      if (dice1 !== dice2) {
        sendRoomMessage(
          io,
          roomId,
          playerId,
          `🎲 Игрок ${username} бросил кубики: \n ${dice1} + ${dice2} = ${totalMove}`,
          "EVENT"
        );
        // room.currentTurnPlayerId = await nextTurn(room, playerId);
        room.comboTurn = 0;
      } else {
        room.comboTurn += 1;
        sendRoomMessage(
          io,
          roomId,
          playerId,
          `🎲 Игрок ${username} получил дубль ${dice1} + ${dice2}, и ходит ещё раз`,
          "EVENT"
        );
      }

      const currentCell = cells.find((c) => c.id === newPosition);
      switch (currentCell?.type.toUpperCase() as Ceil["type"]) {
        case "TAX":
          const taxAmount = Math.floor(player.money * 0.1) + 50;
          player.money -= taxAmount;
          console.log(`💸 Игрок ${username} заплатил налог $${taxAmount}`);
          sendRoomMessage(
            io,
            roomId,
            playerId,
            `💸 Игрок ${username} заплатил налог $${taxAmount}`,
            "EVENT"
          );
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
            text: `${username} ${randomCard.text}`,
          };

          io.emit(GAME_EVENTS.MESSAGE, {
            playerId,
            text: randomCard.text,
            type: "CHANCE",
          });
          break;
        case "CORNER":
          if (currentCell?.id === 30) {
            if (player.hasJailFreeCard) {
              player.hasJailFreeCard = false;

              console.log(
                `🚓 Игрок ${username} попал в тюрьму, но у него есть карты выпуска!`
              );
              sendRoomMessage(
                io,
                roomId,
                playerId,
                `🚓 Игрок ${username} попал в тюрьму, но у него есть карты выпуска!`,
                "EVENT"
              );
            } else {
              player.jailed = true;
              player.positionOnBoard = 10;
              console.log(`🚓 Игрок ${username} попал в тюрьму`);
              sendRoomMessage(
                io,
                roomId,
                playerId,
                `🚓 Игрок ${username} попал в тюрьму`,
                "EVENT"
              );
            }
          }
          break;
      }

      if (currentCell && currentCell?.id !== 30) {
        const timerKey = `${roomId}-${playerId}`;
        if (timers[timerKey]) {
          clearTimeout(timers[timerKey]);
          delete timers[timerKey];
        }

        const TIMER = 30000;
        console.log("Игрок попал на клетку запускаю таймер");
        player.pendingAction = {
          type: "BUY_OR_PAY",
          cellId: currentCell.id,
          expiresAt: Date.now() + TIMER,
        };
        io.to(roomId).emit(GAME_EVENTS.PENDING_ACTION, {
          playerId,
          action: player.pendingAction,
        });

        timers[timerKey] = setTimeout(async () => {
          // получаем актуальные данные игрока из комнаты на момент срабатывания таймера
          const { room, player } = await findRoomAndPlayer(roomId, playerId);
          if (isBuyOrPayAction(player.pendingAction)) {
            console.log(`💸 У игрока ${username} закончилось время`);
            player.pendingAction = null;

            if (dice1 !== dice2 && !player.isFrozen) {
              room.currentTurnPlayerId = await nextTurn(room, playerId);
            }

            io.to(roomId).emit(GAME_EVENTS.TURN_ENDED, { playerId });
            await saveRoomToDB(room);
            roomUpdate(io, roomId, room);
          }
          delete timers[timerKey];
        }, TIMER);
      } else {
        room.currentTurnPlayerId = await nextTurn(room, playerId);
      }

      const { cellState, cell } = getCellState(room, newPosition);

      if (
        cell &&
        cell.ownerId &&
        cell.ownerId !== playerId &&
        !cell.mortgaged
      ) {
        if (player.skipRentTurns && player.skipRentTurns > 0) {
          player.skipRentTurns -= 1;
          console.log(
            `💤 Игрок ${player.player.name} пропускает оплату ренты, осталось ${player.skipRentTurns} ходов`
          );
          sendRoomMessage(
            io,
            roomId,
            playerId,
            `💤 Игрок ${player.player.name} пропускает оплату ренты, осталось ${player.skipRentTurns} ходов`,
            "EVENT"
          );
          await saveRoomToDB(room);
          roomUpdate(io, roomId, room);
          return;
        }

        const rent = cell.currentRent || 0;
        const owner = room.players.find((p) => p.playerId === cell.ownerId);

        if (owner && !owner.jailed) {
          console.log(
            `💸 Игрок ${player.player.name} должен заплатить ${rent}$ игроку ${owner.playerId}`
          );
          if (player.money < rent) {
            console.log(
              `❌ Игрок ${player.player.name} не имеет достаточно денег для оплаты ренты`
            );
            await checkBankruptcy(io, room, playerId, rent);
            sendRoomMessage(
              io,
              roomId,
              playerId,
              `❌ Игрок ${player.player.name} не имеет достаточно денег для оплаты ренты`,
              "EVENT"
            );
            const payment = {
              payerId: player.playerId,
              ownerId: owner.playerId,
              cellId: cell.id,
              rent,
            };
            room.currentPayment = payment;
            io.to(roomId).emit(GAME_EVENTS.RENT_REQUIRED, payment);
          } else {
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
      }
      await saveRoomToDB(room);

      roomUpdate(io, roomId, room);
    })
  );
};
