import { Server, Socket } from "socket.io";
import {
  addPlayerToRoom,
  getRoomById,
  saveRoomToDB,
} from "../../../services/gameService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import {
  findRoomAndPlayer,
  getUserData,
  roomUpdate,
} from "../../utils/roomUtils.js";

export const handleJoinRoom = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.JOIN_ROOM,
    safeSocket(async (roomId: string) => {
      socket.join(roomId);
      const { playerId, username } = getUserData(socket);

      const room = await getRoomById(roomId);

      if (!room) return console.log(`⭕ Комната ${roomId} не найдена`);
      const player = room.players.find((p) => p.playerId === playerId);

      if (player) {
        console.log(
          `👤 Пользователь ${username} уже вошел в комнату ${room?.name}`
        );
        player.disconnected = false;
        await saveRoomToDB(room);
        await roomUpdate(io, roomId, room);
        return;
      }

      console.log(
        `👤 Пользователь ${username} присоединился к комнате ${room?.name}`
      );
      const playerInRoom = await addPlayerToRoom(roomId, playerId);
      io.to(roomId).emit(GAME_EVENTS.PLAYER_JOINED, playerInRoom);
    })
  );
};
