import { createSignal, Show } from "solid-js";

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = createSignal("cash");
  const [isPaid, setIsPaid] = createSignal(false);

  // ข้อมูลตัวอย่าง (ในอนาคตจะดึงจาก API ตาม Order ID)
  const orderSummary = {
    id: "ORD-6701",
    customer: "คุณสมชาย ใจดี",
    items: [
      { name: "ซักอบพับ (S)", price: 50 },
      { name: "ซักแห้งเสื้อสูท", price: 120 },
    ],
    total: 170
  };

  const handlePayment = () => {
    // Logic ส่งข้อมูลไป Backend
    alert(`ชำระเงินเรียบร้อยด้วย: ${paymentMethod()}`);
    setIsPaid(true);
  };

  return (
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8 text-gray-800">ชำระเงิน</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ฝั่งซ้าย: สรุปออเดอร์ */}
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-semibold mb-4 border-b pb-2 text-blue-600">รายการออเดอร์ {orderSummary.id}</h2>
          <div class="space-y-4">
            <p class="text-gray-600">ลูกค้า: <span class="font-bold text-gray-800">{orderSummary.customer}</span></p>
            <div class="space-y-2">
              {orderSummary.items.map((item) => (
                <div class="flex justify-between text-gray-700">
                  <span>{item.name}</span>
                  <span>฿{item.price}</span>
                </div>
              ))}
            </div>
            <div class="border-t pt-4 flex justify-between text-2xl font-bold text-gray-900">
              <span>ยอดรวมทั้งสิ้น</span>
              <span class="text-green-600">฿{orderSummary.total}</span>
            </div>
          </div>
        </div>

        {/* ฝั่งขวา: เลือกวิธีชำระเงิน */}
        <div class="space-y-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">ช่องทางชำระเงิน</h2>
            <div class="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setPaymentMethod("cash")}
                class={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${paymentMethod() === "cash" ? "border-blue-500 bg-blue-50" : "border-gray-100"}`}
              >
                <span class="text-3xl mb-2">💵</span>
                <span>เงินสด</span>
              </button>
              <button 
                onClick={() => setPaymentMethod("qr")}
                class={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${paymentMethod() === "qr" ? "border-blue-500 bg-blue-50" : "border-gray-100"}`}
              >
                <span class="text-3xl mb-2">📱</span>
                <span>QR PromptPay</span>
              </button>
            </div>
          </div>

          <Show when={!isPaid()} fallback={
            <div class="space-y-4">
              <div class="bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold">
                ✓ ชำระเงินสำเร็จ
              </div>
              <button 
                onClick={() => window.print()}
                class="w-full bg-gray-800 text-white py-4 rounded-xl font-bold hover:bg-gray-900"
              >
                🖨️ พิมพ์ใบเสร็จ
              </button>
            </div>
          }>
            <button 
              onClick={handlePayment}
              class="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-transform"
            >
              ยืนยันการรับเงิน
            </button>
          </Show>
        </div>

      </div>
    </div>
  );
}