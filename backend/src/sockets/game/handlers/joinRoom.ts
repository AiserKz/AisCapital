import { Server, Socket } from "socket.io";
import {
  addPlayerToRoom,
  getRoomById,
  saveRoomToDB,
} from "../../../services/gameService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import { getUserData } from "../../utils/roomUtils.js";

export const handleJoinRoom = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.JOIN_ROOM,
    safeSocket(async (roomId: string) => {
      socket.join(roomId);
      if (!socket.data.user.id)
        return console.log(`👤 Пользователь не авторизован`);
      const { playerId, username } = getUserData(socket);

      const room = await getRoomById(roomId);

      const player = room?.players.find((p) => p.playerId === playerId);
      if (player) {
        player.disconnected = false;
        await saveRoomToDB(room);
        io.to(roomId).emit(GAME_EVENTS.ROOM_UPDATE, room);
        return;
      }

      console.log(
        `👤 Пользователь ${username} присоединился к комнате ${roomId}`
      );
      const playerInRoom = await addPlayerToRoom(roomId, playerId);
      io.to(roomId).emit(GAME_EVENTS.PLAYER_JOINED, playerInRoom);
    })
  );
};
