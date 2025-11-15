import { Server, Socket } from "socket.io";
import { saveRoomToDB } from "../../../services/gameService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import { findRoomAndPlayer, roomUpdate } from "../../utils/roomUtils.js";
import { PendingChanceType } from "../../../types/types.js";
import { chanceCards } from "../../../data/ceil.js";
import { checkBankruptcy } from "../../utils/econmy.js";

export const handleConfrimChance = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.CONFIRM_CHANCE,
    safeSocket(async (data: { roomId: string }) => {
      const userid = socket.data.user.id;
      const roomId = data.roomId;
      const { room, player } = await findRoomAndPlayer(roomId, userid);

      const pending = (room.pendingChance ?? null) as PendingChanceType | null;

      if (!pending || pending.playerId !== userid)
        return console.log(`❌ Игрок ${userid} не может подтвердить карточку`);

      const card = chanceCards.find((c) => c.id === pending.cardId);
      if (!card) return;

      card.effect(player);
      room.pendingChance = null;
      if (player.money < 0) await checkBankruptcy(io, room, userid);

      await saveRoomToDB(room);
      roomUpdate(io, roomId, room);
      console.log(`✅ Игрок ${userid} подтвердил карточку "${card.text}"`);
    })
  );
};
