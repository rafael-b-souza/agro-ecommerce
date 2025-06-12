import { Request, Response, NextFunction } from "express";

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Acesso restrito a administradores." });
}
