import type { CellState, PlayerInRoomType } from "../../types/types";

export default function useCellActions(
  cellState: CellState[],
  player: PlayerInRoomType,
  isTurn: boolean,
  isBuying?: boolean
) {
  const currentCell = cellState?.find((c) => c.id === player.positionOnBoard);
  const canBuy = !currentCell?.ownerId && isBuying && isTurn; // 🟢 можно купить, если клетка не куплена она покупаемая и сейчас твой ход

  const canPayRent =
    !!currentCell?.ownerId && currentCell.ownerId !== player.playerId && isTurn; // 🟠 можно оплатить аренду, если куплена другим

  const isOwnerByPlayer = currentCell?.ownerId === player.playerId; // 🔵 владелец ли этой клетки
  return {
    currentCell,
    canBuy,
    canPayRent,
    isOwnerByPlayer,
  };
}
