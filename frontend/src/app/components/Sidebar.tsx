// frontend/src/app/components/Sidebar.tsx
import { A, useLocation, useNavigate } from "@solidjs/router";
import { createSignal, For, Show, onMount } from "solid-js";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  
  // 🟢 1. ดึงข้อมูลผู้ใช้จาก LocalStorage
  const [userRole, setUserRole] = createSignal("front-staff");
  const [userName, setUserName] = createSignal("Jane Staff");

  onMount(() => {
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    if (role) setUserRole(role);
    if (name) setUserName(name);
  });

  const initials = () => userName().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/", { replace: true });
  };

  // 🟢 2. กำหนดสิทธิ์ให้แต่ละเมนู (ใส่ allowedRoles)
  const allMenuItems = [
    { 
      name: "Dashboard", 
      path: "/dashboard", 
      allowedRoles: ["manager"], // ผู้จัดการ
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg> 
    },
    { 
      name: "Customers", 
      path: "/customers", 
      allowedRoles: ["manager", "front-staff"], // ผู้จัดการ และ หน้าร้าน
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> 
    },
    { 
      name: "Orders", 
      path: "/orders", 
      allowedRoles: ["manager", "front-staff"], // ผู้จัดการ และ หน้าร้าน
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> 
    },
    { 
      name: "Queue", 
      path: "/queue", 
      allowedRoles: ["manager", "laundry-staff"], // ผู้จัดการ และ พนักงานซักรีด
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path></svg> 
    },
  ];

  // 🟢 3. กรองเมนูให้เหลือแค่สิ่งที่ User คนนั้นมีสิทธิ์เห็น
  const visibleMenuItems = () => allMenuItems.filter(item => item.allowedRoles.includes(userRole()));

  // --- ฟังก์ชันแปลง Role เป็นภาษาไทยให้สวยงาม ---
  const displayRole = (role: string) => {
    switch (role) {
      case "manager": return "ผู้จัดการร้าน";
      case "front-staff": return "พนักงานหน้าร้าน";
      case "laundry-staff": return "พนักงานซักรีด";
      default: return role;
    }
  };

  // 🟢 เพิ่มฟังก์ชันเช็คหน้าแรกของแต่ละตำแหน่ง
  const getHomePath = () => {
    if (userRole() === "manager") return "/dashboard";
    if (userRole() === "laundry-staff") return "/queue";
    return "/customers"; // สำหรับ front-staff หรือตำแหน่งอื่นๆ
  };



  return (
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          
          <div class="flex items-center gap-8">
            {/* 🟢 แก้ไขตรงนี้ ให้ใช้ getHomePath() แทนของเดิม */}
            <A href={getHomePath()} class="flex items-center gap-2">
              <div class="bg-blue-600 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path></svg>
              </div>
              <span class="text-xl font-bold text-gray-900">LaundryPro</span>
            </A>
            
            <div class="hidden md:flex items-center gap-1">
              {/* 🟢 4. วนลูปแสดงผลเฉพาะเมนูที่กรองมาแล้ว */}
              <For each={visibleMenuItems()}>
                {(item) => {
                  const isActive = () => location.pathname === item.path;
                  return (
                    <A 
                      href={item.path} 
                      class={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                        isActive() 
                          ? "bg-gray-900 text-white shadow-md" 
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </A>
                  );
                }}
              </For>
            </div>
          </div>

          {/* ฝั่งขวา: โปรไฟล์ผู้ใช้ */}
          <div class="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen())}
              class="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-full transition-colors focus:outline-none"
            >
              <div class="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {initials()}
              </div>
              <span class="hidden md:inline text-sm font-bold text-gray-700">{userName()}</span>
            </button>

            <Show when={isMenuOpen()}>
              <div class="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
              <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <div class="px-4 py-3 border-b border-gray-100 mb-2 bg-gray-50/50 rounded-t-xl">
                  <p class="text-sm font-bold text-gray-900">{userName()}</p>
                  {/* 🟢 แสดงชื่อตำแหน่งภาษาไทย */}
                  <p class="text-xs font-semibold text-blue-600 mt-0.5">{displayRole(userRole())}</p>
                </div>
                
                <A href="/profile" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  โปรไฟล์ (Profile)
                </A>
                
                <button onClick={handleLogout} class="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 text-left mt-1 border-t border-gray-50 pt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  ออกจากระบบ
                </button>
              </div>
            </Show>
          </div>

        </div>
      </div>
    </nav>
  );
}