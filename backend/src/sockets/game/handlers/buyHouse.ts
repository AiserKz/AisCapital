import { Server, Socket } from "socket.io";
import {
  addPlayerToRoom,
  getRoomById,
  saveRoomToDB,
} from "../../../services/gameService.js";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import {
  calculateRent,
  findRoomAndPlayer,
  getCellState,
  roomUpdate,
} from "../../utils/roomUtils.js";

export const handleBuyHouse = async (io: Server, socket: Socket) => {
  socket.on(
    GAME_EVENTS.BUY_HOUSE,
    safeSocket(
      async (data: {
        roomId: string;
        cellId: number;
        type: "house" | "hotel";
      }) => {
        const { roomId, cellId, type } = data;
        const playerId = socket.data?.user?.id;

        const { room, player } = await findRoomAndPlayer(roomId, playerId);
        const { cellState, cell } = await getCellState(room, cellId);

        if (!cell) return console.log(`Эта клетка никому не принадлежит`);
        if (cell.ownerId !== playerId)
          return console.log(`⭕ Вы не можете купить дом/отель в чужую клетку`);
        if (type === "house" && cell.houses >= 4)
          return console.log(
            `⭕ Клетка уже имеет максимальное количество домов`
          );
        if (type === "hotel" && cell.hotels >= 3)
          return console.log(
            `⭕ Клетка уже имеет максимальное количество отелей`
          );
        if (type === "hotel" && cell.houses < 4)
          return console.log(`⭕ Нужно 4 дома прежде чем купить отель`);
        if (room.currentTurnPlayerId !== playerId)
          return console.log(`⭕ Сейчас не ваш ход`);

        const houseCost = type === "house" ? cell.housePrice : cell.hotelPrice;
        if (player.money < (houseCost || 50))
          return console.log(`⭕ Недостаточно денег для покупки дома/отеля`);

        player.money -= houseCost || 50;
        if (type === "house") cell.houses++;
        else cell.hotels++;

        cell.currentRent = calculateRent(cell);

        const updateCellState = cellState.map((c) =>
          c.id === cellId ? cell : c
        );
        room.cellState = updateCellState;

        await saveRoomToDB(room);
        console.log("Пользователь покупает дом/отель", playerId, cellId, type);

        roomUpdate(io, roomId, room);
      }
    )
  );
};
