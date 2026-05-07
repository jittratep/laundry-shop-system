// frontend/src/app/pages/DashboardPage.tsx
import { createSignal, For, Show, onMount, ErrorBoundary } from "solid-js";
import { api } from "../utils/api";

// --- Icons (SVG) ---
const IconDollar = (props: any = {}) => <svg class={props.class} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const IconPackage = (props: any = {}) => <svg class={props.class} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const IconUsers = (props: any = {}) => <svg class={props.class} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconAlert = (props: any = {}) => <svg class={props.class} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const IconAward = (props: any = {}) => <svg class={props.class} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;

// 🟢 1. Component กล่องสถิติ
const MetricCard = (props: { title: string, value: string | number, change?: string, icon: any, colorClass: string }) => {
  const Icon = props.icon;
  return (
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow print:border print:border-gray-300 print:shadow-none">
      <div>
        <p class="text-sm font-semibold text-gray-500 mb-1">{props.title}</p>
        <p class="text-3xl font-bold text-gray-900 print:text-black">{props.value}</p>
        <Show when={props.change}>
          <p class={`text-xs font-bold mt-2 flex items-center gap-1 ${parseFloat(props.change!) >= 0 ? "text-green-600" : "text-red-600"}`}>
            {parseFloat(props.change!) >= 0 ? "↗" : "↘"} {Math.abs(parseFloat(props.change!))}% จากเมื่อวาน
          </p>
        </Show>
      </div>
      <div class={`p-4 rounded-xl text-white ${props.colorClass} print:bg-gray-100 print:text-gray-800`}>
        <Icon />
      </div>
    </div>
  );
};

// 🟢 2. Component เนื้อหา Dashboard
const DashboardContent = (props: { data: any }) => {
  const [activeTab, setActiveTab] = createSignal("daily");
  
  const data = props.data || {};
  const dailySales = Array.isArray(data.dailySales) ? data.dailySales : [];
  const monthlySales = Array.isArray(data.monthlySales) ? data.monthlySales : [];
  const popularServices = Array.isArray(data.popularServices) ? data.popularServices : [];
  const topCustomers = Array.isArray(data.topCustomers) ? data.topCustomers : [];
  const overdueTasks = Array.isArray(data.overdueTasks) ? data.overdueTasks : [];

  const latestSales = dailySales[dailySales.length - 1] || { revenue: 0, orderCount: 0, customerCount: 0 };
  const previousSales = dailySales[dailySales.length - 2] || { revenue: 0, orderCount: 0 };
  
  const prevRev = previousSales.revenue === 0 ? 1 : previousSales.revenue;
  const prevOrd = previousSales.orderCount === 0 ? 1 : previousSales.orderCount;
  
  const revenueChange = (((latestSales.revenue - previousSales.revenue) / prevRev) * 100).toFixed(1);
  const orderChange = (((latestSales.orderCount - previousSales.orderCount) / prevOrd) * 100).toFixed(1);

  const maxDailyRevenue = Math.max(...dailySales.map((d: any) => d.revenue || 0), 1);
  const maxDailyOrders = Math.max(...dailySales.map((d: any) => d.orderCount || 0), 1); 
  
  const maxMonthlyRevenue = Math.max(...monthlySales.map((m: any) => m.revenue || 0), 1);
  const totalServiceRevenue = popularServices.reduce((sum: number, s: any) => sum + (s.revenue || 0), 1);

  const firstMonthRev = monthlySales[0]?.revenue || 0;
  const lastMonthRev = monthlySales[monthlySales.length - 1]?.revenue || 0;
  const growthRate = firstMonthRev > 0 ? (((lastMonthRev / firstMonthRev) - 1) * 100).toFixed(1) : "0";

  return (
    <>
      {/* --- 1. Metric Cards --- */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:grid-cols-4 print:gap-4">
        <MetricCard title="ยอดขายวันนี้ (Revenue)" value={`฿${latestSales.revenue.toLocaleString()}`} change={revenueChange} icon={IconDollar} colorClass="bg-blue-600" />
        <MetricCard title="จำนวนออเดอร์ (Orders)" value={latestSales.orderCount} change={orderChange} icon={IconPackage} colorClass="bg-green-500" />
        <MetricCard title="ลูกค้าที่ใช้บริการ (Customers)" value={latestSales.customerCount || 0} icon={IconUsers} colorClass="bg-purple-500" />
        <MetricCard title="งานค้างเกินกำหนด (Overdue)" value={overdueTasks.length} icon={IconAlert} colorClass="bg-red-500" />
      </div>

      {/* --- 2. Tabs Menu (ซ่อนตอนปริ้น) --- */}
      <div class="bg-white p-1 rounded-xl inline-flex gap-1 mb-6 border border-gray-200 shadow-sm print:hidden">
        <button onClick={() => setActiveTab("daily")} class={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeTab() === "daily" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>ยอดขาย 7 วันล่าสุด</button>
        <button onClick={() => setActiveTab("monthly")} class={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeTab() === "monthly" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>แนวโน้มรายเดือน</button>
        <button onClick={() => setActiveTab("services")} class={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeTab() === "services" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>บริการยอดนิยม</button>
        <button onClick={() => setActiveTab("customers")} class={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeTab() === "customers" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>ลูกค้าประจำ (Top)</button>
      </div>

      {/* --- 3. Tab Contents --- */}
      
      {/* 🔴 Tab: Daily Sales (เปลี่ยนจาก <Show> เป็นคลาส CSS เพื่อให้ปริ้นออกทุกหน้า) */}
      <div class={`${activeTab() === "daily" ? "block" : "hidden"} print:block mb-12 page-break-inside-avoid`}>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-fade-in print:border-none print:shadow-none print:p-0">
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-900">รายงานยอดขาย 7 วันล่าสุด (Daily Sales)</h2>
            <p class="text-sm text-gray-500">เปรียบเทียบยอดขายรายวัน</p>
          </div>
          
          <div class="h-72 flex gap-4 md:gap-8 pt-6 border-b border-gray-200 pb-2 relative print:h-64">
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2 opacity-20">
              <div class="border-b border-dashed border-gray-400 w-full h-0"></div>
              <div class="border-b border-dashed border-gray-400 w-full h-0"></div>
              <div class="border-b border-dashed border-gray-400 w-full h-0"></div>
              <div class="border-b border-dashed border-gray-400 w-full h-0"></div>
            </div>

            <For each={dailySales}>
              {(day: any) => (
                <div class="flex-1 h-full flex flex-col items-center group relative z-10">
                  <div class="absolute -top-12 bg-gray-900 text-white text-xs font-bold py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none print:opacity-100 print:text-black print:-top-8 print:bg-transparent">
                    ฿{(day.revenue || 0).toLocaleString()} ({day.orderCount || 0})
                  </div>
                  
                  <div class="w-full flex-1 flex items-end justify-center relative">
                    <div class="w-full max-w-[4rem] bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all relative" style={{ height: `${((day.revenue || 0) / maxDailyRevenue) * 100}%` }}>
                      <div class="absolute bottom-0 w-full bg-blue-700/30 rounded-t-md" style={{ height: `${((day.orderCount || 0) / maxDailyOrders) * 100}%` }}></div>
                    </div>
                  </div>

                  <p class="text-xs font-bold text-gray-600 mt-2">{new Date(day.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</p>
                </div>
              )}
            </For>
          </div>
          <div class="flex justify-center gap-6 mt-4 text-sm font-semibold text-gray-600">
            <div class="flex items-center gap-2"><div class="w-3 h-3 bg-blue-500 rounded-sm"></div> ยอดขาย (Revenue)</div>
            <div class="flex items-center gap-2"><div class="w-3 h-3 bg-blue-700/30 rounded-sm"></div> จำนวนออเดอร์</div>
          </div>
        </div>
      </div>

      {/* 🔴 Tab: Monthly Trend */}
      <div class={`${activeTab() === "monthly" ? "block" : "hidden"} print:block mb-12 page-break-inside-avoid`}>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-fade-in print:border-none print:shadow-none print:p-0">
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-900">แนวโน้มรายเดือน (Monthly Trend)</h2>
            <p class="text-sm text-gray-500">ผลประกอบการย้อนหลัง 6 เดือน</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 print:grid-cols-4">
            <div class="lg:col-span-3 print:col-span-3">
              <div class="h-64 flex gap-4 border-b border-gray-200 pb-2 relative">
                <For each={monthlySales}>
                  {(month: any) => (
                    <div class="flex-1 h-full flex flex-col items-center group relative z-10">
                      <div class="absolute -top-10 bg-gray-900 text-white text-xs font-bold py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none print:opacity-100 print:text-black print:bg-transparent">
                        ฿{(month.revenue || 0).toLocaleString()}
                      </div>
                      <div class="w-full flex-1 flex items-end justify-center relative">
                        <div class="w-full max-w-[5rem] bg-indigo-500 rounded-t-md hover:bg-indigo-600 transition-all" style={{ height: `${((month.revenue || 0) / maxMonthlyRevenue) * 100}%` }}></div>
                      </div>
                      <p class="text-xs font-bold text-gray-600 mt-2">{month.date}</p>
                    </div>
                  )}
                </For>
              </div>
            </div>
            
            <div class="space-y-4 print:col-span-1">
              <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 print:bg-transparent print:border-gray-300">
                <p class="text-sm text-indigo-800 font-semibold print:text-gray-600">รายได้เฉลี่ย/เดือน</p>
                <p class="text-2xl font-bold text-indigo-900 mt-1 print:text-black">฿{Math.round(monthlySales.reduce((s: number, m: any) => s + (m.revenue || 0), 0) / (monthlySales.length || 1)).toLocaleString()}</p>
              </div>
              <div class="bg-green-50 p-4 rounded-xl border border-green-100 print:bg-transparent print:border-gray-300">
                <p class="text-sm text-green-800 font-semibold print:text-gray-600">ออเดอร์รวม (6 เดือน)</p>
                <p class="text-2xl font-bold text-green-900 mt-1 print:text-black">{monthlySales.reduce((s: number, m: any) => s + (m.orderCount || 0), 0).toLocaleString()}</p>
              </div>
              <div class="bg-purple-50 p-4 rounded-xl border border-purple-100 print:bg-transparent print:border-gray-300">
                <p class="text-sm text-purple-800 font-semibold print:text-gray-600">อัตราการเติบโต (Growth)</p>
                <p class="text-2xl font-bold text-purple-900 mt-1 print:text-black">{growthRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 Tab: Popular Services */}
      <div class={`${activeTab() === "services" ? "block" : "hidden"} print:block mb-12 page-break-inside-avoid`}>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-fade-in print:border-none print:shadow-none print:p-0">
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-900">บริการยอดนิยม (Service Performance)</h2>
            <p class="text-sm text-gray-500">สัดส่วนรายได้แยกตามประเภทบริการ</p>
          </div>

          <div class="space-y-6 max-w-3xl mx-auto">
            <Show when={popularServices.length > 0} fallback={<div class="text-center text-gray-500 py-8">ยังไม่มีข้อมูลบริการ</div>}>
              <For each={popularServices}>
                {(service: any, index) => {
                  const colors = ["bg-blue-500", "bg-teal-500", "bg-orange-500", "bg-purple-500"];
                  const color = colors[index() % colors.length];
                  const percentage = ((service.revenue || 0) / totalServiceRevenue) * 100;
                  
                  return (
                    <div>
                      <div class="flex justify-between items-end mb-2">
                        <div class="flex items-center gap-3">
                          <div class={`w-4 h-4 rounded-full ${color}`}></div>
                          <span class="font-bold text-gray-900 text-lg">{service.serviceName}</span>
                        </div>
                        <div class="text-right">
                          <span class="font-bold text-gray-900 text-lg">฿{(service.revenue || 0).toLocaleString()}</span>
                          <span class="text-gray-500 text-sm ml-2">({service.count || 0} ออเดอร์)</span>
                        </div>
                      </div>
                      <div class="w-full bg-gray-100 rounded-full h-4 overflow-hidden flex">
                        <div class={`h-4 ${color}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <p class="text-right text-xs font-bold text-gray-400 mt-1">สัดส่วน {percentage.toFixed(1)}%</p>
                    </div>
                  )
                }}
              </For>
            </Show>
          </div>
        </div>
      </div>

      {/* 🔴 Tab: Top Customers */}
      <div class={`${activeTab() === "customers" ? "block" : "hidden"} print:block mb-12 page-break-inside-avoid`}>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in print:border-none print:shadow-none print:overflow-visible">
          <div class="p-6 border-b border-gray-100 print:px-0">
            <h2 class="text-xl font-bold text-gray-900">ลูกค้าประจำยอดเยี่ยม (Top Customers)</h2>
            <p class="text-sm text-gray-500">จัดอันดับตามยอดใช้จ่ายสูงสุด</p>
          </div>
          
          <div class="overflow-x-auto print:overflow-visible">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-sm border-b border-gray-200 print:bg-transparent">
                  <th class="p-4 font-semibold">อันดับ</th>
                  <th class="p-4 font-semibold">ชื่อลูกค้า</th>
                  <th class="p-4 font-semibold">ติดต่อ</th>
                  <th class="p-4 font-semibold text-center">ออเดอร์สะสม</th>
                  <th class="p-4 font-semibold text-right">ยอดใช้จ่ายรวม</th>
                  <th class="p-4 font-semibold text-right">คะแนนสะสม (Points)</th>
                </tr>
              </thead>
              <tbody>
                <Show when={topCustomers.length > 0} fallback={<tr><td colspan="6" class="text-center text-gray-500 py-8">ยังไม่มีข้อมูลลูกค้า</td></tr>}>
                  <For each={topCustomers}>
                    {(item: any, index) => (
                      <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td class="p-4 text-center">
                          <Show when={index() === 0}><IconAward class="inline text-yellow-500 print:text-gray-800" /></Show>
                          <Show when={index() === 1}><IconAward class="inline text-gray-400 print:text-gray-600" /></Show>
                          <Show when={index() === 2}><IconAward class="inline text-orange-700 print:text-gray-500" /></Show>
                          <Show when={index() > 2}><span class="font-bold text-gray-400 print:text-black">#{index() + 1}</span></Show>
                        </td>
                        <td class="p-4">
                          <p class="font-bold text-gray-900">{item.customer?.name || 'ลูกค้าทั่วไป'}</p>
                          <Show when={item.customer?.registeredDate}>
                            <p class="text-xs text-gray-500">เป็นสมาชิก: {new Date(item.customer.registeredDate).toLocaleDateString('th-TH')}</p>
                          </Show>
                        </td>
                        <td class="p-4">
                          <p class="text-sm font-semibold text-gray-700">{item.customer?.phone || '-'}</p>
                          <p class="text-xs text-gray-500">{item.customer?.email || ''}</p>
                        </td>
                        <td class="p-4 text-center font-bold text-gray-700">{item.orderCount}</td>
                        <td class="p-4 text-right font-bold text-green-600 print:text-gray-900">฿{(item.totalSpent || 0).toLocaleString()}</td>
                        <td class="p-4 text-right">
                          <span class="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-lg text-xs print:bg-transparent print:border print:border-gray-300 print:text-gray-800">
                            {item.customer?.points || 0} pts
                          </span>
                        </td>
                      </tr>
                    )}
                  </For>
                </Show>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

// 🟢 3. Component หน้าหลัก
export default function DashboardPage() {
  const [analytics, setAnalytics] = createSignal<any>(null);
  const [isLoading, setIsLoading] = createSignal(true);

  onMount(async () => {
    try {
      const res = await api.getDashboardAnalytics();
      setAnalytics(res.data);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      alert("ไม่สามารถดึงข้อมูล Dashboard ได้");
    } finally {
      setIsLoading(false);
    }
  });

  // 🟢 ฟังก์ชัน Export เป็น Excel (CSV)
  const exportToCSV = () => {
    const data = analytics();
    if (!data) return alert("ไม่มีข้อมูลสำหรับ Export");

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 

    csvContent += "--- สรุปภาพรวม (Overview) ---\n";
    csvContent += "วันที่, ยอดขายรายวัน (7 วันล่าสุด), จำนวนออเดอร์\n";
    data.dailySales.forEach((d: any) => { csvContent += `${d.date}, ${d.revenue}, ${d.orderCount}\n`; });
    csvContent += "\n";

    csvContent += "--- แนวโน้มรายเดือน (Monthly Trend) ---\n";
    csvContent += "เดือน, ยอดขาย, จำนวนออเดอร์\n";
    data.monthlySales.forEach((m: any) => { csvContent += `${m.date}, ${m.revenue}, ${m.orderCount}\n`; });
    csvContent += "\n";

    csvContent += "--- ลูกค้าประจำยอดเยี่ยม (Top Customers) ---\n";
    csvContent += "ชื่อลูกค้า, เบอร์ติดต่อ, ออเดอร์สะสม, ยอดใช้จ่ายรวม, คะแนนสะสม\n";
    data.topCustomers.forEach((c: any) => {
        const name = c.customer?.name || "ลูกค้าทั่วไป";
        const phone = c.customer?.phone || "-";
        const points = c.customer?.points || 0;
        csvContent += `${name}, ${phone}, ${c.orderCount}, ${c.totalSpent}, ${points}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laundry_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🟢 ฟังก์ชันสั่งพิมพ์ (Save as PDF)
  const exportToPDF = () => {
    window.print();
  };

  return (
    <div class="container mx-auto p-6 max-w-7xl relative">
      
      {/* 🔴 [เพิ่มใหม่] พลังเวทย์มนต์ควบคุมการปริ้น (CSS Print Styles) */}
      <style>{`
        @media print {
          /* บังคับให้เบราว์เซอร์แสดงสีพื้นหลังพวกกราฟแท่ง (สำคัญมาก!) */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* ปิดพวกแถบเมนูด้านซ้าย/บน (ถ้ามีใน Layout หลัก) */
          nav, aside, header { display: none !important; }
          /* บังคับให้หน้าเว็บยืดออกเต็มที่ ป้องกันอาการหน้าขาว */
          body, html, #root {
            background-color: white !important;
            height: auto !important;
            overflow: visible !important;
          }
          /* ปิด Animation เพราะเบราว์เซอร์บางตัวแคปหน้าจอตอนมันกำลังโปร่งใส */
          .animate-fade-in {
            animation: none !important;
            opacity: 1 !important;
          }
          /* ป้องกันไม่ให้ตารางขาดครึ่งหน้ากระดาษ */
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* 🟢 ส่วนหัวและปุ่ม Export */}
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-1">Manager Dashboard</h1>
          <p class="text-gray-500 font-medium print:hidden">ภาพรวมธุรกิจและสถิติร้าน (Analytics & Insights)</p>
          {/* ข้อความนี้จะโผล่มาเฉพาะตอนอยู่ในกระดาษ PDF */}
          <p class="hidden print:block text-gray-500 text-sm mt-1">วันที่พิมพ์รายงาน: {new Date().toLocaleString('th-TH')}</p>
        </div>
        
        <div class="flex gap-2 w-full md:w-auto print:hidden">
          <button 
            onClick={exportToCSV} 
            disabled={!analytics()}
            class="flex-1 md:flex-none bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
          >
            📊 Export CSV (Excel)
          </button>
          
          <button 
            onClick={exportToPDF} 
            disabled={!analytics()}
            class="flex-1 md:flex-none bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      <Show when={isLoading()}>
        <div class="text-center py-20 text-gray-500 font-bold animate-pulse print:hidden">กำลังคำนวณสถิติของร้าน... 📊</div>
      </Show>

      <ErrorBoundary fallback={(err, reset) => (
        <div class="bg-red-50 p-6 rounded-xl border border-red-200 print:hidden">
          <h3 class="text-red-800 font-bold text-lg mb-2">เกิดข้อผิดพลาดในการวาดกราฟ 🚨</h3>
          <p class="text-red-600 font-mono text-sm mb-4">{err.toString()}</p>
          <button onClick={reset} class="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">ลองโหลดใหม่</button>
        </div>
      )}>
        <Show when={!isLoading() && analytics()}>
          <DashboardContent data={analytics()} />
        </Show>
      </ErrorBoundary>
    </div>
  );
}