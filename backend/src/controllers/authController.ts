import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  createPlayer,
  getPlayerById,
  getPlayerByName,
} from "../services/playerService.js";
import { getToken, setCookie, verifyToken } from "../utils/jwt.js";
import {
  createAuthResponse,
  validateAuthData,
  verifyPassword,
} from "../utils/authHelpers.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    validateAuthData(req.body, ["name", "password", "email"]);

    const existingUser = await getPlayerByName(name);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким именем уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createPlayer({
      email,
      name,
      password: hashedPassword,
    });

    const tokens = await getToken(user.id, user.name);
    await setCookie(tokens.accessToken, tokens.refreshToken, res);

    res.json(createAuthResponse(user, tokens));
  } catch (error: any) {
    const status = error.message.includes("обязательно") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    validateAuthData(req.body, ["name", "password"]);

    const { name, password } = req.body;

    const user = await getPlayerByName(name);
    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }
    console.log(user);
    await verifyPassword(password, user.password);

    const tokens = await getToken(user.id, user.name);
    await setCookie(tokens.accessToken, tokens.refreshToken, res);

    res.json(createAuthResponse(user, tokens));
  } catch (error: any) {
    const status = error.message.includes("Неверный пароль") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    if (!userId) {
      console.log("Пользователь не авторизован");
      return res.status(401).json({ message: "Пользователь не авторизован" });
    }
    const user = await getPlayerById(userId);
    if (!user) return res.status(404).json({ message: "Игрок не найден" });
    res.json(user);
  } catch (err) {
    console.error("Ошибка профиля:", err);
    res.status(500).json({ error: String(err) });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    console.log("Запрос обновления токена", req.cookies);

    let refreshToken = null;

    // Пробуем получить refresh token из куки
    if (req.cookies?.refreshToken) {
      refreshToken = req.cookies.refreshToken;
    }

    // Если нет в куках, пробуем из заголовка
    if (!refreshToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        refreshToken = authHeader.split(" ")[1];
      }
    }

    // Если токен не найден
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    // Верифицируем refresh token
    const decoded = await verifyToken(refreshToken, "refresh");
    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Проверяем существование пользователя (опционально)
    const user = await getPlayerById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Генерируем новую пару токенов
    const { accessToken, refreshToken: newRefreshToken } = await getToken(
      decoded.id,
      decoded.name
    );

    // Устанавливаем новые куки
    res = await setCookie(accessToken, newRefreshToken, res);

    res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
