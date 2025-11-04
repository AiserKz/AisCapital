import jwt, { JwtPayload } from 'jsonwebtoken';
import { REFRESH_SECRET_KEY, ACCESS_SECRET_KEY, REFRESH_TOKEN_EXPIRATION_TIME, REFRESH_TOKEN_TIME, ACCESS_TOKEN_EXPIRATION_TIME } from "../utils/config.js";
import { Request, Response } from "express";

// Получить токен
export async function getToken(userId: string, username: string) {
    const accessToken = jwt.sign({ id: userId, name: username }, ACCESS_SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRATION_TIME });
    const refreshToken = jwt.sign({ id: userId, name: username }, REFRESH_SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRATION_TIME });
    return { accessToken, refreshToken };
}
// Установить куки
export async function setCookie(accessToken: string, refreshToken: string, res: Response) {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // true если https
        sameSite: 'strict',
        maxAge: REFRESH_TOKEN_TIME * 24 * 60 * 60 * 1000,
    });

    return res
}

// Проверить токен
export const verifyToken = async (token: string, type: "access" | "refresh" = "access"): Promise<JwtPayload | null> => {
    try {
        const decoded = jwt.verify(token, type === "access" ? ACCESS_SECRET_KEY : REFRESH_SECRET_KEY);
        if (typeof decoded === "string") return null;
        return decoded as JwtPayload;
    } catch (err) {
        console.error("Ошибка проверки токена:");
        return null;
    }
};
// Middleware
export const authMiddleware = async (req: Request, res: Response, next: any) => {
    try {
        let token = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token && req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return res.status(401).json({ message: 'Токен не предоставлен' });
        }

        const deoced = await verifyToken(token, "access");
        if (!deoced) {
            return res.status(401).json({ message: 'Неверный токен или истекло время жизни токена' });
        } 
        res.locals.user = deoced;
        next();
    } catch (err) {
        console.error("Ошибка аутентификации:", err);
        res.status(401).json({ message: "Ошибка аутентификации" });
    }
}