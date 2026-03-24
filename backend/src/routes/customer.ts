// backend/src/routes/customer.ts
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import * as bcrypt from "bcrypt";
import { authMiddleware } from "../middlewares/auth.middleware";

const customer = new Hono();
const prisma = new PrismaClient();

// ==========================================
// FR-2.1: ค้นหาลูกค้า & ดึงรายชื่อทั้งหมด (GET /api/customers)
// ==========================================
customer.get("/", authMiddleware, async (c) => {
  try {
    // รับคำค้นหาจาก URL เช่น /api/customers?search=081
    const search = c.req.query("search") || "";

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } },
        ],
      },
      orderBy: { points: 'desc' }, // เรียงตามคะแนน
      // 🟢 1. ดึง include กลับมา เพื่อให้นับจำนวนออเดอร์จาก Database
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    // แปลงข้อมูลให้ตรงกับที่ Frontend ต้องการ (แปลง _count.orders เป็น orders เฉยๆ)
    const formattedCustomers = customers.map(cust => ({
      id: cust.id,
      name: cust.name,
      phone: cust.phone,
      email: cust.email || "-",
      address: cust.address || "-",
      points: cust.points,
      orders: cust._count.orders
    }));

    return c.json({ data: formattedCustomers });
  } catch (error) {
    return c.json({ error: "ดึงข้อมูลลูกค้าล้มเหลว" }, 500);
  }
});

// ==========================================
// FR-2.2: พนักงานเพิ่มลูกค้าใหม่หน้าร้าน (POST /api/customers)
// ==========================================
const createCustomerSchema = z.object({
  name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  phone: z.string().min(9, "กรุณากรอกเบอร์โทรศัพท์ให้ครบ 9-10 หลัก").max(10, "เบอร์โทรศัพท์ต้องไม่เกิน 10 หลัก"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  address: z.string().optional(),
});

customer.post("/", authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { name, phone, email, address } = createCustomerSchema.parse(body);

    // 1. เช็คว่าเบอร์ซ้ำไหม
    const existing = await prisma.customer.findUnique({ where: { phone } });
    if (existing) {
      return c.json({ error: "เบอร์โทรศัพท์นี้มีในระบบแล้ว" }, 400);
    }

    // 2. ตั้งรหัสผ่านเริ่มต้นให้ลูกค้า (เช่น 123456) เผื่อลูกค้าอยากล็อกอินเข้าระบบเองทีหลัง
    const defaultPassword = await bcrypt.hash("123456", 10);

    // 3. บันทึกลง Database
    const newCustomer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || null,
        address,
        password: defaultPassword,
        points: 0,
      },
    });

    return c.json({ message: "ลงทะเบียนลูกค้าใหม่สำเร็จ", data: newCustomer }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) return c.json({ error: error.errors[0]?.message }, 400);
    return c.json({ error: "เกิดข้อผิดพลาดในการเพิ่มลูกค้า" }, 500);
  }
});

// ==========================================
// FR-2.3: ดูประวัติลูกค้า (GET /api/customers/:id)
// ==========================================
customer.get("/:id", authMiddleware, async (c) => {
  try {
    const customerId = c.req.param("id");

    const customerData = await prisma.customer.findUnique({
      where: { id: customerId },

    });

    if (!customerData) return c.json({ error: "ไม่พบข้อมูลลูกค้า" }, 404);

    // ไม่ส่ง password กลับไป
    const { password, ...safeData } = customerData;
    
    return c.json({ data: safeData });
  } catch (error) {
    return c.json({ error: "ดึงประวัติลูกค้าล้มเหลว" }, 500);
  }
});

export default customer;