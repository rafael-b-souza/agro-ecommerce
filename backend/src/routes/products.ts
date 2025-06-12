import { Router } from "express";
import { db } from "../db.js";

const router = Router();

/**
 * GET /products
 * ?page=1&limit=10&category=<uuid-ou-slug>
 *
 * Retorna lista paginada + metadados.
 */
router.get("/", async (req, res) => {
  const { page = "1", limit = "10", category } = req.query;

  // Sanitiza paginação
  const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
  const limitNum = Math.min(
    Math.max(parseInt(limit as string, 10) || 10, 1),
    50,
  ); // cap de 50 p/ evitar abusos
  const offset = (pageNum - 1) * limitNum;

  let where = "";
  const params: unknown[] = [];

  if (category) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      category as string,
    );
  
    where = isUuid
      ? "WHERE products.category_id = $1"
      : "WHERE LOWER(categories.slug) = LOWER($1)";
  
    params.push(category);
  }
  

  try {
    const totalSQL = `
      SELECT COUNT(*)::int AS count
      FROM products
      LEFT JOIN categories ON categories.id = products.category_id
      ${where}`;
    const {
      rows: [{ count: total }],
    } = await db.query(totalSQL, params);

    params.push(limitNum, offset); // $n+1, $n+2
    const dataSQL = `
      SELECT products.*
      FROM products
      LEFT JOIN categories ON categories.id = products.category_id
      ${where}
      ORDER BY products.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows: products } = await db.query(dataSQL, params);

    return res.json({
      data: products,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno." });
  }
});

/**
 * GET /products/:id
 * Retorna um único produto pelo UUID.
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rows: [product],
    } = await db.query("SELECT * FROM products WHERE id = $1", [id]);

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }
    return res.json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno." });
  }
});

export default router;
