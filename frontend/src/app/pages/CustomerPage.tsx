// frontend/src/app/pages/CustomerPage.tsx
import { createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";

export default function CustomerPage() {
  const navigate = useNavigate();

  // สร้าง State เพื่อจำว่าตอนนี้เลือก Tab ไหนอยู่ ('search' หรือ 'register')
  const [activeTab, setActiveTab] = createSignal("search");

  // 🟢 [เพิ่มใหม่] State สำหรับเก็บข้อความแจ้งเตือน (Toast)
  const [toastMessage, setToastMessage] = createSignal("");

  // ข้อมูลลูกค้าจำลอง
  const [customers] = createSignal([
    {
      id: 1, name: "คุณสมหญิง รักสะอาด", phone: "081-234-5678", email: "somying@email.com", address: "123 ถ.สุขุมวิท กรุงเทพฯ", points: 450, orders: 23,
    },
    {
      id: 2, name: "คุณมานะ อดทน", phone: "082-345-6789", email: "mana@email.com", address: "456 ถ.รัชดาภิเษก กรุงเทพฯ", points: 780, orders: 45,
    },
  ]);

  const [searchQuery, setSearchQuery] = createSignal("");

  // 🟢 [เพิ่มใหม่ 1] State สำหรับแท็บสร้างออเดอร์
  const [selectedCustomer] = createSignal(customers()[0]); // จำลองการเลือกลูกค้าคนแรก
  const [orderItems, setOrderItems] = createSignal([
    { id: 1, type: "", quantity: 1, price: 50, service: "ซักพับ" }
  ]);

  const addItem = () => {
    setOrderItems([...orderItems(), { id: Date.now(), type: "", quantity: 1, price: 0, service: "ซักพับ" }]);
  };

    // 🟢 [เพิ่มโค้ดนี้ลงไป] ฟังก์ชันสำหรับลบแถว
   const removeItem = (indexToRemove: number) => {
        if (orderItems().length > 1) {
        setOrderItems(orderItems().filter((_, index) => index !== indexToRemove));
        } else {
        // 🟢 [แก้ไข] เปลี่ยนจาก alert เป็นการเซ็ตข้อความ Toast แทน
        setToastMessage("ต้องมีรายการซักอย่างน้อย 1 รายการ");
        
        // ตั้งเวลาให้ Toast หายไปเองใน 3 วินาที
        setTimeout(() => {
            setToastMessage("");
            }, 3000);
        }
    };

  const totalAmount = () => orderItems().reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div class="max-w-5xl mx-auto py-4 relative"> {/* 🟢 เติม relative เพื่อให้ toast เกาะอยู่กับคอนเทนเนอร์นี้ */}
      {/* ส่วนหัวหน้าจอ */}
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-1">จัดการลูกค้า</h1>
        <p class="text-gray-500">ค้นหา ดูประวัติ และเพิ่มข้อมูลลูกค้าใหม่</p>
      </div>

      {/* ปุ่มเครื่องมือต่างๆ (Tabs) */}
      <div class="flex gap-3 mb-8">
        <button 
          onClick={() => setActiveTab("search")}
          class={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeTab() === "search" 
              ? "bg-white border border-gray-200 text-gray-800 shadow-sm" 
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          🔍 ค้นหาลูกค้า
        </button>
        <button 
          onClick={() => setActiveTab("register")}
          class={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeTab() === "register" 
              ? "bg-white border border-gray-200 text-gray-800 shadow-sm" 
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          + ลงทะเบียนลูกค้าใหม่
        </button>
        
        {/* 🟢 [เพิ่มใหม่ 2] เปลี่ยนปุ่มนี้ให้สลับไปแท็บ order แทนการกระโดดไปหน้าอื่น */}
        <button 
          onClick={() => setActiveTab("order")}
          class={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeTab() === "order" 
              ? "bg-white border border-gray-200 text-gray-800 shadow-sm" 
              : "bg-gray-900 text-white shadow-md hover:bg-gray-900"
          }`}
        >
          🧺 สร้างออเดอร์
        </button>
      </div>

      {/* พื้นที่หลักของการ์ด */}
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* 🟢 แสดงส่วนนี้เมื่อ Tab = search */}
        <Show when={activeTab() === "search"}>
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

          <div class="p-6 flex flex-col gap-4">
            <For each={customers()}>
              {(customer) => (
                <div class="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                  <div>
                    <h3 class="font-bold text-gray-900 text-lg">{customer.name}</h3>
                    <div class="text-sm text-gray-500 mt-1 space-y-0.5">
                      <p>📞 {customer.phone} • ✉️ {customer.email}</p>
                      <p>📍 {customer.address}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-blue-600 font-bold text-lg">{customer.points} คะแนน</p>
                    <p class="text-gray-400 text-sm">{customer.orders} ออเดอร์</p>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>

        {/* 🔵 แสดงส่วนนี้เมื่อ Tab = register (ฟอร์มใหม่ตามรูป) */}
        <Show when={activeTab() === "register"}>
          <div class="p-8">
            <h2 class="text-lg font-bold text-gray-900">ลงทะเบียนลูกค้าใหม่</h2>
            <p class="text-gray-500 text-sm mb-8">เพิ่มข้อมูลลูกค้าใหม่เข้าระบบเพื่อสะสมคะแนน</p>

            <form class="space-y-6">
              {/* แถวที่ 1: ชื่อ และ เบอร์โทร */}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">ชื่อ-นามสกุล <span class="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="กรอกชื่อและนามสกุล"
                    class="w-full bg-gray-100 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">เบอร์โทรศัพท์ <span class="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    placeholder="08X-XXX-XXXX"
                    class="w-full bg-gray-100 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>

              {/* แถวที่ 2: อีเมล และ ที่อยู่ */}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">อีเมล</label>
                  <input 
                    type="email" 
                    placeholder="example@email.com"
                    class="w-full bg-gray-100 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">ที่อยู่</label>
                  <input 
                    type="text" 
                    placeholder="บ้านเลขที่ ซอย ถนน เขต จังหวัด"
                    class="w-full bg-gray-100 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>

              {/* ปุ่ม Submit */}
              <div class="pt-4">
                <button 
                  type="button" 
                  class="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <line x1="19" y1="8" x2="19" y2="14"></line>
                    <line x1="22" y1="11" x2="16" y2="11"></line>
                  </svg>
                  ลงทะเบียนลูกค้า
                </button>
              </div>
            </form>
          </div>
        </Show>

        {/* 🟢 [เพิ่มใหม่ 3] ส่วน UI ของแท็บสร้างออเดอร์ */}
        <Show when={activeTab() === "order"}>
          <div class="p-8">
            <h2 class="text-lg font-bold text-gray-900">สร้างออเดอร์ใหม่</h2>
            <p class="text-gray-500 text-sm mb-6">กำลังสร้างออเดอร์ให้ {selectedCustomer().name}</p>

            {/* กล่องข้อมูลลูกค้า */}
            <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
              <p class="font-bold text-gray-900">{selectedCustomer().name}</p>
              <p class="text-sm text-gray-600">{selectedCustomer().phone}</p>
            </div>

            {/* ส่วนเพิ่มรายการผ้า */}
            <div class="mb-8">
              <h3 class="font-bold text-gray-900 mb-4">เพิ่มรายการ</h3>
              
              <div class="space-y-4 mb-4">
                <For each={orderItems()}>
                  {(item, index) => (
                    // เพิ่ม bg-white และ hover เพื่อให้รู้ว่ากำลังชี้แถวไหนอยู่
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors">
                      
                      {/* ปรับขนาดช่องประเภทผ้าเหลือ col-span-4 */}
                      <div class="md:col-span-4">
                        <label class="block text-xs font-semibold text-gray-600 mb-1">ประเภทผ้า</label>
                        <input type="text" placeholder="ระบุประเภทผ้า" class="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={item.type} onInput={(e) => { const newItems = [...orderItems()]; newItems[index()].type = e.currentTarget.value; setOrderItems(newItems); }} />
                      </div>
                      
                      <div class="md:col-span-2">
                        <label class="block text-xs font-semibold text-gray-600 mb-1">จำนวน</label>
                        <input type="number" min="1" class="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={item.quantity} onInput={(e) => { const newItems = [...orderItems()]; newItems[index()].quantity = Number(e.currentTarget.value); setOrderItems(newItems); }} />
                      </div>
                      
                      <div class="md:col-span-2">
                        <label class="block text-xs font-semibold text-gray-600 mb-1">ราคา/ชิ้น (฿)</label>
                        <input type="number" min="0" class="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={item.price} onInput={(e) => { const newItems = [...orderItems()]; newItems[index()].price = Number(e.currentTarget.value); setOrderItems(newItems); }} />
                      </div>
                      
                      <div class="md:col-span-3">
                        <label class="block text-xs font-semibold text-gray-600 mb-1">บริการ</label>
                        <select class="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={item.service} onChange={(e) => { const newItems = [...orderItems()]; newItems[index()].service = e.currentTarget.value; setOrderItems(newItems); }}>
                          <option value="ซักพับ">ซักพับ</option>
                          <option value="ซักรีด">ซักรีด</option>
                          <option value="ซักแห้ง">ซักแห้ง</option>
                        </select>
                      </div>

                      {/* 🟢 [เพิ่มใหม่] ปุ่มลบรายการ (col-span-1) */}
                      <div class="md:col-span-1">
                        <button 
                          onClick={() => removeItem(index())}
                          class="w-full bg-red-50 text-red-500 border border-red-100 rounded-lg py-3 text-sm font-semibold hover:bg-red-500 hover:text-white transition-colors flex justify-center items-center"
                          title="ลบรายการนี้"
                        >
                          ลบ
                        </button>
                      </div>

                    </div>
                  )}
                </For>
              </div>

              <button onClick={addItem} class="text-sm font-semibold text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                + เพิ่มรายการ
              </button>
            </div>

            <hr class="border-gray-100 mb-6" />

            {/* ส่วนชำระเงิน และ ยอดรวม */}
            <div class="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
              <div class="w-full md:w-1/3">
                <label class="block text-sm font-semibold text-gray-900 mb-2">ช่องทางชำระเงิน</label>
                <select class="w-full bg-gray-100 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="cash">เงินสด</option>
                  <option value="promptpay">PromptPay</option>
                  <option value="credit">บัตรเครดิต</option>
                </select>
              </div>
              
              <div class="text-right">
                <p class="text-sm text-gray-500 font-semibold">ยอดรวมทั้งสิ้น</p>
                <p class="text-4xl font-bold text-blue-600">฿{totalAmount()}</p>
              </div>
            </div>

            <button class="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-black transition-colors shadow-lg">
              บันทึกออเดอร์
            </button>
          </div>
        </Show>

        {/* 🟢 [เพิ่มใหม่] กล่อง Toast Notification ที่จะเด้งมุมขวาล่าง */}
        <Show when={toastMessage() !== ""}>
            <div class="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce shadow-red-200 z-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span class="font-bold">{toastMessage()}</span>
            </div>
        </Show>
      </div>
    </div>
  );
}