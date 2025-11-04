import { saveRoomToDB } from "./gameService.js";

export const processRentPayment = async (
  room: any,
  payer: any,
  owner: any,
  rent: number
) => {
  payer.money -= rent;
  owner.money += rent;

  room.players = room.players.map((p: any) =>
    p.playerId === payer.playerId
      ? payer
      : p.playerId === owner.playerId
      ? owner
      : p
  );

  room.currentPayment = null;
  return saveRoomToDB(room);
};
