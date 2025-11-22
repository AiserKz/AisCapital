import { Server, Socket } from "socket.io";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import { getUserData, findRoomAndPlayer } from "../../utils/roomUtils.js";
import {
    createTradeOffer,
    acceptTrade,
    rejectTrade,
    cancelTrade,
    TradeOffer,
} from "../services/tradeService.js";

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
                toPlayerId: string;
                fromCells: number[];
                fromMoney: number;
                toCells: number[];
                toMoney: number;
            }) => {
                const { playerId, username } = getUserData(socket);
                const { room } = await findRoomAndPlayer(data.roomId, playerId);

                console.log(`🤝 ${username} предлагает обмен игроку ${data.toPlayerId}`);

                const tradeOffer = createTradeOffer(room, playerId, data.toPlayerId, {
                    fromCells: data.fromCells,
                    fromMoney: data.fromMoney,
                    toCells: data.toCells,
                    toMoney: data.toMoney,
                });

                if (!tradeOffer) {
                    socket.emit(GAME_EVENTS.MESSAGE, {
                        playerId,
                        text: "⭕ Не удалось создать предложение обмена",
                        type: "EVENT",
                    });
                    return;
                }

                // Устанавливаем активный обмен в комнате
                // if (!room.activeTrade) {
                //     (room as any).activeTrade = tradeOffer;
                // }

                // Отправляем предложение получателю
                io.to(data.roomId).emit(GAME_EVENTS.TRADE_UPDATED, tradeOffer);

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
        safeSocket(async (data: { roomId: string; tradeId: string }) => {
            const { playerId, username } = getUserData(socket);
            const { room } = await findRoomAndPlayer(data.roomId, playerId);

            const activeTrade = (room as any).activeTrade as TradeOffer | undefined;

            if (!activeTrade || activeTrade.id !== data.tradeId) {
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
            (room as any).activeTrade = null;

            io.to(data.roomId).emit(GAME_EVENTS.TRADE_UPDATED, null);
        })
    );

    // === ОТКЛОНЕНИЕ ОБМЕНА ===
    socket.on(
        GAME_EVENTS.TRADE_REJECT,
        safeSocket(async (data: { roomId: string; tradeId: string }) => {
            const { playerId, username } = getUserData(socket);
            const { room } = await findRoomAndPlayer(data.roomId, playerId);

            const activeTrade = (room as any).activeTrade as TradeOffer | undefined;

            if (!activeTrade || activeTrade.id !== data.tradeId) {
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
            (room as any).activeTrade = null;

            io.to(data.roomId).emit(GAME_EVENTS.TRADE_UPDATED, null);
        })
    );

    // === ОТМЕНА ОБМЕНА (ИНИЦИАТОРОМ) ===
    socket.on(
        GAME_EVENTS.TRADE_CANCEL,
        safeSocket(async (data: { roomId: string; tradeId: string }) => {
            const { playerId, username } = getUserData(socket);
            const { room } = await findRoomAndPlayer(data.roomId, playerId);

            const activeTrade = (room as any).activeTrade as TradeOffer | undefined;

            if (!activeTrade || activeTrade.id !== data.tradeId) {
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
            (room as any).activeTrade = null;

            io.to(data.roomId).emit(GAME_EVENTS.TRADE_UPDATED, null);
        })
    );
};
