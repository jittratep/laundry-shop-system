// frontend/src/app/components/StaffLayout.tsx
import { useNavigate } from "@solidjs/router";
import { onMount } from "solid-js";
import Sidebar from "./Sidebar"; // เปลี่ยนรูปร่างเป็น Topbar แล้ว แต่ยังใช้ชื่อเดิม

export default function StaffLayout(props: { children?: any }) {
  const navigate = useNavigate();

  onMount(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
    }
  });

  return (
    // 🟢 เปลี่ยนเป็น flex-col (เรียงบนลงล่าง) แทนของเดิมที่เรียงซ้ายไปขวา
    <div class="min-h-screen bg-gray-50 flex flex-col">
      
      {/* เมนูนำทางด้านบน */}
      <Sidebar />
      
      {/* 🟢 พื้นที่เนื้อหาหลัก (เอา ml-64 ออกแล้ว) */}
      <main class="flex-1 p-4 md:p-8">
        {props.children}
      </main>
      
    </div>
  );
}