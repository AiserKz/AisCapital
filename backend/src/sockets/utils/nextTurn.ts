import { PlayerInRoom } from "@prisma/client";

export const nextTurn = async (room: any, currentId: string) => {
  const players = room.players;
  const currentIndex = players.findIndex(
    (p: PlayerInRoom) => p.playerId === currentId
  );

  let nextIndex = (currentIndex + 1) % players.length;
  while (players[nextIndex].bankrupt) {
    nextIndex = (nextIndex + 1) % players.length;
    if (nextIndex === currentIndex) {
      return null;
    }
  }
  return players[nextIndex].playerId;
};
