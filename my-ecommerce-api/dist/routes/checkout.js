import { Router } from "express";
import { db } from "../db.js";
import { authRequired } from "../middleware/authRequired.js";
const router = Router();
/**
 * POST /checkout
 * → gera pedido status "pending", move itens do carrinho
 *   e devolve { orderId }
 *
 * Obs.: inclui um mock de pagamento que, após 2 s,
 *       troca o status para "paid" (simulando webhook).
 */
router.post("/", authRequired, async (req, res) => {
    const userId = req.user.sub; // injetado pelo middleware
    try {
        /* ---------- 1. Lê o carrinho ---------- */
        const { rows: cart } = await db.query(`
      SELECT ci.product_id, ci.quantity, p.price_cents
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = $1
      `, [userId]);
        if (cart.length === 0) {
            return res.status(400).json({ error: "Carrinho vazio." });
        }
        /* ---------- 2. Calcula totais ---------- */
        const subtotal = cart.reduce((sum, i) => sum + i.quantity * Number(i.price_cents), 0);
        const shipping = Math.round(subtotal * 0.1); // 10 %
        const total = subtotal + shipping;
        /* ---------- 3. Transação ---------- */
        await db.query("BEGIN");
        /* 3a. Cria pedido */
        const { rows: [order], } = await db.query(`
      INSERT INTO orders (user_id, status, total_cents, shipping_cents)
      VALUES ($1, 'pending', $2, $3)
      RETURNING id
      `, [userId, total, shipping]);
        const orderId = order.id;
        /* 3b. Insere itens */
        const valueStrings = [];
        const params = [];
        let n = 1;
        cart.forEach((item) => {
            valueStrings.push(`($${n++}, $${n++}, $${n++}, $${n++})`);
            params.push(orderId, item.product_id, item.quantity, item.price_cents);
        });
        await db.query(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES ${valueStrings.join(",")}
      `, params);
        /* 3c. Limpa carrinho do usuário */
        await db.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
        await db.query("COMMIT");
        /* ---------- 4. Mock de pagamento ---------- */
        setTimeout(async () => {
            try {
                await db.query("UPDATE orders SET status = 'paid' WHERE id = $1", [orderId]);
                console.log(`✔️  Pedido ${orderId} marcado como pago (mock)`);
            }
            catch (e) {
                console.error("Falha no mock de pagamento:", e);
            }
        }, 2000);
        /* ---------- 5. Resposta ---------- */
        return res.status(201).json({ orderId });
    }
    catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        return res.status(500).json({ error: "Erro interno." });
    }
});
export default router;
