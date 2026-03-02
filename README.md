

---


# 🧺 Laundry Shop System (SolidJS + Hono + Prisma)

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
# 🛠️ Tech Stack: Laundry Shop System

รายละเอียดเทคโนโลยีที่ใช้ในโปรเจกต์ ทั้งฝั่ง Frontend, Backend และ Database

---

## ⚡ Runtime Environment
- **[Bun](https://bun.sh/)**: ใช้เป็น JavaScript Runtime, Package Manager และ Test Runner (เร็วกว่า Node.js และรองรับ TypeScript ในตัว)

---

## 🎨 Frontend (Client-side)
- **[SolidJS](https://www.solidjs.com/)**: UI Library ที่เน้นประสิทธิภาพสูง (High Performance) ด้วยระบบ Fine-grained Reactivity (ไม่มี Virtual DOM ทำให้กินทรัพยากรน้อยกว่า React)
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Utility-first CSS framework สำหรับการเขียนสไตล์ที่รวดเร็วและรองรับ Responsive Design
- **[Solid Router](https://github.com/solidjs/solid-router)**: สำหรับจัดการเส้นทาง (Routing) ภายใน Single Page Application (SPA)
- **[Vite](https://vitejs.dev/)**: Frontend Tooling สำหรับการ Build และทำ Hot Module Replacement (HMR) ที่รวดเร็ว

---

## ⚙️ Backend (Server-side)
- **[Hono](https://hono.dev/)**: Web Framework ขนาดเล็กและรวดเร็วมาก (Ultrafast) ออกแบบมาเพื่อทำงานบน Edge Runtimes และรองรับ TypeScript แบบ First-class
- **[Prisma ORM](https://www.prisma.io/)**: ตัวช่วยจัดการ Database Schema และทำ Type-safe Database Queries (ช่วยให้เขียน Query ได้ง่ายและลดข้อผิดพลาด)
- **[Zod](https://zod.dev/)**: TypeScript-first schema validation สำหรับตรวจสอบข้อมูลที่ส่งมาจาก Client (Data Validation)

---

## 🔐 Authentication & Security
- **[JSON Web Tokens (JWT)](https://jwt.io/)**: ใช้สำหรับการทำ Stateless Authentication (ระบบสมาชิกและสิทธิ์การเข้าถึง)
- **[Bcrypt](https://github.com/kelektiv/node.bcrypt.js)**: สำหรับการเข้ารหัสรหัสผ่าน (Password Hashing) ก่อนบันทึกลงฐานข้อมูล

---

## 🗄️ Database
- **[SQLite](https://www.sqlite.org/)**: ฐานข้อมูลแบบไฟล์ที่ติดตั้งง่าย ไม่ต้องรัน Server แยก (เหมาะสำหรับการพัฒนาและระบบขนาดเล็กถึงกลาง)

---

## 🛠️ Development Tools
- **TypeScript**: เพิ่มความปลอดภัยในการเขียนโค้ดด้วยระบบ Static Typing
- **ESLint / Prettier**: สำหรับจัดฟอร์แมตโค้ดให้เป็นมาตรฐานเดียวกันทั้งทีม
- **Postman**: สำหรับทดสอบ API Endpoints
- **Prisma Studio**: GUI สำหรับดูและแก้ไขข้อมูลใน Database แบบ Visual

---

## 📈 System Architecture Diagram (Overview)
`User` <-> `SolidJS (Frontend)` <-> `Hono API (Backend)` <-> `Prisma ORM` <-> `SQLite DB`


## 🚀 ขั้นตอนการเริ่มทำงาน (สำหรับทีม)

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

โปรเจกต์นี้ใช้ตัวแปรสภาพแวดล้อมแยกกัน ให้สร้างไฟล์ `.env` ตามตัวอย่างที่เตรียมไว้สามารถ 
หรือลบที่ `.sample` ที่ต่อท้ายเช่น `.env.example` --> `.env` และกด save 

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
```
---

## 📂 โครงสร้างโปรเจกต์และจุดที่ต้องทำต่อ

### 🔹 Backend (`backend/src`)

* **`routes/auth.ts`**: ระบบ Login/Auth (ใช้ Bcrypt เช็ครหัสผ่าน Hash)
* **`routes/`**: 🟢 **[เพื่อนๆ]** ถ้าจะทำฟีเจอร์ใหม่ (เช่น Orders, Customers) ให้สร้างไฟล์ `.ts` แยกไว้ในโฟลเดอร์นี้
* **`index.ts`**: 🟢 **[เพื่อนๆ]** เมื่อสร้าง Route ใหม่เสร็จ ต้องนำมา Import และลงทะเบียนด้วย `app.route()` ที่นี่เสมอ

### 🔹 Frontend (`frontend/src`)

* **`app/pages/`**: 🟢 **[เพื่อนๆ]** สร้างไฟล์หน้าจอใหม่ที่นี่ (เช่น `DashboardPage.tsx`)
* **`App.tsx`**: 🟢 **[เพื่อนๆ]** เพิ่มเส้นทาง URL ของหน้าตัวเองต่อจากหน้า Login
* **`app/utils/api.ts`**: 🟢 **[เพื่อนๆ]** เพิ่มฟังก์ชันเรียก API (Fetch) ต่อจาก `login` ที่นี่เพื่อให้คนอื่นเรียกใช้ได้ง่าย

---

## 🔐 ข้อมูลสำหรับการทดสอบ (Test Account)

คุณสามารถใช้ Account นี้ในการ Login เพื่อทดสอบระบบ:

* **เบอร์โทรศัพท์:** `0812345678`
* **รหัสผ่าน:** `123456`
*(รหัสผ่านใน DB จะเห็นเป็น Hash เพื่อความปลอดภัย แต่ตอนส่งผ่าน Postman/Frontend ให้ใช้เลขปกติได้เลย)*

---

## 🤝 กฎการทำงาน (Git Workflow)

* **ห้าม** Push งานลง `main` โดยตรง
* **ให้สร้าง Branch ใหม่** ของตัวเองทุกครั้ง: `git checkout -b feat/ชื่อหน้าของคุณ`
* เมื่อทำเสร็จแล้วให้ **Pull Request** มาที่ `main`



---

### 💡 คำแนะนำเพิ่มเติมก่อนส่งงาน:
1. **เช็ค `.gitignore` อีกรอบ:** มั่นใจว่าไม่ได้เอา `node_modules` หรือ `dev.db` ขึ้นไปนะครับ
2. **Push ขึ้น Git:** ```bash
   git add .
   git commit -m "docs: add complete readme for team setup"
   git push origin main











# 🧺 Laundry Shop System (SolidJS + Hono + Prisma)

โปรเจกต์ระบบจัดการร้านซักรีดแบบ Full-stack พัฒนาด้วยเทคโนโลยีสมัยใหม่และรันด้วย **Bun** ทั้งระบบ


## 🚀 ขั้นตอนการเริ่มทำงาน (สำหรับทีม)

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

โปรเจกต์นี้ใช้ตัวแปรสภาพแวดล้อมแยกกัน ให้สร้างไฟล์ `.env` ตามตัวอย่างที่เตรียมไว้สามารถ 
หรือลบที่ `.sample` ที่ต่อท้ายเช่น `.env.example` --> `.env` และกด save 

* **Backend:** สร้าง `backend/.env`
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-key-for-dev"

```


* **Frontend:** สร้าง `frontend/.env`
```env
VITE_API_URL="http://localhost:3000/api"

```



### 3. เตรียมฐานข้อมูล (Database)

รันคำสั่งเพื่อสร้างตารางและใส่ข้อมูลทดสอบ (Seed) ในเครื่องตัวเอง:

```bash
cd backend
bunx prisma db push
bun run db:seed

```

### 4. การรันโปรเจกต์ (Development)

* **Backend:** `cd backend && bun run dev` (รันที่พอร์ต 3000)
* **Frontend:** `cd frontend && bun run dev` (รันที่พอร์ต 5173)

---

## 📂 โครงสร้างการแบ่งงาน (ห้ามสร้าง Folder เพิ่ม!)

เราได้เตรียมไฟล์โครงกระดูก (Skeleton) ไว้ให้ทุกคนแล้ว ให้เขียนโค้ดลงในไฟล์ชื่อของตัวเองได้เลย:

### 🔹 ฝั่ง Backend (`backend/src/routes/`)

* `auth.ts`: ระบบสมาชิกและการยืนยันตัวตน (Bcrypt + JWT)
* `orders.ts`: ระบบรับ-ส่งผ้า และคำนวณราคา
* `customers.ts`: ระบบจัดการข้อมูลและประวัติลูกค้า
* `queues.ts`: ระบบคิวงานและการแจ้งเตือน (SMS/LINE)
* `payments.ts`: ระบบชำระเงินและคะแนนสะสม
* `reports.ts`: ระบบออกรายงาน Dashboard (PDF/Excel)

### 🔹 ฝั่ง Frontend (`frontend/src/app/pages/`)

* `LoginPage.tsx`: หน้าเข้าสู่ระบบ
* `OrderManagementPage.tsx`: หน้าจอรับผ้า/ส่งผ้า
* `CustomerPage.tsx`: หน้าจอจัดการลูกค้า
* `QueuePage.tsx`: หน้าจอคิวงาน (พนักงานซักรีด)
* `PaymentPage.tsx`: หน้าจอชำระเงิน
* `DashboardPage.tsx`: หน้าจอรายงานสำหรับผู้จัดการ

---

## 🔗 การเรียกใช้งาน API (Frontend Utility)

ทุกคนสามารถใช้ฟังก์ชันจาก `frontend/src/app/utils/api.ts` ได้เลย โดยเราเซ็ตค่า `API_URL` จาก `.env` ไว้ให้แล้ว:

```typescript
import { api } from "../utils/api";

// ตัวอย่างการเพิ่มฟังก์ชันใหม่ใน api.ts
// getOrders: async () => { ... fetch(`${API_URL}/orders`) ... }

```

---

## 🔐 ข้อมูลทดสอบ (Default Seed)

* **Phone:** `0812345678`
* **Password:** `123456`
*(รหัสผ่านใน DB จะถูก Hash ไว้เพื่อความปลอดภัย)*

---

## 🤝 Git Workflow

1. `git checkout -b feat/your-feature-name` (สร้าง Branch ใหม่เสมอ)
2. เขียนโค้ดในไฟล์ที่กำหนด
3. `git commit -m "feat: add your feature description"`
4. `git push origin feat/your-feature-name` แล้วค่อยเปิด Pull Request (PR)

```

---

### 💡 คำแนะนำสุดท้ายสำหรับคุณ (Tech Lead):
ก่อนจะส่งไฟล์นี้ให้เพื่อน อย่าลืมตรวจเช็คว่า:
1. ไฟล์ **`backend/.env.example`** และ **`frontend/.env.example`** ถูกสร้างไว้แล้ว (เพื่อให้เพื่อนดูตัวอย่าง)
2. ไฟล์ใน `routes/` และ `pages/` ถูกสร้างไว้เป็นไฟล์เปล่าๆ พร้อมส่งออก (`export default`) เพื่อไม่ให้โปรเจกต์พ่น Error ตอนรัน

**ตอนนี้คุณพร้อมแล้วครับ!** คุณได้วางรากฐานที่ยอดเยี่ยมมาก เพื่อนในทีมจะทำงานได้แบบไม่มีสะดุดแน่นอน

**มีอะไรที่อยากให้ผมช่วยเพิ่มเติมอีกไหมครับ? หรืออยากให้ช่วยร่างโค้ดเริ่มต้นในไฟล์ `orders.ts` หรือ `ordersPage.tsx` ให้เพื่อนดูเป็นแนวทางก่อนไหม?**

```









