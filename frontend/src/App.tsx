// frontend/src/App.tsx
import { Router, Route } from "@solidjs/router";
import LoginPage from "./app/pages/LoginPage";

// @Prosoidger — Frontend (Staff Interface)
import DashboardPage from "./app/pages/DashboardPage";
import OrderManagementPage from "./app/pages/OrderManagementPage";
import CustomerPage from "./app/pages/CustomerPage";
import QueuePage from "./app/pages/QueuePage";
import PaymentPage from "./app/pages/PaymentPage";
import ProfilePage from "./app/pages/ProfilePage";

// นำเข้า Layout ที่เราเพิ่งสร้าง
import StaffLayout from "./app/components/StaffLayout";

// [เพื่อนๆ] นำเข้า (Import) หน้า Page ใหม่ๆ ตรงนี้ครับ
// import DashboardPage from "./app/pages/DashboardPage"; 
import Register from "./Register";

export default function App() {
  return (
    <Router>
      {/* หน้าแรกสุด (Default Route) */}
      <Route path="/" component={LoginPage} />

      {/* 2. หน้าของ Staff ทั้งหมด ให้ครอบด้วย StaffLayout */}
      <Route path="/" component={StaffLayout}>

        {/*เพิ่ม Route @Prosoidger — Frontend (Staff Interface) */}
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/orders" component={OrderManagementPage} />
        <Route path="/customers" component={CustomerPage} />
        <Route path="/queue" component={QueuePage} />
        <Route path="/payment" component={PaymentPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/register" component={Register} />
        {/* [เพื่อนคนอื่น] มาต่อ Route ของตัวเองได้ที่นี่ */}
        {/* 🟢 [เพื่อนๆ] เพิ่ม Route สำหรับหน้าใหม่ๆ ต่อจากบรรทัดนี้ได้เลยครับ */}
        <Route path="/register" component={Register} />
        {/* ตัวอย่าง: <Route path="/dashboard" component={DashboardPage} /> */}
      </Route>
    </Router>
  );
}