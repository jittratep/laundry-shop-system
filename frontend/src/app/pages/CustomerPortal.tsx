// frontend/src/app/pages/CustomerPortal.tsx (หน้าแดชบอร์ดสำหรับลูกค้าในระบบ Customer Portal)
import { createSignal, For, Show, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { api } from "../utils/api";

export default function CustomerPortal() {
  // // --- ข้อมูลจำลอง (Mock Data) ---
  // const customer = {
  //   id: "CUST001",
  //   name: "คุณวชิระพล สิริอิสสระนันท์",
  //   phone: "081-234-5678",
  //   address: "123 ถ.สุขุมวิท กรุงเทพฯ",
  //   loyaltyPoints: 750,
  //   totalOrders: 15,
  // };

  // 🟢 1. สร้าง State สำหรับเก็บข้อมูลลูกค้า (ใส่ค่าเริ่มต้นไว้ก่อนโหลดเสร็จ)
  const [customer, setCustomer] = createSignal({
    id: "",
    name: "กำลังโหลด...",
    phone: "-",
    address: "-",
    points: 0,
    totalOrders: 0 // Mock ไว้ก่อนรอระบบ Order
  });

  // --- States สำหรับโหมดแก้ไขข้อมูล ---
  const [isEditing, setIsEditing] = createSignal(false);
  const [editForm, setEditForm] = createSignal({ name: "", phone: "", address: "" });

  // 🟢 ฟังก์ชันเตรียมข้อมูลก่อนเริ่มแก้
  const startEditing = () => {
    setEditForm({
      name: customer().name,
      phone: customer().phone,
      address: customer().address === "ยังไม่ได้ระบุที่อยู่" ? "" : customer().address,
    });
    setIsEditing(true);
  };

  // 🟢 ฟังก์ชันตอนกดปุ่มบันทึก
  const handleSaveProfile = async () => {
    try {
      const res = await api.updateProfile(editForm());
      
      // อัปเดตข้อมูลใน State ทันทีที่ API ตอบกลับมาว่าสำเร็จ
      setCustomer(prev => ({
        ...prev,
        name: res.data.name,
        phone: res.data.phone,
        address: res.data.address || "ยังไม่ได้ระบุที่อยู่"
      }));
      
      // อัปเดตชื่อใน LocalStorage เผื่อใช้อ้างอิงที่อื่น
      localStorage.setItem("userName", res.data.name);
      
      setIsEditing(false); // ปิดโหมดแก้ไข
      alert("อัปเดตข้อมูลส่วนตัวสำเร็จ!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  // 🟢 2. ดึงข้อมูลจาก API ทันทีที่โหลดหน้านี้
  onMount(async () => {
    try {
      const response = await api.getProfile();
      const data = response.data;
      
      // อัปเดตข้อมูลที่ได้จาก Database ลงไปใน State
      setCustomer({
        id: data.id,
        name: data.name,
        phone: data.phone,
        address: data.address || "ยังไม่ได้ระบุที่อยู่", // ถ้าไม่มีที่อยู่ให้แสดงข้อความนี้
        points: data.points || 0,
        totalOrders: 15 // ตอนนี้สมมติเลขไปก่อน จนกว่าจะทำ API Order
      });
    } catch (error) {
      // ถ้า Token หมดอายุ หรือดึงข้อมูลไม่ได้ ให้เด้งกลับไปหน้า Login
      console.error(error);
      handleLogout();
    }
  });



  const mockOrders = [
    {
      id: "ORD001",
      status: "washing",
      createdAt: "2026-03-05T08:30:00",
      estimatedCompletion: "2026-03-06T14:00:00",
      items: [
        { id: 1, type: "เสื้อเชิ้ต", service: "ซักรีด", quantity: 3, pricePerItem: 50 },
        { id: 2, type: "กางเกงสแล็ค", service: "ซักรีด", quantity: 2, pricePerItem: 60 },
      ],
      totalAmount: 270,
      paymentStatus: "paid",
      paymentMethod: "promptpay",
    },
    {
      id: "ORD002",
      status: "completed",
      createdAt: "2026-02-28T10:00:00",
      estimatedCompletion: "2026-03-01T12:00:00",
      items: [
        { id: 3, type: "ผ้าปูที่นอน", service: "ซักพับ", quantity: 1, pricePerItem: 150 },
      ],
      totalAmount: 150,
      paymentStatus: "paid",
      paymentMethod: "cash",
    },
  ];

  // --- States เพื่อจัดการแท็บออเดอร์ ---
  const [activeTab, setActiveTab] = createSignal("active");
  const navigate = useNavigate();

  // [ฟังก์ชัน Logout]
  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  // --- จัดกลุ่มออเดอร์ ---
  const activeOrders = () => mockOrders.filter(o => o.status !== "completed" && o.status !== "cancelled");
  const completedOrders = () => mockOrders.filter(o => o.status === "completed");

  // --- Helper Functions เพื่อจัดการข้อมูลออเดอร์ ---
  const getOrderProgress = (status: string) => {
    const statusMap: Record<string, number> = {
      pending: 20,
      "in-progress": 40,
      washing: 50,
      drying: 70,
      folding: 85,
      ready: 95,
      completed: 100,
    };
    return statusMap[status] || 0;
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { label: "รับออเดอร์", status: "pending" },
      { label: "กำลังดำเนินการ", status: "in-progress" },
      { label: "กำลังซัก", status: "washing" },
      { label: "กำลังอบ", status: "drying" },
      { label: "พร้อมรับ", status: "ready" },
      { label: "เสร็จสิ้น", status: "completed" },
    ];
    const currentIndex = steps.findIndex((s) => s.status === status);
    // หากหาสถานะไม่เจอ (เช่น เป็น foldding) ให้ถือว่ากำลังดำเนินการอยู่ระหว่างทาง
    const actualIndex = currentIndex === -1 ? 2 : currentIndex; 
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= actualIndex,
      current: index === actualIndex,
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-600";
      case "in-progress": return "bg-blue-100 text-blue-600";
      case "washing": return "bg-blue-100 text-blue-600";
      case "drying": return "bg-yellow-100 text-yellow-600";
      case "folding": return "bg-purple-100 text-purple-600";
      case "ready": return "bg-green-100 text-green-600";
      case "completed": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const translateStatus = (status: string) => {
     switch (status) {
      case "pending": return "รอดำเนินการ";
      case "in-progress": return "กำลังดำเนินการ";
      case "washing": return "กำลังซัก";
      case "drying": return "กำลังอบ";
      case "folding": return "กำลังพับ";
      case "ready": return "พร้อมรับ";
      case "completed": return "เสร็จสิ้น";
      default: return status;
    }
  }

  // 🟢 [เพิ่มใหม่] ฟังก์ชันคำนวณระดับสมาชิกลูกค้าตามคะแนน
  const getCustomerTier = (points: number) => {
    if (points >= 2000) return "gold";
    if (points >= 1000) return "silver";
    if (points >= 500) return "bronze";
    return "none"; // ยังไม่ถึงระดับ Bronze
  };

  // 🟢 [เพิ่มใหม่] คำนวณคะแนนที่ต้องการสำหรับระดับถัดไป
  const getNextTierTarget = (points: number) => {
    if (points >= 2000) return 2000; // ตันที่ Gold
    if (points >= 1000) return 2000; // เป้าหมายต่อไปคือ Gold
    if (points >= 500) return 1000;  // เป้าหมายต่อไปคือ Silver
    return 500;                      // เป้าหมายแรกคือ Bronze
  };

  // --- Icons (SVG) ---
  const IconAward = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;
  const IconPhone = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
  const IconMapPin = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
  const IconPackage = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
  const IconHistory = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline><path d="M12 7v5l4 2"></path></svg>;
  const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
  const IconLogOut = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
  
  return (
    <div class="min-h-screen bg-gray-50 pb-12">
      
      {/* Mobile-first Header (Gradient) */}
      <div class="bg-linear-to-br from-blue-600 to-blue-800 text-white p-6 pt-10 pb-16">
        <div class="container mx-auto max-w-4xl">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h1 class="text-3xl font-bold">ยินดีต้อนรับกลับมา!</h1>
              <p class="text-blue-100 mt-2 text-lg">{customer().name}</p>
            </div>
            
            {/* 🟢 [เพิ่มกลุ่มปุ่ม Logout และ กล่องคะแนน] */}
            <div class="flex flex-col items-end gap-3">
              {/* ปุ่มออกจากระบบ */}
              <button
                onClick={handleLogout}
                class="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 backdrop-blur-sm rounded-lg transition-all text-sm font-bold"
              >
                <IconLogOut /> ออกจากระบบ
              </button>
              
              {/* กล่องคะแนนสะสม (ของเดิม) */}
              <div class="text-right">
                <div class="bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 flex flex-col items-center">
                  <IconAward />
                  <p class="text-3xl font-bold mt-1">{customer().points}</p>
                  <p class="text-xs text-blue-100 font-medium tracking-wide uppercase">คะแนนสะสม</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mt-6">
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p class="text-sm text-blue-100 font-medium">ออเดอร์ปัจจุบัน</p>
              <p class="text-3xl font-bold mt-1">{activeOrders().length}</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p class="text-sm text-blue-100 font-medium">ออเดอร์ทั้งหมด</p>
              <p class="text-3xl font-bold mt-1">{customer().totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto max-w-4xl p-4 -mt-10">
        
        {/* Contact Info Card */}
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-8 relative">
          
          <Show when={!isEditing()}>
            {/* --- โหมดดูข้อมูลปกติ --- */}
            <button 
              onClick={startEditing} 
              class="absolute top-4 right-4 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              แก้ไขข้อมูล
            </button>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div class="flex items-center gap-4">
                <div class="bg-blue-50 p-3 rounded-full text-blue-600"><IconPhone /></div>
                <div>
                  <p class="text-xs text-gray-500 font-bold mb-0.5">เบอร์โทรศัพท์</p>
                  <p class="text-sm font-bold text-gray-900">{customer().phone}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="bg-blue-50 p-3 rounded-full text-blue-600"><IconMapPin /></div>
                <div>
                  <p class="text-xs text-gray-500 font-bold mb-0.5">ที่อยู่จัดส่ง</p>
                  <p class="text-sm font-bold text-gray-900">{customer().address}</p>
                </div>
              </div>
            </div>
          </Show>

          <Show when={isEditing()}>
            {/* --- โหมดแก้ไขข้อมูล (Form) --- */}
            <div class="space-y-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-gray-900">แก้ไขข้อมูลส่วนตัว</h3>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1">ชื่อ - นามสกุล</label>
                  <input 
                    type="text" 
                    value={editForm().name} 
                    onInput={(e) => setEditForm({...editForm(), name: e.currentTarget.value})}
                    class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                  <input 
                    type="tel" 
                    value={editForm().phone} 
                    onInput={(e) => setEditForm({...editForm(), phone: e.currentTarget.value})}
                    class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs font-bold text-gray-700 mb-1">ที่อยู่จัดส่ง</label>
                  <textarea 
                    value={editForm().address} 
                    onInput={(e) => setEditForm({...editForm(), address: e.currentTarget.value})}
                    rows="2"
                    class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                  ></textarea>
                </div>
              </div>

              <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setIsEditing(false)} 
                  class="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleSaveProfile} 
                  class="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </div>
          </Show>
          
        </div>

        {/* Custom Tabs */}
        <div class="bg-gray-200/50 p-1.5 rounded-xl flex gap-1 mb-6">
          <button 
            onClick={() => setActiveTab("active")}
            class={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${activeTab() === "active" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <IconPackage /> ออเดอร์ปัจจุบัน ({activeOrders().length})
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            class={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${activeTab() === "history" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <IconHistory /> ประวัติย้อนหลัง ({completedOrders().length})
          </button>
        </div>

        {/* Tab Content: Active Orders */}
        <Show when={activeTab() === "active"}>
          <div class="space-y-6">
            <Show when={activeOrders().length > 0} fallback={
              <div class="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div class="text-gray-300 flex justify-center mb-4"><IconPackage /></div>
                <p class="text-lg font-bold text-gray-900">ไม่มีออเดอร์ที่กำลังดำเนินการ</p>
                <p class="text-gray-500 mt-1">รายการออเดอร์ปัจจุบันของคุณจะแสดงที่นี่</p>
              </div>
            }>
              <For each={activeOrders()}>
                {(order) => (
                  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div class="p-6 border-b border-gray-100">
                      <div class="flex items-start justify-between mb-6">
                        <div>
                          <h3 class="text-xl font-bold text-gray-900">{order.id}</h3>
                          <p class="text-sm text-gray-500 mt-1">วันที่สั่ง: {new Date(order.createdAt).toLocaleDateString('th-TH')}</p>
                        </div>
                        <span class={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                          {translateStatus(order.status)}
                        </span>
                      </div>

                      {/* Progress Bar & Steps */}
                      <div class="space-y-3 mb-8">
                        <div class="flex justify-between text-sm font-bold">
                          <span class="text-gray-600">ความคืบหน้า</span>
                          <span class="text-blue-600">{getOrderProgress(order.status)}%</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2.5">
                          <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${getOrderProgress(order.status)}%` }}></div>
                        </div>
                      </div>

                      <div class="space-y-4">
                        <For each={getStatusSteps(order.status)}>
                          {(step, index) => (
                            <div class="flex items-center gap-4">
                              <div class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                step.completed ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                              }`}>
                                {step.completed ? "✓" : index() + 1}
                              </div>
                              <p class={`text-sm font-bold ${step.completed ? "text-gray-900" : "text-gray-400"}`}>
                                {step.label}
                              </p>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>

                    <div class="p-6 bg-gray-50/50">
                      <div class="flex items-center gap-2 text-sm mb-6 bg-white p-3 rounded-xl border border-gray-100">
                        <span class="text-gray-400"><IconClock /></span>
                        <span class="text-gray-600 font-semibold">กำหนดเสร็จโดยประมาณ:</span>
                        <span class="font-bold text-gray-900">{new Date(order.estimatedCompletion).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short'})} น.</span>
                      </div>

                      <p class="text-sm font-bold text-gray-900 mb-3">รายการซัก (Items):</p>
                      <div class="space-y-2 mb-4">
                        <For each={order.items}>
                          {(item) => (
                            <div class="flex justify-between text-sm">
                              <span class="text-gray-600">{item.quantity}x {item.type} ({item.service})</span>
                              <span class="font-bold text-gray-900">฿{item.quantity * item.pricePerItem}</span>
                            </div>
                          )}
                        </For>
                      </div>
                      
                      <div class="border-t border-gray-200 pt-4 flex justify-between items-center mb-4">
                        <span class="font-bold text-gray-900">ยอดรวมทั้งสิ้น</span>
                        <span class="text-xl font-bold text-blue-600">฿{order.totalAmount}</span>
                      </div>

                      <div class="flex items-center justify-between text-sm font-bold">
                        <span class={`px-3 py-1 rounded-md bg-gray-900 text-white flex items-center gap-1`}>
                          ✓ ชำระเงินแล้ว
                        </span>
                        <span class="text-gray-500 uppercase">{order.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </Show>

        {/* Tab Content: History */}
        <Show when={activeTab() === "history"}>
          <div class="space-y-4">
            <Show when={completedOrders().length > 0} fallback={
              <div class="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div class="text-gray-300 flex justify-center mb-4"><IconHistory /></div>
                <p class="text-lg font-bold text-gray-900">ไม่มีประวัติออเดอร์</p>
              </div>
            }>
              <For each={completedOrders()}>
                {(order) => (
                  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <h3 class="text-lg font-bold text-gray-900">{order.id}</h3>
                        <p class="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString('th-TH')}</p>
                      </div>
                      <span class="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">เสร็จสิ้น</span>
                    </div>
                    <div class="space-y-2 mb-4">
                      <For each={order.items}>
                        {(item) => (
                          <div class="flex justify-between text-sm">
                            <span class="text-gray-600">{item.quantity}x {item.type}</span>
                            <span class="font-bold text-gray-900">฿{item.quantity * item.pricePerItem}</span>
                          </div>
                        )}
                      </For>
                    </div>
                    <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span class="font-bold text-gray-900">ยอดรวม</span>
                      <span class="text-lg font-bold text-blue-600">฿{order.totalAmount}</span>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </Show>

        {/* Loyalty Program Card */}
        <div class="mt-8 bg-linear-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl overflow-hidden shadow-sm">
          <div class="p-6">
            <h2 class="flex items-center gap-2 text-purple-900 font-bold text-lg mb-1">
              <span class="bg-purple-100 p-1.5 rounded-lg"><IconAward /></span>
              โปรแกรมสะสมคะแนน (Loyalty Rewards)
            </h2>
            <p class="text-sm text-gray-600 mb-6">สะสมคะแนนจากทุกออเดอร์ เพื่อแลกรับส่วนลดพิเศษ</p>
            
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-2 font-bold">
                  <span class="text-gray-700">คะแนนปัจจุบัน</span>
                  {/* 🟢 อัปเดตเป้าหมายสูงสุดแบบไดนามิก */}
                  <span class="text-purple-700">{customer().points} / {getNextTierTarget(customer().points)}</span>
                </div>
                <div class="w-full bg-white rounded-full h-3 border border-purple-100">
                  {/* 🟢 อัปเดต % หลอดคะแนนแบบไดนามิก */}
                  <div 
                    class="bg-linear-to-br from-purple-500 to-blue-500 h-3 rounded-full transition-all" 
                    style={{ width: `${Math.min((customer().points / getNextTierTarget(customer().points)) * 100, 100)}%` }}
                  ></div>
                </div>
                
                <Show when={customer().points < 2000} fallback={
                   <p class="text-xs text-yellow-600 mt-2 font-bold">🎉 ยินดีด้วย! คุณอยู่ระดับสูงสุด (Gold) แล้ว</p>
                }>
                  <p class="text-xs text-gray-500 mt-2 font-semibold">
                    เหลืออีก {getNextTierTarget(customer().points) - customer().points} คะแนน เพื่อเลื่อนระดับเป็นระดับถัดไป!
                  </p>
                </Show>
              </div>

              {/* 🟢 กล่อง 3 ระดับ พร้อมเช็คสถานะปัจจุบัน */}
              <div class="grid grid-cols-3 gap-3 text-center mt-6">
                
                {/* กล่อง Bronze */}
                <div class={`p-4 rounded-xl shadow-sm relative transition-transform ${getCustomerTier(customer().points) === 'bronze' ? 'bg-white border-2 border-orange-400 shadow-md transform scale-105' : 'bg-white/60 border border-gray-100'}`}>
                  <Show when={getCustomerTier(customer().points) === 'bronze'}>
                     <div class="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">ปัจจุบัน</div>
                  </Show>
                  <p class={`text-xs font-bold mb-1 ${getCustomerTier(customer().points) === 'bronze' ? 'text-orange-700' : 'text-gray-500'}`}>บรอนซ์ (Bronze)</p>
                  <p class="text-sm font-bold text-gray-900">500 pts</p>
                </div>

                {/* กล่อง Silver */}
                <div class={`p-4 rounded-xl shadow-sm relative transition-transform ${getCustomerTier(customer().points) === 'silver' ? 'bg-white border-2 border-gray-400 shadow-md transform scale-105' : 'bg-white/60 border border-gray-100'}`}>
                   <Show when={getCustomerTier(customer().points) === 'silver'}>
                     <div class="absolute -top-2 -right-2 bg-gray-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">ปัจจุบัน</div>
                  </Show>
                  <p class={`text-xs font-bold mb-1 ${getCustomerTier(customer().points) === 'silver' ? 'text-gray-700' : 'text-gray-500'}`}>ซิลเวอร์ (Silver)</p>
                  <p class="text-sm font-bold text-gray-900">1000 pts</p>
                </div>

                {/* กล่อง Gold */}
                <div class={`p-4 rounded-xl shadow-sm relative transition-transform ${getCustomerTier(customer().points) === 'gold' ? 'bg-white border-2 border-yellow-400 shadow-md transform scale-105' : 'bg-white/60 border border-gray-100'}`}>
                  <Show when={getCustomerTier(customer().points) === 'gold'}>
                     <div class="absolute -top-2 -right-2 bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">ปัจจุบัน</div>
                  </Show>
                  <p class={`text-xs font-bold mb-1 ${getCustomerTier(customer().points) === 'gold' ? 'text-yellow-600' : 'text-gray-500'}`}>โกลด์ (Gold)</p>
                  <p class="text-sm font-bold text-gray-900">2000 pts</p>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}