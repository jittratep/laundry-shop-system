// frontend/src/app/utils/api.ts

// ✅ แก้ไข: ใช้ import.meta.env เพื่อดึงค่าจาก .env ของ Vite
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = {
  // ฟังก์ชัน Login ที่ทำไว้ให้แล้ว
  login: async (phone: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Login failed");
    }
    
    return res.json();
  },

  // 🔵 [เพื่อนๆ] เพิ่มฟังก์ชันเรียก API อื่นๆ ต่อตรงนี้ครับ
  // ตัวอย่าง: 
  // getOrders: async () => {
  //   const res = await fetch(`${API_URL}/orders`);
  //   return res.json();
  // }
};