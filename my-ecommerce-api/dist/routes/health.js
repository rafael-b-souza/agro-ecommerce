import { Router } from "express";
const router = Router();
/* GET /health  →  { status: "ok" } */
router.get("/", (_req, res) => {
    res.json({ status: "ok" });
});
export default router;
