import { JwtPayload } from "jsonwebtoken";
interface TokenPayload {
    id: string;
    iat?: number;
    exp?: number;
}

declare global {
    namespace Express {
        export interface Request {
            user?: JwtPayload
        }
    }
}