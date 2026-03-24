// backend/src/routes/orders.ts
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.middleware";

const orders = new Hono();
const prisma = new PrismaClient();

// ==========================================
// FR-3.1 & FR-3.2: สร้างออเดอร์ใหม่ & คำนวณราคาอัตโนมัติ
// ==========================================
const createOrderSchema = z.object({
  customerId: z.string(),
  paymentMethod: z.string(),
  usedPoints: z.number().optional().default(0), // 🟢 เพิ่มตัวนี้
  items: z.array(z.object({
    type: z.string(),
    service: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })).min(1, "ต้องมีรายการผ้าอย่างน้อย 1 รายการ")
});

orders.post("/", authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { customerId, paymentMethod, items, usedPoints } = createOrderSchema.parse(body); // 🟢 รับค่า usedPoints

    // 🟢 FR-3.2: คำนวณยอดรวม (คำนวณซ้ำที่ Backend เพื่อความปลอดภัย)
    const rawTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const discountAmount = Math.floor(usedPoints / 10);
    const totalAmount = Math.max(0, rawTotal - discountAmount);

    // 🟢 สร้างเลขออเดอร์อัตโนมัติ (เช่น ORD20260324001)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // ได้ 20260324
    const count = await prisma.order.count({
      where: { orderNumber: { startsWith: `ORD${dateStr}` } }
    });
    const orderNumber = `ORD${dateStr}${(count + 1).toString().padStart(3, '0')}`;

    // 🟢 กำหนดเวลารับผ้า (สมมติให้มารับได้ในอีก 2 วันข้างหน้า)
    const estimatedCompletion = new Date(today);
    estimatedCompletion.setDate(estimatedCompletion.getDate() + 2);

    // 🟢 บันทึกลง Database (ใช้ Transaction เพื่อให้แน่ใจว่าบันทึกครบทุกตาราง)
    const newOrder = await prisma.$transaction(async (tx) => {
      // เช็คว่าลูกค้ามีคะแนนพอให้หักจริงไหม (กันคนแฮ็ก)
      if (usedPoints > 0) {
        const cust = await tx.customer.findUnique({ where: { id: customerId } });
        if (!cust || cust.points < usedPoints) throw new Error("คะแนนสะสมไม่เพียงพอ");
      }
      
      // 1. บันทึก Order และรายการผ้า (OrderItem)
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          totalAmount,
          status: "pending", // สถานะเริ่มต้น
          estimatedCompletion,
          paymentMethod,
          paymentStatus: paymentMethod === "cash" ? "paid" : "pending", // สมมติเงินสดคือจ่ายเลย
          items: {
            create: items.map(item => ({
              type: item.type,
              service: item.service,
              quantity: item.quantity,
              pricePerItem: item.price
            }))
          }
        }
      });

      // 2. บันทึกข้อมูลการชำระเงินลงตาราง Payment
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          method: paymentMethod,
          status: paymentMethod === "cash" ? "paid" : "pending"
        }
      });

      // 3. เพิ่มแต้มสะสมให้ลูกค้า (ทุกๆ 10 บาท = 1 แต้ม)
      const earnedPoints = Math.floor(totalAmount / 10);
      await tx.customer.update({
        where: { id: customerId },
        data: { 
          points: { 
            decrement: usedPoints, // หักที่ใช้
            increment: earnedPoints // บวกที่ได้ใหม่
          } 
        }
      });

      return order;
    });

    return c.json({ message: "สร้างออเดอร์สำเร็จ", data: newOrder }, 201);
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) return c.json({ error: error.errors[0]?.message }, 400);
    return c.json({ error: "เกิดข้อผิดพลาดในการสร้างออเดอร์" }, 500);
  }
});

// ==========================================
// FR-3.4: ดึงรายการออเดอร์ทั้งหมด (ค้นหาได้)
// ==========================================
orders.get("/", authMiddleware, async (c) => {
  try {
    const search = c.req.query("search") || "";

    const orderList = await prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: search } }, // ค้นหาจากเลขออเดอร์
          { customer: { name: { contains: search } } }, // ค้นหาจากชื่อลูกค้า
          { customer: { phone: { contains: search } } }, // ค้นหาจากเบอร์โทร
        ]
      },
      include: {
        customer: { select: { name: true, phone: true } }, // ดึงชื่อและเบอร์ลูกค้ามาด้วย
        payment: true
      },
      orderBy: { createdAt: 'desc' } // เรียงจากออเดอร์ใหม่ล่าสุดไปเก่าสุด
    });

    return c.json({ data: orderList });
  } catch (error) {
    console.error(error);
    return c.json({ error: "ดึงข้อมูลออเดอร์ล้มเหลว" }, 500);
  }
});


// ==========================================
// FR-3.6: แก้ไข/ยกเลิกคำสั่งงาน
// ==========================================
orders.get("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        payment: true
      }
    });
    if (!order) return c.json({ error: "ไม่พบออเดอร์" }, 404);
    return c.json({ data: order });
  } catch (error) {
    return c.json({ error: "ดึงข้อมูลล้มเหลว" }, 500);
  }
});

// อัปเดตข้อมูลออเดอร์ (PUT /api/orders/:id)
orders.put("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        notes: body.notes,
        estimatedCompletion: body.estimatedCompletion ? new Date(body.estimatedCompletion) : undefined,
        status: body.status, // เผื่อกรณีแอดมินแก้ไขสถานะ
      }
    });
    return c.json({ message: "อัปเดตสำเร็จ", data: updatedOrder });
  } catch (error) {
    return c.json({ error: "อัปเดตล้มเหลว" }, 500);
  }
});

export default orders;