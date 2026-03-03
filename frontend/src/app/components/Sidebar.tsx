// frontend/src/app/components/Sidebar.tsx
import { A, useLocation } from "@solidjs/router";
import { For } from "solid-js";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "รับผ้า / ส่งผ้า", path: "/orders", icon: "🧺" },
    { name: "คิวงาน", path: "/queue", icon: "⏳" },
    { name: "จัดการลูกค้า", path: "/customers", icon: "👥" },
    { name: "ชำระเงิน", path: "/payment", icon: "💳" },
  ];

  return (
    <div class="w-64 bg-blue-900 text-white min-h-screen p-4 flex flex-col fixed left-0 top-0">
      <div class="text-2xl font-bold mb-8 text-center border-b border-blue-800 pb-4 mt-4">
        🫧 Laundry Shop
      </div>
      
      <nav class="flex-1 space-y-2">
        <For each={menuItems}>
          {(item) => {
            // เช็คว่าตอนนี้อยู่หน้านี้หรือเปล่า เพื่อทำไฮไลท์สีปุ่ม
            const isActive = () => location.pathname === item.path;
            
            return (
              <A
                href={item.path}
                class={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isActive() ? "bg-blue-600 font-bold shadow-lg" : "hover:bg-blue-800 text-blue-100"
                }`}
              >
                <span class="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </A>
            );
          }}
        </For>
      </nav>

      <div class="mt-auto pt-4 border-t border-blue-800">
        <A 
          href="/" 
          class="flex items-center gap-3 p-3 rounded-xl hover:bg-red-600 transition-colors text-red-300 hover:text-white"
        >
          <span class="text-xl">🚪</span>
          <span>ออกจากระบบ</span>
        </A>
      </div>
    </div>
  );
}