"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DieselFormValues } from "@/lib/validations/diesel";
import { logActivity } from "./audit-actions";

export async function getDieselLogs() {
  try {
    return await prisma.dieselLog.findMany({
      include: { tractor: true },
      orderBy: { date: 'desc' }
    });
  } catch (error) {
    console.error("Failed to fetch diesel logs:", error);
    return [];
  }
}

export async function createDieselLog(data: DieselFormValues) {
  try {
    // Validations
    if (data.liters <= 0) return { success: false, error: "Fuel quantity (liters) must be greater than zero" };
    if (data.cost <= 0) return { success: false, error: "Cost must be greater than zero" };
    if (data.hoursWorked < 0) return { success: false, error: "Worked hours cannot be negative" };

    const log = await prisma.dieselLog.create({
      data: {
        date: new Date(data.date),
        tractorId: data.tractorId,
        liters: data.liters,
        cost: data.cost,
        hoursWorked: data.hoursWorked,
        purpose: data.purpose,
        notes: data.notes || "",
      },
      include: { tractor: true }
    });

    // Log Activity
    await logActivity({
      action: "Diesel entry added",
      module: "diesel",
      entityId: log.id,
      newValue: JSON.stringify(log),
      notes: `Logged ${log.liters} liters for tractor "${log.tractor.name}" costing ₹${log.cost}`,
    });

    revalidatePath("/diesel");
    revalidatePath("/logs");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create diesel log:", error);
    return { success: false, error: error.message || "Failed to create diesel log" };
  }
}
