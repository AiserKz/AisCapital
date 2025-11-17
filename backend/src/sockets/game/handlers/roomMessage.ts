import { Server, Socket } from "socket.io";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import { getUserData } from "../../utils/roomUtils.js";

export const handleBuyHouse = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.ROOM_MESSAGE,
    safeSocket(async ({ roomId, text }: { roomId: string; text: string }) => {
      const { username, playerId } = getUserData(socket);

      const msg = {
        playerId,
        username,
        text,
        time: Date.now(),
      };

      io.to(roomId).emit(GAME_EVENTS.ROOM_MESSAGE, msg);
    })
  );
};
