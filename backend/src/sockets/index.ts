import { Server } from "socket.io";
import { gameSocket } from "./gameSocket.js";
import { verifyToken } from "../utils/jwt.js";

export const registerSocketHandler = (io: Server) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Токен не предоставлен"));

    try {
      const payload = await verifyToken(token, "access");
      socket.data.user = payload;
      next();
    } catch (err) {
      console.error("Ошибка аутентификации:", err);
      return next(new Error("Unauthorized"));
    }
  });
  io.on("connection", (socket) => {
    gameSocket(io, socket);
    socket.on("disconnect", () => {
      // console.log(`🔴 Пользователь отключился`);
    });
  });
};
