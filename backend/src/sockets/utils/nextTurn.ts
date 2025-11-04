export const nextTurn = async (room: any, currentId: string) => {
    const i = room.players.findIndex((p: any) => p.playerId === currentId);
    const next = (i + 1) % room.players.length;
    return room.players[next].playerId;
}