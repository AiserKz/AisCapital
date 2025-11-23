import { Server, Socket } from "socket.io";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import {
  getUserData,
  findRoomAndPlayer,
  roomUpdate,
} from "../../utils/roomUtils.js";
import {
  createTradeOffer,
  acceptTrade,
  rejectTrade,
  cancelTrade,
  TradeOffer,
} from "../services/tradeService.js";
import { saveRoomToDB } from "../../../services/gameService.js";

/**
 * Обработчик событий обмена между игроками
 * @param io - Socket.IO сервер
 * @param socket - Сокет клиента
 */
export const handleTrade = async (io: Server, socket: Socket) => {
  // === СОЗДАНИЕ ПРЕДЛОЖЕНИЯ ОБМЕНА ===
  socket.on(
    GAME_EVENTS.TRADE_OFFER,
    safeSocket(
      async (data: {
        roomId: string;
        offer: {
          toPlayerId: string;
          fromCells: number[];
          fromMoney: number;
          toCells: number[];
          toMoney: number;
        };
      }) => {
        const { playerId, username } = getUserData(socket);
        const { room } = await findRoomAndPlayer(data.roomId, playerId);

        console.log(
          `🤝 ${username} предлагает обмен игроку `,
          data.offer.toPlayerId
        );

        const tradeOffer = createTradeOffer(
          room,
          playerId,
          data.offer.toPlayerId,
          {
            fromCells: data.offer.fromCells,
            fromMoney: data.offer.fromMoney,
            toCells: data.offer.toCells,
            toMoney: data.offer.toMoney,
          }
        );

        if (!tradeOffer) {
          socket.emit(GAME_EVENTS.MESSAGE, {
            playerId,
            text: "⭕ Не удалось создать предложение обмена",
            type: "EVENT",
          });
          return;
        }

        // Устанавливаем активный обмен в комнате
        if (!room.activeTrade) {
          (room as any).activeTrade = tradeOffer;
        }

        saveRoomToDB(room);
        await roomUpdate(io, data.roomId, room);

        socket.emit(GAME_EVENTS.MESSAGE, {
          playerId,
          text: `✅ Предложение обмена отправлено`,
          type: "EVENT",
        });
      }
    )
  );

  // === ПРИНЯТИЕ ОБМЕНА ===
  socket.on(
    GAME_EVENTS.TRADE_ACCEPT,
    safeSocket(async (data: { roomId: string }) => {
      const { playerId, username } = getUserData(socket);
      const { room } = await findRoomAndPlayer(data.roomId, playerId);

      const activeTrade = room.activeTrade as unknown as TradeOffer | undefined;
      console.log(activeTrade);
      if (!activeTrade) {
        socket.emit(GAME_EVENTS.MESSAGE, {
          playerId,
          text: "⭕ Обмен не найден",
          type: "EVENT",
        });
        return;
      }

      if (activeTrade.toPlayerId !== playerId) {
        socket.emit(GAME_EVENTS.MESSAGE, {
          playerId,
          text: "⭕ Этот обмен не для вас",
          type: "EVENT",
        });
        return;
      }

      console.log(`✅ ${username} принял предложение обмена`);

      await acceptTrade(io, room, activeTrade);

      // Очищаем активный обмен
      room.activeTrade = null;
      await saveRoomToDB(room);
      await roomUpdate(io, data.roomId, room);
    })
  );

  // === ОТКЛОНЕНИЕ ОБМЕНА ===
  socket.on(
    GAME_EVENTS.TRADE_REJECT,
    safeSocket(async (data: { roomId: string }) => {
      const { playerId, username } = getUserData(socket);
      const { room } = await findRoomAndPlayer(data.roomId, playerId);

      const activeTrade = room.activeTrade as unknown as TradeOffer | undefined;

      if (!activeTrade) {
        socket.emit(GAME_EVENTS.MESSAGE, {
          playerId,
          text: "⭕ Обмен не найден",
          type: "EVENT",
        });
        return;
      }

      if (activeTrade.toPlayerId !== playerId) {
        socket.emit(GAME_EVENTS.MESSAGE, {
          playerId,
          text: "⭕ Этот обмен не для вас",
          type: "EVENT",
        });
        return;
      }

      console.log(`❌ ${username} отклонил предложение обмена`);

      await rejectTrade(io, room, activeTrade);

      // Очищаем активный обмен
      room.activeTrade = null;
      await saveRoomToDB(room);
      await roomUpdate(io, data.roomId, room);
    })
  );

  // === ОТМЕНА ОБМЕНА (ИНИЦИАТОРОМ) ===
  socket.on(
    GAME_EVENTS.TRADE_CANCEL,
    safeSocket(async (data: { roomId: string }) => {
      const { playerId, username } = getUserData(socket);
      const { room } = await findRoomAndPlayer(data.roomId, playerId);

      const activeTrade = room.activeTrade as unknown as TradeOffer | undefined;

      if (!activeTrade) {
        socket.emit(GAME_EVENTS.MESSAGE, {
          playerId,
          text: "⭕ Обмен не найден",
          type: "EVENT",
        });
        return;
      }

      if (activeTrade.fromPlayerId !== playerId) {
        socket.emit(GAME_EVENTS.MESSAGE, {
          playerId,
          text: "⭕ Вы не можете отменить чужой обмен",
          type: "EVENT",
        });
        return;
      }

      console.log(`🚫 ${username} отменил предложение обмена`);

      await cancelTrade(io, room, activeTrade);

      // Очищаем активный обмен
      room.activeTrade = null;
      await saveRoomToDB(room);
      await roomUpdate(io, data.roomId, room);

      io.to(data.roomId).emit(GAME_EVENTS.TRADE_UPDATED, null);
    })
  );
};
