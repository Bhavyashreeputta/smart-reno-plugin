import { Router } from "express";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { addAudit, usersDb } from "../storage/memory";
import { createToken } from "../middleware/auth";

const r = Router();

r.post("/register", async (req, res) => {
    const { email, password, name } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    if (usersDb.has(email)) return res.status(409).json({ error: "user_exists" });
    const id = randomUUID();
    const hash = await bcrypt.hash(password, 10);
    usersDb.set(email, { id, email, name, passwordHash: hash });
    addAudit("user.registered", { id, email });
    return res.status(201).json({ ok: true });
});

r.post("/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    const user = usersDb.get(email);
    if (!user) return res.status(401).json({ error: "invalid_credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });
    const token = createToken({ id: user.id, email: user.email, name: user.name });
    const secure = false; // localhost
    res.cookie("sr_session", token, { httpOnly: true, sameSite: "lax", secure, maxAge: 60 * 60 * 1000 });
    addAudit("user.login", { email });
    res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
});

r.post("/logout", (req, res) => {
    res.clearCookie("sr_session");
    res.json({ ok: true });
});

r.get("/me", (req, res) => {
    const token = (req as any).cookies?.sr_session;
    if (!token) return res.json({ user: null });
    try {
        const p = jwt.verify(token, process.env.JWT_SECRET || "dev_jwt_secret") as any;
        res.json({ user: { id: p.sub, email: p.email, name: p.name } });
    } catch {
        res.json({ user: null });
    }
});

export default r;