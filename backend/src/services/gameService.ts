import { disconnect } from "process";
import { prisma } from "../prisma.js";

export const getRoomList = async () => {
  return prisma.gameRoom.findMany({
    include: {
      players: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              avatar: true,
              level: true,
            },
          },
        },
      },
      host: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
};

export const getActiveRooms = async () => {
  return prisma.gameRoom.findMany({
    where: {
      status: {
        in: ["WAITING", "STARTING", "IN_PROGRESS"],
      },
    },
    include: {
      players: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              avatar: true,
              level: true,
            },
          },
        },
      },
      host: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
};

export const getRoomById = async (id: string) => {
  return prisma.gameRoom.findFirst({
    where: { id: id },
    include: {
      players: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              avatar: true,
              level: true,
            },
          },
        },
      },
      host: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
};

export const createRoom = async (data: {
  name: string;
  hostId: string;
  maxPlayer: number;
  isPrivate: boolean;
  password?: string | null;
}) => {
  return prisma.gameRoom.create({
    data: {
      name: data.name,
      maxPlayer: data.maxPlayer,
      isPrivate: data.isPrivate,
      password: data.password,
      hostId: data.hostId,
      players: {
        create: {
          playerId: data.hostId,
          position: 1,
          isReady: false,
        },
      },
    },
    include: {
      players: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              avatar: true,
              level: true,
            },
          },
        },
      },
      host: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
};

export const deleteRoom = async (roomId: string) => {
  return prisma.gameRoom.delete({ where: { id: roomId } });
};

export const playerExistsInRoom = async (roomId: string, playerId: string) => {
  return prisma.playerInRoom.findFirst({
    where: {
      playerId,
      roomId,
    },
  });
};

export const addPlayerToRoom = async (roomId: string, playerId: string) => {
  const room = await getRoomById(roomId);
  if (!room) throw new Error("Комната не найдена");

  if (room.players.length >= room.maxPlayer) throw new Error("Комната полна");

  // Получаем все комнаты игрока
  const playerRooms = await prisma.playerInRoom.findMany({
    where: { playerId },
    include: { room: true },
  });

  // Блокируем, если есть активная игра
  const activeGame = playerRooms.find((pr) => pr.room.status === "IN_PROGRESS");
  if (activeGame) {
    throw new Error(
      "Вы не можете присоединиться к новой комнате, пока игра в другой комнате не завершена"
    );
  }

  // Удаляем старые записи в завершённых комнатах
  const finishedRoomIds = playerRooms
    .filter((pr) => pr.room.status === "FINISHED")
    .map((pr) => pr.roomId);

  if (finishedRoomIds.length > 0) {
    await prisma.playerInRoom.deleteMany({
      where: {
        playerId,
        roomId: { in: finishedRoomIds },
      },
    });
  }

  // Проверяем, что игрок ещё не в этой комнате
  const existingPlayer = room.players.find((p) => p.playerId === playerId);
  const existsDB = await playerExistsInRoom(roomId, playerId);
  if (existingPlayer || existsDB) throw new Error("Игрок уже в комнате");

  // Назначаем новую позицию
  const takenPositions = room.players
    .map((p) => p.position)
    .filter((pos) => pos !== null)
    .sort((a, b) => a - b);

  let newPosition = 1;
  for (let i = 1; i <= room.maxPlayer; i++) {
    if (!takenPositions.includes(i)) {
      newPosition = i;
      break;
    }
  }

  console.log("🧩 Назначена позиция:", newPosition);

  // Upsert с включением player через relation напрямую
  const playerInRoom = await prisma.playerInRoom.upsert({
    where: { playerId_roomId: { playerId, roomId } }, // должен существовать compound PK
    update: { position: newPosition, isReady: false },
    create: { roomId, playerId, position: newPosition, isReady: false },
    include: {
      player: true,
    },
  });

  return playerInRoom;
};

export const removePlayerFromRoom = async (
  roomId: string,
  playerId: string
) => {
  return prisma.playerInRoom.delete({
    where: {
      playerId_roomId: {
        playerId,
        roomId,
      },
    },
  });
};

export const archiveRoomData = async (roomId: string) => {
  const players = await prisma.playerInRoom.findMany({ where: { roomId } });
  for (const p of players) {
    await prisma.playerGameHistory.create({
      data: {
        playerId: p.playerId,
        roomId: p.roomId,
        finalMoney: p.money,
        finalElo: 1200,
        result: p.bankrupt ? "lose" : "win",
        joinedAt: p.joinedAt,
        leftAt: new Date(),
      },
    });
  }
  await prisma.playerInRoom.deleteMany({ where: { roomId } });
};

export const updatePlayerInRoom = async (
  roomId: string,
  playerId: string,
  isReady: boolean
) => {
  return prisma.playerInRoom.updateMany({
    where: {
      playerId,
      roomId,
    },
    data: {
      isReady,
    },
  });
};

export const checkUserRoomExists = async (userId: string) => {
  return prisma.gameRoom.findFirst({
    where: {
      OR: [
        { hostId: userId },
        {
          players: {
            some: {
              playerId: userId,
            },
          },
        },
      ],
      status: {
        in: ["WAITING", "STARTING"],
      },
    },
    include: {
      players: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      host: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
};

export const saveRoomToDB = async (room: any) => {
  return prisma.gameRoom.update({
    where: { id: room.id },
    data: {
      currentTurnPlayerId: room.currentTurnPlayerId,
      status: room.status,
      cellState: room.cellState,
      currentPayment: room.currentPayment,
      pendingChance: room.pendingChance,
      winnerId: room.winnerId,
      comboTurn: room.comboTurn,
      winner: room.winner,
      startedAt: room.startedAt,
      finishedAt: room.finishedAt,
      activeTrade: room.activeTrade,
      players: {
        updateMany: room.players.map((p: any) => ({
          where: { playerId: p.playerId },
          data: {
            positionOnBoard: p.positionOnBoard,
            money: p.money,
            bankrupt: p.bankrupt,
            jailed: p.jailed,
            properties: p.properties,
            disconnected: p.disconnected,
            jailTurns: p.jailTurns,
            isFrozen: p.isFrozen,
            isReady: p.isReady,
            pendingAction: p.pendingAction,
            skipRentTurns: p.skipRentTurns,
          },
        })),
      },
      updatedAt: new Date(),
    },
    include: {
      players: {
        include: { player: true },
      },
      host: true,
    },
  });
};
