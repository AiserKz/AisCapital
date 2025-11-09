import { Server, Socket } from "socket.io";
import { saveRoomToDB } from "../../../services/gameService.js";
import { cells } from "../../../data/ceil.js";
import {
  findRoomAndPlayer,
  getCellState,
  getUserData,
  sendRoomMessage,
} from "../../utils/roomUtils.js";
import { CellState } from "../../../types/types.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";

export const handleBuyCell = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.BUY_CELL,
    safeSocket(async (data: any) => {
      const roomId = data.roomId;
      const { playerId, username } = getUserData(socket);
      const ceil = cells;

      const { room, player } = await findRoomAndPlayer(roomId, playerId);

      const cellPos = player.positionOnBoard;
      const targetCell = ceil.find((c) => c.id === cellPos) || null;
      if (
        !targetCell ||
        targetCell.isBuying === false ||
        targetCell.price === undefined
      )
        return console.log(
          `❌ Игрок ${username} не может купить клетку, ${targetCell?.name}`
        );

      const { cellState, cell } = getCellState(room, cellPos);

      if (cell)
        return console.log(
          `❌ Клетка ${targetCell.name} уже принадлежит ${username}`
        );
      if (player.money < targetCell.price)
        return console.log(
          `❌ Игрок ${username} не имеет достаточно денег для покупки клетки ${targetCell.name}`
        );

      player.money -= targetCell.price;

      const newCellState: CellState = {
        id: cellPos,
        ownerId: playerId,
        ownerPosition: player.position || 0,
        currentRent: targetCell.price ? targetCell.price * 0.1 : 10,
        mortgaged: false,
        baseRent: targetCell.rent || 0,
        houses: 0,
        hotels: 0,
        housePrice: targetCell.housePrice || 50,
        hotelPrice: targetCell.hotelPrice || 150,
      };

      cellState.push(newCellState);
      room.cellState = cellState;

      // Сохраняем и уведомляем всех
      await saveRoomToDB(room);
      console.log(`🏠 Игрок ${username} купил клетку ${targetCell.name}`);
      sendRoomMessage(
        io,
        roomId,
        playerId,
        `🏠 Игрок ${username} купил клетку ${targetCell.name}`,
        "EVENT"
      );
      io.to(roomId).emit(GAME_EVENTS.ROOM_UPDATE, room);
    })
  );
};
