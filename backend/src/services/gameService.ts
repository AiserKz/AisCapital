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

export const getRoomById = async (id: string) => {
  return prisma.gameRoom.findFirst({
    where: { id },
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
          position: 0,
          isReady: true,
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

export const addPlayerToRoom = async (roomId: string, playerId: string) => {
  const room = await getRoomById(roomId);
  if (!room) throw new Error("Комната не найдена");

  if (room.players.length >= room.maxPlayer) throw new Error("Комната полна");

  const existingPlayer = room.players.find(
    (player) => player.playerId === playerId
  );
  if (existingPlayer) throw new Error("Игрок уже в комнате");

  const takenPositions = room.players
    .map((p) => p.position)
    .filter((pos) => pos !== null)
    .sort((a, b) => a - b);

  let newPosition = 1;
  for (let i = 1; i < room.maxPlayer; i++) {
    if (!takenPositions.includes(i)) {
      newPosition = i;
      break;
    }
  }

  console.log("🧩 Назначена позиция:", newPosition);

  return prisma.playerInRoom.create({
    data: {
      roomId,
      playerId,
      position: newPosition,
      isReady: false,
    },
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
  });
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

export const updatePlayerInRoom = async (
  roomId: string,
  playerId: string,
  isReady: boolean
) => {
  return prisma.playerInRoom.update({
    where: {
      playerId_roomId: {
        playerId,
        roomId,
      },
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
