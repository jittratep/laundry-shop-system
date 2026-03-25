// frontend/src/app/pages/QueuePage.tsx
import { createSignal, For, Show, onMount } from "solid-js";
import { api } from "../utils/api";

const BASE_URL = "http://localhost:3000"; // เอาไว้ต่อ URL รูปภาพ

// --- Types ---
type OrderStatus = 'pending' | 'in-progress' | 'washing' | 'drying' | 'folding' | 'ready' | 'completed';
type Urgency = 'normal' | 'urgent' | 'express';

export default function QueuePage() {
  const [orders, setOrders] = createSignal<any[]>([]);
  const [machines, setMachines] = createSignal<any[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  
  const [selectedOrder, setSelectedOrder] = createSignal<any>(null);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal("status");
  const [newStatus, setNewStatus] = createSignal<OrderStatus>("pending");
  const [assignedMachine, setAssignedMachine] = createSignal("");
  const [issueDescription, setIssueDescription] = createSignal("");
  
  // 🟢 1. เปลี่ยนจากเก็บแค่ชื่อ เป็นเก็บ "ไฟล์ของจริง (File Object)"
  const [issueImage, setIssueImage] = createSignal<File | null>(null); 
  
  const [toastMessage, setToastMessage] = createSignal({ text: "", type: "success" });

  onMount(() => {
    loadData();
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, machinesRes] = await Promise.all([
        api.getQueueOrders(),
        api.getMachines()
      ]);
      setOrders(ordersRes.data);
      setMachines(machinesRes.data);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const groupedOrders = () => ({
    pending: orders().filter(o => o.status === 'pending'),
    inProgress: orders().filter(o => ['in-progress', 'washing', 'drying', 'folding'].includes(o.status)),
    ready: orders().filter(o => o.status === 'ready'),
    completed: orders().filter(o => o.status === 'completed'),
  });

  const urgentOrders = () => orders().filter(o => o.urgency === 'urgent' || o.urgency === 'express');

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage({ text: "", type: "success" }), 3000);
  };

  const openUpdateModal = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAssignedMachine(order.assignedMachineId || "");
    setActiveTab("status");
    setIsModalOpen(true);
  };

 // 🟢 อัปเดตสถานะโดยแพ็คข้อมูลใส่ FormData (เพื่อให้ Backend อ่านเข้าใจ)
  const handleUpdateStatus = async () => {
    const currentOrder = selectedOrder();
    if (!currentOrder) return;

    try {
      const formData = new FormData();
      formData.append("status", newStatus()); // ส่งสถานะใหม่
      
      if (assignedMachine()) {
        formData.append("assignedMachineId", assignedMachine()); // ส่งรหัสเครื่องซัก
      }

      await api.updateQueueStatus(currentOrder.id, formData);
      showToast(`อัปเดตสถานะออเดอร์ ${currentOrder.orderNumber} แล้ว`);
      setIsModalOpen(false);
      loadData(); 
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  // 🟢 2. แพ็คข้อมูลใส่กล่อง FormData
  const handleReportIssue = async () => {
    const currentOrder = selectedOrder();
    if (!currentOrder || !issueDescription()) {
      showToast('กรุณาระบุรายละเอียดปัญหา', 'error');
      return;
    }

    try {
      // สร้างกล่องพัสดุ (FormData)
      const formData = new FormData();
      formData.append("status", currentOrder.status); // ส่งสถานะเดิมกลับไป
      formData.append("issueDescription", issueDescription());
      
      // ถ้ามีไฟล์รูปภาพ ให้ยัดใส่กล่องไปด้วย!
      if (issueImage()) {
        formData.append("issueImage", issueImage() as File);
      }

      await api.updateQueueStatus(currentOrder.id, formData);
      showToast('รายงานปัญหาพร้อมรูปภาพสำเร็จ');
      setIssueDescription('');
      setIssueImage(null);
      setIsModalOpen(false);
      loadData(); 
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'washing': return 'bg-blue-100 text-blue-800';
      case 'drying': return 'bg-yellow-100 text-yellow-800';
      case 'folding': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-800 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyBadgeClass = (urgency: string) => {
    switch (urgency) {
      case 'express': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'hidden';
    }
  };

  const OrderCard = (props: { order: any }) => {
    const isOverdue = new Date(props.order.estimatedCompletion) < new Date() && props.order.status !== 'completed';

    return (
      <div class={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow ${isOverdue ? 'border-red-300' : 'border-gray-200'}`}>
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="font-bold text-gray-900 text-sm">{props.order.orderNumber}</h3>
            <p class="text-xs text-gray-500 font-semibold">{props.order.customer.name}</p>
          </div>
          <div class="flex gap-2 flex-col items-end">
            <span class={`px-2 py-1 rounded-md text-xs font-bold capitalize ${getStatusBadgeClass(props.order.status)}`}>
              {props.order.status}
            </span>
            <span class={`px-2 py-1 rounded-md text-xs font-bold border ${getUrgencyBadgeClass(props.order.urgency)}`}>
              {props.order.urgency}
            </span>
          </div>
        </div>

        <div class="space-y-2 text-sm mb-4">
          <div class="flex items-center gap-2 text-xs text-gray-600 font-semibold">
            <span>🕒 Due: {new Date(props.order.estimatedCompletion).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <Show when={props.order.machine}>
            <span class="inline-block bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs text-blue-700 font-bold">
              🖥️ {props.order.machine?.name}
            </span>
          </Show>
        </div>

        <div class="border-t border-gray-100 pt-3 mb-4">
          <p class="text-xs font-bold text-gray-500 mb-2">รายการ (Items):</p>
          <ul class="text-xs text-gray-700 space-y-1">
            <For each={props.order.items}>
              {(item: any) => <li>• {item.quantity}x {item.type} ({item.service})</li>}
            </For>
          </ul>
        </div>

        <Show when={props.order.issueDescription}>
          <div class="bg-red-50 p-3 rounded-lg flex flex-col items-start gap-2 mb-3 border border-red-100">
            <div class="flex items-start gap-2">
              <span class="text-red-500 mt-0.5">⚠️</span>
              <div class="text-xs">
                <p class="font-bold text-red-900">แจ้งปัญหา</p>
                <p class="text-red-700">{props.order.issueDescription}</p>
              </div>
            </div>
            {/* 🟢 3. ดึงรูปภาพของจริงจากเซิร์ฟเวอร์มาแสดง! */}
            <Show when={props.order.issueImageUrl}>
              <div class="mt-2 w-full">
                <img 
                  src={`${BASE_URL}${props.order.issueImageUrl}`} 
                  alt="Issue Upload" 
                  class="w-full max-h-32 object-cover rounded-lg border border-red-200 shadow-sm"
                />
              </div>
            </Show>
          </div>
        </Show>

        <Show when={isOverdue}>
          <div class="bg-red-50 p-2 rounded-lg flex items-center gap-2 mb-3">
            <span class="text-red-500">⚠️</span>
            <span class="text-xs text-red-900 font-bold">เกินกำหนดเวลา (Overdue)</span>
          </div>
        </Show>

        <button 
          onClick={() => openUpdateModal(props.order)}
          class="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          อัปเดตสถานะ
        </button>
      </div>
    );
  };

  return (
    <div class="p-6 max-w-7xl mx-auto relative">
      <div class="flex justify-between items-end mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-1">คิวงาน และ ระบบปฏิบัติการ</h1>
          <p class="text-gray-500">Queue Management & Operations</p>
        </div>
        <button onClick={loadData} class="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 flex items-center gap-2 shadow-sm">
          ↻ โหลดใหม่
        </button>
      </div>

      <Show when={isLoading()}>
        <div class="text-center py-12 text-gray-500 animate-pulse font-semibold">กำลังโหลดข้อมูลคิวงาน...</div>
      </Show>

      <Show when={!isLoading()}>
        <Show when={urgentOrders().length > 0}>
          <div class="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8 shadow-sm">
            <h2 class="flex items-center gap-2 text-orange-900 font-bold text-lg mb-4">
              ⚠️ งานด่วน (Urgent Orders) - {urgentOrders().length} รายการ
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <For each={urgentOrders()}>{(order) => <OrderCard order={order} />}</For>
            </div>
          </div>
        </Show>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <h2 class="font-bold text-lg mb-4 flex items-center justify-between text-gray-700">
              รอดำเนินการ <span class="bg-white px-2 py-0.5 rounded text-sm border">{groupedOrders().pending.length}</span>
            </h2>
            <div class="space-y-4">
              <For each={groupedOrders().pending}>{(order) => <OrderCard order={order} />}</For>
            </div>
          </div>

          <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <h2 class="font-bold text-lg mb-4 flex items-center justify-between text-blue-900">
              กำลังดำเนินการ <span class="bg-white px-2 py-0.5 rounded text-sm border">{groupedOrders().inProgress.length}</span>
            </h2>
            <div class="space-y-4">
              <For each={groupedOrders().inProgress}>{(order) => <OrderCard order={order} />}</For>
            </div>
          </div>

          <div class="bg-green-50/50 p-4 rounded-2xl border border-green-100">
            <h2 class="font-bold text-lg mb-4 flex items-center justify-between text-green-900">
              พร้อมรับ <span class="bg-white px-2 py-0.5 rounded text-sm border">{groupedOrders().ready.length}</span>
            </h2>
            <div class="space-y-4">
              <For each={groupedOrders().ready}>{(order) => <OrderCard order={order} />}</For>
            </div>
          </div>

          <div class="bg-gray-100/50 p-4 rounded-2xl border border-gray-200">
            <h2 class="font-bold text-lg mb-4 flex items-center justify-between text-gray-800">
              เสร็จสิ้น <span class="bg-white px-2 py-0.5 rounded text-sm border">{groupedOrders().completed.length}</span>
            </h2>
            <div class="space-y-4">
              <For each={groupedOrders().completed}>{(order) => <OrderCard order={order} />}</For>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 class="text-lg font-bold text-gray-900 mb-4">สถานะเครื่องจักร (Machine Status)</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <For each={machines()}>
              {(machine) => (
                <div class="p-4 border rounded-xl bg-gray-50 text-center">
                  <p class="font-bold text-sm text-gray-800 mb-2">{machine.name}</p>
                  <span class={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    machine.status === 'available' ? 'bg-green-100 text-green-800' :
                    machine.status === 'in-use' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {machine.status}
                  </span>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* --- Modal (Dialog) --- */}
      <Show when={isModalOpen() && selectedOrder()}>
        <div class="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fade-in">
            
            <div class="flex justify-between items-start mb-4">
              <div>
                <h2 class="text-xl font-bold text-gray-900">อัปเดตออเดอร์ {selectedOrder()?.orderNumber}</h2>
                <p class="text-sm text-gray-500">เปลี่ยนสถานะ, กำหนดเครื่อง, หรือแจ้งปัญหา</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} class="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <div class="flex border bg-gray-100 p-1 rounded-lg mb-6">
              <button onClick={() => setActiveTab("status")} class={`flex-1 py-2 text-sm font-semibold rounded-md ${activeTab() === "status" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>อัปเดตสถานะ</button>
              <button onClick={() => setActiveTab("issue")} class={`flex-1 py-2 text-sm font-semibold rounded-md ${activeTab() === "issue" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>แจ้งปัญหา</button>
            </div>

            <Show when={activeTab() === "status"}>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">สถานะ (Status)</label>
                  <select value={newStatus()} onChange={(e) => setNewStatus(e.currentTarget.value as OrderStatus)} class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="pending">Pending (รอดำเนินการ)</option>
                    <option value="in-progress">In Progress (กำลังดำเนินการ)</option>
                    <option value="washing">Washing (กำลังซัก)</option>
                    <option value="drying">Drying (กำลังอบ)</option>
                    <option value="folding">Folding (กำลังพับ)</option>
                    <option value="ready">Ready (พร้อมรับ)</option>
                    <option value="completed">Completed (เสร็จสิ้น)</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">ระบุเครื่องซัก (Assign Machine)</label>
                  <select value={assignedMachine()} onChange={(e) => setAssignedMachine(e.currentTarget.value)} class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">-- ไม่ระบุ --</option>
                    <For each={machines()}>
                      {(m: any) => <option value={m.id} disabled={m.status === 'maintenance'}>{m.name} - {m.status}</option>}
                    </For>
                  </select>
                </div>

                <button onClick={handleUpdateStatus} class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 mt-6">
                  ✅ บันทึกการอัปเดต
                </button>
              </div>
            </Show>

            <Show when={activeTab() === "issue"}>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">รายละเอียดปัญหา (Issue Description)</label>
                  <textarea rows="4" placeholder="อธิบายปัญหาที่พบ..." value={issueDescription()} onInput={(e) => setIssueDescription(e.currentTarget.value)} class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"></textarea>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">แนบรูปภาพ (Optional)</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative group overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*" 
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        // 🟢 4. เก็บไฟล์ภาพก้อนเต็มๆ ลงใน State
                        if (file) setIssueImage(file);
                      }}
                    />
                    <div class="pointer-events-none flex flex-col items-center justify-center">
                      <Show when={!issueImage()} fallback={
                        <div class="text-blue-600 font-semibold flex flex-col items-center gap-2">
                          <span class="text-3xl">✅</span>
                          {/* 🟢 5. โชว์ชื่อไฟล์ที่เลือก */}
                          <span class="text-sm truncate max-w-[200px]">{issueImage()?.name}</span>
                          <span class="text-xs text-gray-400 font-normal">คลิกเพื่อเปลี่ยนรูปภาพ</span>
                        </div>
                      }>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400 mb-3 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p class="text-sm font-semibold text-gray-600">คลิกเพื่ออัปโหลดรูปภาพ</p>
                        <p class="text-xs text-gray-400 mt-1">รองรับ JPG, PNG (สูงสุด 5MB)</p>
                      </Show>
                    </div>
                  </div>
                </div>

                <button onClick={handleReportIssue} class="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors flex justify-center items-center gap-2 mt-4">
                  ⚠️ รายงานปัญหาพร้อมรูปภาพ
                </button>
              </div>
            </Show>

          </div>
        </div>
      </Show>

      {/* --- Toast Notification --- */}
      <Show when={toastMessage().text !== ""}>
        <div class={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce z-50 text-white ${toastMessage().type === 'error' ? 'bg-red-500 shadow-red-200' : 'bg-green-600 shadow-green-200'}`}>
          <span class="font-bold">{toastMessage().text}</span>
        </div>
      </Show>

    </div>
  );
}