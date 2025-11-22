import { Server, Socket } from "socket.io";
import { safeSocket } from "../../utils/safeSocket.js";
import { GAME_EVENTS } from "../events/gameEvents.js";
import { getUserData, findRoomAndPlayer } from "../../utils/roomUtils.js";
import {
    startAuction,
    placeBid,
    endAuction,
    getAuction,
} from "../services/auctionService.js";
import { cells } from "../../../data/ceil.js";

/**
 * Обработчик событий аукциона
 * @param io - Socket.IO сервер
 * @param socket - Сокет клиента
 */
export const handleAuction = async (io: Server, socket: Socket) => {
    // === НАЧАЛО АУКЦИОНА ===
    // Этот обработчик вызывается из pendingAction, когда игрок отказывается покупать
    socket.on(
        GAME_EVENTS.AUCTION_START,
        safeSocket(async (data: { roomId: string }) => {
            const { playerId, username } = getUserData(socket);
            const { room, player } = await findRoomAndPlayer(data.roomId, playerId);

            console.log(`🔨 Начинается аукцион для клетки ${player.positionOnBoard}`);

            const cell = cells.find((c) => c.id === player.positionOnBoard);

            if (!cell) {
                console.log(`⭕ Клетка ${player.positionOnBoard} не найдена`);
                return;
            }

            if (cell.isBuying === false) {
                console.log(`⭕ Клетка ${player.positionOnBoard} не доступна для аукциона`);
                return;
            }
            const cellState = room.cellState as any[];
            const existingCell = cellState.find((c: any) => c.id === player.positionOnBoard);
            if (existingCell && existingCell.ownerId) {
                console.log(`❌ Клетка ${existingCell.name} уже принадлежит другому игроку`);
                return;
            }

            const auction = startAuction(room, player.positionOnBoard);

            // Уведомляем всех игроков об аукционе
            io.to(data.roomId).emit(GAME_EVENTS.AUCTION_START, {
                auctionId: auction.id,
                cellId: auction.cellId,
                endsAt: auction.endsAt,
                currentBid: auction.currentBid
            });

            // Автоматически завершаем аукцион по таймауту
            setTimeout(async () => {
                const currentAuction = getAuction(auction.id);
                if (currentAuction && currentAuction.status === "active") {
                    await endAuction(io, room, auction.id);
                }
            }, auction.endsAt - auction.startedAt);
        })
    );

    // === СТАВКА НА АУКЦИОНЕ ===
    socket.on(
        GAME_EVENTS.AUCTION_BID,
        safeSocket(
            async (data: { roomId: string; auctionId: string; amount: number }) => {
                const { playerId, username } = getUserData(socket);
                const { room } = await findRoomAndPlayer(data.roomId, playerId);

                console.log(
                    `💰 ${username} делает ставку ${data.amount}$ на аукционе ${data.auctionId}`
                );

                const success = await placeBid(
                    io,
                    room,
                    data.auctionId,
                    playerId,
                    data.amount
                );

                if (!success) {
                    socket.emit(GAME_EVENTS.MESSAGE, {
                        playerId,
                        text: "⭕ Не удалось сделать ставку",
                        type: "EVENT",
                    });
                }
            }
        )
    );
};
