export default function DashboardPage() {
  return (
    <div class="p-6 bg-gray-50 min-h-screen">
      <h1 class="text-3xl font-bold mb-6 text-blue-800">Dashboard ผู้จัดการ</h1>
      
      {/* ส่วนสรุปยอด (Cards) */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p class="text-gray-500 text-sm">ยอดขายวันนี้</p>
          <p class="text-2xl font-bold">฿ 4,500</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <p class="text-gray-500 text-sm">ผ้าค้างซัก</p>
          <p class="text-2xl font-bold">12 รายการ</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p class="text-gray-500 text-sm">ส่งมอบสำเร็จแล้ว</p>
          <p class="text-2xl font-bold">8 รายการ</p>
        </div>
      </div>

      {/* พื้นที่สำหรับใส่กราฟหรือตารางในอนาคต */}
      <div class="bg-white p-6 rounded-xl shadow-sm h-64 flex items-center justify-center border-dashed border-2 border-gray-200">
        <p class="text-gray-400">พื้นที่สำหรับกราฟสรุปยอดขาย (Chart.js)</p>
      </div>
    </div>
  );
}