// frontend/src/app/pages/ProfilePage.tsx
import { createSignal, Show, onMount } from "solid-js";
import { api } from "../utils/api"; // 🟢 1. นำเข้า api

export default function ProfilePage() {
  // --- States ---
  const [name, setName] = createSignal(""); // 🟢 2. เปลี่ยนเป็นค่าว่าง รอโหลดจาก DB
  const [email, setEmail] = createSignal("");
  const [phone, setPhone] = createSignal("");
  const [currentPassword, setCurrentPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  
  // OTP States
  const [otpSent, setOtpSent] = createSignal(false);
  const [otpInputs, setOtpInputs] = createSignal(["", "", "", "", "", ""]);
  
  // Tabs & Toast State
  const [activeTab, setActiveTab] = createSignal("profile");
  const [toastMessage, setToastMessage] = createSignal({ text: "", type: "success" });
  const [isLoading, setIsLoading] = createSignal(true); // 🟢 เพิ่ม State โหลดข้อมูล

  // 🟢 3. ดึงข้อมูลโปรไฟล์เมื่อเปิดหน้าเว็บ
  onMount(async () => {
    try {
      const res = await api.getProfile();
      if (res.data) {
        setName(res.data.name || "");
        setEmail(res.data.email || ""); // พนักงานมักจะล็อกอินด้วย Email
        setPhone(res.data.phone || ""); // ลูกค้ามักจะล็อกอินด้วย Phone
      }
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  });

  const initials = () => (name() || "U").split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // --- Handlers ---
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage({ text: "", type: "success" }), 3000);
  };

  // 🟢 4. ฟังก์ชันอัปเดตโปรไฟล์ผ่าน API
  const handleUpdateProfile = async (e: Event) => {
    e.preventDefault();
    try {
      // ส่งข้อมูลไปบันทึก (api.ts รองรับ name, phone, address)
      await api.updateProfile({ 
        name: name(), 
        phone: phone() 
      });
      showToast("อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว 🎉");
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  // 🟠 ฟังก์ชันเปลี่ยนรหัสผ่าน (ตอนนี้จำลอง UI ไว้ก่อน รอเชื่อม API เปลี่ยนรหัสผ่าน)
  const handlePasswordReset = (e: Event) => {
    e.preventDefault();
    if (newPassword() !== confirmPassword()) {
      showToast("รหัสผ่านใหม่ไม่ตรงกัน", "error");
      return;
    }
    showToast("เปลี่ยนรหัสผ่านสำเร็จ (UI Simulation)");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // 🟠 ฟังก์ชัน OTP (จำลอง UI ไว้ก่อน)
  const handleSendOTP = () => {
    setOtpSent(true);
    showToast(`ส่งรหัส OTP ไปยังเบอร์ ${phone()} แล้ว`);
  };

  const handleVerifyOTP = (e: Event) => {
    e.preventDefault();
    const otpCode = otpInputs().join("");
    if (otpCode.length === 6) {
      showToast("ยืนยันตัวตน (OTP) สำเร็จ");
      setOtpInputs(["", "", "", "", "", ""]);
      setOtpSent(false);
    } else {
      showToast("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก", "error");
    }
  };

  const updateOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newInputs = [...otpInputs()];
    newInputs[index] = value.substring(0, 1);
    setOtpInputs(newInputs);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  // --- Icons (SVG) ---
  const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
  const IconMail = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>;
  const IconPhone = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
  const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
  const IconShield = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;

  return (
    <div class="max-w-4xl mx-auto py-6 relative">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">ตั้งค่าโปรไฟล์ (Profile)</h1>
        <p class="text-gray-500">จัดการข้อมูลส่วนตัว ความปลอดภัย และรหัสผ่านของคุณ</p>
      </div>

      <Show when={isLoading()}>
        <div class="text-center py-10 text-gray-500 font-bold animate-pulse">กำลังโหลดข้อมูลโปรไฟล์...</div>
      </Show>

      <Show when={!isLoading()}>
        {/* Profile Header Card */}
        <div class="flex items-center gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8 animate-fade-in">
          <div class="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
            {initials()}
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{name() || "ผู้ใช้งาน"}</h2>
            <Show when={email()}><p class="text-gray-600 mt-1 flex items-center gap-2"><IconMail /> {email()}</p></Show>
            <Show when={phone()}><p class="text-sm text-gray-500 mt-1 flex items-center gap-2"><IconPhone /> {phone()}</p></Show>
          </div>
        </div>

        {/* Custom Tabs */}
        <div class="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
          <button onClick={() => setActiveTab("profile")} class={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab() === "profile" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            ข้อมูลส่วนตัว
          </button>
          <button onClick={() => setActiveTab("password")} class={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab() === "password" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            เปลี่ยนรหัสผ่าน
          </button>
          <button onClick={() => setActiveTab("security")} class={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab() === "security" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            ความปลอดภัย (OTP)
          </button>
        </div>

        {/* Tab Content: Profile */}
        <Show when={activeTab() === "profile"}>
          <div class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm animate-fade-in">
            <h3 class="text-lg font-bold text-gray-900 mb-2">ข้อมูลส่วนตัว</h3>
            <p class="text-sm text-gray-500 mb-6">อัปเดตชื่อ อีเมล และเบอร์ติดต่อของคุณ</p>
            
            <form onSubmit={handleUpdateProfile} class="space-y-5">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                <div class="relative">
                  <span class="absolute left-4 top-3.5 text-gray-400"><IconUser /></span>
                  <input type="text" value={name()} onInput={(e) => setName(e.currentTarget.value)} class="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">อีเมล (Email)</label>
                <div class="relative">
                  <span class="absolute left-4 top-3.5 text-gray-400"><IconMail /></span>
                  {/* อีเมลส่วนใหญ่ใช้ตอนล็อกอิน จึงมักจะไม่อนุญาตให้แก้ตรงนี้ง่ายๆ เลยใส่ disabled ไว้ก่อนครับ */}
                  <input type="email" disabled value={email()} class="w-full bg-gray-100 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none text-gray-500 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                <div class="relative">
                  <span class="absolute left-4 top-3.5 text-gray-400"><IconPhone /></span>
                  <input type="tel" value={phone()} onInput={(e) => setPhone(e.currentTarget.value)} class="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors mt-2 shadow-md">
                บันทึกข้อมูล
              </button>
            </form>
          </div>
        </Show>

        {/* Tab Content: Password */}
        <Show when={activeTab() === "password"}>
          <div class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm animate-fade-in">
            <h3 class="text-lg font-bold text-gray-900 mb-2">เปลี่ยนรหัสผ่าน</h3>
            <p class="text-sm text-gray-500 mb-6">แนะนำให้เปลี่ยนรหัสผ่านทุกๆ 3 เดือนเพื่อความปลอดภัย</p>
            
            <form onSubmit={handlePasswordReset} class="space-y-5">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">รหัสผ่านปัจจุบัน</label>
                <div class="relative">
                  <span class="absolute left-4 top-3.5 text-gray-400"><IconLock /></span>
                  <input type="password" required value={currentPassword()} onInput={(e) => setCurrentPassword(e.currentTarget.value)} class="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">รหัสผ่านใหม่</label>
                <div class="relative">
                  <span class="absolute left-4 top-3.5 text-gray-400"><IconLock /></span>
                  <input type="password" required value={newPassword()} onInput={(e) => setNewPassword(e.currentTarget.value)} class="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">ยืนยันรหัสผ่านใหม่</label>
                <div class="relative">
                  <span class="absolute left-4 top-3.5 text-gray-400"><IconLock /></span>
                  <input type="password" required value={confirmPassword()} onInput={(e) => setConfirmPassword(e.currentTarget.value)} class="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button type="submit" class="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-colors mt-2 shadow-md">
                อัปเดตรหัสผ่าน
              </button>
            </form>
          </div>
        </Show>

        {/* Tab Content: Security (OTP) */}
        <Show when={activeTab() === "security"}>
          <div class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm animate-fade-in">
            <h3 class="text-lg font-bold text-gray-900 mb-2">การยืนยันตัวตนแบบ 2 ขั้นตอน (2FA)</h3>
            <p class="text-sm text-gray-500 mb-6">เพิ่มความปลอดภัยด้วยการยืนยันผ่าน SMS OTP</p>
            
            <div class="bg-blue-50/50 border border-blue-100 rounded-xl p-6 mb-8 flex items-center gap-5">
              <div class="text-blue-600 bg-blue-100 p-3 rounded-full"><IconShield /></div>
              <div>
                <p class="font-bold text-gray-900 text-lg">เปิดใช้งาน SMS Verification</p>
                <p class="text-sm text-gray-600">ระบบจะส่งรหัส OTP ไปที่เบอร์ {phone()}</p>
              </div>
            </div>

            <Show when={!otpSent()} fallback={
              <form onSubmit={handleVerifyOTP} class="space-y-6">
                <div class="text-center">
                  <label class="block text-sm font-bold text-gray-700 mb-4">กรอกรหัส 6 หลักที่ได้รับทาง SMS</label>
                  <div class="flex justify-center gap-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        class="w-12 h-14 text-center text-xl font-bold bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={otpInputs()[index]}
                        onInput={(e) => updateOtpInput(index, e.currentTarget.value)}
                      />
                    ))}
                  </div>
                </div>
                <div class="flex gap-3 pt-2">
                  <button type="submit" class="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md">ยืนยันรหัส OTP</button>
                  <button type="button" onClick={handleSendOTP} class="px-6 bg-white border border-gray-300 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors">ส่งรหัสอีกครั้ง</button>
                </div>
              </form>
            }>
              <button onClick={handleSendOTP} class="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-colors shadow-md">
                ส่งรหัส OTP ไปยังโทรศัพท์
              </button>
            </Show>
          </div>
        </Show>
      </Show>

      {/* --- Toast Notification --- */}
      <Show when={toastMessage().text !== ""}>
        <div class={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce z-50 text-white ${toastMessage().type === 'error' ? 'bg-red-500 shadow-red-200' : 'bg-green-600 shadow-green-200'}`}>
          <span class="font-bold">{toastMessage().text}</span>
        </div>
      </Show>

    </div>
  );
}