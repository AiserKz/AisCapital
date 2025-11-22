import { Server } from "socket.io";
import { RoomWithPlayers, CellState } from "../../../types/types.js";
import { saveRoomToDB } from "../../../services/gameService.js";
import { roomUpdate, sendRoomMessage } from "../../utils/roomUtils.js";
import { GAME_EVENTS } from "../events/gameEvents.js";

/**
 * Сервис для обмена между игроками
 * Позволяет игрокам обмениваться недвижимостью и деньгами
 */

/** Интерфейс предложения обмена */
export interface TradeOffer {
    /** ID предложения */
    id: string;
    /** ID инициатора обмена */
    fromPlayerId: string;
    /** ID получателя обмена */
    toPlayerId: string;
    /** Клетки, которые отдает инициатор */
    fromCells: number[];
    /** Деньги, которые отдает инициатор */
    fromMoney: number;
    /** Клетки, которые получает инициатор */
    toCells: number[];
    /** Деньги, которые получает инициатор */
    toMoney: number;
    /** Статус предложения */
    status: "pending" | "accepted" | "rejected" | "cancelled";
    /**  Время создания */
    createdAt: number;
}

/**
 * Создать предложение обмена
 * @param room - Комната с игроками
 * @param fromPlayerId - ID инициатора
 * @param toPlayerId - ID получателя
 * @param offer - Детали обмена
 * @returns Созданное предложение или null при ошибке
 */
export const createTradeOffer = (
    room: RoomWithPlayers,
    fromPlayerId: string,
    toPlayerId: string,
    offer: {
        fromCells: number[];
        fromMoney: number;
        toCells: number[];
        toMoney: number;
    }
): TradeOffer | null => {
    const fromPlayer = room.players.find((p) => p.playerId === fromPlayerId);
    const toPlayer = room.players.find((p) => p.playerId === toPlayerId);

    if (!fromPlayer || !toPlayer) {
        console.log("⭕ Один из игроков не найден");
        return null;
    }

    // Проверка: достаточно ли денег у инициатора
    if (fromPlayer.money < offer.fromMoney) {
        console.log("⭕ Недостаточно денег для обмена");
        return null;
    }

    // Проверка: достаточно ли денег у получателя
    if (toPlayer.money < offer.toMoney) {
        console.log("⭕ У другого игрока недостаточно денег");
        return null;
    }

    // Проверка: все ли клетки принадлежат соответствующим игрокам
    const cellState = (room.cellState || []) as CellState[];
    const fromCellsValid = offer.fromCells.every((cellId) => {
        const cell = cellState.find((c) => c.id === cellId);
        return cell?.ownerId === fromPlayerId && !cell.mortgaged;
    });

    const toCellsValid = offer.toCells.every((cellId) => {
        const cell = cellState.find((c) => c.id === cellId);
        return cell?.ownerId === toPlayerId && !cell.mortgaged;
    });

    if (!fromCellsValid) {
        console.log("⭕ Некоторые клетки не принадлежат инициатору или заложены");
        return null;
    }

    if (!toCellsValid) {
        console.log("⭕ Некоторые клетки не принадлежат получателю или заложены");
        return null;
    }

    const tradeOffer: TradeOffer = {
        id: `trade_${Date.now()}_${fromPlayerId}`,
        fromPlayerId,
        toPlayerId,
        ...offer,
        status: "pending",
        createdAt: Date.now(),
    };

    return tradeOffer;
};

/**
 * Принять предложение обмена и выполнить транзакцию
 * @param io - Socket.IO сервер
 * @param room - Комната с игроками
 * @param tradeOffer - Предложение обмена
 */
export const acceptTrade = async (
    io: Server,
    room: RoomWithPlayers,
    tradeOffer: TradeOffer
): Promise<void> => {
    const fromPlayer = room.players.find(
        (p) => p.playerId === tradeOffer.fromPlayerId
    );
    const toPlayer = room.players.find(
        (p) => p.playerId === tradeOffer.toPlayerId
    );

    if (!fromPlayer || !toPlayer) {
        console.log("⭕ Игроки не найдены");
        return;
    }

    // Переводим деньги
    fromPlayer.money -= tradeOffer.fromMoney;
    fromPlayer.money += tradeOffer.toMoney;
    toPlayer.money -= tradeOffer.toMoney;
    toPlayer.money += tradeOffer.fromMoney;

    // Переводим клетки
    const cellState = (room.cellState || []) as CellState[];
    tradeOffer.fromCells.forEach((cellId) => {
        const cell = cellState.find((c) => c.id === cellId);
        if (cell) {
            cell.ownerId = tradeOffer.toPlayerId;
            // Сбрасываем дома и отели при передаче
            cell.houses = 0;
            cell.hotels = 0;
        }
    });

    tradeOffer.toCells.forEach((cellId) => {
        const cell = cellState.find((c) => c.id === cellId);
        if (cell) {
            cell.ownerId = tradeOffer.fromPlayerId;
            // Сбрасываем дома и отели при передаче
            cell.houses = 0;
            cell.hotels = 0;
        }
    });

    tradeOffer.status = "accepted";

    console.log(
        `✅ Обмен между ${fromPlayer.player.name} и ${toPlayer.player.name} завершен`
    );

    sendRoomMessage(
        io,
        room.id,
        tradeOffer.fromPlayerId,
        `🤝 Обмен между ${fromPlayer.player.name} и ${toPlayer.player.name} успешно завершен!`,
        "EVENT"
    );

    await saveRoomToDB(room);
    roomUpdate(io, room.id, room);
};

/**
 * Отклонить предложение обмена
 * @param io - Socket.IO сервер
 * @param room - Комната с игроками
 * @param tradeOffer - Предложение обмена
 */
export const rejectTrade = async (
    io: Server,
    room: RoomWithPlayers,
    tradeOffer: TradeOffer
): Promise<void> => {
    tradeOffer.status = "rejected";

    const fromPlayer = room.players.find(
        (p

        ) => p.playerId === tradeOffer.fromPlayerId
    );
    const toPlayer = room.players.find(
        (p) => p.playerId === tradeOffer.toPlayerId
    );

    if (fromPlayer && toPlayer) {
        sendRoomMessage(
            io,
            room.id,
            tradeOffer.toPlayerId,
            `❌ ${toPlayer.player.name} отклонил обмен от ${fromPlayer.player.name}`,
            "EVENT"
        );
    }

    await saveRoomToDB(room);
    roomUpdate(io, room.id, room);
};

/**
 * Отменить предложение обмена (инициатором)
 * @param io - Socket.IO сервер
 * @param room - Комната с игроками
 * @param tradeOffer - Предложение обмена
 */
export const cancelTrade = async (
    io: Server,
    room: RoomWithPlayers,
    tradeOffer: TradeOffer
): Promise<void> => {
    tradeOffer.status = "cancelled";

    const fromPlayer = room.players.find(
        (p) => p.playerId === tradeOffer.fromPlayerId
    );

    if (fromPlayer) {
        sendRoomMessage(
            io,
            room.id,
            tradeOffer.fromPlayerId,
            `🚫 ${fromPlayer.player.name} отменил предложение обмена`,
            "EVENT"
        );
    }

    await saveRoomToDB(room);
    roomUpdate(io, room.id, room);
};
