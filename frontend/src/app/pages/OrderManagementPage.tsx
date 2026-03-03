// frontend/src/app/pages/OrderManagementPage.tsx
import { createSignal } from "solid-js";

export default function OrderManagementPage() {
  const [totalPrice, setTotalPrice] = createSignal(0);

  return (
    <div class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ฝั่งซ้าย: เลือกรายการผ้า */}
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border">
          <h2 class="text-lg font-bold mb-4">เลือกประเภทบริการ</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button class="p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 text-center">
              <span class="block text-2xl mb-1">🧺</span>
              <span class="text-sm">ซักพับ</span>
            </button>
            <button class="p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 text-center">
              <span class="block text-2xl mb-1">👔</span>
              <span class="text-sm">ซักรีด</span>
            </button>
            {/* เพิ่มปุ่มอื่นๆ ตามประเภท */}
          </div>
        </div>
      </div>

      {/* ฝั่งขวา: สรุปยอดและชำระเงิน */}
      <div class="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100 h-fit sticky top-6">
        <h2 class="text-xl font-bold mb-4">สรุปรายการ</h2>
        <div class="space-y-3 mb-6">
          <div class="flex justify-between">
            <span>ซักรีด (3 ชิ้น)</span>
            <span>฿ 150</span>
          </div>
          <hr />
          <div class="flex justify-between text-xl font-bold text-blue-700">
            <span>รวมทั้งสิ้น</span>
            <span>฿ {totalPrice()}</span>
          </div>
        </div>
        <button class="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700">
          บันทึกและชำระเงิน
        </button>
      </div>
    </div>
  );
}