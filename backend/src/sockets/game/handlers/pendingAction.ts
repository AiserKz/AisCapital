import { Server, Socket } from "socket.io";
import { saveRoomToDB } from "../../../services/gameService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import {
  findRoomAndPlayer,
  getUserData,
  isBuyOrPayAction,
  roomUpdate,
} from "../../utils/roomUtils.js";
import { nextTurn } from "../../utils/nextTurn.js";
import { buyCell } from "../../utils/econmy.js";

export const handlePendingAction = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.PENDING_ACTION,
    safeSocket(async ({ roomId, buy }: { roomId: string; buy: boolean }) => {
      const { playerId, username } = getUserData(socket);
      const { room, player } = await findRoomAndPlayer(roomId, playerId);

      if (!player.pendingAction) {
        return console.log(`❌ Пользователь ${username} не ожидает действия`);
      }
      if (!isBuyOrPayAction(player.pendingAction)) {
        return console.log(
          `❌ Пользователь ${username} не ожидает действия BUY_OR_PAY`
        );
      }

      if (buy) {
        await buyCell(io, roomId, playerId);
        return;
      } else {
        console.log(`👤 Пользователь ${username} завершил ход`);
        if (room.comboTurn === 0) {
          player.pendingAction = null;
          room.currentTurnPlayerId = await nextTurn(room, playerId);
        }
      }

      io.to(roomId).emit(GAME_EVENTS.TURN_ENDED, { playerId });
      await saveRoomToDB(room);
      roomUpdate(io, roomId, room);
    })
  );
};
