import { Request, Response } from "express";
import {
  addPlayerToRoom,
  checkUserRoomExists,
  createRoom,
  getRoomById,
  getRoomList,
  removePlayerFromRoom,
} from "../services/gameService.js";
import { getPlayerById } from "../services/playerService.js";

export const getRooms = async (req: Request, res: Response) => {
  const rooms = await getRoomList();
  return res.json(rooms);
};

export const getRoom = async (req: Request, res: Response) => {
  const roomId = req.params.id;
  const userId = res.locals.user.id;
  const { password } = req.query;
  const user = await getPlayerById(userId);
  const room = await getRoomById(roomId);
  if (!room) {
    return res.status(404).json({ message: "Комната не найдена" });
  }
  if (room.isPrivate && password !== room.password) {
    return res.status(403).json({ message: "Неверный пароль" });
  }

  return res.json(room);
};

export const leavePlayerFromRoom = async (req: Request, res: Response) => {
  const roomId = req.params.id;
  const userId = res.locals.user.id;
  await removePlayerFromRoom(roomId, userId);
  console.log(`Пользователь ${userId} покинул комнату ${roomId}`);
  return res.json({ message: "Вы покинули комнату" });
};

export const addRoom = async (req: Request, res: Response) => {
  try {
    const { name, maxPlayer = 4, isPrivate = false, password } = req.body;
    const hostId = res.locals.user.id;
    console.log("Поступил запрос на создание команаты с параметрами:", {
      name,
      maxPlayer,
      isPrivate,
      password,
      hostId,
    });

    if (!name || !hostId) {
      return res
        .status(400)
        .json({ message: "Название комнаты и hostId обязательны" });
    }

    if (maxPlayer < 2 || maxPlayer > 6) {
      return res.status(400).json({
        message: "Максимальное количество игроков должно быть от 2 до 6",
      });
    }

    const host = await getPlayerById(hostId);
    if (!host) {
      return res.status(404).json({ message: "Хост не найден" });
    }

    const existingRoom = await checkUserRoomExists(hostId);
    if (existingRoom) {
      return res.status(400).json({
        message: "У вас уже есть активная комната",
        existingRoom: {
          id: existingRoom.id,
          name: existingRoom.name,
          players: existingRoom.players.length,
          maxPlayers: existingRoom.maxPlayer,
          status: existingRoom.status,
        },
      });
    }

    // Создаем комнату
    const room = await createRoom({
      name,
      hostId,
      maxPlayer,
      isPrivate,
      password: isPrivate ? password : null,
    });

    // Форматируем ответ
    const roomResponse = {
      id: room.id,
      name: room.name,
      playersLength: room.players.length,
      maxPlayer: room.maxPlayer,
      status: room.status,
      isPrivate: room.isPrivate,
      host: room.host,
      players: room.players.map((p) => ({
        ...p.player,
        position: p.position,
        isReady: p.isReady,
      })),
      createdAt: room.createdAt,
    };

    res.status(201).json({
      message: "Комната создана успешно",
      room: roomResponse,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ message: "Ошибка при создании комнаты" });
  }
};
