// frontend/src/app/pages/LoginPage.tsx
import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";

export default function LoginPage() {
  const navigate = useNavigate();
  
  // --- States ---
  const [activeTab, setActiveTab] = createSignal("staff");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [phone, setPhone] = createSignal("");

// --- Handlers ---
  const handleStaffLogin = (e: Event) => {
    e.preventDefault();

    // 🟢 เพิ่มการตรวจสอบอีเมลและรหัสผ่านสำหรับพนักงาน
    if (email() === "staff@laundryshop.com" && password() === "123456") {
      localStorage.setItem("userRole", "front-staff");
      localStorage.setItem("userName", "พนักงานหน้าร้าน (Jane)");
      localStorage.setItem("token", "dummy-token-staff"); 
      navigate("/dashboard", { replace: true });
    } 
    else if (email() === "manager@laundryshop.com" && password() === "123456") {
      localStorage.setItem("userRole", "manager");
      localStorage.setItem("userName", "ผู้จัดการร้าน (John)");
      localStorage.setItem("token", "dummy-token-manager"); 
      navigate("/dashboard", { replace: true });
    } 
    else {
      // 🔴 ถ้ากรอกผิด ให้แจ้งเตือนและไม่ให้เข้าสู่ระบบ
      alert("อีเมล หรือ รหัสผ่านไม่ถูกต้อง!");
    }
  };

  const handleCustomerLogin = (e: Event) => {
    e.preventDefault();

    // 🟢 เพิ่มการตรวจสอบเบอร์โทรและรหัสผ่านสำหรับลูกค้า
    if (phone() === "0891234567" && password() === "123456") {
      localStorage.setItem("userRole", "customer");
      localStorage.setItem("userName", "คุณสมหญิง");
      localStorage.setItem("token", "dummy-token-customer");
      navigate("/customer-portal", { replace: true }); 
    } 
    else {
      // 🔴 ถ้ากรอกผิด ให้แจ้งเตือนและไม่ให้เข้าสู่ระบบ
      alert("เบอร์โทรศัพท์ หรือ รหัสผ่าน/OTP ไม่ถูกต้อง!");
    }
  };

  const handleQuickLogin = (role: string) => {
    const roleNames: Record<string, string> = {
      'manager': 'ผู้จัดการร้าน',
      'front-staff': 'พนักงานหน้าร้าน',
      'laundry-staff': 'พนักงานซักรีด',
      'customer': 'คุณสมหญิง (ลูกค้า)'
    };
    
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', roleNames[role]);
    localStorage.setItem('token', `dummy-token-${role}`);
    
    if (role === 'customer') {
      navigate('/customer-portal', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  // --- Icons (SVG) ---
  const IconShirt = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path></svg>;
  const IconMail = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>;
  const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
  const IconPhone = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;

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

              {/* Quick Access */}
              <div class="mt-8 pt-6 border-t border-gray-100">
                <p class="text-xs font-bold text-gray-500 mb-3 text-center uppercase tracking-wider">ทดลองเข้าสู่ระบบ (Demo)</p>
                <div class="grid grid-cols-3 gap-2">
                  <button onClick={() => handleQuickLogin('manager')} class="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors">ผู้จัดการ</button>
                  <button onClick={() => handleQuickLogin('front-staff')} class="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors">หน้าร้าน</button>
                  <button onClick={() => handleQuickLogin('laundry-staff')} class="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors">ซักรีด</button>
                </div>
              </div>
            </div>
          </Show>

          {/* Tab Content: Customer */}
          <Show when={activeTab() === "customer"}>
            <div class="p-6 md:p-8">
              <div class="mb-6">
                <h2 class="text-xl font-bold text-gray-900">ติดตามสถานะซักรีด</h2>
                <p class="text-sm text-gray-500 mt-1">เข้าสู่ระบบเพื่อดูประวัติและสถานะออเดอร์ของคุณ</p>
              </div>

              <form onSubmit={handleCustomerLogin} class="space-y-4">
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-gray-700">เบอร์โทรศัพท์</label>
                  <div class="relative">
                    <span class="absolute left-3 top-3 text-gray-400"><IconPhone /></span>
                    <input 
                      type="tel" 
                      placeholder="08X-XXX-XXXX" 
                      value={phone()} 
                      onInput={(e) => setPhone(e.currentTarget.value)}
                      class="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-bold text-gray-700">รหัสผ่าน / รหัส OTP</label>
                  <div class="relative">
                    <span class="absolute left-3 top-3 text-gray-400"><IconLock /></span>
                    <input 
                      type="password" 
                      placeholder="กรอกรหัสผ่าน หรือ รหัส OTP" 
                      value={password()} 
                      onInput={(e) => setPassword(e.currentTarget.value)}
                      class="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors mt-2">
                  เข้าสู่ระบบ
                </button>

                <button type="button" class="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  ขอรับรหัส OTP ทาง SMS
                </button>
              </form>

              <div class="mt-8 pt-6 border-t border-gray-100">
                <button onClick={() => handleQuickLogin('customer')} class="w-full bg-gray-50 border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                  ทดลองเข้าสู่ระบบในฐานะลูกค้า (Demo)
                </button>
              </div>
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