// frontend/src/app/pages/OrderManagementPage.tsx
import { createSignal, For, onMount, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { api } from "../utils/api"; // 🟢 อย่าลืม Import API

export default function OrderManagementPage() {
  const navigate = useNavigate();

  // 🟢 1. State ของจริง
  const [orders, setOrders] = createSignal<any[]>([]);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(true);

  // 🟢 2. State สำหรับกล่องสถิติด้านบน
  const [stats, setStats] = createSignal({
    pending: 0,
    inProgress: 0,
    ready: 0,
    completed: 0
  });

  // 🟢 State ควบคุมว่าเปิด Dropdown ของออเดอร์ไหนอยู่
  const [openDropdownId, setOpenDropdownId] = createSignal<string | null>(null);

  // 🟢 State สำหรับเก็บพิกัดของ Dropdown
  const [dropdownPosition, setDropdownPosition] = createSignal({ top: 0, right: 0 });

  // 🟢 เพิ่ม State ใหม่
  const [selectedOrder, setSelectedOrder] = createSignal<any>(null);
  const [showDetailModal, setShowDetailModal] = createSignal(false);
  const [showEditModal, setShowEditModal] = createSignal(false);

  // 🟢 ฟังก์ชันดึงข้อมูลมาแสดงใน Modal
  const openDetails = async (id: string) => {
    setOpenDropdownId(null);
    try {
      const res = await api.getOrderById(id);
      setSelectedOrder(res.data);
      setShowDetailModal(true);
    } catch (e) { alert("โหลดข้อมูลล้มเหลว"); }
  };

  const openEdit = async (id: string) => {
    setOpenDropdownId(null);
    try {
      const res = await api.getOrderById(id);
      setSelectedOrder(res.data);
      setShowEditModal(true);
    } catch (e) { alert("โหลดข้อมูลล้มเหลว"); }
  };

  // 🟢 ฟังก์ชันยกเลิกออเดอร์
  const handleCancelOrder = async (id: string) => {
    setOpenDropdownId(null); // ปิด Dropdown ก่อน
    
    // ถามเพื่อความชัวร์ (Confirm Dialog)
    const isConfirm = window.confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการยกเลิกออเดอร์นี้?\n(การกระทำนี้ไม่สามารถย้อนกลับได้)");
    
    if (isConfirm) {
      try {
        // ส่งสถานะ "cancelled" ไปให้ Backend อัปเดต
        await api.updateOrder(id, { status: "cancelled" });
        loadOrders(); // รีโหลดตารางใหม่
      } catch (e: any) {
        alert("เกิดข้อผิดพลาดในการยกเลิกออเดอร์");
      }
    }
  };

  const toggleDropdown = (id: string) => {
    if (openDropdownId() === id) {
      setOpenDropdownId(null); // ปิดถ้ากดซ้ำ
    } else {
      setOpenDropdownId(id); // เปิดของออเดอร์ที่กด
    }
  };

  // 🟢 SVG Icons สำหรับเมนู Dropdown
  const IconEye = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
  const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
  const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

  // 🟢 3. โหลดข้อมูลตอนเปิดหน้าเว็บ
  onMount(() => {
    loadOrders();
  });

  const loadOrders = async (query = "") => {
    setIsLoading(true);
    try {
      const res = await api.getOrders(query);
      const data = res.data;
      setOrders(data);

      // คำนวณสถิติอัตโนมัติจากข้อมูลที่ได้มา
      setStats({
        pending: data.filter((o: any) => o.status === "pending").length,
        inProgress: data.filter((o: any) => ["in-progress", "washing", "drying", "folding"].includes(o.status)).length,
        ready: data.filter((o: any) => o.status === "ready").length,
        completed: data.filter((o: any) => o.status === "completed").length,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 แปลงสถานะจาก Backend ให้กลายเป็นคำสวยๆ ใน UI
  const formatStatus = (status: string) => {
    const statusMap: any = {
      "pending": "รอดำเนินการ",
      "in-progress": "กำลังดำเนินการ",
      "washing": "กำลังซัก",
      "drying": "กำลังอบ",
      "folding": "กำลังพับ",
      "ready": "พร้อมรับ",
      "completed": "เสร็จสิ้น",
      "cancelled": "ยกเลิกแล้ว" // 🟢 เพิ่มบรรทัดนี้
    };
    return statusMap[status] || status;
  };

  // 🟢 ฟังก์ชันสลับสี Badge ตามสถานะออเดอร์
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-600";
      case "in-progress": 
      case "washing": 
      case "drying": 
      case "folding": return "bg-blue-100 text-blue-600";
      case "ready": return "bg-green-100 text-green-600";
      case "completed": return "bg-gray-100 text-gray-600";
      case "cancelled": return "bg-red-100 text-red-600 border border-red-200"; // 🟢 เพิ่มสีแดงสำหรับออเดอร์ที่ถูกยกเลิก
      default: return "bg-gray-100 text-gray-600";
    }
  };

  // 🟢 ตัวแปลงวันที่ให้อ่านง่าย
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleString('th-TH', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    }) + ' น.';
  };

  return (
    <div class="max-w-6xl mx-auto py-4">
      {/* ส่วนหัว Header และปุ่มสร้างออเดอร์ */}
      <div class="flex justify-between items-end mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-1">Orders</h1>
          <p class="text-gray-500">จัดการออเดอร์ทั้งหมด</p>
        </div>
        <button 
          onClick={() => navigate('/customers')}
          class="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-black transition-colors flex items-center gap-2"
        >
          <span>+</span> สร้างออเดอร์ใหม่
        </button>
      </div>

      {/* กล่องสรุปสถิติด้านบน (Dynamic Stats) */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <p class="text-gray-500 font-semibold mb-2">รอดำเนินการ</p>
          <p class="text-3xl font-bold text-orange-500">{stats().pending}</p>
        </div>
        <div class="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <p class="text-gray-500 font-semibold mb-2">กำลังดำเนินการ</p>
          <p class="text-3xl font-bold text-blue-500">{stats().inProgress}</p>
        </div>
        <div class="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <p class="text-gray-500 font-semibold mb-2">พร้อมรับ</p>
          <p class="text-3xl font-bold text-green-500">{stats().ready}</p>
        </div>
        <div class="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <p class="text-gray-500 font-semibold mb-2">เสร็จสิ้น</p>
          <p class="text-3xl font-bold text-gray-700">{stats().completed}</p>
        </div>
      </div>

      {/* พื้นที่ตารางหลัก */}
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* แถบเครื่องมือ ค้นหา */}
        <div class="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div class="relative w-full md:w-2/3">
            <span class="absolute left-4 top-3 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="ค้นหาด้วยเลขออเดอร์, ชื่อลูกค้า, หรือเบอร์โทร..." 
              class="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery()}
              onInput={(e) => {
                const val = e.currentTarget.value;
                setSearchQuery(val);
                loadOrders(val); // ค้นหาแบบ Real-time
              }}
            />
          </div>
          <div class="w-full md:w-auto flex gap-2">
            <button onClick={() => {setSearchQuery(""); loadOrders("");}} class="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 flex items-center gap-2">
              ↻ โหลดใหม่
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
              <Show when={!isLoading() && orders().length === 0}>
                <tr><td colSpan="8" class="p-8 text-center text-gray-500">ไม่พบออเดอร์ในระบบ</td></tr>
              </Show>
              <For each={orders()}>
                {(order) => (
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4 text-sm font-bold text-blue-600">{order.orderNumber}</td>
                    <td class="p-4 text-sm">
                      <p class="font-bold text-gray-900">{order.customer.name}</p>
                      <p class="text-xs text-gray-500 mt-0.5">{order.customer.phone}</p>
                    </td>
                    <td class="p-4">
                      <span class={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td class="p-4">
                      <span class={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${order.paymentStatus === 'paid' ? 'bg-gray-900 text-white' : 'bg-red-100 text-red-700'}`}>
                        {order.paymentStatus === 'paid' ? `✓ ชำระแล้ว (${order.paymentMethod})` : 'ค้างชำระ'}
                      </span>
                    </td>
                    <td class="p-4 text-sm font-bold text-gray-900">฿{order.totalAmount.toFixed(2)}</td>
                    <td class="p-4 text-xs text-gray-600">{formatDate(order.createdAt)}</td>
                    <td class="p-4 text-xs text-gray-600">{formatDate(order.estimatedCompletion)}</td>
                    <td class="p-4 text-right">
                      {/* ปุ่มจัดการ */}
                      <button 
                        onClick={(e) => {
                          // ดึงพิกัด (X, Y) ของปุ่มที่เพิ่งกด เพื่อให้ Dropdown โผล่มาตรงตำแหน่งนี้
                          const rect = e.currentTarget.getBoundingClientRect();
                          setOpenDropdownId(openDropdownId() === order.id ? null : order.id);
                          // เก็บค่าพิกัดเอาไว้ใช้ (เดี๋ยวต้องเพิ่ม State ไว้ข้างบน)
                          setDropdownPosition({ top: rect.bottom + window.scrollY + 4, right: window.innerWidth - rect.right });
                        }} 
                        class="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm inline-flex items-center gap-1"
                      >
                        จัดการ
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>

                      <Show when={openDropdownId() === order.id}>
                        {/* ฉากหลังใสๆ */}
                        <div class="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)}></div>
                        
                        {/* 🟢 เปลี่ยน absolute เป็น fixed และใช้พิกัดที่คำนวณไว้ */}
                        <div 
                          class="fixed w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left animate-fade-in"
                          style={{ top: `${dropdownPosition().top}px`, right: `${dropdownPosition().right}px` }}
                        >
                          <div class="p-3 border-b border-gray-50 bg-gray-50/50">
                            <p class="text-xs font-bold text-gray-500">การดำเนินการ</p>
                          </div>
                          <div class="py-1">
                            <button 
                              onClick={() => openDetails(order.id)} 
                              class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                              <IconEye /> ดูรายละเอียด
                            </button>
                            <button 
                              onClick={() => openEdit(order.id)} 
                              class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                              <IconEdit /> แก้ไข
                            </button>
                            <button 
                              onClick={() => handleCancelOrder(order.id)}
                              class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-3 transition-colors"
                            >
                              <IconTrash /> ยกเลิกออเดอร์
                            </button>
                          </div>
                        </div>
                      </Show>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>

        {/* ส่วนท้ายตาราง */}
        <div class="p-4 border-t border-gray-100 text-center text-sm text-gray-500">
          แสดงทั้งหมด {orders().length} ออเดอร์
        </div>

      </div>
      <Show when={showDetailModal() && selectedOrder()}>
        <div class="fixed inset-0 bg-black/50 z-100 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 class="text-xl font-bold text-gray-900">รายละเอียดออเดอร์: {selectedOrder().orderNumber}</h2>
              <button onClick={() => setShowDetailModal(false)} class="text-gray-400 hover:text-gray-900 text-2xl">✕</button>
            </div>
            <div class="p-6 max-h-[70vh] overflow-y-auto">
              <div class="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p class="text-xs font-bold text-gray-500 uppercase">ข้อมูลลูกค้า</p>
                  <p class="font-bold text-lg text-blue-600">{selectedOrder().customer.name}</p>
                  <p class="text-sm text-gray-600">{selectedOrder().customer.phone}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs font-bold text-gray-500 uppercase">สถานะปัจจุบัน</p>
                  <span class={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${getStatusBadge(selectedOrder().status)}`}>
                    {formatStatus(selectedOrder().status)}
                  </span>
                </div>
              </div>
              <table class="w-full text-sm mb-6">
                <thead class="bg-gray-100 font-bold">
                  <tr><th class="p-2">รายการ</th><th class="p-2">บริการ</th><th class="p-2 text-right">จำนวน</th><th class="p-2 text-right">รวม</th></tr>
                </thead>
                <tbody>
                  <For each={selectedOrder().items}>
                    {(item) => (
                      <tr class="border-b border-gray-50">
                        <td class="p-2">{item.type}</td>
                        <td class="p-2 text-gray-500">{item.service}</td>
                        <td class="p-2 text-right">{item.quantity}</td>
                        <td class="p-2 text-right font-bold">฿{item.quantity * item.pricePerItem}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
              <div class="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
                <span class="font-bold text-blue-900">ยอดเงินสุทธิ</span>
                <span class="text-2xl font-bold text-blue-600">฿{selectedOrder().totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </Show>

      <Show when={showEditModal() && selectedOrder()}>
        <div class="fixed inset-0 bg-black/50 z-100 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div class="p-6 border-b border-gray-100">
              <h2 class="text-xl font-bold">แก้ไขออเดอร์ {selectedOrder().orderNumber}</h2>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-bold mb-1">หมายเหตุ (Notes)</label>
                <textarea 
                  onInput={(e) => setSelectedOrder({...selectedOrder(), notes: e.currentTarget.value})}
                  class="w-full border rounded-xl p-3 text-sm" value={selectedOrder().notes || ""}></textarea>
              </div>
              <button 
                onClick={async () => {
                  await api.updateOrder(selectedOrder().id, { notes: selectedOrder().notes });
                  setShowEditModal(false);
                  loadOrders(); // รีโหลดข้อมูลตาราง
                }}
                class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
              >บันทึกการแก้ไข</button>
              <button onClick={() => setShowEditModal(false)} class="w-full text-gray-500 font-bold">ยกเลิก</button>
            </div>
          </div>
        </div>
      </Show>  
    </div>
  );
}