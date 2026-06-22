"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DEMO_USER_ID = "demo-user-001";

export interface LogActivityInput {
  action: string;
  module: string;
  entityId: string;
  oldValue?: string | null;
  newValue?: string | null;
  notes?: string;
}

export async function logActivity(data: LogActivityInput) {
  try {
    const log = await prisma.auditLog.create({
      data: {
        userId: DEMO_USER_ID,
        action: data.action,
        module: data.module,
        entity: data.module, // Map module to existing entity column for backwards compatibility
        entityId: data.entityId,
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
        notes: data.notes || "",
      },
    });
    console.log(`[LOG] Activity logged: [${data.module}] ${data.action} (ID: ${data.entityId})`);
    return { success: true, logId: log.id };
  } catch (error: any) {
    console.error("[LOG] Failed to log activity:", error.message);
    return { success: false, error: error.message };
  }
}

export interface GetAuditLogsFilters {
  module?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export async function getAuditLogs(filters: GetAuditLogsFilters = {}) {
  try {
    const where: any = {
      userId: DEMO_USER_ID,
    };

    if (filters.module && filters.module !== "all") {
      where.module = filters.module;
    }

    if (filters.search) {
      where.OR = [
        { action: { contains: filters.search } },
        { notes: { contains: filters.search } },
        { entityId: { contains: filters.search } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        // Set end date to end of that day (23:59:59)
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return logs;
  } catch (error: any) {
    console.error("[LOG] Failed to fetch audit logs:", error);
    return [];
  }
}

export async function getAuditLogsCount(filters: GetAuditLogsFilters = {}) {
  try {
    const where: any = {
      userId: DEMO_USER_ID,
    };

    if (filters.module && filters.module !== "all") {
      where.module = filters.module;
    }

    if (filters.search) {
      where.OR = [
        { action: { contains: filters.search } },
        { notes: { contains: filters.search } },
        { entityId: { contains: filters.search } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    return await prisma.auditLog.count({ where });
  } catch (error: any) {
    console.error("[LOG] Failed to fetch audit logs count:", error);
    return 0;
  }
}

export async function deleteAuditLog(id: string) {
  try {
    await prisma.auditLog.delete({
      where: { id },
    });
    revalidatePath("/logs");
    return { success: true };
  } catch (error: any) {
    console.error("[LOG] Failed to delete audit log:", error);
    return { success: false, error: error.message || "Failed to delete log entry" };
  }
}

export async function clearAllAuditLogs() {
  try {
    await prisma.auditLog.deleteMany({
      where: { userId: DEMO_USER_ID },
    });
    revalidatePath("/logs");
    return { success: true };
  } catch (error: any) {
    console.error("[LOG] Failed to clear audit logs:", error);
    return { success: false, error: error.message || "Failed to clear logs" };
  }
}
