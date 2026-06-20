"use server";

import { prisma } from "@/lib/prisma";

export interface ExpenseBreakdownFilter {
  period: "daily" | "weekly" | "monthly" | "yearly";
  date?: string; // anchor date (defaults to today)
}

export interface CategoryShare {
  name: string;
  value: number; // percentage
  amount: number; // raw currency amount
}

export async function getConsolidatedExpenses(filter: ExpenseBreakdownFilter) {
  try {
    const anchor = filter.date ? new Date(filter.date) : new Date();
    let startDate = new Date();
    let endDate = new Date();

    // 1. Calculate date ranges
    if (filter.period === "daily") {
      startDate = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), 0, 0, 0);
      endDate = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), 23, 59, 59, 999);
    } else if (filter.period === "weekly") {
      // Find start of week (Sunday or Monday)
      const day = anchor.getDay();
      const diff = anchor.getDate() - day;
      startDate = new Date(anchor.getFullYear(), anchor.getMonth(), diff, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000 + 23 * 59 * 59 * 999);
    } else if (filter.period === "monthly") {
      startDate = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 0, 0, 0);
      endDate = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (filter.period === "yearly") {
      startDate = new Date(anchor.getFullYear(), 0, 1, 0, 0, 0);
      endDate = new Date(anchor.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    console.log(`[BREAKDOWN] Querying consolidated expenses from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // 2. Fetch and aggregate data sources concurrently
    const [paymentsSum, dieselLogsSum, miscellaneousExpenses] = await Promise.all([
      // A. Labor Cost (Sum of all paid wages/payments)
      prisma.payment.aggregate({
        where: {
          status: "paid",
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      // B. Diesel Cost (Sum of all diesel logs)
      prisma.dieselLog.aggregate({
        where: {
          date: { gte: startDate, lte: endDate },
        },
        _sum: { cost: true },
      }),
      // C. General Expenses (fertilizer, seeds, water, equipment, repairs, repairs/maintenance, miscellaneous)
      prisma.expense.groupBy({
        by: ["category"],
        where: {
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    // 3. Initialize breakdown buckets
    const categories: Record<string, number> = {
      Labor: paymentsSum._sum.amount ?? 0,
      Diesel: dieselLogsSum._sum.cost ?? 0,
      Fertilizer: 0,
      Seeds: 0,
      Water: 0,
      Equipment: 0,
      Maintenance: 0,
      Miscellaneous: 0,
    };

    // 4. Map and accumulate standard database categories to target buckets
    for (const exp of miscellaneousExpenses) {
      const dbCat = exp.category.toLowerCase().trim();
      const amount = exp._sum.amount ?? 0;

      if (dbCat === "labour" || dbCat === "labor") {
        categories.Labor += amount;
      } else if (dbCat === "diesel") {
        categories.Diesel += amount;
      } else if (dbCat === "fertilizer" || dbCat === "fertilizers") {
        categories.Fertilizer += amount;
      } else if (dbCat === "seeds" || dbCat === "seed") {
        categories.Seeds += amount;
      } else if (dbCat === "water" || dbCat === "irrigation") {
        categories.Water += amount;
      } else if (dbCat === "equipment" || dbCat === "tools") {
        categories.Equipment += amount;
      } else if (dbCat === "maintenance" || dbCat === "repairs" || dbCat === "repair") {
        categories.Maintenance += amount;
      } else {
        categories.Miscellaneous += amount;
      }
    }

    // 5. Compute totals & percentages
    const totalAmount = Object.values(categories).reduce((sum, val) => sum + val, 0);

    const breakdown: CategoryShare[] = Object.keys(categories).map((catName) => {
      const amount = categories[catName];
      const share = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
      return {
        name: catName,
        value: share,
        amount: amount,
      };
    });

    return {
      success: true,
      totalAmount,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      breakdown,
    };
  } catch (error: any) {
    console.error("[BREAKDOWN] Failed to calculate consolidated expenses:", error);
    return {
      success: false,
      error: error.message,
      totalAmount: 0,
      breakdown: [],
    };
  }
}
