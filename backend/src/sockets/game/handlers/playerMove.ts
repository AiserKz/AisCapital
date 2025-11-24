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
import {
  PENDING_ACTION_TIMEOUT,
  START_BONUS,
  TAX_BASE,
  TAX_PERCENTAGE,
  MAX_COMBO_FOR_JAIL,
  TOTAL_CELLS,
  CORNER_CELLS,
} from "../../../config/gameConstants.js";
import { calculateMonopolyRent } from "../services/monopolyService.js";

const timers: Record<string, NodeJS.Timeout> = {};

export const handlePlayerMove = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.PLAYER_MOVE,
    safeSocket(async (data: any) => {
      const { roomId } = data;

      // === БРОСОК КОСТЕЙ ===
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const totalMove = dice1 + dice2;
      const { playerId, username } = getUserData(socket);

      const { room, player } = await findRoomAndPlayer(roomId, playerId);

      // === ПРОВЕРКА СТАТУСА ИГРЫ ===
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

      if (room.pendingChance) {
        console.log(`🎲 Игрок ${username} ожидает карточку!`);
        return;
      }

      if (room.activeTrade) {
        console.log(`🎲 Игрок ${username} ожидает обмен!`);
        return;
      }

      console.log(
        `🎲 Игрок ${username} бросил кубики: ${dice1} + ${dice2} = ${totalMove}`
      );

      // === ПРОВЕРКА НА ТРОЙНОЙ ДУБЛЬ (АВТОМАТИЧЕСКОЕ ПОПАДАНИЕ В ТЮРЬМУ) ===
      if (room.comboTurn >= MAX_COMBO_FOR_JAIL) {
        room.comboTurn = 0;
        player.jailed = true;
        player.positionOnBoard = CORNER_CELLS.JAIL;
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

      // === РАСЧЕТ НОВОГО ПОЛОЖЕНИЯ НА ДОСКЕ ===
      // Новое положение с учётом цикла на 40 клеток
      const newPosition = (player.positionOnBoard + totalMove) % TOTAL_CELLS;

      // === БОНУС ЗА ПРОХОЖДЕНИЕ СТАРТА ===
      // Если игрок прошел через клетку «Старт» (id=0), начисляем бонус
      if (player.positionOnBoard + totalMove >= TOTAL_CELLS) {
        player.money += START_BONUS;
        console.log(
          `💰 Игрок ${username} прошёл через старт и получил $${START_BONUS}`
        );
        sendRoomMessage(
          io,
          roomId,
          playerId,
          `💰 Игрок ${username} прошёл через старт и получил $${START_BONUS}`,
          "EVENT"
        );
      }

      player.positionOnBoard = newPosition;

      // === ОБРАБОТКА ДУБЛЯ ===
      // Если кости одинаковые (дубль), игрок ходит еще раз
      if (dice1 !== dice2) {
        sendRoomMessage(
          io,
          roomId,
          playerId,
          `🎲 Игрок ${username} бросил кубики: \n ${dice1} + ${dice2} = ${totalMove}`,
          "EVENT"
        );
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

      // === ОБРАБОТКА ТИПА КЛЕТКИ ===
      const currentCell = cells.find((c) => c.id === newPosition);
      switch (currentCell?.type.toUpperCase() as Ceil["type"]) {
        // === КЛЕТКА НАЛОГА ===
        case "TAX":
          // Налог = базовая сумма + процент от денег игрока
          const taxAmount =
            Math.floor(player.money * TAX_PERCENTAGE) + TAX_BASE;
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
        // === КЛЕТКА ШАНСА ===
        case "CHANCE":
          // Выбираем случайную карточку шанса
          const randomCard =
            chanceCards[Math.floor(Math.random() * chanceCards.length)];
          console.log(
            `🎴 Игрок ${username} взял карточку "Шанс" ${randomCard.text}`
          );

          // Сохраняем карточку в ожидании подтверждения от клиента
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
        // === УГЛОВАЯ КЛЕТКА ===
        case "CORNER":
          // Клетка "В тюрьму" (id=30)
          if (currentCell?.id === CORNER_CELLS.GO_TO_JAIL) {
            if (player.hasJailFreeCard) {
              // Игрок использует карту "Выход из тюрьмы"
              player.hasJailFreeCard = false;

              console.log(
                `🚓 Игрок ${username} попал в тюрьму, но у него есть карта выпуска!`
              );
              sendRoomMessage(
                io,
                roomId,
                playerId,
                `🚓 Игрок ${username} попал в тюрьму, но у него есть карта выпуска!`,
                "EVENT"
              );
            } else {
              // Отправляем игрока в тюрьму
              player.jailed = true;
              player.positionOnBoard = CORNER_CELLS.JAIL;
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

      // === ТАЙМЕР НА ПРИНЯТИЕ РЕШЕНИЯ (КУПИТЬ ИЛИ ПРОПУСТИТЬ) ===
      // Не запускаем таймер для клетки "В тюрьму"
      if (currentCell && currentCell?.id !== CORNER_CELLS.GO_TO_JAIL) {
        const timerKey = `${roomId}-${playerId}`;
        if (timers[timerKey]) {
          clearTimeout(timers[timerKey]);
          delete timers[timerKey];
        }

        console.log(
          "Игрок попал на клетку, запускаю таймер на принятие решения"
        );
        player.pendingAction = {
          type: "BUY_OR_PAY",
          cellId: currentCell.id,
          expiresAt: Date.now() + PENDING_ACTION_TIMEOUT,
        };
        io.to(roomId).emit(GAME_EVENTS.PENDING_ACTION, {
          playerId,
          action: player.pendingAction,
        });

        // Таймер автоматически завершает ход, если игрок не принял решение
        timers[timerKey] = setTimeout(async () => {
          // Получаем актуальные данные игрока из комнаты на момент срабатывания таймера
          const { room, player } = await findRoomAndPlayer(roomId, playerId);
          if (isBuyOrPayAction(player.pendingAction)) {
            console.log(
              `💸 У игрока ${username} закончилось время на принятие решения`
            );
            player.pendingAction = null;

            // Передаем ход следующему игроку (если не был дубль)
            if (dice1 !== dice2 && !player.isFrozen) {
              room.currentTurnPlayerId = await nextTurn(room, playerId);
            }

            io.to(roomId).emit(GAME_EVENTS.TURN_ENDED, { playerId });
            await saveRoomToDB(room);
            roomUpdate(io, roomId, room);
          }
          delete timers[timerKey];
        }, PENDING_ACTION_TIMEOUT);
      } else {
        room.currentTurnPlayerId = await nextTurn(room, playerId);
      }

      // === ПРОВЕРКА НА ОПЛАТУ РЕНТЫ ===
      const { cellState, cell } = getCellState(room, newPosition);

      // Если клетка принадлежит другому игроку и не заложена
      if (
        cell &&
        cell.ownerId &&
        cell.ownerId !== playerId &&
        !cell.mortgaged
      ) {
        // Проверка на карточку "Пропуск ренты"
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

        // === РАСЧЕТ РЕНТЫ С УЧЕТОМ МОНОПОЛИИ ===
        // Используем новый сервис для расчета ренты с бонусом за монополию
        const baseRent = cell.currentRent || cell.baseRent || 0;
        const rent = calculateMonopolyRent(cell, cellState, baseRent);
        const owner = room.players.find((p) => p.playerId === cell.ownerId);

        // Владелец получает ренту только если не в тюрьме
        if (owner && !owner.jailed) {
          console.log(
            `💸 Игрок ${player.player.name} должен заплатить ${rent}$ игроку ${owner.player.name}`
          );
          if (player.money < rent) {
            console.log(
              `❌ Игрок ${player.player.name} не имеет достаточно денег для оплаты ренты`
            );

            const updateRoom = await checkBankruptcy(io, room, playerId, rent);

            // Обновляем ссылку на игрока, так как состояние могло измениться
            const updatedPlayer = updateRoom?.players.find(
              (p) => p.playerId === playerId
            );

            // Если игрок обанкротился  дальше выполнять ничего нельзя
            if (updatedPlayer?.bankrupt) {
              console.log(
                `💀 Игрок ${updatedPlayer.player.name} обанкротился, платеж не требуется`
              );
              sendRoomMessage(
                io,
                roomId,
                playerId,
                `💀 Игрок ${updatedPlayer.player.name} обанкротился и больше не может платить ренту`,
                "EVENT"
              );

              await saveRoomToDB(room);
              roomUpdate(io, roomId, room);
              return; // ← выходим, не создаём счет и не отправляем RENT_REQUIRED
            }

            // Если игрок все ещё жив — отправляем запрос на оплату
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
