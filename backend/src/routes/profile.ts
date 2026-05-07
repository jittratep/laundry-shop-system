// backend/src/routes/profile.ts
import { Hono } from "hono";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth.middleware";

// 🟢 1. สร้าง Type ประกาศไว้เลยว่า "user" หน้าตาเป็นยังไง
type Variables = {
  user: {
    userId: string;
    role: string;
    name: string;
  };
};

// 🟢 2. เอา Variables ไปใส่ในวงเล็บของ Hono แบบนี้ครับ
const profile = new Hono<{ Variables: Variables }>();
const prisma = new PrismaClient();

// ==========================================
// 1. ดึงข้อมูลส่วนตัว (GET /api/profile)
// ==========================================
profile.get("/", authMiddleware, async (c) => {
  try {
    // ดึงข้อมูล user จาก Token ที่ authMiddleware แกะไว้ให้
    const userToken = c.get("user");

    if (userToken.role === "customer") {
      // ถ้าเป็นลูกค้า ดึงจากตาราง Customer
      const customer = await prisma.customer.findUnique({
        where: { id: userToken.userId },
        // 🟢 สำคัญ: ใช้ select เพื่อ "ไม่ส่ง" password กลับไปให้หน้าเว็บเพื่อความปลอดภัย!
        select: { id: true, name: true, phone: true, email: true, address: true, points: true } 
      });
      return c.json({ data: customer });
      
    } else {
      // ถ้าเป็นพนักงาน ดึงจากตาราง User
      const staff = await prisma.user.findUnique({
        where: { id: userToken.userId },
        select: { id: true, name: true, email: true, phone: true, role: true }
      });
      return c.json({ data: staff });
    }
  } catch (error) {
    return c.json({ error: "ดึงข้อมูลล้มเหลว" }, 500);
  }
});

// ==========================================
// 2. แก้ไขข้อมูลส่วนตัว (PUT /api/profile)
// ==========================================
// สร้าง Schema สำหรับตรวจสอบข้อมูลที่ส่งมาแก้ (เป็น optional คือส่งมาแก้แค่อันเดียวก็ได้)
const updateProfileSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").optional(),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional(),
  phone: z.string().min(9).max(10, "เบอร์โทรศัพท์ต้องมี 9-10 หลัก").optional(),
  address: z.string().optional(), // สำหรับลูกค้าเอาไว้อัปเดตที่อยู่จัดส่ง
});

profile.put("/", authMiddleware, async (c) => {
  try {
    const userToken = c.get("user");
    const body = await c.req.json();
    const data = updateProfileSchema.parse(body);

    if (userToken.role === "customer") {
      // อัปเดตข้อมูลลูกค้า
      const updatedCustomer = await prisma.customer.update({
        where: { id: userToken.userId },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
        },
        select: { id: true, name: true, phone: true, email: true, address: true }
      });
      return c.json({ message: "อัปเดตข้อมูลสำเร็จ", data: updatedCustomer });

    } else {
      // อัปเดตข้อมูลพนักงาน
      const updatedStaff = await prisma.user.update({
        where: { id: userToken.userId },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
        },
        select: { id: true, name: true, email: true, phone: true, role: true }
      });
      return c.json({ message: "อัปเดตข้อมูลสำเร็จ", data: updatedStaff });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง" }, 400);
    }
    // ดัก Error เผื่อกรณีลูกค้าเปลี่ยนอีเมลหรือเบอร์โทรไปซ้ำกับคนอื่นในระบบ
    return c.json({ error: "อัปเดตข้อมูลล้มเหลว อีเมลหรือเบอร์โทรนี้อาจมีผู้ใช้งานแล้ว" }, 500);
  }
});

export default profile;