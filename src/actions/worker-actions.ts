"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { WorkerFormValues } from "@/lib/validations/worker";
import { logActivity } from "./audit-actions";

const DEMO_USER_ID = "demo-user-001";

async function ensureUserExists() {
  try {
    const user = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
    if (!user) {
      await prisma.user.create({
        data: {
          id: DEMO_USER_ID,
          email: "farmer@farmerp.com",
          name: "Rajesh Kumar",
          farmName: "Green Valley Farms",
          phone: "+91-9876543210",
          role: "owner",
        },
      });
      console.log("[DB] Demo user created:", DEMO_USER_ID);
    }
    return DEMO_USER_ID;
  } catch (error) {
    console.error("[DB] ensureUserExists failed:", error);
    throw error;
  }
}

export async function getWorkers() {
  try {
    const userId = await ensureUserExists();
    const workers = await prisma.worker.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const workersWithStats = await Promise.all(
      workers.map(async (w) => {
        const attendance = await prisma.attendance.findMany({
          where: {
            workerId: w.id,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        });

        const daysPresent = attendance.filter((a) => a.status === "present").length;
        const halfDays = attendance.filter((a) => a.status === "half").length;
        const effectiveDays = daysPresent + halfDays * 0.5;
        const currentMonthEarnings = effectiveDays * w.dailyWage;

        return {
          ...w,
          daysWorked: daysPresent,
          halfDays: halfDays,
          effectiveDays,
          currentMonthEarnings,
        };
      })
    );

    console.log(`[DB] Fetched ${workersWithStats.length} workers with monthly stats`);
    return workersWithStats;
  } catch (error) {
    console.error("[DB] getWorkers failed:", error);
    return [];
  }
}

export async function createWorker(data: WorkerFormValues & { wageType?: string; monthlyWage?: number }) {
  try {
    const userId = await ensureUserExists();

    // Validations
    if (!data.name.trim()) return { success: false, error: "Name is required" };
    if (Number(data.dailyWage) < 0) return { success: false, error: "Wage rate cannot be negative" };

    const worker = await prisma.worker.create({
      data: {
        userId,
        name: data.name.trim(),
        phone: data.phone.trim(),
        village: data.village.trim(),
        dailyWage: Number(data.dailyWage),
        wageType: data.wageType || "daily",
        monthlyWage: data.monthlyWage ? Number(data.monthlyWage) : null,
        joinDate: new Date(data.joinDate),
        status: data.status,
      },
    });

    // Log Activity
    await logActivity({
      action: "Worker created",
      module: "worker",
      entityId: worker.id,
      newValue: JSON.stringify(worker),
      notes: `Registered worker "${worker.name}" from village ${worker.village || "N/A"}`,
    });

    console.log("[DB] Worker created:", worker.id, worker.name);
    revalidatePath("/workers");
    revalidatePath("/logs");
    revalidatePath("/");
    return { success: true, workerId: worker.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error("[DB] createWorker failed:", message, error);
    return {
      success: false,
      error: `Failed to create worker: ${message}`,
    };
  }
}

export async function updateWorker(id: string, data: WorkerFormValues & { wageType?: string; monthlyWage?: number }) {
  try {
    const original = await prisma.worker.findUnique({ where: { id } });
    if (!original) return { success: false, error: "Worker not found" };

    // Validations
    if (!data.name.trim()) return { success: false, error: "Name is required" };
    if (Number(data.dailyWage) < 0) return { success: false, error: "Wage rate cannot be negative" };

    const worker = await prisma.worker.update({
      where: { id },
      data: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        village: data.village.trim(),
        dailyWage: Number(data.dailyWage),
        wageType: data.wageType || original.wageType,
        monthlyWage: data.monthlyWage ? Number(data.monthlyWage) : null,
        joinDate: new Date(data.joinDate),
        status: data.status,
      },
    });

    // Log Activity
    await logActivity({
      action: "Worker updated",
      module: "worker",
      entityId: id,
      oldValue: JSON.stringify(original),
      newValue: JSON.stringify(worker),
      notes: `Updated profile details for "${worker.name}"`,
    });

    console.log("[DB] Worker updated:", worker.id);
    revalidatePath("/workers");
    revalidatePath("/logs");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error("[DB] updateWorker failed:", message);
    return { success: false, error: `Failed to update worker: ${message}` };
  }
}

export async function toggleWorkerStatus(id: string, currentStatus: string) {
  try {
    const original = await prisma.worker.findUnique({ where: { id } });
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const worker = await prisma.worker.update({
      where: { id },
      data: { status: newStatus },
    });

    // Log Activity
    await logActivity({
      action: `Worker status changed: ${newStatus}`,
      module: "worker",
      entityId: id,
      oldValue: JSON.stringify(original),
      newValue: JSON.stringify(worker),
      notes: `Worker "${worker.name}" status set to ${newStatus}`,
    });

    console.log(`[DB] Worker ${id} status -> ${newStatus}`);
    revalidatePath("/workers");
    revalidatePath("/logs");
    return { success: true, newStatus };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error("[DB] toggleWorkerStatus failed:", message);
    return { success: false, error: `Failed to update status: ${message}` };
  }
}

export async function deleteWorker(id: string) {
  try {
    const original = await prisma.worker.findUnique({ where: { id } });
    await prisma.worker.delete({ where: { id } });

    // Log Activity
    await logActivity({
      action: "Worker deleted",
      module: "worker",
      entityId: id,
      oldValue: JSON.stringify(original),
      notes: `Permanently removed worker profile "${original?.name || id}"`,
    });

    console.log("[DB] Worker deleted:", id);
    revalidatePath("/workers");
    revalidatePath("/logs");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error("[DB] deleteWorker failed:", message);
    return { success: false, error: `Failed to delete worker: ${message}` };
  }
}

export async function getWorkerCount() {
  try {
    const userId = await ensureUserExists();
    return await prisma.worker.count({ where: { userId, status: "active" } });
  } catch {
    return 0;
  }
}
