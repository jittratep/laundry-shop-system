import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { api } from "../utils/api";

export default function LoginPage() {
  const [phone, setPhone] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const navigate = useNavigate();

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    try {
      const data = await api.login(phone(), password());
      localStorage.setItem("token", data.token); // บันทึก Token (พิจารณาใช้ HttpOnly Cookie ใน Production)
      navigate("/dashboard"); // ให้เพื่อนร่วมทีมไปสร้างหน้านี้ต่อ
    } catch (err) {
      setError("เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 class="text-2xl font-bold mb-6 text-center text-blue-600">Laundry Shop</h1>
        {error() && <div class="text-red-500 text-sm mb-4">{error()}</div>}
        <form onSubmit={handleLogin} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              value={phone()}
              onInput={(e) => setPhone(e.target.value)}
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input
              type="password"
              value={password()}
              onInput={(e) => setPassword(e.target.value)}
              class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}