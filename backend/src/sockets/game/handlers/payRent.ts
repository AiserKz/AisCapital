import { Server, Socket } from "socket.io";
import {
  findRoomAndPlayer,
  getCurrentPayments,
  getUserData,
  roomUpdate,
  sendRoomMessage,
} from "../../utils/roomUtils.js";
import { processRentPayment } from "../../../services/paymentService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import { checkBankruptcy } from "../../utils/econmy.js";

export const handlePayRent = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.PAY_RENT,
    safeSocket(async (data: any, callback: any) => {
      const { roomId } = data;
      const { playerId, username } = getUserData(socket);
      const { room } = await findRoomAndPlayer(roomId, playerId);

      const { payerId, ownerId, cellId, rent } = await getCurrentPayments(
        room,
        callback
      );

      if (playerId !== payerId) {
        return callback?.({
          success: false,
          message: "Вы не должны оплачивать этот счёт",
        });
      }

      const payer = room.players.find((p) => p.playerId === payerId);
      const owner = room.players.find((p) => p.playerId === ownerId);

      if (!payer || !owner) {
        return callback?.({ success: false, message: "Игрок не найден" });
      }

      if (payer.money < rent) {
        return callback?.({ success: false, message: "Недостаточно денег" });
      }

      await processRentPayment(room, payer, owner, rent);
      await checkBankruptcy(io, room, payerId);
      if (payer.money >= 0 && payer.isFrozen) {
        payer.isFrozen = false;
        io.to(room.id).emit(GAME_EVENTS.MESSAGE, {
          playerId,
          text: `✅ Игрок ${payer.player.name} вышел из банкротства!`,
          type: "EVENT",
        });
      }

      roomUpdate(io, roomId, room);
      io.to(roomId).emit(GAME_EVENTS.PAYMENT_COMPLETE, {
        payerId,
        ownerId,
        cellId,
        rent,
      });

      sendRoomMessage(
        io,
        roomId,
        playerId,
        `💵 ${payer.player.name} заплатил ${rent}$ игроку ${owner.player.name}`,
        "EVENT"
      );
      console.log(
        `💵 ${payer.player.name} заплатил ${rent}$ ${owner.player.name} за клетку ${cellId}`
      );

      callback?.({ success: true });
    })
  );
};
