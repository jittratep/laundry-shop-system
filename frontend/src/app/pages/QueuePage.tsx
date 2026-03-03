// frontend/src/app/pages/QueuePage.tsx
export default function QueuePage() {
  return (
    <div class="p-6 space-y-4">
      <h1 class="text-2xl font-bold mb-4">คิวงานวันนี้</h1>
      
      {/* รายการคิว */}
      <div class="bg-white p-4 rounded-xl shadow-sm border-l-8 border-yellow-400 flex justify-between items-center">
        <div>
          <span class="text-xs font-bold text-gray-400 block">คิวที่ #001</span>
          <h3 class="font-bold">คุณสมหญิง (5 ชิ้น)</h3>
          <p class="text-sm text-gray-500">สถานะ: <span class="text-yellow-600">กำลังซัก...</span></p>
        </div>
        <button class="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold hover:bg-blue-200">
          เสร็จสิ้น ✅
        </button>
      </div>
    </div>
  );
}