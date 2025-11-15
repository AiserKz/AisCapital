import { Server, Socket } from "socket.io";
import { saveRoomToDB } from "../../../services/gameService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import {
  findRoomAndPlayer,
  getUserData,
  roomUpdate,
} from "../../utils/roomUtils.js";

export const handleIsReady = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.IS_READY,
    safeSocket(async (roomId: string) => {
      const { playerId, username } = getUserData(socket);
      const { room, player } = await findRoomAndPlayer(roomId, playerId);

      if (player.isReady) {
        player.isReady = false;
      } else {
        player.isReady = true;
      }

      if (
        room.players.length === room.maxPlayer &&
        room.players.every((p) => p.isReady)
      ) {
        room.status = "STARTING";
        room.currentTurnPlayerId = room.players[0].playerId;
        console.log(`👤 Начинаем игру в комнате ${room?.name}`);
      }

      await saveRoomToDB(room);
      roomUpdate(io, roomId, room);
    })
  );
};
