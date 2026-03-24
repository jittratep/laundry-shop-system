// backend/src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile"; // Now this will work! ✅
import customer from "./routes/customer";
import orders from "./routes/orders";

const app = new Hono().basePath("/api");

// Middleware
app.use("*", cors());
app.use("*", logger());

// --- ROUTES ---

// เส้นทางหลักสำหรับระบบ Authentication
app.route("/auth", authRoutes);
app.route("/profile", profileRoutes);

// ลงทะเบียน /api/customers
app.route("/customers", customer)

// เส้นทางสำหรับ orders
app.route("/orders", orders);

// 🟠 [เพื่อนๆ] ถ้าจะสร้าง API ใหม่ (เช่น Orders) ให้ทำตามนี้:
// 1. สร้างไฟล์ src/routes/orders.ts
// 2. Import เข้ามา: import orderRoutes from "./routes/orders";
// 3. ลงทะเบียนต่อจากบรรทัดนี้: app.route("/orders", orderRoutes);


// --- SERVER CONFIG ---
const port = 3000;
console.log(`🚀 Backend is running on port ${port}`);

export default {
  port: port,
  fetch: app.fetch,
};