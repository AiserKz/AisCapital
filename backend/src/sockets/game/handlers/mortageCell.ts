import { Server, Socket } from "socket.io";
import { saveRoomToDB } from "../../../services/gameService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import {
  findRoomAndPlayer,
  getCellState,
  getUserData,
  roomUpdate,
  sendRoomMessage,
} from "../../utils/roomUtils.js";
import { cells } from "../../../data/ceil.js";
import { CurrentPaymentType } from "../../../types/types.js";
import { checkBankruptcy } from "../../utils/econmy.js";

export const handleMortageCell = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.MORTAGE_CELL,
    safeSocket(async (data: any) => {
      const { roomId, cellId } = data;
      const { playerId, username } = getUserData(socket);

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

      if (player.jailed) return console.log(`⭕ Игрок ${username} в тюрьме!`);

      const mortgageValue = Math.floor((origCell?.price || 0) / 2);
      player.money += mortgageValue;
      cell.mortgaged = true;
      console.log(
        `💰 Игрок ${username} заложил клетку ${origCell?.name} и получил $${mortgageValue}`
      );
      sendRoomMessage(
        io,
        room.id,
        playerId,
        `💰 Игрок ${username} заложил клетку ${origCell?.name} и получил $${mortgageValue}`,
        "EVENT"
      );

      if (player.money >= 0 && player.isFrozen) {
        player.isFrozen = false;
        sendRoomMessage(
          io,
          room.id,
          playerId,
          `✅ Игрок ${player.player.name} вышел из банкротства!`,
          "EVENT"
        );
      } else if (player.money < 0 && player.isFrozen) {
        checkBankruptcy(io, room, playerId);
      }

      room.cellState = cellState.map((c) => (c.id === cellId ? cell : c));
      await saveRoomToDB(room);
      roomUpdate(io, room.id, room);
    })
  );
};
