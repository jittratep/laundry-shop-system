// frontend/src/app/pages/CustomerPage.tsx
import { createSignal, For } from "solid-js";
import { useNavigate } from "@solidjs/router"; // เพิ่มตัวนี้มาเพื่อใช้เปลี่ยนหน้า

export default function CustomerPage() {
  const navigate = useNavigate(); // ฟังก์ชันสำหรับกระโดดไปหน้าอื่น

  // 1. ข้อมูลจำลอง (Mock Data) เป็นภาษาไทย
  const [customers] = createSignal([
    {
      id: 1,
      name: "คุณสมหญิง รักสะอาด",
      phone: "081-234-5678",
      email: "somying@email.com",
      address: "123 ถ.สุขุมวิท กรุงเทพฯ",
      points: 450,
      orders: 23,
    },
    {
      id: 2,
      name: "คุณมานะ อดทน",
      phone: "082-345-6789",
      email: "mana@email.com",
      address: "456 ถ.รัชดาภิเษก กรุงเทพฯ",
      points: 780,
      orders: 45,
    },
    {
      id: 3,
      name: "คุณชูใจ ดีเสมอ",
      phone: "083-456-7890",
      email: "choojai@email.com",
      address: "789 ถ.สีลม กรุงเทพฯ",
      points: 210,
      orders: 12,
    },
    {
      id: 4,
      name: "คุณสมชาย ใจดี", // ชื่อนี้ตรงกับข้อมูลในหน้า Payment ที่เราทำไว้!
      phone: "084-567-8901",
      email: "somchai@email.com",
      address: "321 ถ.ลาดพร้าว กรุงเทพฯ",
      points: 950,
      orders: 67,
    },
  ]);

  const [searchQuery, setSearchQuery] = createSignal("");

  return (
    <div class="max-w-5xl mx-auto py-4">
      {/* ส่วนหัวหน้าจอ */}
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-1">จัดการลูกค้า</h1>
        <p class="text-gray-500">ค้นหา ดูประวัติ และเพิ่มข้อมูลลูกค้าใหม่</p>
      </div>

      {/* ปุ่มเครื่องมือต่างๆ */}
      <div class="flex gap-3 mb-8">
        <button class="bg-white border border-gray-200 text-gray-800 px-5 py-2 rounded-full text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors">
          🔍 ค้นหาลูกค้า
        </button>
        <button class="bg-gray-100 text-gray-800 px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
          + ลงทะเบียนลูกค้าใหม่
        </button>
        {/* สอดคล้องกับหน้าอื่น: กดปุ่มนี้แล้วกระโดดไปหน้ารับผ้า/ส่งผ้า (Order) */}
        <button 
          onClick={() => navigate('/orders')} 
          class="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors"
        >
          🧺 สร้างออเดอร์ใหม่
        </button>
      </div>

      {/* การ์ดพื้นที่หลัก */}
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* ส่วนค้นหา */}
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-900">รายชื่อลูกค้าในระบบ</h2>
          <p class="text-gray-500 text-sm mb-4">พิมพ์เพื่อค้นหาจากชื่อ, เบอร์โทรศัพท์, หรืออีเมล</p>
          
          <div class="relative">
            <span class="absolute left-3 top-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล..."
              class="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </div>
        </div>

        {/* รายการลูกค้า */}
        <div class="p-6 flex flex-col gap-4">
          <For each={customers()}>
            {(customer) => (
              <div class="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                
                {/* ข้อมูลฝั่งซ้าย */}
                <div>
                  <h3 class="font-bold text-gray-900 text-lg">{customer.name}</h3>
                  <div class="text-sm text-gray-500 mt-1 space-y-0.5">
                    <p>📞 {customer.phone} • ✉️ {customer.email}</p>
                    <p>📍 {customer.address}</p>
                  </div>
                </div>

                {/* ข้อมูลสถิติฝั่งขวา */}
                <div class="text-right">
                  <p class="text-blue-600 font-bold text-lg">{customer.points} คะแนน</p>
                  <p class="text-gray-400 text-sm">{customer.orders} ออเดอร์</p>
                </div>
                
              </div>
            )}
          </For>
        </div>

      </div>
    </div>
  );
}