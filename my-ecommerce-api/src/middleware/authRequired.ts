// src/middleware/authRequired.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const { JWT_SECRET = "dev-secret" } = process.env;

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization") || "";
  const [scheme, token] = header.split(" ");

  /* Espera "Bearer <token>" */
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token ausente" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as Request["user"];
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
