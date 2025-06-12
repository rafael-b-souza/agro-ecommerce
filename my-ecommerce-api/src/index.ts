import express from 'express';
import dotenv from "dotenv";

import authRoutes from './routes/auth.js';
import healthRouter from "./routes/health.js"; 
import productsRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import checkoutRoutes from "./routes/checkout.js";
import adminRoutes from "./routes/admin/index.js";
import categoryRoutes from "./routes/categories.js";

dotenv.config();                       
const PORT = Number(process.env.API_PORT) || 3000;

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use("/products", productsRoutes);
app.use("/health", healthRouter);
app.use("/cart", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/admin", adminRoutes);
app.use("/categories", categoryRoutes);


app.listen(PORT, () => {
  console.log(`✅ API ouvindo em http://localhost:${PORT}`);
});
