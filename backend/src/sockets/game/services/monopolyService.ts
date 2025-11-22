import { CellState, RoomWithPlayers } from "../../../types/types.js";
import { cells } from "../../../data/ceil.js";
import {
    COLOR_GROUPS,
    MONOPOLY_RENT_MULTIPLIER,
    MAX_HOUSES_PER_CELL,
    RAILROAD_CELLS,
} from "../../../config/gameConstants.js";

/**
 * Сервис для работы с монополиями
 * Проверяет наличие монополий у игроков и рассчитывает бонусы
 */

/**
 * Получить цвет клетки по её ID
 * @param cellId - ID клетки на доске
 * @returns Цвет группы или null
 */
export const getCellColor = (cellId: number): string | null => {
    const cell = cells.find((c) => c.id === cellId);
    return cell?.color || null;
};

/**
 * Проверяет, владеет ли игрок всеми клетками одного цвета (монополия)
 * @param playerId - ID игрока
 * @param color - Цвет группы для проверки
 * @param cellState - Состояние всех клеток на доске
 * @returns true если у игрока монополия этого цвета
 */
export const hasMonopoly = (
    playerId: string,
    color: string,
    cellState: CellState[]
): boolean => {
    const cellsInGroup = COLOR_GROUPS[color];
    if (!cellsInGroup) return false;

    // Проверяем, что все клетки этого цвета принадлежат игроку
    const ownedCells = cellsInGroup.filter((cellId) => {
        const cell = cellState.find((c) => c.id === cellId);
        return cell?.ownerId === playerId;
    });

    return ownedCells.length === cellsInGroup.length;
};

/**
 * Получить все монополии игрока
 * @param playerId - ID игрока
 * @param cellState - Состояние всех клеток
 * @returns Массив цветов, которыми владеет игрок полностью
 */
export const getPlayerMonopolies = (
    playerId: string,
    cellState: CellState[]
): string[] => {
    const monopolies: string[] = [];

    for (const color in COLOR_GROUPS) {
        // Пропускаем железные дороги и коммунальные услуги
        if (color === "railroad" || color === "utility") continue;

        if (hasMonopoly(playerId, color, cellState)) {
            monopolies.push(color);
        }
    }

    return monopolies;
};

/**
 * Рассчитывает ренту с учетом монополии
 * @param cell - Клетка для расчета
 * @param cellState - Все клетки на доске
 * @param baseRent - Базовая рента клетки
 * @returns Итоговая рента с учетом монополии
 */
export const calculateMonopolyRent = (
    cell: CellState,
    cellState: CellState[],
    baseRent: number
): number => {
    if (!cell.ownerId) return baseRent;

    const cellColor = getCellColor(cell.id);
    if (!cellColor) return baseRent;

    // Если у владельца монополия и нет домов/отелей, удваиваем ренту
    if (hasMonopoly(cell.ownerId, cellColor, cellState)) {
        if (cell.houses === 0 && cell.hotels === 0) {
            return baseRent * MONOPOLY_RENT_MULTIPLIER;
        }
    }

    return baseRent;
};

/**
 * Проверяет, может ли игрок строить дома на клетке
 * @param playerId - ID игрока
 * @param cellId - ID клетки
 * @param cellState - Состояние всех клеток
 * @returns true если игрок может строить
 */
export const canBuildHouse = (
    playerId: string,
    cellId: number,
    cellState: CellState[]
): boolean => {
    // Нельзя строить на железных дорогах
    if (RAILROAD_CELLS.includes(cellId)) return false;

    const cell = cellState.find((c) => c.id === cellId);
    if (!cell || cell.ownerId !== playerId) return false;

    const cellColor = getCellColor(cellId);
    if (!cellColor) return false;

    // Должна быть монополия
    if (!hasMonopoly(playerId, cellColor, cellState)) return false;

    // Проверяем равномерность застройки
    return canBuildEvenly(playerId, cellId, cellColor, cellState);
};

/**
 * Проверяет равномерность застройки в группе
 * Нельзя строить дом, если на других клетках группы меньше домов
 * @param playerId - ID игрока
 * @param targetCellId - Клетка, на которой хотят построить
 * @param color - Цвет группы
 * @param cellState - Состояние клеток
 * @returns true если можно строить
 */
const canBuildEvenly = (
    playerId: string,
    targetCellId: number,
    color: string,
    cellState: CellState[]
): boolean => {
    const cellsInGroup = COLOR_GROUPS[color];
    if (!cellsInGroup) return false;

    const targetCell = cellState.find((c) => c.id === targetCellId);
    if (!targetCell) return false;

    // Получаем все клетки игрока в этой группе
    const ownedCellsInGroup = cellsInGroup
        .map((id) => cellState.find((c) => c.id === id))
        .filter((c) => c && c.ownerId === playerId);

    // Находим минимальное количество домов в группе
    const minHouses = Math.min(...ownedCellsInGroup.map((c) => c!.houses));

    // Можно строить только если на целевой клетке не больше домов, чем минимум
    return targetCell.houses <= minHouses;
};

/**
 * Проверяет, заложены ли все клетки в группе (кроме целевой)
 * Используется при выкупе из залога
 * @param cellId - ID клетки
 * @param cellState - Состояние клеток
 * @returns true если другие клетки группы заложены
 */
export const areOtherCellsMortgaged = (
    cellId: number,
    cellState: CellState[]
): boolean => {
    const cellColor = getCellColor(cellId);
    if (!cellColor) return false;

    const cellsInGroup = COLOR_GROUPS[cellColor];
    if (!cellsInGroup) return false;

    const otherCells = cellsInGroup.filter((id) => id !== cellId);
    const otherCellStates = otherCells
        .map((id) => cellState.find((c) => c.id === id))
        .filter((c) => c !== undefined);

    return otherCellStates.every((c) => c!.mortgaged === true);
};
