import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedUser extends JwtPayload {
    username: string;
    role: string | null;
    type_perfil: string | null;
}

declare global {
    namespace Express {
        interface Request {
            authUser?: AuthenticatedUser;
        }
    }
}

export const getToken = (req: Request): string | null => {
    const authorization = req.get("authorization");
    const match = authorization?.match(/^Bearer\s+(\S+)$/i);

    return match?.[1] ?? null;
};

const isAuthenticatedUser = (
    payload: string | JwtPayload
): payload is AuthenticatedUser => {
    return typeof payload !== "string"
        && typeof payload.username === "string"
        && (typeof payload.role === "string" || payload.role === null)
        && (typeof payload.type_perfil === "string" || payload.type_perfil === null);
};

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const token = getToken(req);

    if (!token) {
        res.status(401).json({ message: "Bearer token is required" });
        return;
    }

    const secret = process.env.JWT_KEY;
    if (!secret) {
        console.error("JWT_KEY is not configured");
        res.status(500).json({ message: "Authentication is not configured" });
        return;
    }

    try {
        const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });

        if (!isAuthenticatedUser(payload)) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }

        req.authUser = payload;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }

        console.error("Error verifying authentication token:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
