// src/routes/admin/index.ts
import { Router } from "express";
import { authRequired } from "../../middleware/authRequired.js";
import { isAdmin } from "../../middleware/isAdmin.js";
import productsCrud from "./products.js";
import ordersCrud from "./orders.js";

const router = Router();

router.use(authRequired, isAdmin);
router.use("/products", productsCrud);
router.use("/orders", ordersCrud);

router.get("/dashboard", (_req, res) => {
  res.json({ message: "Bem-vindo ao painel admin!" });
});

export default router;
