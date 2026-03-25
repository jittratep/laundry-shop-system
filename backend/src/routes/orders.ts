// backend/src/routes/orders.ts
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.middleware";

const orders = new Hono<{ Variables: { user: any } }>();
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

      
      // 3. อัปเดตคะแนนสะสม (หักคะแนนที่ใช้ + เพิ่มคะแนนที่ได้ใหม่จากยอดสุทธิ)
      const earnedPoints = Math.floor(totalAmount / 10);
      
      // 🟢 คำนวณส่วนต่างของคะแนน (Net Points) ก่อน
      // ตัวอย่าง: ได้ใหม่ 30 ลบ ที่ใช้ไป 0 = +30
      // ตัวอย่าง: ได้ใหม่ 10 ลบ ที่ใช้ไป 50 = -40
      const netPoints = earnedPoints - usedPoints;

      // 🟢 ถ้าคะแนนไม่เท่ากับ 0 ถึงจะสั่งอัปเดต
      if (netPoints !== 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: { 
            // ใช้ increment เสมอ แต่ถ้าค่าเป็นลบ Prisma จะไปลดคะแนนให้เองครับ
            points: { increment: netPoints } 
          }
        });
      }

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


// ==========================================
// สำหรับลูกค้า (Customer Portal): ดึงออเดอร์ของตัวเอง
// ==========================================
orders.get("/my-orders", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as any; 
    
    // 🟢 1. ดักจับ ID ให้ครอบคลุม (เผื่อ Token เก็บไว้ในชื่ออื่น)
    const actualUserId = user.id || user.userId || user.customerId;
    
    // 🟢 2. ป้องกันความผิดพลาด! ถ้าหา ID ไม่เจอ ห้ามดึงข้อมูลเด็ดขาด
    if (!actualUserId) {
      return c.json({ error: "ไม่พบข้อมูลประจำตัวผู้ใช้" }, 401);
    }

    // ดึงเฉพาะออเดอร์ที่เป็นของลูกค้ารายนี้จริงๆ
    const myOrders = await prisma.order.findMany({
      where: { customerId: actualUserId },
      include: {
        items: true,
        machine: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    return c.json({ data: myOrders });
  } catch (error) {
    return c.json({ error: "ดึงข้อมูลออเดอร์ล้มเหลว" }, 500);
  }
});

// ==========================================
// FR-4.1: ดึงคิวงานทั้งหมดสำหรับฝ่ายปฏิบัติการ
// ==========================================
orders.get("/queue/all", authMiddleware, async (c) => {
  try {
    const queueOrders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true } },
        items: true,
        machine: true
      },
      orderBy: [
        { urgency: 'desc' }, // งานด่วนขึ้นก่อน
        { estimatedCompletion: 'asc' } // เรียงตามเวลาที่ต้องเสร็จ
      ]
    });
    return c.json({ data: queueOrders });
  } catch (error) {
    return c.json({ error: "ดึงข้อมูลคิวงานล้มเหลว" }, 500);
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

// ==========================================
// FR-4.2, 4.3, 4.4: อัปเดตสถานะงาน, กำหนดเครื่อง, แจ้งปัญหา (รองรับไฟล์รูปภาพ)
// ==========================================
orders.put("/:id/queue", authMiddleware, async (c) => {
  const id = c.req.param("id");
  try {
    // 🟢 1. เปลี่ยนจาก c.req.json() เป็น c.req.parseBody() เพื่อรับ FormData
    const body = await c.req.parseBody(); 
    
    let issueImageUrl = body.issueImageUrl as string | null || null;

    // 🟢 2. ตรวจสอบว่ามี "ไฟล์รูปภาพของจริง" ส่งมาไหม
    if (body.issueImage && body.issueImage instanceof File) {
      const file = body.issueImage;
      const extension = file.name.split('.').pop();
      const fileName = `issue-${id}-${Date.now()}.${extension}`; // ตั้งชื่อไฟล์ใหม่กันซ้ำ
      const savePath = `./public/uploads/${fileName}`; // เซฟลงโฟลเดอร์ที่เราสร้างไว้
      
      // คำสั่งบันทึกไฟล์ลงเซิร์ฟเวอร์ของ Bun
      await Bun.write(savePath, file);
      
      // เก็บแค่ Path รูปไว้ใน Database เพื่อให้ Frontend เรียกใช้
      issueImageUrl = `/uploads/${fileName}`; 
    }

    const oldOrder = await prisma.order.findUnique({ where: { id } });

    // 🟢 3. อัปเดตข้อมูลออเดอร์ (ใช้ค่าจาก body เหมือนเดิม แต่แปลงประเภทข้อมูลนิดหน่อย)
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: body.status as string,
        assignedMachineId: (body.assignedMachineId as string) || null,
        issueDescription: (body.issueDescription as string) || null,
        issueImageUrl: issueImageUrl, // 🟢 ใส่ URL รูปล่าสุด
        issueReportedAt: body.issueDescription ? new Date() : null,
      }
    });

    const newMachineId = (body.assignedMachineId as string) || null;
    const oldMachineId = oldOrder?.assignedMachineId || null;
    const isWorking = ["washing", "drying"].includes(body.status as string);

    if (oldMachineId && oldMachineId !== newMachineId) {
      await prisma.machine.update({
        where: { id: oldMachineId },
        data: { status: "available" }
      });
    }

    if (newMachineId) {
      await prisma.machine.update({
        where: { id: newMachineId },
        data: { status: isWorking ? "in-use" : "available" }
      });
    }

    return c.json({ message: "อัปเดตสถานะคิวงานสำเร็จ", data: updatedOrder });
  } catch (error) {
    console.error(error);
    return c.json({ error: "อัปเดตสถานะคิวงานล้มเหลว" }, 500);
  }
});



export default orders;