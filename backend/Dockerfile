# 1. ใช้ภาพพื้นฐานเป็น Bun ที่เบาและเร็วที่สุด
FROM oven/bun:latest

# 2. กำหนดที่ทำงานหลักในตัวคอนเทนเนอร์
WORKDIR /app

# 3. ก๊อปปี้ไฟล์รายการ Library ไปติดตั้งก่อน (เพื่อความเร็วในการ Build ครั้งต่อไป)
COPY package.json bun.lockb* ./
RUN bun install

# 4. ก๊อปปี้โค้ดทั้งหมดในโฟลเดอร์ backend เข้าไป
COPY . .

# 5. สั่งสร้าง Prisma Client เพื่อให้โค้ดคุยกับ DB ได้
RUN bunx prisma generate

# 6. เปิดพอร์ต 3001 ตามที่ตั้งค่าไว้
EXPOSE 3001

# 7. สั่งรันด้วยสคริปต์ start ที่เราเพิ่งแก้ใน package.json
CMD ["bun", "run", "start"]