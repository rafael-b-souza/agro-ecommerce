/**
 * Garante que o usuário autenticado tenha role === 'admin'.
 * Pressupõe que `authRequired` já populou `req.user`.
 */
export function isAdmin(req, res, next) {
    if (req.user?.role === "admin") {
        return next();
    }
    return res.status(403).json({ error: "Acesso restrito a administradores." });
}
