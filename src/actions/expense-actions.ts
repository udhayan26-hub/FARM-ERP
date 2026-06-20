"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ExpenseFormValues } from "@/lib/validations/expense";
import { logActivity } from "./audit-actions";

const DEMO_USER_ID = "demo-user-001";

export async function getExpenses() {
  try {
    return await prisma.expense.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { date: 'desc' }
    });
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }
}

export async function createExpense(data: ExpenseFormValues) {
  try {
    // Validations
    if (data.amount <= 0) return { success: false, error: "Expense amount must be greater than zero" };
    if (!data.description.trim()) return { success: false, error: "Description is required" };

    const expense = await prisma.expense.create({
      data: {
        userId: DEMO_USER_ID,
        date: new Date(data.date),
        category: data.category,
        amount: data.amount,
        description: data.description.trim(),
        notes: data.notes || "",
      }
    });

    // Log Activity
    await logActivity({
      action: "Expense added",
      module: "expense",
      entityId: expense.id,
      newValue: JSON.stringify(expense),
      notes: `Added general expense "${expense.description}" of ₹${expense.amount} under ${expense.category}`,
    });

    revalidatePath("/expenses");
    revalidatePath("/logs");
    revalidatePath("/");
    return { success: true, expense };
  } catch (error: any) {
    console.error("Failed to create expense:", error);
    return { success: false, error: error.message || "Failed to create expense" };
  }
}

export async function updateExpense(id: string, data: ExpenseFormValues) {
  try {
    const original = await prisma.expense.findUnique({ where: { id } });
    if (!original) return { success: false, error: "Expense record not found" };

    // Validations
    if (data.amount <= 0) return { success: false, error: "Expense amount must be greater than zero" };
    if (!data.description.trim()) return { success: false, error: "Description is required" };

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        date: new Date(data.date),
        category: data.category,
        amount: data.amount,
        description: data.description.trim(),
        notes: data.notes || "",
      }
    });

    // Log Activity
    await logActivity({
      action: "Expense edited",
      module: "expense",
      entityId: id,
      oldValue: JSON.stringify(original),
      newValue: JSON.stringify(expense),
      notes: `Edited expense "${expense.description}". Amount set to ₹${expense.amount}`,
    });

    revalidatePath("/expenses");
    revalidatePath("/logs");
    revalidatePath("/");
    return { success: true, expense };
  } catch (error: any) {
    console.error("Failed to update expense:", error);
    return { success: false, error: error.message || "Failed to update expense" };
  }
}

export async function deleteExpense(id: string) {
  try {
    const original = await prisma.expense.findUnique({ where: { id } });
    if (!original) return { success: false, error: "Expense record not found" };

    await prisma.expense.delete({ where: { id } });

    // Log Activity
    await logActivity({
      action: "Expense deleted",
      module: "expense",
      entityId: id,
      oldValue: JSON.stringify(original),
      notes: `Deleted expense record "${original.description}" of ₹${original.amount}`,
    });

    revalidatePath("/expenses");
    revalidatePath("/logs");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete expense:", error);
    return { success: false, error: error.message || "Failed to delete expense" };
  }
}
