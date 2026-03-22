import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
// 1. เอาคอมเมนต์ออก เพื่อให้ใช้งาน api.ts ได้
import { api } from "../utils/api"; 

export default function LoginPage() {
  const [phone, setPhone] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const navigate = useNavigate();

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    try {
      // 2. ใช้โค้ดของจริงสำหรับยิง API
      const data = await api.login(phone(), password());
      localStorage.setItem("token", data.token); 
      alert("เข้าสู่ระบบสำเร็จ! Token ได้รับแล้ว"); // เติม Alert ให้เห็นภาพชัดๆ
      navigate("/dashboard"); 
    } catch (err: any) {
      setError(err.message || "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 class="text-2xl font-bold mb-6 text-center text-blue-600">Laundry Shop</h1>
        {error() && <div class="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{error()}</div>}
        <form onSubmit={handleLogin} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              value={phone()}
              onInput={(e) => setPhone(e.currentTarget.value)}
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input
              type="password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>
          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}