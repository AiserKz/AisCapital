import { Server, Socket } from "socket.io";
import { saveRoomToDB } from "../../../services/gameService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import {
  findRoomAndPlayer,
  getUserData,
  roomUpdate,
  sendRoomMessage,
} from "../../utils/roomUtils.js";
import { nextTurn } from "../../utils/nextTurn.js";
import { RoomWithPlayers } from "../../../types/types.js";

export const handleJailAction = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.JAIL_ACTION,
    safeSocket(async (data: any) => {
      const { roomId, action } = data;
      const { playerId, username } = getUserData(socket);

      const { room, player } = await findRoomAndPlayer(roomId, playerId);

      if (!player.jailed)
        return console.log(`⭕ Игрок ${username} не в тюрьме!`);

      //
      // === 1. ОПЛАТА 100 ===
      //
      if (action === "pay") {
        if (player.money < 100) {
          return console.log(`❌ ${username} не может заплатить $100`);
        }

        player.money -= 100;
        player.jailed = false;
        player.jailTurns = 0;

        sendRoomMessage(
          io,
          roomId,
          playerId,
          `💵 ${username} оплатил $100 и вышел из тюрьмы`,
          "EVENT"
        );

        // игрок после оплаты ходит в этот же ход
        breakTurn(io, roomId, room, playerId);
        return;
      }

      //
      // === 2. БРОСОК КОСТЕЙ ===
      //
      if (action === "roll") {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;

        io.to(roomId).emit(GAME_EVENTS.PLAYER_HAS_MOVED, dice1, dice2);

        // дубль выход + ход
        if (dice1 === dice2) {
          player.jailed = false;
          player.jailTurns = 0;

          sendRoomMessage(
            io,
            roomId,
            playerId,
            `🎲 ${username} выбросил дубль и вышел из тюрьмы!`,
            "EVENT"
          );

          breakTurn(io, roomId, room, playerId);
          return;
        }

        // не дубль → попытка
        player.jailTurns++;

        sendRoomMessage(
          io,
          roomId,
          playerId,
          `🚫 ${username} не выбросил дубль (${player.jailTurns}/3)`,
          "EVENT"
        );
      }

      //
      // === 3. ПРОПУСК ХОДА (WAIT) ===
      //
      if (action === "wait") {
        player.jailTurns++;

        sendRoomMessage(
          io,
          roomId,
          playerId,
          `🕓 ${username} пропускает ход (${player.jailTurns}/3)`,
          "EVENT"
        );
      }

      //
      // === 4. Доходил до 3 выходит автоматически
      //
      if (player.jailTurns >= 3) {
        player.jailed = false;
        player.jailTurns = 0;

        sendRoomMessage(
          io,
          roomId,
          playerId,
          `⏰ ${username} отсидел 3 хода и вышел из тюрьмы`,
          "EVENT"
        );

        // ход не делает
        room.currentTurnPlayerId = await nextTurn(room, playerId);

        await saveRoomToDB(room);
        roomUpdate(io, roomId, room);
        return;
      }

      //
      // всё ещё сидит → просто передаём ход
      //
      if (player.jailed) {
        room.currentTurnPlayerId = await nextTurn(room, playerId);
      }

      await saveRoomToDB(room);
      roomUpdate(io, roomId, room);
    })
  );
};

function breakTurn(
  io: Server,
  roomId: string,
  room: RoomWithPlayers,
  playerId: string
) {
  room.currentTurnPlayerId = playerId;

  saveRoomToDB(room);
  roomUpdate(io, roomId, room);
}
