// frontend/src/App.tsx
import { Router, Route } from "@solidjs/router";
import LoginPage from "./app/pages/LoginPage";
// [เพื่อนๆ] นำเข้า (Import) หน้า Page ใหม่ๆ ตรงนี้ครับ
// import DashboardPage from "./app/pages/DashboardPage"; 

export default function App() {
  return (
    <Router>
      {/* หน้าแรกสุด (Default Route) */}
      <Route path="/" component={LoginPage} />

      {/* 🟢 [เพื่อนๆ] เพิ่ม Route สำหรับหน้าใหม่ๆ ต่อจากบรรทัดนี้ได้เลยครับ */}
      {/* ตัวอย่าง: <Route path="/dashboard" component={DashboardPage} /> */}
      
    </Router>
  );
}