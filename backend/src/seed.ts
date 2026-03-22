import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // เข้ารหัสผ่าน "123456" เพื่อใช้เป็นรหัสผ่านตั้งต้นให้กับทุกคน
  const hashedPassword = await bcrypt.hash("123456", 10);

  console.log("🌱 เริ่มต้นการ Seed ข้อมูล...");

  // ------------------------------------------------------
  // 1. สร้างพนักงาน: ผู้จัดการร้าน (Manager)
  // ------------------------------------------------------
  const manager = await prisma.user.upsert({
    where: { email: "manager@laundryshop.com" }, // 🟢 เปลี่ยนมาใช้ email
    update: {},
    create: {
      email: "manager@laundryshop.com",
      phone: "0811111111",
      password: hashedPassword,
      name: "ผู้จัดการร้าน (John)",
      role: "manager", // 🟢 ใช้ตัวพิมพ์เล็กตามที่ตกลงกันไว้
    },
  });

  // ------------------------------------------------------
  // 2. สร้างพนักงาน: พนักงานหน้าร้าน (Front Staff)
  // ------------------------------------------------------
  const staff = await prisma.user.upsert({
    where: { email: "staff@laundryshop.com" }, // อีเมลนี้ตรงกับ Placeholder ในช่องกรอกหน้า Login
    update: {},
    create: {
      email: "staff@laundryshop.com",
      phone: "0822222222",
      password: hashedPassword,
      name: "พนักงานหน้าร้าน (Jane)",
      role: "front-staff",
    },
  });

  // ------------------------------------------------------
  // 3. สร้างลูกค้า: สำหรับทดสอบระบบ Customer Portal
  // ------------------------------------------------------
  const customer = await prisma.customer.upsert({
    where: { phone: "0891234567" }, // 🟢 ลูกค้าใช้เบอร์โทร (ตรงกับ Placeholder หน้า Login ลูกค้า)
    update: {},
    create: {
      phone: "0891234567",
      email: "somying@email.com",
      password: hashedPassword,
      name: "คุณสมหญิง",
      address: "123 ถ.สุขุมวิท กรุงเทพฯ",
      points: 750, // แจกแต้มตั้งต้นให้เลย
    },
  });

  console.log("✅ Seed ข้อมูลสำเร็จเรียบร้อยแล้ว!");
  console.log(`👨‍💼 ผู้จัดการ: ${manager.email} | Pass: 123456`);
  console.log(`👩‍💼 พนักงาน: ${staff.email} | Pass: 123456`);
  console.log(`🛍️ ลูกค้า: ${customer.phone} | Pass: 123456`);
}

main()
  .catch((e) => {
    console.error("❌ Seed ล้มเหลว:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });