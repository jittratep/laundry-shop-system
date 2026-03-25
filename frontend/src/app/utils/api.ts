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

  // 🟢 3. สมัครสมาชิกลูกค้าใหม่
  registerCustomer: async (name: string, phone: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, password }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "สมัครสมาชิกล้มเหลว");
    }
    return res.json(); // จะคืนค่า { message, token, customer }
  },

  // 🟢 4. ดึงข้อมูล Profile ของผู้ที่ล็อกอินอยู่
  getProfile: async () => {
    const token = localStorage.getItem("token"); // ดึง Token จาก LocalStorage
    
    if (!token) throw new Error("กรุณาเข้าสู่ระบบ");

    const res = await fetch(`${API_URL}/profile`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // 🔑 แนบกุญแจ Token ไปให้ Backend ตรวจ
      },
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "ดึงข้อมูลโปรไฟล์ล้มเหลว");
    }
    return res.json(); // จะคืนค่า { data: { id, name, phone, address, points, ... } }
  },

  // 🟢 5. อัปเดตข้อมูล Profile
  updateProfile: async (data: { name?: string; phone?: string; address?: string }) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("กรุณาเข้าสู่ระบบ");

    const res = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "อัปเดตข้อมูลล้มเหลว");
    }
    return res.json();
  },

  // 🟢 6. ขอ OTP สำหรับลืมรหัสผ่าน
  requestOtp: async (phone: string) => {
    const res = await fetch(`${API_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "ขอ OTP ล้มเหลว");
    }
    return res.json();
  },

  // 🟢 7. รีเซ็ตรหัสผ่านด้วย OTP
  resetPassword: async (phone: string, otp: string, newPassword: string) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp, newPassword }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "เปลี่ยนรหัสผ่านล้มเหลว");
    }
    return res.json();
  },

  // 🟢 8. ดึงรายชื่อลูกค้า (ค้นหาได้)
  getCustomers: async (search: string = "") => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("กรุณาเข้าสู่ระบบ");

    const res = await fetch(`${API_URL}/customers?search=${encodeURIComponent(search)}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("ดึงข้อมูลลูกค้าล้มเหลว");
    return res.json();
  },

  // 🟢 9. เพิ่มลูกค้าใหม่โดยพนักงาน
  createCustomer: async (data: { name: string; phone: string; email?: string; address?: string }) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("กรุณาเข้าสู่ระบบ");

    const res = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "เพิ่มลูกค้าล้มเหลว");
    }
    return res.json();
  },

  // 🟢 10. สร้างออเดอร์ใหม่
  createOrder: async (orderData: any) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("กรุณาเข้าสู่ระบบ");

    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderData),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "สร้างออเดอร์ล้มเหลว");
    }
    return res.json();
  },

  // 🟢 11. ดึงรายการออเดอร์ทั้งหมด (รองรับการค้นหา)
  getOrders: async (search: string = "") => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("กรุณาเข้าสู่ระบบ");

    const res = await fetch(`${API_URL}/orders?search=${encodeURIComponent(search)}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
    });
    
    if (!res.ok) throw new Error("ดึงข้อมูลออเดอร์ล้มเหลว");
    return res.json();
  },

  //🟢 12. ดึงข้อมูลออเดอร์รายตัว
  getOrderById: async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/orders/${id}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("ดึงข้อมูลออเดอร์ล้มเหลว");
    return res.json();
  },

  //🟢 13. อัปเดตออเดอร์
  updateOrder: async (id: string, data: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("อัปเดตออเดอร์ล้มเหลว");
    return res.json();
  },
  
  // 🟢 14. ดึงรายการเครื่องซักผ้าทั้งหมด
  getMachines: async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/machines`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("ดึงข้อมูลเครื่องจักรล้มเหลว");
    return res.json();
  },

  // 🟢 15. ดึงข้อมูลคิวงานทั้งหมด
  getQueueOrders: async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/orders/queue/all`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("ดึงข้อมูลคิวงานล้มเหลว");
    return res.json();
  },

  // 🟢 16. อัปเดตสถานะคิวงาน
  updateQueueStatus: async (id: string, data: any) => {
    const token = localStorage.getItem("token");
    
    // เช็คว่าข้อมูลที่ส่งมาเป็นกล่อง FormData หรือข้อความปกติ
    const isFormData = data instanceof FormData;

    const headers: any = {
      "Authorization": `Bearer ${token}`
    };

    // ถ้าเป็นข้อความปกติ ถึงจะใส่ Content-Type (ถ้าเป็นไฟล์ ไม่ต้องใส่ เดี๋ยว Browser จัดการให้)
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_URL}/orders/${id}/queue`, {
      method: "PUT",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    
    if (!res.ok) throw new Error("อัปเดตสถานะคิวงานล้มเหลว");
    return res.json();
  },
  
  // 🟢 17. ดึงรายการออเดอร์ของลูกค้าที่ล็อกอินอยู่
  getMyOrders: async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/orders/my-orders`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("ดึงข้อมูลออเดอร์ล้มเหลว");
    return res.json();
  },

  // 🔵 [เพื่อนๆ] เพิ่มฟังก์ชันเรียก API อื่นๆ ต่อตรงนี้ครับ
  // ตัวอย่าง: 
  // getOrders: async () => {
  //   const res = await fetch(`${API_URL}/orders`);
  //   return res.json();
  // }

  
};