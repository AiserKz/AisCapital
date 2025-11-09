import { Router } from "express";
import {
  addRoom,
  getRoom,
  getRooms,
  getRoomsIsGame,
  leavePlayerFromRoom,
} from "../controllers/roomsController.js";
import { authMiddleware } from "../utils/jwt.js";

const roomRouter = Router();

roomRouter.get("/", getRoomsIsGame);
roomRouter.post("/", authMiddleware, addRoom);
roomRouter.get("/:id", authMiddleware, getRoom);

roomRouter.get("/:id/leave", authMiddleware, leavePlayerFromRoom);

export default roomRouter;
