import { Router } from "express";
import { db } from "../db.js";
import { authRequired } from "../middleware/authRequired.js";

const router = Router();

// **POST /cart**  – Adiciona ou incrementa item
router.post("/", authRequired, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId || quantity < 1) {
    return res.status(400).json({ error: "productId e quantity obrigatórios." });
  }

  const userId = req.user!.sub; // assegurado pelo middleware

  try {
    await db.query(
      `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      `,
      [userId, productId, quantity],
    );

    return res.status(201).json({ message: "Item adicionado ao carrinho." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno." });
  }
});

// **DELETE /cart/:itemId**  – Remove item específico
router.delete("/:itemId", authRequired, async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user!.sub;

  try {
    const { rowCount } = await db.query(
      `DELETE FROM cart_items WHERE id = $1 AND user_id = $2`,
      [itemId, userId],
    );

    if (!rowCount) {
      return res.status(404).json({ error: "Item não encontrado no seu carrinho." });
    }
    return res.status(204).send(); // sem corpo
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno." });
  }
});

// **GET /cart**  – Retorna itens + subtotal, frete e total
router.get("/", authRequired, async (req, res) => {
  const userId = req.user!.sub;

  try {
    const { rows: items } = await db.query(
      `
      SELECT
        cart_items.id,
        products.id   AS product_id,
        products.name,
        products.price_cents,
        cart_items.quantity,
        (products.price_cents * cart_items.quantity) AS line_total_cents
      FROM cart_items
      JOIN products ON products.id = cart_items.product_id
      WHERE cart_items.user_id = $1
      ORDER BY cart_items.created_at DESC
      `,
      [userId],
    );

    const subtotal = items.reduce((acc, i) => acc + Number(i.line_total_cents), 0);
    const shipping = Math.round(subtotal * 0.1); // frete = 10 % do subtotal
    const total = subtotal + shipping;

    return res.json({
      items,
      subtotal_cents: subtotal,
      shipping_cents: shipping,
      total_cents: total,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno." });
  }
});

export default router;
