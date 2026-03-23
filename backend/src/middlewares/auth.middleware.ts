// backend/src/middlewares/auth.middleware.ts
import type { Context, Next } from "hono";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";

// สร้าง Middleware สำหรับดักตรวจจับ Token
export const authMiddleware = async (c: Context, next: Next) => {
  // 1. ดึงค่า Authorization ออกมาจาก Header ที่ Frontend ส่งมา
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "กรุณาเข้าสู่ระบบก่อนใช้งาน (Missing Token)" }, 401);
  }

  const token = authHeader.split(" ")[1];

  // 🟢 เพิ่มการเช็คตรงนี้ เพื่อกันเหนียวและให้ TypeScript สบายใจ 
  if (!token) {
    return c.json({ error: "รูปแบบ Token ไม่ถูกต้อง" }, 401);
  }

  try {
    // 2. ถอดรหัส Token เพื่อดูว่าใครล็อกอินมา
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 3. ฝากข้อมูล user (ที่ได้จาก Token) ไว้ใน Context ของ Hono เพื่อให้ Route อื่นเอาไปใช้ต่อได้
    c.set("user", decoded); 
    
    // 4. อนุญาตให้ผ่านไปทำงานต่อได้
    await next();
  } catch (error) {
    return c.json({ error: "Token หมดอายุหรือไม่ถูกต้อง" }, 401);
  }
};