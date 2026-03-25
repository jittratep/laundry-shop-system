import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth.middleware";

const prisma = new PrismaClient();
const machines = new Hono();

// ดึงรายการเครื่องซักผ้า/อบผ้าทั้งหมด
machines.get("/", authMiddleware, async (c) => {
  try {
    const allMachines = await prisma.machine.findMany({
      orderBy: { machineCode: 'asc' }
    });
    return c.json({ data: allMachines });
  } catch (error) {
    return c.json({ error: "ดึงข้อมูลเครื่องจักรล้มเหลว" }, 500);
  }
});

export default machines;