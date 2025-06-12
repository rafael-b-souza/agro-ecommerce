import jwt from "jsonwebtoken";
const { JWT_SECRET = "dev-secret" } = process.env;
export function authRequired(req, res, next) {
    const header = req.header("Authorization") || "";
    const [scheme, token] = header.split(" ");
    /* Espera "Bearer <token>" */
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Token ausente" });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        return next();
    }
    catch {
        return res.status(401).json({ error: "Token inválido ou expirado" });
    }
}
