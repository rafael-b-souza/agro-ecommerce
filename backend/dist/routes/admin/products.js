import { Router } from "express";
import { db } from "../../db.js";
const router = Router();
/**
 * Helpers
 * -------
 * priceCents: faz parse para inteiro (em centavos) e lança 400 se inválido
 */
function parsePrice(price) {
    const cents = Math.round(Number(price) * 100);
    if (Number.isNaN(cents) || cents < 0) {
        throw new Error("Preço inválido.");
    }
    return cents;
}
/* ====================  CREATE  ==================== */
/* POST /admin/products */
router.post("/", async (req, res) => {
    try {
        const { categoryId, name, description, price, // decimal/float no body
        imageUrl, stockQty = 0, isActive = true, } = req.body;
        if (!categoryId || !name || price == null) {
            return res
                .status(400)
                .json({ error: "categoryId, name e price são obrigatórios." });
        }
        const priceCents = parsePrice(price);
        const { rows: [product], } = await db.query(`INSERT INTO products
         (category_id, name, description, price_cents,
          image_url, stock_qty, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`, [
            categoryId,
            name,
            description,
            priceCents,
            imageUrl ?? null,
            stockQty,
            isActive,
        ]);
        return res.status(201).json(product);
    }
    catch (err) {
        if (err.message === "Preço inválido.") {
            return res.status(400).json({ error: err.message });
        }
        console.error(err);
        return res.status(500).json({ error: "Erro interno." });
    }
});
/* ====================  READ ALL  ==================== */
/* GET /admin/products?page=&limit= */
router.get("/", async (req, res) => {
    const { page = "1", limit = "20" } = req.query;
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (p - 1) * l;
    try {
        const [countRes, dataRes] = await Promise.all([
            db.query("SELECT COUNT(*)::int AS count FROM products"),
            db.query("SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2", [l, offset]),
        ]);
        const total = countRes.rows[0]?.count ?? 0;
        return res.json({
            data: dataRes.rows,
            meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro interno." });
    }
});
/* ====================  READ ONE  ==================== */
/* GET /admin/products/:id */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { rows: [product], } = await db.query("SELECT * FROM products WHERE id = $1", [id]);
        return product
            ? res.json(product)
            : res.status(404).json({ error: "Produto não encontrado." });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro interno." });
    }
});
/* ====================  UPDATE  ==================== */
/* PUT /admin/products/:id */
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { categoryId, name, description, price, imageUrl, stockQty, isActive, } = req.body;
    try {
        /* Build dinâmico das colunas a atualizar */
        const sets = [];
        const params = [];
        let n = 1;
        const push = (col, val) => {
            sets.push(`${col} = $${n++}`);
            params.push(val);
        };
        if (categoryId)
            push("category_id", categoryId);
        if (name)
            push("name", name);
        if (description !== undefined)
            push("description", description);
        if (price !== undefined)
            push("price_cents", parsePrice(price));
        if (imageUrl !== undefined)
            push("image_url", imageUrl);
        if (stockQty !== undefined)
            push("stock_qty", stockQty);
        if (isActive !== undefined)
            push("is_active", isActive);
        if (!sets.length) {
            return res.status(400).json({ error: "Nada para atualizar." });
        }
        params.push(id); // último param é o WHERE
        const { rows: [product], } = await db.query(`UPDATE products SET ${sets.join(", ")} WHERE id = $${n} RETURNING *`, params);
        return product
            ? res.json(product)
            : res.status(404).json({ error: "Produto não encontrado." });
    }
    catch (err) {
        if (err.message === "Preço inválido.") {
            return res.status(400).json({ error: err.message });
        }
        console.error(err);
        return res.status(500).json({ error: "Erro interno." });
    }
});
/* ====================  DELETE  ==================== */
/* DELETE /admin/products/:id */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await db.query("DELETE FROM products WHERE id = $1", [
            id,
        ]);
        return rowCount
            ? res.status(204).send()
            : res.status(404).json({ error: "Produto não encontrado." });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro interno." });
    }
});
export default router;
