import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
// สมมติว่ามีการ import PrismaClient เรียบร้อยแล้ว

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";

// Middleware
app.use("*", cors());
app.use("*", logger());

// Schema สำหรับ Input Validation (Security)
const loginSchema = z.object({
  phone: z.string().min(9).max(10),
  password: z.string().min(6),
});

// API: Authentication - POST /api/auth/login
app.post("/api/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const data = loginSchema.parse(body); // Validate Input

    // TODO: Query user from Prisma using data.phone
    // const user = await prisma.user.findUnique({ where: { phone: data.phone } });
    
    // จำลองการตรวจสอบรหัสผ่าน
    // const isMatch = await bcrypt.compare(data.password, user.password);
    
    // สร้าง Token
    const token = jwt.sign({ phone: data.phone, role: "MANAGER" }, JWT_SECRET, { expiresIn: "1d" });

    return c.json({ message: "Login success", token });
  } catch (error) {
    return c.json({ error: "Invalid input or credentials" }, 400);
  }
});

// API: สร้างคำสั่งงาน - POST /api/orders
app.post("/api/orders", async (c) => {
    // โครงสร้างทิ้งไว้ให้เพื่อนร่วมทีมมาเขียนต่อ
    return c.json({ message: "Order creation endpoint ready for development" });
});

export default {
  port: 3000,
  fetch: app.fetch,
};
console.log(`🚀 Backend is running on port 3000`);