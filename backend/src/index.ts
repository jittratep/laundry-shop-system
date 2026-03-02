// backend/src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth"; // Now this will work! ✅

const app = new Hono().basePath("/api");

// Middleware
app.use("*", cors());
app.use("*", logger());

// --- ROUTES ---

// 1. เส้นทางหลักสำหรับระบบ Authentication
app.route("/auth", authRoutes);

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