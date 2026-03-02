// backend/src/routes/auth.ts
import { Hono } from "hono";
import { z } from "zod";
import * as jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client"; // 1. เพิ่ม Prisma เข้ามา
import * as bcrypt from "bcrypt";

const auth = new Hono();
const prisma = new PrismaClient(); // 2. สร้างตัวแปรเรียกใช้งาน Prisma
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";

const loginSchema = z.object({
  phone: z.string().min(9).max(10),
  password: z.string().min(6),
});

auth.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { phone, password } = loginSchema.parse(body);

    // 1. หา User จากเบอร์โทร
    const user = await prisma.user.findUnique({
      where: { phone: phone },
    });

    // 2. ถ้าไม่เจอ User
    if (!user) {
      return c.json({ error: "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง" }, 401);
    }

    // 3. ✅ ใช้ bcrypt.compare เพื่อเช็ค Password ที่เป็น Hash
    // มันจะเอา password (123456) ไปคำนวณเทียบกับ user.password (hash) ใน DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return c.json({ error: "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง" }, 401);
    }

    // 4. ถ้าผ่าน สร้าง Token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone }, 
      JWT_SECRET, 
      { expiresIn: "1d" }
    );

    return c.json({ 
      message: "เข้าสู่ระบบสำเร็จ", 
      token 
    });

  } catch (error) {
    return c.json({ error: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล" }, 400);
  }
});

export default auth;