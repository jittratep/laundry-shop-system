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
  // 3. สร้างพนักงาน: พนักงานซักรีด (Laundry Staff)
  // ------------------------------------------------------
  const laundrystaff = await prisma.user.upsert({
    where: { email: "laundrystaff@laundryshop.com" },
    update: {
      name: "พนักงานซักรีด (สมชาย)", // 🟢 บังคับให้อัปเดตชื่อใหม่
      role: "laundry-staff",        // 🟢 บังคับให้อัปเดตตำแหน่งใหม่ให้ถูกต้อง
    },
    create: {
      email: "laundrystaff@laundryshop.com",
      phone: "0833333333",
      password: hashedPassword,
      name: "พนักงานซักรีด (สมชาย)",
      role: "laundry-staff",
    },
  });

  // ------------------------------------------------------
  // 4. สร้างลูกค้า: สำหรับทดสอบระบบ Customer Portal
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
  console.log(`🛍️ พนักงานซักรีด: ${laundrystaff.email} | Pass: 123456`);
  console.log(`🛍️ ลูกค้า: ${customer.phone} | Pass: 123456`);
  

  // ------------------------------------------------------
  // 5. สร้างเครื่องซักผ้า/อบผ้า (Machines) สำหรับทดสอบคิวงาน
  // ------------------------------------------------------
  const machineData = [
    { machineCode: "MCH-01", name: "เครื่องซักผ้า 1", type: "washer", status: "available" },
    { machineCode: "MCH-02", name: "เครื่องซักผ้า 2", type: "washer", status: "available" },
    { machineCode: "MCH-03", name: "เครื่องอบผ้า 1", type: "dryer", status: "available" },
  ];

  console.log("🧺 กำลังสร้างข้อมูลเครื่องซักผ้า...");
  for (const m of machineData) {
    await prisma.machine.upsert({
      where: { machineCode: m.machineCode },
      update: {}, // ถ้ามีอยู่แล้วก็ไม่ต้องทำอะไร
      create: m,
    });
  }
  
}

main()
  .catch((e) => {
    console.error("❌ Seed ล้มเหลว:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });