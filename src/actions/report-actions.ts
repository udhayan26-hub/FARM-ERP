"use server";

import { prisma } from "@/lib/prisma";
import { getMonthlySalariesData } from "./payment-actions";

const DEMO_USER_ID = "demo-user-001";

export async function getExpenseReportData(month: number, year: number) {
  try {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const [expenses, dieselLogs, payments] = await Promise.all([
      prisma.expense.findMany({
        where: { userId: DEMO_USER_ID, date: { gte: start, lte: end } },
        orderBy: { date: "asc" },
      }),
      prisma.dieselLog.findMany({
        where: {
          tractor: { userId: DEMO_USER_ID },
          date: { gte: start, lte: end },
        },
        include: { tractor: true },
        orderBy: { date: "asc" },
      }),
      prisma.payment.findMany({
        where: {
          worker: { userId: DEMO_USER_ID },
          status: "paid",
          date: { gte: start, lte: end },
        },
        include: { worker: true },
        orderBy: { date: "asc" },
      }),
    ]);

    const report = [];

    for (const e of expenses) {
      report.push({
        Date: new Date(e.date).toLocaleDateString("en-IN"),
        Category: e.category.toUpperCase(),
        Description: e.description || "-",
        Amount: e.amount,
      });
    }

    for (const d of dieselLogs) {
      report.push({
        Date: new Date(d.date).toLocaleDateString("en-IN"),
        Category: "DIESEL FUEL",
        Description: `${d.liters} L for ${d.tractor.name} (${d.purpose || "general"})`,
        Amount: d.cost,
      });
    }

    for (const p of payments) {
      report.push({
        Date: new Date(p.date).toLocaleDateString("en-IN"),
        Category: "LABOUR WAGES",
        Description: `Wage payout to worker "${p.worker.name}"`,
        Amount: p.amount,
      });
    }

    // Sort by date ascending
    report.sort((a, b) => {
      const partsA = a.Date.split("/");
      const partsB = b.Date.split("/");
      const dateA = new Date(Number(partsA[2]), Number(partsA[1]) - 1, Number(partsA[0]));
      const dateB = new Date(Number(partsB[2]), Number(partsB[1]) - 1, Number(partsB[0]));
      return dateA.getTime() - dateB.getTime();
    });

    return report;
  } catch (error) {
    console.error("[REPORT] Failed to get expense report data:", error);
    return [];
  }
}

export async function getWorkerSalarySheetReportData(month: number, year: number) {
  try {
    const salaries = await getMonthlySalariesData(month, year);
    return salaries.map((s) => ({
      "Worker Name": s.name,
      Village: s.village || "-",
      "Wage Frequency": s.wageType.toUpperCase(),
      "Wage Rate": `₹${s.dailyWage}`,
      "Days Worked": s.daysWorked,
      "Half Days": s.halfDays,
      "Calculated Base": s.calculatedBase,
      "Bonus Paid": s.bonus || 0,
      Deductions: s.deduction || 0,
      "Paid Amount": s.status === "paid" ? s.paidAmount : 0,
      Status: s.status.toUpperCase(),
    }));
  } catch (error) {
    console.error("[REPORT] Failed to get worker salary sheet data:", error);
    return [];
  }
}

export async function getTractorUtilizationReportData(month: number, year: number) {
  try {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const tractors = await prisma.tractor.findMany({
      where: { userId: DEMO_USER_ID },
      include: {
        dieselLogs: {
          where: { date: { gte: start, lte: end } },
        },
      },
      orderBy: { name: "asc" },
    });

    return tractors.map((t) => {
      const totalLiters = t.dieselLogs.reduce((acc, log) => acc + log.liters, 0);
      const totalCost = t.dieselLogs.reduce((acc, log) => acc + log.cost, 0);
      const totalHours = t.dieselLogs.reduce((acc, log) => acc + log.hoursWorked, 0);

      return {
        "Tractor Name": t.name,
        "Registration No": t.registrationNo,
        Model: t.model || "-",
        "Driver Name": t.driverName,
        "Hours Operated": totalHours,
        "Fuel Consumed (Liters)": totalLiters,
        "Total Diesel Cost": totalCost,
      };
    });
  } catch (error) {
    console.error("[REPORT] Failed to get tractor utilization data:", error);
    return [];
  }
}

export async function getFarmSummaryReportData(month: number, year: number) {
  try {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const [
      activeWorkers,
      activeLands,
      activeTractors,
      expensesSum,
      dieselSum,
      paymentsSum,
    ] = await Promise.all([
      prisma.worker.count({ where: { userId: DEMO_USER_ID, status: "active" } }),
      prisma.land.count({ where: { userId: DEMO_USER_ID, isDeleted: false, status: "active" } }),
      prisma.tractor.count({ where: { userId: DEMO_USER_ID, status: "active" } }),
      prisma.expense.aggregate({
        where: { userId: DEMO_USER_ID, date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.dieselLog.aggregate({
        where: {
          tractor: { userId: DEMO_USER_ID },
          date: { gte: start, lte: end },
        },
        _sum: { cost: true },
      }),
      prisma.payment.aggregate({
        where: {
          worker: { userId: DEMO_USER_ID },
          status: "paid",
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalGeneral = expensesSum._sum.amount || 0;
    const totalDiesel = dieselSum._sum.cost || 0;
    const totalWages = paymentsSum._sum.amount || 0;
    const totalCost = totalGeneral + totalDiesel + totalWages;

    return [
      { Metric: "Active Cultivators Staff", Value: activeWorkers },
      { Metric: "Active Land Parcels", Value: activeLands },
      { Metric: "Active Tractors Roster", Value: activeTractors },
      { Metric: "General Operations Expenses", Value: `₹${totalGeneral.toLocaleString("en-IN")}` },
      { Metric: "Fuel/Diesel Total Costs", Value: `₹${totalDiesel.toLocaleString("en-IN")}` },
      { Metric: "Labor Wages Disbursed", Value: `₹${totalWages.toLocaleString("en-IN")}` },
      { Metric: "Grand Total Farm Expenditures", Value: `₹${totalCost.toLocaleString("en-IN")}` },
    ];
  } catch (error) {
    console.error("[REPORT] Failed to get farm summary data:", error);
    return [];
  }
}
