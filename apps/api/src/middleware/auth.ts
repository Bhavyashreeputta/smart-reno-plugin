import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

export interface AuthRequest extends Request {
    user?: { id: string; email: string; name?: string };
}

export function createToken(user: { id: string; email: string; name?: string }) {
    return jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as any;
}

export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
    let token: string | undefined;
    const auth = req.header("authorization");
    if (auth && auth.toLowerCase().startsWith("bearer ")) token = auth.slice(7);
    if (!token && (req as any).cookies?.sr_session) token = (req as any).cookies.sr_session;
    if (!token) return res.status(401).json({ error: "unauthorized" });
    try {
        const p = verifyToken(token);
        req.user = { id: p.sub, email: p.email, name: p.name };
        return next();
    } catch {
        return res.status(401).json({ error: "invalid_token" });
    }
}