"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "./audit-actions";

const DEMO_USER_ID = "demo-user-001";

interface LandData {
  name: string;
  acres: number;
  location?: string;
  crop?: string;
  sowingDate?: string;
  harvestDate?: string;
  status: string;
}

export async function getLands() {
  try {
    return await prisma.land.findMany({
      where: { userId: DEMO_USER_ID, isDeleted: false },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("[DB] getLands failed:", error);
    return [];
  }
}

export async function getDeletedLands() {
  try {
    return await prisma.land.findMany({
      where: { userId: DEMO_USER_ID, isDeleted: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("[DB] getDeletedLands failed:", error);
    return [];
  }
}

export async function createLand(data: LandData) {
  try {
    if (data.acres <= 0) {
      return { success: false, error: "Acreage must be greater than zero" };
    }

    const land = await prisma.land.create({
      data: {
        userId: DEMO_USER_ID,
        name: data.name.trim(),
        acres: Number(data.acres),
        location: data.location?.trim() ?? "",
        crop: data.crop?.trim() ?? "",
        status: data.status,
        sowingDate: data.sowingDate ? new Date(data.sowingDate) : null,
        harvestDate: data.harvestDate ? new Date(data.harvestDate) : null,
        isDeleted: false,
      },
    });

    // Audit Log
    await logActivity({
      action: "Land created",
      module: "land",
      entityId: land.id,
      newValue: JSON.stringify(land),
      notes: `Created land parcel "${land.name}" of ${land.acres} acres`,
    });

    revalidatePath("/lands");
    revalidatePath("/logs");
    revalidatePath("/");
    return { success: true, land };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[DB] createLand failed:", message);
    return { success: false, error: `Failed to create land: ${message}` };
  }
}

export async function updateLand(id: string, data: Partial<LandData>) {
  try {
    const original = await prisma.land.findUnique({ where: { id } });
    if (!original) return { success: false, error: "Land parcel not found" };

    if (data.acres !== undefined && data.acres <= 0) {
      return { success: false, error: "Acreage must be greater than zero" };
    }

    const updated = await prisma.land.update({
      where: { id },
      data: {
        name: data.name?.trim() ?? original.name,
        acres: data.acres !== undefined ? Number(data.acres) : original.acres,
        location: data.location?.trim() ?? original.location,
        crop: data.crop?.trim() ?? original.crop,
        status: data.status ?? original.status,
        sowingDate: data.sowingDate ? new Date(data.sowingDate) : original.sowingDate,
        harvestDate: data.harvestDate ? new Date(data.harvestDate) : original.harvestDate,
      },
    });

    // Audit Log
    await logActivity({
      action: "Land updated",
      module: "land",
      entityId: id,
      oldValue: JSON.stringify(original),
      newValue: JSON.stringify(updated),
      notes: `Updated land parcel "${updated.name}"`,
    });

    revalidatePath("/lands");
    revalidatePath("/logs");
    return { success: true, land: updated };
  } catch (error: any) {
    console.error("[DB] updateLand failed:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteLand(id: string) {
  try {
    const land = await prisma.land.findUnique({
      where: { id },
    });

    if (!land) {
      return { success: false, error: "Land parcel not found" };
    }

    // 1. Dependency checks: Crops exist
    if (land.crop && land.crop.trim() !== "") {
      return {
        success: false,
        error: `Cannot delete: active crop "${land.crop}" is registered on this land.`,
      };
    }

    // 2. Dependency checks: Expenses exist
    // Query expenses referencing this land name in description or notes
    const linkedExpense = await prisma.expense.findFirst({
      where: {
        OR: [
          { description: { contains: land.name } },
          { notes: { contains: land.name } },
        ],
      },
    });

    if (linkedExpense) {
      return {
        success: false,
        error: `Cannot delete: historical expenses exist referring to "${land.name}" (linked to expense "${linkedExpense.description}").`,
      };
    }

    // Perform soft delete
    const updated = await prisma.land.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: "inactive",
      },
    });

    // Audit Log
    await logActivity({
      action: "Land soft-deleted",
      module: "land",
      entityId: id,
      oldValue: JSON.stringify(land),
      newValue: JSON.stringify(updated),
      notes: `Soft-deleted land parcel "${land.name}"`,
    });

    revalidatePath("/lands");
    revalidatePath("/logs");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("[DB] deleteLand failed:", error);
    return { success: false, error: error.message };
  }
}

export async function restoreLand(id: string) {
  try {
    const land = await prisma.land.findUnique({
      where: { id },
    });

    if (!land) {
      return { success: false, error: "Land parcel not found" };
    }

    const updated = await prisma.land.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        status: "active",
      },
    });

    // Audit Log
    await logActivity({
      action: "Land restored",
      module: "land",
      entityId: id,
      oldValue: JSON.stringify(land),
      newValue: JSON.stringify(updated),
      notes: `Restored soft-deleted land parcel "${land.name}"`,
    });

    revalidatePath("/lands");
    revalidatePath("/logs");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("[DB] restoreLand failed:", error);
    return { success: false, error: error.message };
  }
}
