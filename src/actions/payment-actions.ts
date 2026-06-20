"use server";

import { prisma } from "@/lib/prisma";
import { logActivity } from "./audit-actions";
import { revalidatePath } from "next/cache";

const DEMO_USER_ID = "demo-user-001";

export interface RecordPaymentInput {
  workerId: string;
  date: string;
  baseWage: number;
  bonus: number;
  deduction: number;
  amount: number;
  notes?: string;
  paymentType: "daily" | "weekly" | "monthly";
}

export async function recordPayment(data: RecordPaymentInput) {
  try {
    // Validations
    if (data.baseWage < 0 || data.bonus < 0 || data.deduction < 0 || data.amount < 0) {
      return { success: false, error: "Financial amounts cannot be negative" };
    }

    const worker = await prisma.worker.findUnique({
      where: { id: data.workerId },
    });

    if (!worker) {
      return { success: false, error: "Worker not found" };
    }

    // Use Prisma transaction to ensure salary payment and advance transaction are recorded atomically
    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          workerId: data.workerId,
          date: new Date(data.date),
          baseWage: data.baseWage,
          bonus: data.bonus,
          deduction: data.deduction,
          amount: data.amount,
          status: "paid",
          notes: data.notes || "",
          paymentType: data.paymentType,
        },
      });

      if (data.deduction > 0) {
        const latestTx = await tx.advanceTransaction.findFirst({
          where: { workerId: data.workerId },
          orderBy: { createdAt: "desc" },
        });

        const currentBalance = latestTx ? latestTx.balance : 0;
        const newBalance = currentBalance - data.deduction;

        await tx.advanceTransaction.create({
          data: {
            workerId: data.workerId,
            date: new Date(data.date),
            amountGiven: 0,
            amountReturned: data.deduction,
            balance: newBalance,
            notes: `Deducted from wage payout (Earned: ₹${data.baseWage + data.bonus}, Paid: ₹${data.amount}) for ${new Date(data.date).toLocaleDateString("en-IN", {month: 'long', year: 'numeric'})}`,
          },
        });
      }

      return p;
    });

    // Write to audit logs
    await logActivity({
      action: `Wage paid: ₹${data.amount}`,
      module: "payment",
      entityId: payment.id,
      newValue: JSON.stringify({
        workerName: worker.name,
        amount: data.amount,
        baseWage: data.baseWage,
        bonus: data.bonus,
        deduction: data.deduction,
        type: data.paymentType,
      }),
      notes: `Payout recorded for ${worker.name}. Deduction of ₹${data.deduction} automatically recovered and logged as advance repayment. Notes: ${data.notes || "None"}`,
    });

    revalidatePath("/salaries");
    revalidatePath("/advances");
    revalidatePath("/logs");
    revalidatePath("/");
    
    return { success: true, payment };
  } catch (error: any) {
    console.error("[PAYMENT] Failed to record payment:", error);
    return { success: false, error: error.message };
  }
}

export async function getPayments() {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { date: "desc" },
      include: {
        worker: {
          select: {
            name: true,
            wageType: true,
          },
        },
      },
    });
    return payments;
  } catch (error) {
    console.error("[PAYMENT] Failed to fetch payments:", error);
    return [];
  }
}

// Advance Payments / Loans System
export interface RecordAdvanceInput {
  workerId: string;
  date: string;
  amount: number;
  notes?: string;
}

export async function giveAdvance(data: RecordAdvanceInput) {
  try {
    if (data.amount <= 0) {
      return { success: false, error: "Disbursement amount must be greater than zero" };
    }

    const worker = await prisma.worker.findUnique({
      where: { id: data.workerId },
    });

    if (!worker) {
      return { success: false, error: "Worker not found" };
    }

    // Get current balance
    const latestTx = await prisma.advanceTransaction.findFirst({
      where: { workerId: data.workerId },
      orderBy: { createdAt: "desc" },
    });

    const currentBalance = latestTx ? latestTx.balance : 0;
    const newBalance = currentBalance + data.amount;

    const tx = await prisma.advanceTransaction.create({
      data: {
        workerId: data.workerId,
        date: new Date(data.date),
        amountGiven: data.amount,
        amountReturned: 0,
        balance: newBalance,
        notes: data.notes || "",
      },
    });

    // Write to audit logs
    await logActivity({
      action: `Advance given: ₹${data.amount}`,
      module: "advance",
      entityId: tx.id,
      newValue: JSON.stringify({
        workerName: worker.name,
        amountGiven: data.amount,
        newBalance,
      }),
      notes: `Advance disbursed to ${worker.name}. Balance: ₹${newBalance}`,
    });

    revalidatePath("/advances");
    revalidatePath("/logs");
    revalidatePath("/");

    return { success: true, tx };
  } catch (error: any) {
    console.error("[ADVANCE] Failed to record advance given:", error);
    return { success: false, error: error.message };
  }
}

export async function repayAdvance(data: RecordAdvanceInput) {
  try {
    if (data.amount <= 0) {
      return { success: false, error: "Repayment amount must be greater than zero" };
    }

    const worker = await prisma.worker.findUnique({
      where: { id: data.workerId },
    });

    if (!worker) {
      return { success: false, error: "Worker not found" };
    }

    // Get current balance
    const latestTx = await prisma.advanceTransaction.findFirst({
      where: { workerId: data.workerId },
      orderBy: { createdAt: "desc" },
    });

    const currentBalance = latestTx ? latestTx.balance : 0;
    
    if (data.amount > currentBalance) {
      return { success: false, error: `Repayment amount (₹${data.amount}) exceeds current balance (₹${currentBalance})` };
    }

    const newBalance = currentBalance - data.amount;

    const tx = await prisma.advanceTransaction.create({
      data: {
        workerId: data.workerId,
        date: new Date(data.date),
        amountGiven: 0,
        amountReturned: data.amount,
        balance: newBalance,
        notes: data.notes || "",
      },
    });

    // Write to audit logs
    await logActivity({
      action: `Advance returned: ₹${data.amount}`,
      module: "advance",
      entityId: tx.id,
      newValue: JSON.stringify({
        workerName: worker.name,
        amountReturned: data.amount,
        newBalance,
      }),
      notes: `Advance repaid by ${worker.name}. Balance: ₹${newBalance}`,
    });

    revalidatePath("/advances");
    revalidatePath("/logs");
    revalidatePath("/");

    return { success: true, tx };
  } catch (error: any) {
    console.error("[ADVANCE] Failed to record advance repayment:", error);
    return { success: false, error: error.message };
  }
}

export async function getWorkerAdvanceHistory(workerId: string) {
  try {
    const history = await prisma.advanceTransaction.findMany({
      where: { workerId },
      orderBy: { date: "desc" },
    });
    return history;
  } catch (error) {
    console.error("[ADVANCE] Failed to fetch worker advance history:", error);
    return [];
  }
}

export async function getAdvancesLedger() {
  try {
    const workers = await prisma.worker.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
    });

    const ledger = await Promise.all(
      workers.map(async (w) => {
        const latestTx = await prisma.advanceTransaction.findFirst({
          where: { workerId: w.id },
          orderBy: { createdAt: "desc" },
        });
        return {
          id: w.id,
          name: w.name,
          phone: w.phone,
          village: w.village,
          balance: latestTx ? latestTx.balance : 0,
        };
      })
    );

    return ledger;
  } catch (error) {
    console.error("[ADVANCE] Failed to fetch advances ledger:", error);
    return [];
  }
}

export async function getMonthlySalariesData(month: number, year: number) {
  try {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const workers = await prisma.worker.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
    });

    if (workers.length === 0) return [];

    const attendance = await prisma.attendance.findMany({
      where: {
        workerId: { in: workers.map((w) => w.id) },
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const payments = await prisma.payment.findMany({
      where: {
        workerId: { in: workers.map((w) => w.id) },
        status: "paid",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const salaries = await Promise.all(
      workers.map(async (worker) => {
        const workerAttendance = attendance.filter((a) => a.workerId === worker.id);
        const daysPresent = workerAttendance.filter((a) => a.status === "present").length;
        const halfDays = workerAttendance.filter((a) => a.status === "half").length;
        const effectiveDays = daysPresent + halfDays * 0.5;

        let calculatedBase = effectiveDays * worker.dailyWage;
        if (worker.wageType === "monthly" && worker.monthlyWage) {
          calculatedBase = worker.monthlyWage;
        }

        const workerPayment = payments.find((p) => p.workerId === worker.id);

        const latestTx = await prisma.advanceTransaction.findFirst({
          where: { workerId: worker.id },
          orderBy: { createdAt: "desc" },
        });
        const advanceBalance = latestTx ? latestTx.balance : 0;

        return {
          id: worker.id,
          name: worker.name,
          village: worker.village,
          dailyWage: worker.dailyWage,
          wageType: worker.wageType,
          monthlyWage: worker.monthlyWage,
          daysWorked: daysPresent,
          halfDays: halfDays,
          calculatedBase,
          status: workerPayment ? "paid" : "pending",
          paidAmount: workerPayment ? workerPayment.amount : 0,
          baseWage: workerPayment ? workerPayment.baseWage : calculatedBase,
          bonus: workerPayment ? workerPayment.bonus : 0,
          deduction: workerPayment ? workerPayment.deduction : 0,
          notes: workerPayment ? workerPayment.notes : "",
          advanceBalance,
        };
      })
    );

    return salaries;
  } catch (error) {
    console.error("[PAYMENT] Failed to fetch monthly salaries data:", error);
    return [];
  }
}

export async function getWorkerSalaryAndAdvanceStatus(workerId: string, month: number, year: number) {
  try {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
    });

    if (!worker) {
      return null;
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        workerId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const daysPresent = attendance.filter((a) => a.status === "present").length;
    const halfDays = attendance.filter((a) => a.status === "half").length;
    const effectiveDays = daysPresent + halfDays * 0.5;

    let calculatedBase = effectiveDays * worker.dailyWage;
    if (worker.wageType === "monthly" && worker.monthlyWage) {
      calculatedBase = worker.monthlyWage;
    }

    const payments = await prisma.payment.findMany({
      where: {
        workerId,
        status: "paid",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingWageDue = Math.max(0, calculatedBase - paidAmount);

    const latestTx = await prisma.advanceTransaction.findFirst({
      where: { workerId },
      orderBy: { createdAt: "desc" },
    });
    const advanceBalance = latestTx ? latestTx.balance : 0;

    return {
      daysWorked: daysPresent,
      halfDays: halfDays,
      effectiveDays,
      calculatedBase,
      paidAmount,
      remainingWageDue,
      advanceBalance,
      dailyWage: worker.dailyWage,
      wageType: worker.wageType,
    };
  } catch (error) {
    console.error("[ADVANCE] Failed to fetch worker salary & advance status:", error);
    return null;
  }
}
