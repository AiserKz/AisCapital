import { PlayerInRoom } from "@prisma/client";
import { chanceCards } from "../../data/ceil.js";
import { PendingChanceType, RoomWithPlayers } from "../../types/types.js";

export const useChanceCard = async (
  pending: PendingChanceType,
  room: RoomWithPlayers,
  player: PlayerInRoom
) => {
  const card = chanceCards.find((c) => c.id === pending.cardId);
  if (!card) return;

  card.effect(player, room);
  room.pendingChance = null;
  console.log(`✅ Игрок ${player.playerId} подтвердил карточку "${card.text}"`);
};
