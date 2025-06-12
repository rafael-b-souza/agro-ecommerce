import { Router } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db.js';
import { signJwt } from '../utils/jwt.js';
const router = Router();
const SALT_ROUNDS = 12;
/* ---------- /auth/register -------------------------------- */
router.post('/register', async (req, res) => {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }
    try {
        /* 1) Verifica duplicidade de e-mail */
        const { rowCount } = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (rowCount) {
            return res.status(409).json({ error: 'E-mail já cadastrado.' });
        }
        /* 2) Hash da senha */
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        /* 3) Insere registro */
        const { rows: [user], } = await db.query(`INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, role`, [email, hash, full_name]);
        return res.status(201).json({ user });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro interno.' });
    }
});
/* ---------- /auth/login ----------------------------------- */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }
    try {
        /* 1) Busca usuário */
        const { rows: [user], } = await db.query(`SELECT id, email, password_hash, role FROM users WHERE email = $1`, [email]);
        if (!user)
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        /* 2) Compara senhas */
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok)
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        /* 3) Gera JWT */
        const token = signJwt({ sub: user.id, role: user.role });
        return res.json({ token, expires_in: 3600 });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro interno.' });
    }
});
export default router;
