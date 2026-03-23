// backend/src/routes/auth.ts
import { Hono } from "hono";
import { z } from "zod";
import * as jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const auth = new Hono();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";

// ==========================================
// 1. เข้าสู่ระบบพนักงาน (Staff Login)
// ==========================================
const staffLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

auth.post("/login/staff", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = staffLoginSchema.parse(body);

    // หา User จากอีเมล
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return c.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, 401);
    }

    // เช็ค Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return c.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, 401);
    }

    // สร้าง Token
    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name }, 
      JWT_SECRET, 
      { expiresIn: "1d" }
    );

    return c.json({ 
      message: "เข้าสู่ระบบพนักงานสำเร็จ", 
      token,
      role: user.role,
      name: user.name
    });

  } catch (error) {
    return c.json({ error: "ข้อมูลไม่ถูกต้อง หรือเกิดข้อผิดพลาด" }, 400);
  }
});

// ==========================================
// 2. เข้าสู่ระบบลูกค้า (Customer Login)
// ==========================================
const customerLoginSchema = z.object({
  phone: z.string().min(9).max(10),
  password: z.string().min(6), // อนาคตอาจจะเปลี่ยนเป็นเช็ค OTP แทน
});

auth.post("/login/customer", async (c) => {
  try {
    const body = await c.req.json();
    const { phone, password } = customerLoginSchema.parse(body);

    // หา Customer จากเบอร์โทร
    const customer = await prisma.customer.findUnique({ where: { phone } });
    if (!customer || !customer.password) {
      return c.json({ error: "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง" }, 401);
    }

    // เช็ค Password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return c.json({ error: "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง" }, 401);
    }

    // สร้าง Token สำหรับลูกค้า
    const token = jwt.sign(
      { userId: customer.id, role: "customer", name: customer.name }, 
      JWT_SECRET, 
      { expiresIn: "7d" } // ลูกค้าให้อยู่ในระบบได้นานกว่าพนักงาน
    );

    return c.json({ 
      message: "เข้าสู่ระบบลูกค้าสำเร็จ", 
      token,
      role: "customer",
      name: customer.name
    });

  } catch (error) {
    return c.json({ error: "ข้อมูลไม่ถูกต้อง หรือเกิดข้อผิดพลาด" }, 400);
  }
});


// ==========================================
// 3. สมัครสมาชิกลูกค้าใหม่ (Customer Register) - FR-1.1
// ==========================================
const registerSchema = z.object({
  phone: z.string().min(9).max(10, "เบอร์โทรศัพท์ต้องมี 9-10 หลัก"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional(), // อีเมลจะมีหรือไม่มีก็ได้
});

auth.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    
    // 1. ตรวจสอบรูปแบบข้อมูลด้วย Zod
    const { phone, password, name, email } = registerSchema.parse(body);

    // 2. เช็คว่าเบอร์โทรนี้เคยสมัครไปหรือยัง?
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (existingCustomer) {
      return c.json({ error: "เบอร์โทรศัพท์นี้ถูกลงทะเบียนในระบบแล้ว" }, 400);
    }

    // 3. เข้ารหัสผ่านก่อนบันทึกลง Database
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. บันทึกข้อมูลลูกค้าใหม่ลง Database
    const newCustomer = await prisma.customer.create({
      data: {
        phone,
        password: hashedPassword,
        name,
        email,
        points: 0, // สมัครใหม่เริ่มที่ 0 คะแนน
      },
    });

    // 5. (Option) สร้าง Token ให้เลย เพื่อให้ลูกค้าล็อกอินอัตโนมัติหลังสมัครเสร็จ
    const token = jwt.sign(
      { userId: newCustomer.id, role: "customer", name: newCustomer.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return c.json({ 
      message: "สมัครสมาชิกสำเร็จ ยินดีต้อนรับ!",
      token,
      customer: {
        id: newCustomer.id,
        name: newCustomer.name,
        phone: newCustomer.phone
      }
    }, 201); // 201 Created

  } catch (error) {
    // ดัก Error จาก Zod (กรณีลูกค้ากรอกข้อมูลไม่ครบหรือผิดฟอร์แมต)
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors[0]?.message || "รูปแบบข้อมูลไม่ถูกต้อง" }, 400);
    }
    return c.json({ error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" }, 500);
  }
});

// ==========================================
// 4. ขอรหัส OTP สำหรับลืมรหัสผ่าน (FR-1.4)
// ==========================================
const requestOtpSchema = z.object({
  phone: z.string().min(9).max(10, "เบอร์โทรศัพท์ต้องมี 9-10 หลัก"),
});

// (จำลอง) เก็บ OTP ไว้ในหน่วยความจำชั่วคราว
// ของจริงมักจะเก็บใน Redis หรือ Database พร้อมตั้งเวลาหมดอายุ
const otpStorage = new Map<string, string>(); 

auth.post("/request-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { phone } = requestOtpSchema.parse(body);

    // 1. เช็คว่ามีลูกค้านี้ในระบบไหม
    const customer = await prisma.customer.findUnique({ where: { phone } });
    if (!customer) {
      return c.json({ error: "ไม่พบเบอร์โทรศัพท์นี้ในระบบ" }, 404);
    }

    // 2. สร้างรหัส OTP 6 หลัก (แบบสุ่ม)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. เก็บ OTP ไว้ (ผูกกับเบอร์โทร)
    otpStorage.set(phone, otp);

    // 4. จำลองการส่ง SMS (ของจริงจะเรียก API ส่ง SMS ตรงนี้)
    console.log(`\n=============================`);
    console.log(`📱 [SMS MOCK] ส่งไปที่เบอร์: ${phone}`);
    console.log(`🔑 รหัส OTP ของคุณคือ: ${otp}`);
    console.log(`=============================\n`);

    return c.json({ message: "ระบบได้ส่งรหัส OTP ไปยังเบอร์โทรศัพท์ของคุณแล้ว" });

  } catch (error) {
    if (error instanceof z.ZodError) return c.json({ error: error.errors[0]?.message }, 400);
    return c.json({ error: "เกิดข้อผิดพลาดในการขอ OTP" }, 500);
  }
});

// ==========================================
// 5. ยืนยัน OTP และรีเซ็ตรหัสผ่านใหม่ (FR-1.4)
// ==========================================
const resetPasswordSchema = z.object({
  phone: z.string(),
  otp: z.string().length(6, "รหัส OTP ต้องมี 6 หลัก"),
  newPassword: z.string().min(6, "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"),
});

auth.post("/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { phone, otp, newPassword } = resetPasswordSchema.parse(body);

    // 1. เช็คว่า OTP ตรงกับที่เก็บไว้ไหม
    const savedOtp = otpStorage.get(phone);
    if (!savedOtp || savedOtp !== otp) {
      return c.json({ error: "รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว" }, 400);
    }

    // 2. ถ้ารหัสถูก ให้เข้ารหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. อัปเดตลง Database
    await prisma.customer.update({
      where: { phone },
      data: { password: hashedPassword },
    });

    // 4. ลบ OTP ทิ้งเพื่อความปลอดภัย (ใช้ซ้ำไม่ได้)
    otpStorage.delete(phone);

    return c.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ สามารถเข้าสู่ระบบได้ทันที" });

  } catch (error) {
    if (error instanceof z.ZodError) return c.json({ error: error.errors[0]?.message }, 400);
    return c.json({ error: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" }, 500);
  }
});

export default auth;