#  LaundryPro - ระบบจัดการร้านซักรีด
โปรเจกต์นี้เป็นส่วนหนึ่งของรายวิชา Software Design and Development พัฒนาขึ้นเพื่อบริหารจัดการร้านซักรีดอย่างครบวงจร ตั้งแต่หน้าร้าน หลังร้าน จนถึงหน้าติดตามสถานะของลูกค้า

---

##  2.1 ทีมงานและหน้าที่ความรับผิดชอบ
1. **[68030013] [นางสาวกัญจณะ คุ้มทรัพย]**
   * **Role:** Payment & Receipt System
   * **Responsibilities:** 
     * ระบบชำระเงิน (FR-5, FR-3.3)

2. **[68030020] [นางสาวกันติชา ย๋องชา]**
   * **Role:** Laundry Queue & Notification System
   * **Responsibilities:** 
     * ระบบจัดการงานซัก + การแจ้งเตือน (FR-4,FR-3.5)

3. **[68030040] [นายจิตรเทพ พะชำนิ]**
   * **Role:** Frontend (Staff Interface), Customer Management & Order Management
   * **Responsibilities:** 
     * ระบบจัดการลูกค้า + รับ-ส่งผ้า (ฝั่ง Backend) รวมถึงดูแลโมดูลหลักต่างๆ (FR-2, FR-3)
     * UI รับผ้า / ส่งผ้า / ชำระเงิน,
     * UI คิวงานและอัปเดตสถานะ (หน้าจอพนักงานซักรีด),
     * UI จัดการลูกค้า / ค้นหา / ประวัติ,
     * UI Dashboard รายงานสำหรับผู้จัดการ
     * เขียน Unit Test / Integration Test 

4. **[68030080] [นายณภัทร สิงห์ตุ้ย]**
   * **Role:** Backend Architecture & Authentication
   * **Responsibilities:** 
     * โครงสร้างระบบหลัก + ระบบสมาชิก (FR-1)

5. **[68030095] [นายณัทภพ เกษมสานต]**
   * **Role:** Report & Dashboard (Backend)
   * **Responsibilities:** 
     * ระบบรายงานและ Dashboard ฝั่ง Backend (FR-6)

6. **[68030250] [นายวชิระพล สิริอิสสระนันท]**
   * **Role:** Frontend (Customer Interface)
   * **Responsibilities:** หน้าจอลูกค้า
     * UI สมัครสมาชิก / เข้าสู่ระบบ / แก้ไขข้อมูล,
     * UI ติดตามสถานะผ้า (FR-3.5) — หน้าลูกค้า,
     * UI ประวัติการใช้บริการของลูกค้า

---

##  2.2 Software Requirements Specification (SRS)
ระบบได้ทำการพัฒนาตามข้อกำหนดสิทธิการใช้งาน (SRS) ดังนี้:  
### Backend Architecture & Authentication - โครงสร้างระบบหลัก + ระบบสมาชิก
- FR-1.1 สมัครสมาชิก,  
- FR-1.2 เข้าสู่ระบบ (JWT / Session),  
- FR-1.3 แก้ไขข้อมูลส่วนตัว,  
- FR-1.4 ลืมรหัสผ่าน (SMS OTP)  
### Customer Management & Order Management - ระบบจัดการลูกค้า + รับ-ส่งผ้า (ฝั่ง Backend)
- FR-2.1 ค้นหาลูกค้า,
- FR-2.2 เพิ่มลูกค้าใหม่,
- FR-2.3 ดูประวัติลูกค้า,
- FR-3.1 รับผ้า (บันทึกคำสั่งงาน),
- FR-3.2 คำนวณราคาอัตโนมัติ,
- FR-3.4 ค้นหาคำสั่งงาน,
- FR-3.6 แก้ไข/ยกเลิกคำสั่งงาน,
- FR-3.7 บันทึกการส่งมอบผ้าคืน
### Laundry Queue & Notification System - ระบบจัดการงานซัก + การแจ้งเตือน
- FR-4.1 แสดงคิวงาน (เรียงตามความเร่งด่วน),
- FR-4.2 อัปเดตสถานะงาน (State Machine),
- FR-4.3 บันทึกปัญหา/ความเสียหาย (รองรับอัปโหลดรูป),
- FR-4.4 ระบุเครื่องซักที่ใช้,
- FR-4.5 ส่ง SMS/LINE แจ้งเตือนลูกค้าอัตโนมัติ,
- FR-3.5 ติดตามสถานะผ้า (API)
### Payment & Receipt System - ระบบชำระเงิน
- FR-5.1 รับชำระเงินสด + คำนวณเงินทอน,
- FR-5.2 รับชำระผ่าน PromptPay / บัตรเครดิต,
- FR-5.3 พิมพ์ใบเสร็จรับเงิน,
- FR-5.5 ระบบคะแนนสะสมและการใช้คะแนน,
- FR-3.3 พิมพ์ใบรับผ้า + สร้าง QR Code

### Report & Dashboard (Backend) - ระบบรายงานและ Dashboard ฝั่ง Backend
- FR-6.1 รายงานยอดขายรายวัน,
- FR-6.2 รายงานยอดขายรายเดือน,
- FR-6.3 รายงานลูกค้าประจำ,
- FR-6.4 รายงานบริการยอดนิยม,
- FR-6.5 รายงานงานค้างเกินกำหนด,  

---

##  2.3 ผลงานการออกแบบ (Design & Diagrams)

1. **System Architecture:** [ดูภาพ System Architecture](./images/system-architecture.png)
2. **Use Case Diagram:** [ดูภาพ Use Case Diagram](./images/use-case.png)
3. **Activity Diagram:** [ดูภาพ Activity Diagram](./images/activity-diagram.png)
4. **ER Diagram:** [ดูภาพ ER Diagram](./images/er-diagram.png)
5. **User Flow:** [ดูภาพ User Flow](./images/user-flow.png)
6. **UX/UI Design:** ออกแบบด้วย Tailwind CSS เน้นความสะอาดตาและใช้งานง่าย (Clean & Modern UI)
7. **API End-Points ปัจจุบัน:**
   **ระบบยืนยันตัวตนและโปรไฟล์ (Auth & Profile)**
   * `POST /api/auth/login/staff` - เข้าสู่ระบบพนักงาน
   * `POST /api/auth/login/customer` - เข้าสู่ระบบลูกค้า
   * `POST /api/auth/register` - สมัครสมาชิกลูกค้า
   * `POST /api/auth/request-otp` - ขอรหัส OTP รีเซ็ตรหัสผ่าน
   * `POST /api/auth/reset-password` - รีเซ็ตรหัสผ่านใหม่
   * `GET /api/profile` - ดึงข้อมูลโปรไฟล์ผู้ใช้งาน
   * `PUT /api/profile` - อัปเดตข้อมูลโปรไฟล์ผู้ใช้งาน

   **ระบบลูกค้าและออเดอร์ (Customers & Orders)**
   * `GET /api/customers?search=...` - ดึงข้อมูล/ค้นหาลูกค้า
   * `POST /api/customers` - เพิ่มลูกค้ารายใหม่
   * `POST /api/orders` - สร้างออเดอร์ใหม่
   * `GET /api/orders?search=...` - ดึงข้อมูล/ค้นหาออเดอร์ทั้งหมด
   * `GET /api/orders/:id` - ดึงรายละเอียดออเดอร์รายตัว
   * `PUT /api/orders/:id` - อัปเดตข้อมูลออเดอร์
   * `GET /api/orders/my-orders` - ดึงออเดอร์ของลูกค้าที่ล็อกอิน

   **ระบบคิวงานและเครื่องจักร (Queue & Machines)**
   * `GET /api/machines` - ดึงสถานะเครื่องซักผ้าทั้งหมด
   * `GET /api/orders/queue/all` - ดึงคิวงานซักรีดทั้งหมด
   * `PUT /api/orders/:id/queue` - อัปเดตสถานะคิวงาน (เช่น กำลังซัก, เสร็จสิ้น)

   **ระบบรายงาน (Report)**
   * `GET /api/dashboard` - ดึงข้อมูลสถิติ (รายวัน, รายเดือน, บริการยอดนิยม, ลูกค้าประจำ)
   * *(สามารถดู API ทั้งหมดได้ในไฟล์ `backend/src/index.ts`)*

---

##  2.4 Tech Stack & Tools
**Frontend:**
* **Framework:** SolidJS (รวดเร็ว, ไม่มี Virtual DOM)
* **Styling:** Tailwind CSS
* **Routing:** `@solidjs/router`
* **Language:** TypeScript

**Backend:**
* **Runtime:** Bun 
* **Framework:** Hono 
* **ORM:** Prisma
* **Database:** SQLite 

---

##  2.5 Test Case และผลการทดสอบ
* **API Testing:** ทำการทดสอบ API ผ่าน Postman มั่นใจว่าสามารถส่งข้อมูล JSON ได้ถูกต้อง
* **Unit/Manual Testing:** * ระบบ Login: ป้องกันการเข้าถึงหากรหัสผ่านผิด และตรวจสอบ Role-based Access 
  * ระบบ Dashboard: ตรวจสอบการคำนวณยอดขายย้อนหลังและข้อมูลการเติบโต


### 1. System Test Case (การทดสอบหน้าเว็บ UI)
ตารางแสดงผลการทดสอบการทำงานหลักของระบบผ่านหน้าจอผู้ใช้งาน

| รหัสทดสอบ | ฟังก์ชันที่ทดสอบ | ขั้นตอนการทดสอบ (Steps) | ผลลัพธ์ที่คาดหวัง (Expected) | ผลลัพธ์จริง (Actual) | สถานะ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-UI-01** | Login (ผู้จัดการ) | 1. กรอก Email ผู้จัดการ<br>2. กรอก รหัสผ่าน<br>3. กดปุ่มเข้าสู่ระบบ | ระบบต้องพานำทางไปที่หน้า `/dashboard` อัตโนมัติ | พาไปหน้า Dashboard ได้ถูกต้อง | ✅ Pass |
| **TC-UI-02** | Login (ซักรีด) | 1. กรอก Email พนักงานซักรีด<br>2. กดปุ่มเข้าสู่ระบบ | ระบบต้องพาไปที่หน้า `/queue` ไม่ให้เห็น Dashboard | พาไปหน้า Queue และซ่อนเมนูอื่น | ✅ Pass |
| **TC-UI-03** | Dashboard Tabs | 1. ล็อกอินเป็นผู้จัดการ<br>2. กดสลับแท็บ "ยอดขาย" และ "ลูกค้าประจำ" | ข้อมูลและกราฟต้องเปลี่ยนตามแท็บที่กดโดยหน้าเว็บไม่รีเฟรช | กราฟสลับได้ถูกต้องและรวดเร็ว | ✅ Pass |
| **TC-UI-04** | สร้างออเดอร์ใหม่ | 1. ล็อกอินเป็นพนักงานหน้าร้าน<br>2. ค้นหาลูกค้าและเลือกเพิ่มออเดอร์<br>3. เลือกบริการซักรีดและกดยืนยัน | ระบบคำนวณราคารวมถูกต้อง บันทึกข้อมูลสำเร็จ และขึ้นแจ้งเตือนสีเขียว | สร้างออเดอร์สำเร็จ สถานะเป็น Pending | ✅ Pass |
| **TC-UI-05** | อัปเดตคิวงาน (Kanban) | 1. ไปที่หน้า Queue (พนักงานซักรีด)<br>2. กดเปลี่ยนสถานะงานจาก "รอดำเนินการ" เป็น "กำลังซัก" | การ์ดงานย้ายหมวดหมู่ และข้อมูลใน Database ถูกอัปเดตสถานะ | การ์ดย้ายสำเร็จ สถานะอัปเดตเรียบร้อย | ✅ Pass |

<br>

### 2. API Testing (การทดสอบเส้นทางหลังบ้าน)
ตารางแสดงผลการทดสอบ Backend API (Hono + Prisma) ผ่าน Postman / API Client

| รหัสทดสอบ | API Endpoint | Method | ข้อมูลที่ส่งไป (Request Payload) | ผลลัพธ์ที่คาดหวัง (Expected Response) | สถานะ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-API-01** | `/api/auth/login/staff` | `POST` | `{"email": "...", "password": "..."}` แบบถูกต้อง | HTTP 200 OK<br>ได้ข้อมูล Token และ Role กลับมา | ✅ Pass |
| **TC-API-02** | `/api/auth/login/staff` | `POST` | `{"email": "...", "password": "ผิด"}` | HTTP 400 หรือ 401<br>แจ้ง Error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" | ✅ Pass |
| **TC-API-03** | `/api/dashboard` | `GET` | แนบ Header `Authorization: Bearer <Token>` | HTTP 200 OK<br>ได้ JSON ก้อนข้อมูลสถิติ (dailySales, topCustomers) | ✅ Pass |
| **TC-API-04** | `/api/dashboard` | `GET` | **ไม่แนบ** Token ไปด้วย | HTTP 401 Unauthorized<br>แสดง Error ว่าไม่มีสิทธิ์เข้าถึง | ✅ Pass |
| **TC-API-05** | `/api/profile` | `PUT` | แนบ Token + ส่ง `{"name": "ชื่อใหม่"}` | HTTP 200 OK<br>ข้อมูลชื่อพนักงานใน Database ถูกอัปเดต | ✅ Pass |

---

##  2.6 (วิธีการรันโปรเจกต์)

# LaundryPro System (SolidJS + Hono + Prisma)

โปรเจกต์ระบบจัดการร้านซักรีด พัฒนาด้วยเทคโนโลยีสมัยใหม่และรันด้วย **Bun** ทั้งระบบ

### โครงสร้างโฟลเดอร์ (Monorepo Directory Structure)

เราจะใช้โครงสร้างแบบ Monorepo เพื่อให้แชร์ Type และจัดการ Package ได้ง่ายขึ้น

```
laundry-shop-system/
├── package.json (Root - Workspace config)
├── ARCHITECTURE.md (This file)
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma (Database models)
│   ├── src/
│   │   ├── index.ts (Entry point & middleware)
│   │   ├── constants.ts (Constants)
│   │   ├── seed.ts (Database seeding)
│   │   └── routes/
│   │       └── auth.ts (Authentication APIs)
│   └── .env (Environment variables)
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── src/
    │   ├── index.tsx (React entry)
    │   ├── App.tsx (Main router)
    │   ├── index.css (Global styles)
    │   ├── app/
    │   │   ├── pages/
    │   │   │   └── LoginPage.tsx
    │   │   └── utils/
    │   │       └── api.ts (API client)
    │   ├── assets/ (Images, fonts)
    │   └── public/ (Static files)
    └── .env (Frontend env variables)
```

## ขั้นตอนการเริ่มทำงาน

เพื่อให้ระบบรันได้ถูกต้อง เพื่อนๆ โปรดทำตามลำดับนี้:

### 1. ติดตั้ง Library
เปิด Terminal แล้วรันคำสั่งติดตั้งในทั้ง 2 โฟลเดอร์:
```bash
# ติดตั้งในโฟลเดอร์ backend
cd backend && bun install

# ติดตั้งในโฟลเดอร์ frontend
cd frontend && bun install

```

### 2. ตั้งค่า Environment (.env)

โปรเจกต์นี้ใช้ตัวแปรสภาพแวดล้อมแยกกัน ให้สร้างไฟล์ `.env` ตามตัวอย่างที่เตรียมไว้ 

* **Backend:** แก้ไขไฟล์ `.env` ใน `/backend` ตามข้อความด้านล่าง
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-key-for-dev"
```


* **Frontend:** แก้ไขไฟล์ `.env` ใน `/frontend` ตามข้อความด้านล่าง
```env
VITE_API_URL="http://localhost:3000/api"
```



### 3. เตรียมฐานข้อมูล (Database)

รันคำสั่งเพื่อสร้างตารางและใส่ข้อมูลทดสอบ (Seed) ในเครื่องตัวเอง:

```bash
cd backend #เข้าไปที่โฟลเดอร์ backend
bunx prisma db push
bun run db:seed
```

### 4. การรันโปรเจกต์ (Development)

* **Backend:** `cd backend && bun run dev` (รันที่พอร์ต 3000)
* **Frontend:** `cd frontend && bun run dev` (รันที่พอร์ต 5173)

---

### 5. การจัดการฐานข้อมูล (Database Managment)
รันเพื่อเรียกหน้าเว็บสำหรับการจัดการฐานข้อมูลที่เป็น GUI ได้โดย
```bash
npx prisma studio