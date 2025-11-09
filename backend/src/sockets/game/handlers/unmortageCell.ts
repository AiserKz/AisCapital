import { Server, Socket } from "socket.io";
import { saveRoomToDB } from "../../../services/gameService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import {
  findRoomAndPlayer,
  getCellState,
  getUserData,
  sendRoomMessage,
} from "../../utils/roomUtils.js";
import { cells } from "../../../data/ceil.js";

export const handleUnMortageCell = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.UN_MORTAGE_CELL,
    safeSocket(async (data: any) => {
      const { roomId, cellId } = data;
      const { playerId, username } = getUserData(socket);
      const origCell = cells.find((c) => c.id === cellId);

      const { room, player } = await findRoomAndPlayer(roomId, playerId);

      const { cellState, cell } = getCellState(room, cellId);
      if (!cell)
        return console.log(
          `Эта клетка никому не принадлежит или не покупаемая`
        );
      if (cell.ownerId !== playerId)
        return console.log(`⭕ Вы не можете выкупить чужую клетку`);
      if (!cell.mortgaged) return console.log(`⭕ Клетка не заложена`);
      if (room.currentTurnPlayerId !== playerId)
        return console.log(`⭕ Сейчас не ваш ход`);

      const mortgageValue = Math.floor((origCell?.price || 0) / 2);
      const unmortgageCost = Math.floor(mortgageValue * 1.1);

      if (player.money < unmortgageCost)
        return console.log(
          `❌ У игрока ${username} недостаточно средств для выкупа (${unmortgageCost}$)`
        );

      player.money -= unmortgageCost;
      cell.mortgaged = false;

      console.log(
        `💵 Игрок ${username} выкупил клетку ${origCell?.name} за ${unmortgageCost}$`
      );
      sendRoomMessage(
        io,
        roomId,
        playerId,
        `${username} выкупил клетку ${origCell?.name} за ${unmortgageCost}$`,
        "EVENT"
      );

      room.cellState = cellState.map((c) => (c.id === cellId ? cell : c));
      await saveRoomToDB(room);
      io.emit(GAME_EVENTS.ROOM_UPDATE, room);
    })
  );
};
