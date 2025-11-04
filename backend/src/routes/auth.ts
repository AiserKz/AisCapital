import { Router } from "express";
import { getProfile, login, refreshToken, register } from "../controllers/authController.js";
import { authMiddleware } from "../utils/jwt.js";


const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/me', authMiddleware, getProfile);
authRoutes.post('/refresh', refreshToken);
 
export default authRoutes;