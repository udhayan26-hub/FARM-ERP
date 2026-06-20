"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface UpdateUserProfileInput {
  name: string;
  email: string;
  farmName: string;
  phone: string;
}

export async function updateUserProfile(data: UpdateUserProfileInput) {
  try {
    const userId = "demo-user-001";
    console.log("[DB] Syncing/updating user profile for:", userId, data);

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        farmName: data.farmName.trim(),
        phone: data.phone.trim(),
      },
      create: {
        id: userId,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        farmName: data.farmName.trim(),
        phone: data.phone.trim(),
        role: "owner",
      },
    });

    console.log("[DB] User profile upserted successfully:", user.id);
    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true, user };
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error("[DB] updateUserProfile failed:", message, error);
    return { success: false, error: message };
  }
}

export async function getUserProfile() {
  try {
    const userId = "demo-user-001";
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user;
  } catch (error: any) {
    console.error("[DB] getUserProfile failed:", error);
    return null;
  }
}
