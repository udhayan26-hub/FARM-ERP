"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "./audit-actions";

const DEMO_USER_ID = "demo-user-001";

interface TractorData {
  name: string;
  registrationNo: string;
  model?: string;
  driverName: string;
  purchaseDate: string;
  status?: string;
}

export async function getTractors() {
  try {
    return await prisma.tractor.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { name: "asc" },
      include: { _count: { select: { dieselLogs: true } } },
    });
  } catch (error) {
    console.error("[DB] getTractors failed:", error);
    return [];
  }
}

export async function createTractor(data: TractorData) {
  try {
    if (!data.name.trim()) return { success: false, error: "Name is required" };
    if (!data.registrationNo.trim()) return { success: false, error: "Registration number is required" };

    const tractor = await prisma.tractor.create({
      data: {
        userId: DEMO_USER_ID,
        name: data.name.trim(),
        registrationNo: data.registrationNo.trim(),
        model: data.model?.trim() ?? "",
        driverName: data.driverName.trim(),
        purchaseDate: new Date(data.purchaseDate),
        status: data.status ?? "active",
      },
    });

    // Log Activity
    await logActivity({
      action: "Tractor entry added",
      module: "tractor",
      entityId: tractor.id,
      newValue: JSON.stringify(tractor),
      notes: `Registered tractor "${tractor.name}" with registration number ${tractor.registrationNo}`,
    });

    revalidatePath("/tractors");
    revalidatePath("/logs");
    return { success: true, tractor };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[DB] createTractor failed:", message);
    return { success: false, error: `Failed to create tractor: ${message}` };
  }
}

export async function deleteTractor(id: string) {
  try {
    const original = await prisma.tractor.findUnique({
      where: { id },
    });
    if (!original) return { success: false, error: "Tractor record not found" };

    await prisma.tractor.delete({
      where: { id },
    });

    // Log Activity
    await logActivity({
      action: "Tractor deleted",
      module: "tractor",
      entityId: id,
      oldValue: JSON.stringify(original),
      notes: `Deleted tractor "${original.name}" with registration number ${original.registrationNo}`,
    });

    revalidatePath("/tractors");
    revalidatePath("/logs");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[DB] deleteTractor failed:", message);
    return { success: false, error: `Failed to delete tractor: ${message}` };
  }
}
