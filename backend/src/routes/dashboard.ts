// backend/src/routes/dashboard.ts
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth.middleware";


const dashboard = new Hono<{ Variables: { user: any } }>();
const prisma = new PrismaClient();

dashboard.get("/", authMiddleware, async (c) => {
  try {
    const now = new Date();
    
    // 🟢 1. งานค้างเกินกำหนด (Overdue Tasks)
    const overdueTasks = await prisma.order.findMany({
      where: {
        status: { notIn: ["completed", "cancelled"] },
        estimatedCompletion: { lt: now } // กำหนดเสร็จน้อยกว่าเวลาปัจจุบัน
      },
      select: { id: true }
    });

    // 🟢 2. ลูกค้าประจำยอดเยี่ยม (Top Customers)
    const topCustomersData = await prisma.order.groupBy({
      by: ['customerId'],
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10,
      where: { status: { not: 'cancelled' } }
    });

    const topCustomers = await Promise.all(
      topCustomersData.map(async (tc) => {
        const customer = await prisma.customer.findUnique({ where: { id: tc.customerId } });
        return {
          customer,
          orderCount: tc._count.id,
          totalSpent: tc._sum.totalAmount || 0
        };
      })
    );

    // 🟢 3. บริการยอดนิยม (Popular Services)
    const allItems = await prisma.orderItem.findMany({
      where: { order: { status: { not: 'cancelled' } } }
    });
    
    const serviceMap: Record<string, { count: number, revenue: number }> = {};
    allItems.forEach(item => {
      // 🟢 ดักเอาไว้ว่าถ้าไม่มีชื่อบริการ ให้ใช้คำว่า "ทั่วไป" แทน (แก้ปัญหา undefined index)
      const serviceName = item.service || "ทั่วไป"; 
      
      if (!serviceMap[serviceName]) {
        serviceMap[serviceName] = { count: 0, revenue: 0 };
      }
      serviceMap[serviceName].count += item.quantity;
      serviceMap[serviceName].revenue += (item.quantity * item.pricePerItem);
    });
    
    const popularServices = Object.entries(serviceMap).map(([serviceName, data]) => ({
      serviceName, count: data.count, revenue: data.revenue
    })).sort((a, b) => b.revenue - a.revenue);

    // 🟢 4. ยอดขายรายวัน (7 วันล่าสุด)
    const dailySalesMap: Record<string, { revenue: number, orderCount: number, customerCount: Set<string> }> = {};
    for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailySalesMap[d.toISOString().split('T')[0]!] = { revenue: 0, orderCount: 0, customerCount: new Set() };
    }
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);
    
    const recentOrders = await prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo }, status: { not: 'cancelled' } }
    });

    recentOrders.forEach(o => {
        const dateStr = o.createdAt.toISOString().split('T')[0]!;
        if(dailySalesMap[dateStr]) {
            dailySalesMap[dateStr].revenue += o.totalAmount;
            dailySalesMap[dateStr].orderCount += 1;
            dailySalesMap[dateStr].customerCount.add(o.customerId);
        }
    });

    const dailySales = Object.entries(dailySalesMap).map(([date, data]) => ({
        date, revenue: data.revenue, orderCount: data.orderCount, customerCount: data.customerCount.size
    }));

    // 🟢 5. ยอดขายรายเดือน (6 เดือนล่าสุด)
    const monthlySalesMap: Record<string, { revenue: number, orderCount: number }> = {};
    for(let i=5; i>=0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        monthlySalesMap[monthStr] = { revenue: 0, orderCount: 0 };
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0,0,0,0);

    const monthlyOrders = await prisma.order.findMany({
        where: { createdAt: { gte: sixMonthsAgo }, status: { not: 'cancelled' } }
    });

    monthlyOrders.forEach(o => {
        const monthStr = `${o.createdAt.getFullYear()}-${(o.createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
        if(monthlySalesMap[monthStr]) {
            monthlySalesMap[monthStr].revenue += o.totalAmount;
            monthlySalesMap[monthStr].orderCount += 1;
        }
    });

    const monthlySales = Object.entries(monthlySalesMap).map(([date, data]) => ({
        date, revenue: data.revenue, orderCount: data.orderCount
    }));

    // ส่งข้อมูลทั้งหมดกลับไปเป็นก้อนเดียว!
    return c.json({
        data: { dailySales, monthlySales, topCustomers, popularServices, overdueTasks: overdueTasks.map(t => t.id) }
    });

  } catch (error) {
    console.error(error);
    return c.json({ error: "ดึงข้อมูล Dashboard ล้มเหลว" }, 500);
  }
});

export default dashboard;