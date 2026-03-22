import { createSignal } from "solid-js";

export default function Register() {
  const [phone, setPhone] = createSignal("");
  const [password, setPassword] = createSignal("");

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone: phone(),
          password: password()
        })
      });

      const data = await res.json();
      alert(data.message || "สมัครสำเร็จ");
    } catch (err) {
      alert("สมัครไม่สำเร็จ");
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 class="text-xl font-bold mb-4 text-center">สมัครสมาชิก</h2>

        <input
          class="w-full mb-3 px-3 py-2 border rounded"
          placeholder="เบอร์โทร"
          onInput={(e) => setPhone(e.currentTarget.value)}
        />

        <input
          type="password"
          class="w-full mb-3 px-3 py-2 border rounded"
          placeholder="รหัสผ่าน"
          onInput={(e) => setPassword(e.currentTarget.value)}
        />

        <button
          class="w-full bg-green-600 text-white py-2 rounded"
          onClick={handleRegister}
        >
          สมัครสมาชิก
        </button>
      </div>
    </div>
  );
}