import { Router } from "express";
import { db } from "../db.js";
const router = Router();
// GET /categories → retorna lista de nomes de categoria
router.get("/", async (_, res) => {
    try {
        const { rows } = await db.query(`
        SELECT name, slug FROM categories ORDER BY name
      `);
        res.json(rows);
    }
    catch (err) {
        console.error("Erro ao buscar categorias:", err);
        res.status(500).json({ error: "Erro ao buscar categorias" });
    }
});
export default router;
