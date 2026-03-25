// backend/src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile"; // Now this will work! ✅
import customer from "./routes/customer";
import orders from "./routes/orders";
import machines from './routes/machines'
import dashboard from "./routes/dashboard";


// 🟢 1. สร้าง App หลัก (ไม่ต้องมี basePath)
const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger());

// 🟢 2. เปิดให้เข้าถึงไฟล์รูปภาพ (เข้าผ่าน http://localhost:3000/uploads/...)
app.use('/uploads/*', serveStatic({ root: './public' }));

// 🟢 3. สร้างกลุ่ม API ย่อย (ใส่ basePath /api ไว้ตรงนี้แทน)
const api = new Hono().basePath("/api");



// --- ROUTES (เอาไปต่อกับ api แทน app) ---
api.route("/auth", authRoutes);
api.route("/profile", profileRoutes);
api.route("/customers", customer);
api.route("/orders", orders);
api.route("/machines", machines);
api.route("/dashboard", dashboard);

// 🟠 [เพื่อนๆ] ถ้าจะสร้าง API ใหม่ (เช่น Orders) ให้ทำตามนี้:
// 1. สร้างไฟล์ src/routes/orders.ts
// 2. Import เข้ามา: import orderRoutes from "./routes/orders";
// 3. ลงทะเบียนต่อจากบรรทัดนี้: app.route("/orders", orderRoutes);


// 🟢 4. นำกลุ่ม API ไปประกอบเข้ากับ App หลัก
app.route("/", api);

// --- SERVER CONFIG ---
const port = 3000;
console.log(`🚀 Backend is running on port ${port}`);

export default {
  port: port,
  fetch: app.fetch,
};