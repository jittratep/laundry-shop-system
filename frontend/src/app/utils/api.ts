// frontend/src/app/utils/api.ts
const API_URL = "http://localhost:3000/api";

export const api = {
  // ฟังก์ชัน Login ที่ทำไว้ให้แล้ว
  login: async (phone: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  // 🔵 [เพื่อนๆ] เพิ่มฟังก์ชันเรียก API อื่นๆ (GET, POST, PUT, DELETE) ต่อตรงนี้ครับ
  // ตัวอย่าง: getOrders: async () => { ... }
};