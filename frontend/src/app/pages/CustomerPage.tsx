// frontend/src/app/pages/CustomerPage.tsx
import { createSignal, For, Show, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { api } from "../utils/api";

export default function CustomerPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = createSignal("search");
  const [toastMessage, setToastMessage] = createSignal({ text: "", type: "success" });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage({ text: "", type: "success" }), 3000);
  };

  // 🟢 1. State ลูกค้าของจริง
  const [customers, setCustomers] = createSignal<any[]>([]);
  const [searchQuery, setSearchQuery] = createSignal("");


  // 🟢 2. โหลดข้อมูลลูกค้าเมื่อเปิดหน้านี้ครั้งแรก
  onMount(() => {
    loadCustomers();
  });

  const loadCustomers = async (query = "") => {
    try {
      const res = await api.getCustomers(query);
      setCustomers(res.data);
      // ตั้งค่าเริ่มต้นให้ selectedCustomer เป็นคนแรก (เพื่อกัน Error หน้าสร้างออเดอร์)
      // if (res.data.length > 0) setSelectedCustomer(res.data[0]);
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  // 🟢 3. State และ ฟังก์ชันสำหรับฟอร์มลงทะเบียนลูกค้าใหม่
  const [regName, setRegName] = createSignal("");
  const [regPhone, setRegPhone] = createSignal("");
  const [regEmail, setRegEmail] = createSignal("");
  const [regAddress, setRegAddress] = createSignal("");

  const handleRegisterCustomer = async (e: Event) => {
    e.preventDefault();
    try {
      await api.createCustomer({
        name: regName(),
        phone: regPhone(),
        email: regEmail(),
        address: regAddress()
      });
      
      showToast("ลงทะเบียนลูกค้าใหม่สำเร็จ! 🎉", "success");
      
      // ล้างฟอร์ม
      setRegName(""); setRegPhone(""); setRegEmail(""); setRegAddress("");
      
      // โหลดข้อมูลใหม่ และเด้งกลับไปหน้าค้นหา
      loadCustomers();
      setActiveTab("search");
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  // --- State สำหรับสร้างออเดอร์ (อันเดิม) ---
  const [selectedCustomer, setSelectedCustomer] = createSignal<any>(null);
  const [orderItems, setOrderItems] = createSignal([
    { id: 1, type: "", quantity: 1, price: 50, service: "ซักพับ" }
  ]);

  const addItem = () => {
    setOrderItems([...orderItems(), { id: Date.now(), type: "", quantity: 1, price: 0, service: "ซักพับ" }]);
  };

  const removeItem = (indexToRemove: number) => {
    if (orderItems().length > 1) {
      setOrderItems(orderItems().filter((_, index) => index !== indexToRemove));
    } else {
      showToast("ต้องมีรายการซักอย่างน้อย 1 รายการ", "error");
    }
  };

  const totalAmount = () => orderItems().reduce((sum, item) => sum + (item.quantity * item.price), 0);

  // 🟢 [เพิ่มใหม่] State สำหรับช่องทางชำระเงิน
  const [paymentMethod, setPaymentMethod] = createSignal("cash");

  // 🟢 [เพิ่มใหม่] ฟังก์ชันกดบันทึกออเดอร์
  const handleCreateOrder = async () => {
    if (!selectedCustomer()) return showToast("กรุณาเลือกลูกค้าก่อนสร้างออเดอร์", "error");
    
    try {
      const res = await api.createOrder({
        customerId: selectedCustomer().id,
        paymentMethod: paymentMethod(),
        items: orderItems(),
        usedPoints: pointsToUse(),
      });

      showToast("สร้างออเดอร์สำเร็จ! 🎉", "success");
      
      // 🟢 1. เก็บข้อมูลออเดอร์ที่สร้างเสร็จไว้ส่งให้ใบเสร็จ
      setCompletedOrderData({
         ...res.data, // ดึงข้อมูลจาก Backend มาเลย
         items: orderItems(),
         paymentMethod: paymentMethod(),
         usedPoints: pointsToUse(),
         netTotal: netAmount() // ยอดสุทธิ
      });

      // 🟢 2. เปิดหน้าต่างใบเสร็จ
      setShowReceiptModal(true);
      
      // ล้างข้อมูลฟอร์ม
      setOrderItems([{ id: Date.now(), type: "", quantity: 1, price: 50, service: "ซักพับ" }]);
      setPaymentMethod("cash");
      setPointsToUse(0); 
      setCashReceived(0); // ล้างเงินทอน
      
      loadCustomers();
      // 🟢 หมายเหตุ: เราจะไม่เด้งกลับไปหน้าค้นหา (setActiveTab("search")) ทันที 
      // จะรอให้พนักงานกดปิดใบเสร็จก่อนค่อยเด้งกลับครับ
      
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  // 🟢 State สำหรับระบบแลกคะแนน
  const [showPointsModal, setShowPointsModal] = createSignal(false);
  const [pointsToUse, setPointsToUse] = createSignal(0);

  // คำนวณส่วนลด (สมมติ: 10 คะแนน = 1 บาท)
  const discountAmount = () => Math.floor(pointsToUse() / 10);
  
  // คำนวณยอดสุทธิ (หลังหักส่วนลด)
  const netAmount = () => Math.max(0, totalAmount() - discountAmount());

  // คำนวณคะแนนที่จะได้รับใหม่ (จากยอดสุทธิ)
  const pointsToEarn = () => Math.floor(netAmount() / 10);


  // --- States สำหรับระบบชำระเงินและใบเสร็จ ---
  const [cashReceived, setCashReceived] = createSignal<number>(0); // เงินสดที่รับมา
  const [showReceiptModal, setShowReceiptModal] = createSignal(false); // เปิด/ปิด Modal
  const [completedOrderData, setCompletedOrderData] = createSignal<any>(null); // ข้อมูลออเดอร์ที่เพิ่งสร้างเสร็จ

  // 🟢 ฟังก์ชันสั่งพิมพ์
  const handlePrint = () => {
    window.print();
  };

  // 🟢 Modal ใบเสร็จ
  const ReceiptModal = () => (
    <Show when={showReceiptModal() && completedOrderData()}>
      <div class="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4">
        <div class="bg-gray-100 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in flex flex-col md:flex-row gap-4 p-6">
          
          {/* 📄 ส่วนที่ 1: ใบเสร็จให้ลูกค้า (Receipt) */}
          <div id="printable-receipt" class="bg-white p-6 rounded-xl shadow-sm flex-1 font-mono text-sm border border-gray-200">
            <div class="text-center mb-6">
              <h2 class="text-xl font-bold">WASH & CLEAR</h2>
              <p class="text-xs text-gray-500">123 ถนนสุขุมวิท กทม. 10110</p>
              <p class="text-xs text-gray-500">โทร. 02-123-4567</p>
              <div class="mt-4 pb-4 border-b border-dashed border-gray-300">
                <p class="font-bold text-lg mb-1">ใบเสร็จรับเงิน (Receipt)</p>
                <p class="text-xs">ออเดอร์: {completedOrderData().orderNumber}</p>
                <p class="text-xs">วันที่: {new Date(completedOrderData().createdAt).toLocaleString('th-TH')}</p>
              </div>
            </div>

            <div class="space-y-2 mb-4 pb-4 border-b border-dashed border-gray-300">
              <p class="font-bold mb-2">ลูกค้า: {selectedCustomer()?.name}</p>
              <For each={completedOrderData().items}>
                {(item: any) => (
                  <div class="flex justify-between">
                    <span>{item.quantity}x {item.type} ({item.service})</span>
                    <span>฿{item.quantity * item.price}</span>
                  </div>
                )}
              </For>
            </div>

            <div class="space-y-1 mb-4 pb-4 border-b border-dashed border-gray-300 font-bold">
               <div class="flex justify-between">
                <span>ยอดรวม</span>
                <span>฿{completedOrderData().items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0)}</span>
              </div>
              <Show when={completedOrderData().usedPoints > 0}>
                <div class="flex justify-between text-red-500">
                  <span>ส่วนลด (ใช้ {completedOrderData().usedPoints} แต้ม)</span>
                  <span>-฿{Math.floor(completedOrderData().usedPoints / 10)}</span>
                </div>
              </Show>
              <div class="flex justify-between text-lg mt-2">
                <span>ยอดสุทธิ</span>
                <span>฿{completedOrderData().netTotal}</span>
              </div>
            </div>

            <div class="text-xs space-y-2">
              <p>ชำระด้วย: <span class="uppercase font-bold">{completedOrderData().paymentMethod}</span></p>
              
              {/* 🟢 ระบบเงินทอน */}
              <Show when={completedOrderData().paymentMethod === 'cash'}>
                <div class="flex items-center gap-2 mt-2 no-print">
                  <span class="font-bold">รับเงินมา:</span>
                  <input 
                    type="number" 
                    value={cashReceived()} 
                    onInput={(e) => setCashReceived(Number(e.currentTarget.value))}
                    class="border rounded px-2 py-1 w-24 text-right"
                    placeholder="0"
                  />
                  <span>บาท</span>
                </div>
                <Show when={cashReceived() > 0}>
                  <div class="flex justify-between font-bold text-green-600 mt-2 text-base">
                    <span>เงินทอน:</span>
                    <span>฿{Math.max(0, cashReceived() - completedOrderData().netTotal)}</span>
                  </div>
                </Show>
              </Show>

              {/* 🟢 ระบบ PromptPay QR */}
              <Show when={completedOrderData().paymentMethod === 'promptpay'}>
                <div class="text-center mt-4 p-4 border rounded-xl bg-blue-50 border-blue-200">
                  <p class="font-bold text-blue-900 mb-2">สแกนเพื่อชำระเงิน</p>
                  {/* ใช้ API ฟรีสร้าง QR Code หลอกๆ เป็นเบอร์พร้อมเพย์ */}
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PROMPTPAY:0812345678:${completedOrderData().netTotal}`} alt="PromptPay QR" class="mx-auto mix-blend-multiply" />
                  <p class="text-[10px] text-gray-500 mt-2">ยอดเงิน: {completedOrderData().netTotal} บาท</p>
                </div>
              </Show>
            </div>
            
            <p class="text-center text-xs mt-8 font-bold">ขอบคุณที่ใช้บริการค่ะ 🙏</p>
          </div>

          {/* 🏷️ ส่วนที่ 2: ใบรับผ้า (สำหรับแปะตะกร้า) & ปุ่ม Action */}
          <div class="flex-1 flex flex-col gap-4 no-print">
            
            <div class="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-200 flex-1">
              <h3 class="font-bold text-yellow-900 mb-4 text-center border-b border-yellow-200 pb-2">ใบติดตะกร้า (Laundry Tag)</h3>
              <div class="text-center mb-4">
                {/* 🟢 สร้าง QR Code เลขออเดอร์ให้พนักงานสแกน */}
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${completedOrderData().orderNumber}`} alt="Order QR" class="mx-auto mb-2 mix-blend-multiply rounded-lg" />
                <p class="font-bold text-xl">{completedOrderData().orderNumber}</p>
                <p class="text-sm font-semibold text-gray-700">{selectedCustomer()?.name}</p>
              </div>
              <div class="text-sm text-gray-800 space-y-1">
                <p>รวมทั้งหมด: <span class="font-bold">{completedOrderData().items.reduce((sum: number, item: any) => sum + item.quantity, 0)} ชิ้น</span></p>
                <p class="uppercase">บริการ: <span class="font-bold text-blue-600">{completedOrderData().items[0]?.service}</span></p>
              </div>
            </div>

            <div class="flex gap-2">
              <button onClick={() => { setShowReceiptModal(false); setSelectedCustomer(null); }} class="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors">
                ปิด / ทำรายการใหม่
              </button>
              <button onClick={handlePrint} class="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                🖨️ พิมพ์ใบเสร็จ
              </button>
            </div>

          </div>
        </div>
      </div>
    </Show>
  );

  
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
                onInput={(e) => {
                  const val = e.currentTarget.value;
                  setSearchQuery(val);
                  loadCustomers(val); // 🟢 ให้มันโหลดข้อมูลใหม่ทันทีที่พิมพ์!
                }}
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
                  
                  {/* 🟢 แก้ไขฝั่งขวา ให้มีทั้งคะแนน และปุ่ม "สร้างออเดอร์" */}
                  <div class="text-right flex flex-col items-end gap-2">
                    <div>
                      <p class="text-blue-600 font-bold text-lg">{customer.points} คะแนน</p>
                      <p class="text-gray-400 text-sm">{customer.orders} ออเดอร์</p>
                    </div>
                    
                    {/* 🟢 ปุ่มเลือกคนนี้เพื่อสร้างออเดอร์ */}
                    <button 
                      onClick={() => {
                        setSelectedCustomer(customer); // 1. ล็อกตัวลูกค้าคนนี้
                        setActiveTab("order"); // 2. สลับไปแท็บสร้างออเดอร์
                        setPointsToUse(0); //3. รีเซ็ตคะแนนที่ค้างอยู่ให้กลับเป็น 0
                      }}
                      class="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-800 transition-colors flex items-center gap-2 mt-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                      สร้างออเดอร์
                    </button>
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

            {/* 🟢 ผูก onSubmit เข้ากับฟังก์ชัน handleRegisterCustomer */}
            <form onSubmit={handleRegisterCustomer} class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">ชื่อ-นามสกุล <span class="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={regName()} onInput={(e) => setRegName(e.currentTarget.value)} required
                    placeholder="กรอกชื่อและนามสกุล"
                    class="w-full bg-gray-100 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">เบอร์โทรศัพท์ <span class="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    value={regPhone()} onInput={(e) => setRegPhone(e.currentTarget.value)} required minlength="9" maxlength="10"
                    placeholder="08X-XXX-XXXX"
                    class="w-full bg-gray-100 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">อีเมล</label>
                  <input 
                    type="email" 
                    value={regEmail()} onInput={(e) => setRegEmail(e.currentTarget.value)}
                    placeholder="example@email.com"
                    class="w-full bg-gray-100 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">ที่อยู่</label>
                  <input 
                    type="text" 
                    value={regAddress()} onInput={(e) => setRegAddress(e.currentTarget.value)}
                    placeholder="บ้านเลขที่ ซอย ถนน เขต จังหวัด"
                    class="w-full bg-gray-100 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>

              <div class="pt-4">
                {/* 🟢 เปลี่ยน type="button" เป็น type="submit" */}
                <button 
                  type="submit" 
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
            <Show 
              when={selectedCustomer()} 
              fallback={
                // 🟠 หน้าจอ Empty State (แสดงเมื่อยังไม่ได้เลือกลูกค้า)
                <div class="h-full flex flex-col">
                  <h2 class="text-lg font-bold text-gray-900 mb-1">สร้างออเดอร์ใหม่</h2>
                  <p class="text-gray-500 text-sm mb-12">กรุณาเลือกลูกค้าจากแท็บค้นหาก่อน</p>

                  <div class="flex-1 flex flex-col items-center justify-center py-16">
                    {/* ไอคอนกล่องพัสดุ */}
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    <p class="text-gray-500 font-semibold mb-6 text-center">กรุณาเลือกลูกค้าจากแท็บค้นหา<br/>เพื่อเริ่มสร้างออเดอร์</p>
                    
                    {/* แถมปุ่มกดกลับไปหน้าค้นหาให้ด้วยครับ */}
                    <button 
                      onClick={() => setActiveTab("search")}
                      class="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <span class="text-lg">🔍</span> ไปหน้าค้นหาลูกค้า
                    </button>
                  </div>
                </div>
              }
            >
              {/* 🟢 หน้าจอสร้างออเดอร์ปกติ (แสดงเมื่อเลือกลูกค้าแล้ว) */}
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
                      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors">
                        
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
                <div class="w-full md:w-auto flex flex-col md:flex-row items-end gap-4">
                  <div class="w-full md:w-64">
                    <label class="block text-sm font-semibold text-gray-900 mb-2">ช่องทางชำระเงิน</label>
                    <select 
                      value={paymentMethod()} 
                      onChange={(e) => setPaymentMethod(e.currentTarget.value)}
                      class="w-full bg-gray-100 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="cash">เงินสด</option>
                      <option value="promptpay">PromptPay</option>
                      <option value="credit">บัตรเครดิต</option>
                    </select>
                  </div>

                  {/* 🟢 ปุ่มเปิด Modal ใช้คะแนน */}
                  <button 
                    onClick={() => setShowPointsModal(true)}
                    disabled={selectedCustomer().points < 10}
                    class={`px-4 py-3 rounded-xl border font-bold text-sm flex items-center gap-2 transition-colors ${
                      pointsToUse() > 0 
                        ? "bg-yellow-50 border-yellow-300 text-yellow-700" 
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    <span class="text-yellow-500">✨</span> 
                    {pointsToUse() > 0 ? `ใช้ ${pointsToUse()} คะแนน (-฿${discountAmount()})` : `ใช้คะแนน (${selectedCustomer().points})`}
                  </button>
                </div>
                
                <div class="text-right">
                  <Show when={discountAmount() > 0}>
                    <p class="text-sm text-gray-500 line-through">ราคาเดิม ฿{totalAmount()}</p>
                    <p class="text-sm text-yellow-600 font-bold mb-1">- ส่วนลด ฿{discountAmount()}</p>
                  </Show>
                  <p class="text-sm text-gray-500 font-semibold">ยอดสุทธิ</p>
                  <p class="text-4xl font-bold text-blue-600">฿{netAmount()}</p>
                </div>
              </div>

              <button 
                onClick={handleCreateOrder} 
                class="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-black transition-colors shadow-lg"
              >
                บันทึกออเดอร์
              </button>
            </Show>
          </div>
        </Show>

        {/* 🟢 [เพิ่มใหม่] กล่อง Toast Notification ที่จะเด้งมุมขวาล่าง */}
        {/* 🟢 อัปเดตกล่อง Toast ให้เปลี่ยนสีตาม Type */}
        {/* 🟢 อัปเดตกล่อง Toast ให้เปลี่ยนสีตาม Type */}
        <Show when={toastMessage().text !== ""}>
            <div class={`fixed bottom-6 right-6 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce z-50 ${
              toastMessage().type === 'error' ? 'bg-red-500 shadow-red-200' : 'bg-green-500 shadow-green-200'
            }`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                {/* 🟢 แก้ตรง fallback นี้ครับ เติม <> และ </> ครอบไว้ */}
                <Show 
                  when={toastMessage().type === 'error'} 
                  fallback={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></>}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </Show>
            </svg>
            <span class="font-bold">{toastMessage().text}</span>
            </div>
        </Show>

        {/* 🟢 Modal ใช้คะแนนสะสม */}
        <Show when={showPointsModal()}>
          <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
              <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span class="text-yellow-500 text-xl">✨</span> ใช้คะแนนสะสม
                </h2>
                <button onClick={() => setShowPointsModal(false)} class="text-gray-400 hover:text-gray-900 text-xl">✕</button>
              </div>

              <div class="p-6 space-y-6">
                <div class="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p class="text-sm text-gray-600 mb-1">คะแนนสะสมของคุณ</p>
                    <p class="text-3xl font-bold text-blue-600">{selectedCustomer().points}</p>
                    <p class="text-xs text-blue-400 font-semibold mt-1">มูลค่าสูงสุด ฿{Math.floor(selectedCustomer().points / 10)}</p>
                  </div>
                  <div class="text-blue-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between items-end mb-2">
                    <label class="block text-sm font-bold text-gray-700">จำนวนคะแนนที่ต้องการใช้</label>
                    <button 
                      onClick={() => setPointsToUse(Math.min(selectedCustomer().points, totalAmount() * 10))}
                      class="text-xs font-bold text-blue-600 hover:underline"
                    >ใช้สูงสุด</button>
                  </div>
                  <input 
                    type="number" 
                    min="0" 
                    max={Math.min(selectedCustomer().points, totalAmount() * 10)} 
                    step="10"
                    value={pointsToUse() || ""}
                    onInput={(e) => {
                      let val = Number(e.currentTarget.value);
                      if (val > selectedCustomer().points) val = selectedCustomer().points;
                      if (val > totalAmount() * 10) val = totalAmount() * 10; // ไม่ให้ใช้เกินราคาสินค้า
                      setPointsToUse(val);
                    }}
                    placeholder={`ใส่คะแนน (สูงสุด ${Math.min(selectedCustomer().points, totalAmount() * 10)})`}
                    class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                  <p class="text-xs text-gray-500 mt-2">อัตราแลก: 10 คะแนน = ฿1 (ใช้ขั้นต่ำ 10 คะแนน)</p>
                </div>

                <div class="flex justify-between items-center text-sm">
                  <span class="font-bold text-gray-700">ราคาเดิม</span>
                  <span class="font-bold">฿{totalAmount()}</span>
                </div>

                <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-sm">
                  <p class="text-yellow-800 font-semibold mb-1">สะสมคะแนน: ทุกการซื้อ ฿10 = 1 คะแนน</p>
                  <p class="text-yellow-700">ออเดอร์นี้จะได้รับ <span class="font-bold">+{pointsToEarn()}</span> คะแนน</p>
                </div>
              </div>

              <div class="p-6 border-t border-gray-100 flex gap-3">
                <button onClick={() => { setPointsToUse(0); setShowPointsModal(false); }} class="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                  ยกเลิก
                </button>
                <button onClick={() => setShowPointsModal(false)} class="flex-1 px-4 py-3 rounded-xl bg-gray-600 text-white font-bold hover:bg-gray-700 transition-colors shadow-md flex justify-center items-center gap-2">
                  <span class="text-yellow-400">✨</span> ใช้คะแนน
                </button>
              </div>
            </div>
          </div>
        </Show>

        {/* 🟢 2. เรียกใช้ Modal ใบเสร็จแค่นี้พอครับ! */}
        {ReceiptModal()}
        
      </div>
    </div>
  );
}