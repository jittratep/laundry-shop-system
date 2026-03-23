// frontend/src/app/utils/api.ts

// ✅ แก้ไข: ใช้ import.meta.env เพื่อดึงค่าจาก .env ของ Vite
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = {
 // 🟢 1. ฟังก์ชันล็อกอินพนักงาน (ใช้อีเมล)
  loginStaff: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login/staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "เข้าสู่ระบบพนักงานล้มเหลว");
    }
    return res.json(); // จะคืนค่า { message, token, role, name }
  },

  // 🟢 2. ฟังก์ชันล็อกอินลูกค้า (ใช้เบอร์โทร)
  loginCustomer: async (phone: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login/customer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "เข้าสู่ระบบลูกค้าล้มเหลว");
    }
    return res.json(); // จะคืนค่า { message, token, role, name }
  },

  // 🔵 [เพื่อนๆ] เพิ่มฟังก์ชันเรียก API อื่นๆ ต่อตรงนี้ครับ
  // ตัวอย่าง: 
  // getOrders: async () => {
  //   const res = await fetch(`${API_URL}/orders`);
  //   return res.json();
  // }
};