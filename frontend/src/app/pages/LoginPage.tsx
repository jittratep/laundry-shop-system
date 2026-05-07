// frontend/src/app/pages/LoginPage.tsx
import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { api } from "../utils/api";

export default function LoginPage() {
  const navigate = useNavigate();
  
  // --- States ---
  const [activeTab, setActiveTab] = createSignal("staff");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [phone, setPhone] = createSignal("");

  // 🟢 State สำหรับสมัครสมาชิก
  const [isRegistering, setIsRegistering] = createSignal(false);
  const [registerName, setRegisterName] = createSignal("");
  const [registerPhone, setRegisterPhone] = createSignal("");
  const [registerPassword, setRegisterPassword] = createSignal("");

  // --- Handlers ---
  const handleStaffLogin = async (e: Event) => {
    e.preventDefault();

    try {
      const response = await api.loginStaff(email(), password());
      
      // 🟢 1. ลอง Console.log ดูว่าหน้าตาข้อมูลที่ Backend ส่งมาเป็นแบบไหน
      console.log("Login Response: ", response);
      
      // 🟢 2. ดักจับเผื่อ Backend ส่งข้อมูลมาในก้อน response.user
      const role = response.role || response.user?.role || "manager"; // ถ้าหาไม่เจอจริงๆ สมมติให้เป็น manager ไปก่อน
      const name = response.name || response.user?.name || "พนักงาน";
      const token = response.token;
      
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", name);
      localStorage.setItem("token", token); 
      
      // 🟢 3. จัดการการนำทาง (ใส่ toLowerCase() เผื่อ Backend ส่งมาเป็นตัวพิมพ์ใหญ่)
      const userRole = role.toLowerCase(); 
      
      if (userRole === "manager" || userRole === "admin") {
        navigate("/dashboard", { replace: true });
      } else if (userRole === "laundry-staff") {
        navigate("/queue", { replace: true });
      } else if (userRole === "front-staff") {
        navigate("/customers", { replace: true });
      } else {
        // ถ้าไม่ตรงกับเงื่อนไขด้านบนเลย ให้โชว์ข้อความว่ามันคือ Role อะไร แล้วเด้งไป Dashboard ไว้ก่อน
        alert(`ล็อกอินผ่าน! แต่สิทธิ์ของคุณคือ: ${role}`);
        navigate("/dashboard", { replace: true }); 
      }
      
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCustomerLogin = async (e: Event) => {
    e.preventDefault();

    try {
      // 1. เรียก API ยิงไปหา Hono Backend
      const response = await api.loginCustomer(phone(), password());
      
      // 2. ถ้าสำเร็จ เซฟข้อมูลจริง
      localStorage.setItem("userRole", response.role);
      localStorage.setItem("userName", response.name);
      localStorage.setItem("token", response.token);
      
      // 3. พาไปหน้า Customer Portal
      navigate("/customer-portal", { replace: true }); 
      
    } catch (error: any) {
      // 4. ถ้าผิดพลาด แจ้งเตือนข้อความที่ส่งมาจาก Backend
      alert(error.message);
    }
  };

  // 🟢 ฟังก์ชันจัดการตอนกดปุ่มสมัครสมาชิก
  const handleCustomerRegister = async (e: Event) => {
    e.preventDefault();
    try {
      const response = await api.registerCustomer(registerName(), registerPhone(), registerPassword());
      
      alert("สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...");
      
      // Auto-login ให้เลยหลังจากสมัครเสร็จ (เพราะ Backend เราส่ง Token กลับมาให้ด้วย)
      localStorage.setItem("userRole", "customer");
      localStorage.setItem("userName", response.customer.name);
      localStorage.setItem("token", response.token);
      
      window.location.href = "/customer-portal";
    } catch (error: any) {
      alert(error.message);
    }
  };

  // --- States สำหรับลืมรหัสผ่าน ---
  const [isForgotPassword, setIsForgotPassword] = createSignal(false);
  const [otpSent, setOtpSent] = createSignal(false);
  const [resetPhone, setResetPhone] = createSignal("");
  const [otpCode, setOtpCode] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");

  // --- Handlers สำหรับลืมรหัสผ่าน ---
  const handleRequestOtp = async () => {
    if (!resetPhone()) return alert("กรุณากรอกเบอร์โทรศัพท์");
    try {
      await api.requestOtp(resetPhone());
      alert("ระบบได้ส่งรหัส OTP ไปที่เบอร์ของคุณแล้ว (ดูรหัสใน Terminal ของ Backend)");
      setOtpSent(true); // เปลี่ยนหน้าจอไปช่องกรอก OTP
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleResetPassword = async (e: Event) => {
    e.preventDefault();
    try {
      await api.resetPassword(resetPhone(), otpCode(), newPassword());
      alert("เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่");
      
      // ล้างค่าและกลับไปหน้าล็อกอิน
      setIsForgotPassword(false);
      setOtpSent(false);
      setResetPhone("");
      setOtpCode("");
      setNewPassword("");
    } catch (error: any) {
      alert(error.message);
    }
  };


  // --- Icons (SVG) ---
  const IconShirt = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path></svg>;
  const IconMail = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>;
  const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
  const IconPhone = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
  const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

  return (
    <div class="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        
        {/* Header Section */}
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center bg-blue-600 p-4 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <div class="text-white"><IconShirt /></div>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">LaundryPro</h1>
          <p class="text-gray-600">ระบบจัดการร้านซักรีดระดับมืออาชีพ</p>
        </div>

        {/* Custom Tabs */}
        <div class="bg-gray-100 p-1 rounded-xl flex mb-6">
          <button 
            onClick={() => setActiveTab("staff")}
            class={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab() === "staff" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            สำหรับพนักงาน
          </button>
          <button 
            onClick={() => setActiveTab("customer")}
            class={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab() === "customer" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            สำหรับลูกค้า
          </button>
        </div>

        {/* Card Container */}
        <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          
          {/* Tab Content: Staff */}
          <Show when={activeTab() === "staff"}>
            <div class="p-6 md:p-8">
              <div class="mb-6">
                <h2 class="text-xl font-bold text-gray-900">เข้าสู่ระบบพนักงาน</h2>
                <p class="text-sm text-gray-500 mt-1">เข้าสู่ระบบด้วยบัญชีผู้ใช้พนักงานของคุณ</p>
              </div>

              <form onSubmit={handleStaffLogin} class="space-y-4">
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-gray-700">อีเมล</label>
                  <div class="relative">
                    <span class="absolute left-3 top-3 text-gray-400"><IconMail /></span>
                    <input 
                      type="email" 
                      placeholder="staff@laundryshop.com" 
                      value={email()} 
                      onInput={(e) => setEmail(e.currentTarget.value)}
                      class="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-gray-700">รหัสผ่าน</label>
                  <div class="relative">
                    <span class="absolute left-3 top-3 text-gray-400"><IconLock /></span>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password()} 
                      onInput={(e) => setPassword(e.currentTarget.value)}
                      class="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <button type="submit" class="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors mt-2">
                  เข้าสู่ระบบ
                </button>
              </form>

            </div>
          </Show>

          {/* Tab Content: Customer */}
          <Show when={activeTab() === "customer"}>
            <div class="p-6 md:p-8">
              
              {/* === โหมด 1: เข้าสู่ระบบ === */}
              <Show when={!isRegistering() && !isForgotPassword()}>
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-gray-900">ติดตามสถานะซักรีด</h2>
                  <p class="text-sm text-gray-500 mt-1">เข้าสู่ระบบเพื่อดูประวัติและสถานะออเดอร์ของคุณ</p>
                </div>

                <form onSubmit={handleCustomerLogin} class="space-y-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-bold text-gray-700">เบอร์โทรศัพท์</label>
                    <div class="relative">
                      <span class="absolute left-3 top-3 text-gray-400"><IconPhone /></span>
                      <input type="tel" placeholder="08X-XXX-XXXX" value={phone()} onInput={(e) => setPhone(e.currentTarget.value)} class="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-sm font-bold text-gray-700">รหัสผ่าน</label>
                    <div class="relative">
                      <span class="absolute left-3 top-3 text-gray-400"><IconLock /></span>
                      <input type="password" placeholder="••••••••" value={password()} onInput={(e) => setPassword(e.currentTarget.value)} class="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                  </div>

                  <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors mt-2">
                    เข้าสู่ระบบ
                  </button>

                  <button type="button" onClick={() => setIsForgotPassword(true)} class="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    ลืมรหัสผ่าน / ขอรหัส OTP
                  </button>
                </form>

                <div class="mt-6 text-center">
                  <p class="text-sm text-gray-600">
                    ยังไม่มีบัญชีใช่ไหม? <button onClick={() => setIsRegistering(true)} class="text-blue-600 font-bold hover:underline">สมัครสมาชิกที่นี่</button>
                  </p>
                </div>
              </Show>

              {/* === โหมด 2: สมัครสมาชิก (โค้ดเดิม) === */}
              <Show when={isRegistering()}>
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-gray-900">สมัครสมาชิกใหม่</h2>
                  <p class="text-sm text-gray-500 mt-1">ลงทะเบียนเพื่อสะสมแต้มและติดตามสถานะซักรีด</p>
                </div>

                <form onSubmit={handleCustomerRegister} class="space-y-4">
                  {/* ... (ช่องกรอกชื่อ เบอร์โทร รหัสผ่าน โค้ดสมัครสมาชิกเดิมของคุณ) ... */}
                  <div class="space-y-2">
                    <label class="block text-sm font-bold text-gray-700">ชื่อ - นามสกุล</label>
                    <div class="relative">
                      <span class="absolute left-3 top-3 text-gray-400"><IconUser /></span>
                      <input type="text" placeholder="คุณสมหญิง รักความสะอาด" value={registerName()} onInput={(e) => setRegisterName(e.currentTarget.value)} class="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-sm font-bold text-gray-700">เบอร์โทรศัพท์ (ใช้เป็น Username)</label>
                    <div class="relative">
                      <span class="absolute left-3 top-3 text-gray-400"><IconPhone /></span>
                      <input type="tel" placeholder="08X-XXX-XXXX" value={registerPhone()} onInput={(e) => setRegisterPhone(e.currentTarget.value)} minlength="9" maxlength="10" class="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-sm font-bold text-gray-700">ตั้งรหัสผ่าน</label>
                    <div class="relative">
                      <span class="absolute left-3 top-3 text-gray-400"><IconLock /></span>
                      <input type="password" placeholder="อย่างน้อย 6 ตัวอักษร" value={registerPassword()} onInput={(e) => setRegisterPassword(e.currentTarget.value)} minlength="6" class="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                  </div>

                  <button type="submit" class="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors mt-2">
                    ยืนยันการสมัครสมาชิก
                  </button>
                </form>

                <div class="mt-6 text-center">
                  <p class="text-sm text-gray-600">
                    มีบัญชีอยู่แล้ว? <button onClick={() => setIsRegistering(false)} class="text-blue-600 font-bold hover:underline">กลับไปเข้าสู่ระบบ</button>
                  </p>
                </div>
              </Show>

              {/* === โหมด 3: ลืมรหัสผ่าน (เพิ่มใหม่) === */}
              <Show when={isForgotPassword()}>
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-gray-900">ลืมรหัสผ่าน</h2>
                  <p class="text-sm text-gray-500 mt-1">ระบบจะส่งรหัส OTP ไปยังเบอร์โทรศัพท์ของคุณ</p>
                </div>

                <form onSubmit={handleResetPassword} class="space-y-4">
                  
                  {/* ถ้ายืนยันเบอร์แล้ว (otpSent = true) ให้ช่องเบอร์โทรแก้ไม่ได้ */}
                  <div class="space-y-2">
                    <label class="block text-sm font-bold text-gray-700">เบอร์โทรศัพท์</label>
                    <div class="flex gap-2">
                      <div class="relative flex-1">
                        <span class="absolute left-3 top-3 text-gray-400"><IconPhone /></span>
                        <input type="tel" placeholder="08X-XXX-XXXX" value={resetPhone()} onInput={(e) => setResetPhone(e.currentTarget.value)} disabled={otpSent()} class={`w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${otpSent() ? "bg-gray-100 text-gray-500" : "bg-white"}`} required />
                      </div>
                      <Show when={!otpSent()}>
                        <button type="button" onClick={handleRequestOtp} class="bg-blue-100 text-blue-700 font-bold px-4 rounded-xl hover:bg-blue-200 transition-colors text-sm">
                          ขอ OTP
                        </button>
                      </Show>
                    </div>
                  </div>

                  {/* ช่องกรอก OTP และ รหัสผ่านใหม่ จะโผล่มาก็ต่อเมื่อกดขอ OTP แล้ว */}
                  <Show when={otpSent()}>
                    <div class="space-y-2 animate-fade-in">
                      <label class="block text-sm font-bold text-gray-700">รหัส OTP 6 หลัก</label>
                      <input type="text" placeholder="••••••" value={otpCode()} onInput={(e) => setOtpCode(e.currentTarget.value)} maxlength="6" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-center tracking-[0.5em] text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>

                    <div class="space-y-2 animate-fade-in">
                      <label class="block text-sm font-bold text-gray-700">ตั้งรหัสผ่านใหม่</label>
                      <div class="relative">
                        <span class="absolute left-3 top-3 text-gray-400"><IconLock /></span>
                        <input type="password" placeholder="อย่างน้อย 6 ตัวอักษร" value={newPassword()} onInput={(e) => setNewPassword(e.currentTarget.value)} minlength="6" class="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                      </div>
                    </div>

                    <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors mt-4">
                      เปลี่ยนรหัสผ่าน
                    </button>
                  </Show>
                </form>

                <div class="mt-6 text-center">
                  <button onClick={() => { setIsForgotPassword(false); setOtpSent(false); }} class="text-sm font-bold text-gray-500 hover:text-gray-700 hover:underline">
                    ← กลับไปหน้าเข้าสู่ระบบ
                  </button>
                </div>
              </Show>

            </div>
          </Show>

        </div>

        <p class="text-center text-sm text-gray-400 mt-6 font-medium">
          ระบบรักษาความปลอดภัยด้วยการยืนยันตัวตนผ่าน OTP/SMS
        </p>
      </div>
    </div>
  );
}