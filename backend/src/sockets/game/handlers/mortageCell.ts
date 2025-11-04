import { Server, Socket } from "socket.io";
import { saveRoomToDB } from "../../../services/gameService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import { findRoomAndPlayer, getCellState } from "../../utils/roomUtils.js";
import { cells } from "../../../data/ceil.js";
import { CurrentPaymentType } from "../../../types/types.js";

export const handleMortageCell = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.MORTAGE_CELL,
    safeSocket(async (data: any) => {
      const { roomId, cellId } = data;
      const playerId = socket.data.user.id;
      const origCell = cells.find((c) => c.id === cellId);

      const { room, player } = await findRoomAndPlayer(roomId, playerId);

      const { cellState, cell } = getCellState(room, cellId);
      const payment = room.currentPayment as unknown as CurrentPaymentType;
      if (!cell)
        return console.log(
          `Эта клетка никому не принадлежит или не покупаемая`
        );
      if (cell.ownerId !== playerId)
        return console.log(`⭕ Вы не можете заложить чужую клетку`);
      if (cell.mortgaged) return console.log(`⭕ Клетка уже заложена`);
      if (
        room.currentTurnPlayerId !== playerId &&
        (!room.currentPayment || payment.payerId !== playerId)
      )
        return console.log(`⭕ Сейчас не ваш ход`);

      const mortgageValue = Math.floor((origCell?.price || 0) / 2);
      player.money += mortgageValue;
      cell.mortgaged = true;
      console.log(
        `💰 Игрок ${playerId} заложил клетку ${cellId} и получил $${mortgageValue}`
      );

      if (player.money >= 0 && player.isFrozen) {
        player.isFrozen = false;
        io.to(room.id).emit(GAME_EVENTS.MESSAGE, {
          playerId,
          text: `✅ Игрок ${player.player.name} вышел из банкротства!`,
          type: "EVENT",
        });
      }

      room.cellState = cellState.map((c) => (c.id === cellId ? cell : c));
      await saveRoomToDB(room);
      io.emit(GAME_EVENTS.ROOM_UPDATE, room);
    })
  );
};
