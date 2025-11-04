import { Server, Socket } from "socket.io";
import {
  getRoomById,
  removePlayerFromRoom,
  saveRoomToDB,
} from "../../../services/gameService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import { getUserData } from "../../utils/roomUtils.js";

export const handleLeaveRoom = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.LEAVE_ROOM,
    safeSocket(async (roomId: string) => {
      socket.leave(roomId);
      const { playerId, username } = getUserData(socket);

      console.log(`👤 Пользователь ${username} покинул комнату ${roomId}`);
      if (!roomId || !playerId) return;

      const room = await getRoomById(roomId);
      if (!room) return;

      if (room.status === "WAITING") {
        await removePlayerFromRoom(roomId, playerId);
        io.to(roomId).emit(GAME_EVENTS.PLAYER_LEFT, playerId);
      } else if (room.status === "IN_PROGRESS" || room.status === "STARTING") {
        const player = room.players.find((p) => p.playerId === playerId);
        if (player) {
          console.log(`👤 Пользователь ${username} покинул комнату ${roomId}`);
          player.disconnected = true;
          await saveRoomToDB(room);
          io.to(roomId).emit(GAME_EVENTS.ROOM_UPDATE, room);
        }
      }
    })
  );
};
