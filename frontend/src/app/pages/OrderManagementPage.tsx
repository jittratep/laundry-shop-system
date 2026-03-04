// frontend/src/app/pages/OrderManagementPage.tsx
import { createSignal, For } from "solid-js";
import { useNavigate } from "@solidjs/router";

export default function OrderManagementPage() {
  const navigate = useNavigate();

  // ข้อมูลจำลองสำหรับตารางออเดอร์
  const [orders] = createSignal([
    { id: "ORD001", customerName: "Sarah Johnson", phone: "+66 81 234 5678", status: "Pending", payment: "ชำระแล้ว", amount: 270.00, receiveDate: "1 มี.ค. 2569 08:30", dueDate: "1 มี.ค. 2569 14:00" },
    { id: "ORD002", customerName: "Michael Chen", phone: "+66 82 345 6789", status: "In Progress", payment: "ชำระแล้ว", amount: 650.00, receiveDate: "1 มี.ค. 2569 09:15", dueDate: "2 มี.ค. 2569 17:00" },
    { id: "ORD003", customerName: "Emma Wilson", phone: "+66 83 456 7890", status: "Washing", payment: "ชำระแล้ว", amount: 360.00, receiveDate: "28 ก.พ. 2569 16:45", dueDate: "1 มี.ค. 2569 18:00" },
    { id: "ORD004", customerName: "David Lee", phone: "+66 84 567 8901", status: "Ready", payment: "ชำระแล้ว", amount: 450.00, receiveDate: "28 ก.พ. 2569 14:20", dueDate: "1 มี.ค. 2569 11:00" },
    { id: "ORD005", customerName: "Sarah Johnson", phone: "+66 81 234 5678", status: "Completed", payment: "ชำระแล้ว", amount: 400.00, receiveDate: "27 ก.พ. 2569 10:00", dueDate: "28 ก.พ. 2569 17:00" },
  ]);

  const [searchQuery, setSearchQuery] = createSignal("");

  // ฟังก์ชันสลับสี Badge ตามสถานะออเดอร์
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return "bg-orange-100 text-orange-600";
      case "In Progress": return "bg-yellow-100 text-yellow-600";
      case "Washing": return "bg-yellow-100 text-yellow-600";
      case "Ready": return "bg-blue-100 text-blue-600";
      case "Completed": return "bg-green-100 text-green-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div class="max-w-6xl mx-auto py-4">
      
      {/* ส่วนหัว Header และปุ่มสร้างออเดอร์ */}
      <div class="flex justify-between items-end mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-1">Orders</h1>
          <p class="text-gray-500">จัดการออเดอร์ทั้งหมด</p>
        </div>
        {/* 🟢 ปุ่มนี้จะลิงก์กลับไปที่หน้า CustomerPage.tsx (ที่มี Tab สร้างออเดอร์รออยู่) */}
        <button 
          onClick={() => navigate('/customers')}
          class="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-black transition-colors flex items-center gap-2"
        >
          <span>+</span> สร้างออเดอร์ใหม่
        </button>
      </div>

      {/* กล่องสรุปสถิติด้านบน (Stat Cards) */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <p class="text-gray-500 font-semibold mb-2">รอดำเนินการ</p>
          <p class="text-3xl font-bold text-orange-500">1</p>
        </div>
        <div class="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <p class="text-gray-500 font-semibold mb-2">กำลังดำเนินการ</p>
          <p class="text-3xl font-bold text-blue-500">2</p>
        </div>
        <div class="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <p class="text-gray-500 font-semibold mb-2">พร้อมรับ</p>
          <p class="text-3xl font-bold text-green-500">1</p>
        </div>
        <div class="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <p class="text-gray-500 font-semibold mb-2">เสร็จสิ้น (วันนี้)</p>
          <p class="text-3xl font-bold text-gray-700">1</p>
        </div>
      </div>

      {/* พื้นที่ตารางหลัก */}
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* แถบเครื่องมือ ค้นหา + ตัวกรอง */}
        <div class="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div class="relative w-full md:w-2/3">
            <span class="absolute left-4 top-3 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="ค้นหาด้วยเลขออเดอร์, ชื่อลูกค้า, หรือเบอร์โทร..." 
              class="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </div>
          <div class="w-full md:w-auto flex gap-2">
            <button class="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              ทั้งหมด
            </button>
          </div>
        </div>

        {/* ตารางข้อมูลออเดอร์ */}
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-white border-b border-gray-100">
              <tr>
                <th class="p-4 text-xs font-bold text-gray-900">เลขออเดอร์</th>
                <th class="p-4 text-xs font-bold text-gray-900">ลูกค้า</th>
                <th class="p-4 text-xs font-bold text-gray-900">สถานะ</th>
                <th class="p-4 text-xs font-bold text-gray-900">การชำระเงิน</th>
                <th class="p-4 text-xs font-bold text-gray-900">ยอดเงิน</th>
                <th class="p-4 text-xs font-bold text-gray-900">วันรับงาน</th>
                <th class="p-4 text-xs font-bold text-gray-900">วันนัดรับ</th>
                <th class="p-4 text-xs font-bold text-gray-900 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <For each={orders()}>
                {(order) => (
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4 text-sm font-bold text-gray-900">{order.id}</td>
                    <td class="p-4 text-sm">
                      <p class="font-bold text-gray-900">{order.customerName}</p>
                      <p class="text-xs text-gray-500 mt-0.5">{order.phone}</p>
                    </td>
                    <td class="p-4">
                      <span class={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td class="p-4">
                      <span class="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
                        ✓ {order.payment}
                      </span>
                    </td>
                    <td class="p-4 text-sm font-bold text-gray-900">฿{order.amount.toFixed(2)}</td>
                    <td class="p-4 text-sm text-gray-600">{order.receiveDate}</td>
                    <td class="p-4 text-sm text-gray-600">{order.dueDate}</td>
                    <td class="p-4 text-right">
                      <button class="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                        จัดการ
                      </button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>

        {/* ส่วนท้ายตาราง */}
        <div class="p-4 border-t border-gray-100 text-center text-sm text-gray-500">
          แสดง 5 จาก 5 ออเดอร์
        </div>

      </div>
    </div>
  );
}