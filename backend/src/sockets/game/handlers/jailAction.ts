import { Server, Socket } from "socket.io";
import { saveRoomToDB } from "../../../services/gameService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import { findRoomAndPlayer } from "../../utils/roomUtils.js";
import { nextTurn } from "../../utils/nextTurn.js";

export const handleJailAction = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.JAIL_ACTION,
    safeSocket(async (data: any) => {
      const { roomId, action } = data;
      const playerId = socket.data.user.id;

      const { room, player } = await findRoomAndPlayer(roomId, playerId);

      if (!player.jailed)
        return console.log(`⭕ Игрок ${playerId} не в тюрьме!`);

      switch (action) {
        case "roll":
          const dice1 = Math.floor(Math.random() * 6) + 1;
          const dice2 = Math.floor(Math.random() * 6) + 1;
          console.log(`🎲 Игрок ${playerId} бросил кубики: ${dice1}|${dice2}`);
          socket
            .to(roomId)
            .emit(GAME_EVENTS.PLAYER_HAS_MOVED, playerId, dice1, dice2);
          if (dice1 === dice2) {
            player.jailed = false;
            player.jailTurns = 0;
            console.log(
              `✅ Игрок ${playerId} выбросил дубль и вышел из тюрьмы!`
            );
          } else {
            player.jailTurns++;
            console.log(`🚫 Не дубль. Ход пропущен (${player.jailTurns}/3)`);
          }
          break;

        case "pay":
          if (player.money < 100) {
            return console.log(`❌ Игрок ${playerId} не может заплатить $100`);
          }
          player.money -= 100;
          player.jailed = false;
          player.jailTurns = 0;
          console.log(`💵 Игрок ${playerId} заплатил $100 и вышел из тюрьмы`);
          break;
        case "wait":
          player.jailTurns++;
          console.log(
            `🕓 Игрок ${playerId} пропускает ход (${player.jailTurns}/3)`
          );
          break;

        default:
          return console.log(`⭕ Неизвестная команда ${action}!`);
      }

      if (player.jailTurns >= 3) {
        player.jailed = false;
        player.jailTurns = 0;
        console.log(`⏰ Игрок ${playerId} отсидел своё и вышел`);
      } else if (player.jailed) {
        room.currentTurnPlayerId = await nextTurn(room, playerId);
      }

      await saveRoomToDB(room);
      io.to(roomId).emit(GAME_EVENTS.ROOM_UPDATE, room);

      console.log(`👤 Игрок ${playerId} действие в тюрьме: ${action}`);
    })
  );
};
