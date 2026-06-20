"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AttendanceFormValues } from "@/lib/validations/attendance";
import { logActivity } from "./audit-actions";

const DEMO_USER_ID = "demo-user-001";

export async function getAttendance(date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        }
      },
      include: { worker: true }
    });
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return [];
  }
}

export async function submitAttendance(data: AttendanceFormValues) {
  try {
    if (!data.date) return { success: false, error: "Date is required" };
    if (!data.entries || data.entries.length === 0) return { success: false, error: "No attendance entries provided" };

    const date = new Date(data.date);
    date.setHours(12, 0, 0, 0); // Normalize to mid-day to avoid timezone offset shifts
    
    // Process each entry using transaction
    const results = await prisma.$transaction(
      data.entries.map((entry) => 
        prisma.attendance.upsert({
          where: {
            workerId_date: {
              workerId: entry.workerId,
              date: date
            }
          },
          update: {
            status: entry.status,
            markedBy: DEMO_USER_ID
          },
          create: {
            workerId: entry.workerId,
            date: date,
            status: entry.status,
            markedBy: DEMO_USER_ID
          },
          include: { worker: true }
        })
      )
    );

    // Summarize results for logging
    const present = results.filter(r => r.status === "present").length;
    const half = results.filter(r => r.status === "half").length;
    const absent = results.filter(r => r.status === "absent").length;

    // Log Activity
    await logActivity({
      action: "Attendance marked",
      module: "attendance",
      entityId: `bulk-att-${date.toISOString().split("T")[0]}`,
      newValue: JSON.stringify({
        date: date.toISOString().split("T")[0],
        totalCount: results.length,
        present,
        half,
        absent,
      }),
      notes: `Marked attendance for ${results.length} workers on ${date.toLocaleDateString()}. Present: ${present}, Half: ${half}, Absent: ${absent}`,
    });

    revalidatePath("/attendance");
    revalidatePath("/daily-entry");
    revalidatePath("/logs");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to submit attendance:", error);
    return { success: false, error: error.message || "Failed to submit attendance" };
  }
}
