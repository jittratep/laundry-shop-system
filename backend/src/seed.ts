import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // เข้ารหัสผ่านเพื่อความปลอดภัย (Security)
  const hashedPassword = await bcrypt.hash("123456", 10);

  console.log("🌱 เริ่มต้นการ Seed ข้อมูล...");

  // สร้าง User ระดับ Manager (ตัวอย่างสำหรับ Login)
  const admin = await prisma.user.upsert({
    where: { phone: "0812345678" },
    update: {},
    create: {
      phone: "0812345678",
      password: hashedPassword,
      name: "เจ้าของร้าน (Admin)",
      role: "MANAGER", // ใช้ String ตามที่เราแก้กันตอนแรก
    },
  });

  console.log(`✅ Seed สำเร็จ: สร้าง User ${admin.name} (Phone: ${admin.phone}) เรียบร้อย`);

  // 🟣 [เพื่อนๆ] อยากให้รันโปรเจกต์มาแล้วมีข้อมูล Order หรือข้อมูลอื่นๆ เลย 
  // ให้มาเขียนคำสั่งสร้างข้อมูลจำลองต่อตรงนี้ครับ
  
}

main()
  .catch((e) => {
    console.error("❌ Seed ล้มเหลว:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });