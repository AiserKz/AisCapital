import { COLOR_GROUPS, RAILROAD_CELLS } from "../config/gameConstants";
import { cells } from "../test/data";
import type { CellState } from "../types/types";


export const getCellColor = (cellId: number): string | null => {
    const cell = cells.find((c) => c.id === cellId);
    return cell?.color || null;
};

export const hasMonopoly = (
    playerId: string,
    color: string,
    cellState: CellState[]
): boolean => {
    const cellsInGroup = COLOR_GROUPS[color];
    if (!cellsInGroup) return false;

    const ownedCells = cellsInGroup.filter((cellId: number) => {
        const cell = cellState.find((c) => c.id === cellId);
        return cell?.ownerId === playerId;
    });

    return ownedCells.length === cellsInGroup.length;
};


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