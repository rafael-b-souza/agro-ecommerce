import { Router } from "express";
import { db } from "../../db.js";

const router = Router();

// -------- util -----------
const VALID_STATUS = ["pending", "paid", "shipped", "canceled"] as const;
type OrderStatus = (typeof VALID_STATUS)[number];

/* ============================================================
   GET /admin/orders
   ?status=pending|paid|shipped|canceled
   ?page=1&limit=20
   ------------------------------------------------------------ */
router.get("/", async (req, res) => {
  const { status, page = "1", limit = "20" } = req.query;
  const p = Math.max(parseInt(page as string, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);
  const offset = (p - 1) * l;

  const whereClauses: string[] = [];
  const params: unknown[] = [];
  let n = 1;

  if (status && VALID_STATUS.includes(status as OrderStatus)) {
    whereClauses.push(`orders.status = $${n++}`);
    params.push(status);
  }

  const where = whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : "";

  try {
    const totalSQL = `SELECT COUNT(*)::int AS count FROM orders ${where}`;
    const total = (
      await db.query(totalSQL, params)
    ).rows[0]?.count as number;

    params.push(l, offset); 
    const listSQL = `
      SELECT
        orders.id,
        orders.status,
        orders.total_cents,
        orders.shipping_cents,
        orders.created_at,
        users.email  AS customer_email
      FROM orders
      JOIN users ON users.id = orders.user_id
      ${where}
      ORDER BY orders.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const { rows } = await db.query(listSQL, params);

    return res.json({
      data: rows,
      meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro interno." });
  }
});

/* ============================================================
   PUT /admin/orders/:id/status
   Body: { "status": "paid" }
   ------------------------------------------------------------ */
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };

  if (!status || !VALID_STATUS.includes(status as OrderStatus)) {
    return res
      .status(400)
      .json({ error: `status deve ser um de: ${VALID_STATUS.join(", ")}` });
  }

  try {
    const {
      rows: [order],
    } = await db.query(
      `UPDATE orders SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id],
    );

    return order
      ? res.json(order)
      : res.status(404).json({ error: "Pedido não encontrado." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro interno." });
  }
});

export default router;
