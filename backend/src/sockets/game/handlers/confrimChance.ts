import { Server, Socket } from "socket.io";
import { saveRoomToDB } from "../../../services/gameService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import {
  findRoomAndPlayer,
  getUserData,
  roomUpdate,
} from "../../utils/roomUtils.js";
import { PendingChanceType } from "../../../types/types.js";
import { chanceCards } from "../../../data/ceil.js";
import { checkBankruptcy } from "../../utils/econmy.js";
import { useChanceCard } from "../../utils/chanceUtils.js";

export const handleConfrimChance = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.CONFIRM_CHANCE,
    safeSocket(async (data: { roomId: string }) => {
      const roomId = data.roomId;
      const { playerId, username } = getUserData(socket);
      const { room, player } = await findRoomAndPlayer(roomId, playerId);

      const pending = (room.pendingChance ?? null) as PendingChanceType | null;

      if (!pending || pending.playerId !== playerId)
        return console.log(
          `❌ Игрок ${username} не может подтвердить карточку`
        );

      await useChanceCard(pending, room, player);
      if (player.money < 0) await checkBankruptcy(io, room, playerId, 0);
      await saveRoomToDB(room);
      roomUpdate(io, roomId, room);
    })
  );
};
