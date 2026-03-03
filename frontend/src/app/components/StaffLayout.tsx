// frontend/src/app/components/StaffLayout.tsx
import Sidebar from "./Sidebar";

// props.children คือเนื้อหาของแต่ละหน้า (เช่น หน้า Dashboard, หน้า Order) ที่จะถูกโยนเข้ามาตรงกลาง
export default function StaffLayout(props: { children?: any }) {
  return (
    <div class="flex min-h-screen bg-gray-50">
      {/* เมนูด้านซ้าย */}
      <Sidebar />
      
      {/* พื้นที่เนื้อหาด้านขวา (เว้นระยะซ้ายไว้ 64 ตามความกว้าง Sidebar) */}
      <main class="flex-1 ml-64 p-8">
        {props.children}
      </main>
    </div>
  );
}