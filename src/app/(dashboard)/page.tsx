import { Users, DollarSign, Tractor, Droplets, Zap, Wallet, ArrowDownRight, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import dynamicImport from "next/dynamic";

const ExpenseTrendChart = dynamicImport(
  () => import("@/components/dashboard/charts").then((mod) => mod.ExpenseTrendChart),
  {
    loading: () => (
      <div className="col-span-1 lg:col-span-4 h-[350px] bg-muted/20 animate-pulse rounded-md flex items-center justify-center border text-xs text-muted-foreground font-semibold">
        Loading Expense Trend...
      </div>
    ),
  }
);

const CategoryPieChart = dynamicImport(
  () => import("@/components/dashboard/charts").then((mod) => mod.CategoryPieChart),
  {
    loading: () => (
      <div className="col-span-1 lg:col-span-3 h-[350px] bg-muted/20 animate-pulse rounded-md flex items-center justify-center border text-xs text-muted-foreground font-semibold">
        Loading Expense Breakdown...
      </div>
    ),
  }
);
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getConsolidatedExpenses } from "@/actions/expense-breakdown";
import { getAuditLogs } from "@/actions/audit-actions";

const DEMO_USER_ID = "demo-user-001";

async function ensureUser() {
  try {
    const user = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
    if (!user) {
      await prisma.user.create({
        data: {
          id: DEMO_USER_ID,
          email: "farmer@farmerp.com",
          name: "Rajesh Kumar",
          farmName: "Green Valley Farms",
          phone: "+91-9876543210",
          role: "owner",
        },
      });
    }
  } catch {
    // silently handle — DB may not be set up yet
  }
}

async function getDashboardStats() {
  try {
    await ensureUser();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      totalWorkers,
      activeWorkers,
      activeTractors,
      activeLands,
      paymentsSum,
      expensesSum,
      dieselSum,
      todayAttendance,
      todayWagesPaidAgg,
      outstandingWagesAgg,
    ] = await Promise.all([
      prisma.worker.count({ where: { userId: DEMO_USER_ID } }),
      prisma.worker.count({ where: { userId: DEMO_USER_ID, status: "active" } }),
      prisma.tractor.count({ where: { userId: DEMO_USER_ID, status: "active" } }),
      prisma.land.count({ where: { userId: DEMO_USER_ID, isDeleted: false, status: "active" } }),
      // A. Monthly paid wages
      prisma.payment.aggregate({
        where: { status: "paid", date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      // B. Monthly general expenses
      prisma.expense.aggregate({
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      // C. Monthly diesel costs
      prisma.dieselLog.aggregate({
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { cost: true },
      }),
      // D. Today's attendance to compute wages due
      prisma.attendance.findMany({
        where: { date: { gte: todayStart, lte: todayEnd } },
        include: { worker: true },
      }),
      // E. Today's wages paid
      prisma.payment.aggregate({
        where: { status: "paid", date: { gte: todayStart, lte: todayEnd } },
        _sum: { amount: true },
      }),
      // F. Outstanding unpaid wages
      prisma.payment.aggregate({
        where: { status: "pending" },
        _sum: { amount: true },
      }),
    ]);

    // Calculate Today's Wages Due
    let todayWagesDue = 0;
    let presentToday = 0;
    for (const att of todayAttendance) {
      if (att.status === "present") {
        todayWagesDue += att.worker.dailyWage;
        presentToday++;
      } else if (att.status === "half") {
        todayWagesDue += att.worker.dailyWage / 2;
        presentToday++;
      }
    }

    const monthlyExpensesTotal =
      (paymentsSum._sum.amount ?? 0) + (expensesSum._sum.amount ?? 0) + (dieselSum._sum.cost ?? 0);
    const monthlyDieselTotal = dieselSum._sum.cost ?? 0;
    const todayWagesPaid = todayWagesPaidAgg._sum.amount ?? 0;
    const outstandingWages = outstandingWagesAgg._sum.amount ?? 0;

    return {
      totalWorkers,
      activeWorkers,
      activeTractors,
      activeLands,
      monthlyExpensesTotal,
      monthlyDieselTotal,
      presentToday,
      todayWagesDue,
      todayWagesPaid,
      outstandingWages,
    };
  } catch (error) {
    console.error("[Dashboard] Failed to fetch stats:", error);
    return {
      totalWorkers: 0,
      activeWorkers: 0,
      activeTractors: 0,
      activeLands: 0,
      monthlyExpensesTotal: 0,
      monthlyDieselTotal: 0,
      presentToday: 0,
      todayWagesDue: 0,
      todayWagesPaid: 0,
      outstandingWages: 0,
    };
  }
}

async function getMonthlyExpenseData() {
  try {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const monthPromises = Array.from({ length: 6 }, (_, index) => {
      const i = 5 - index;
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      return Promise.all([
        prisma.payment.aggregate({
          where: { status: "paid", date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: { date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
        prisma.dieselLog.aggregate({
          where: { date: { gte: start, lte: end } },
          _sum: { cost: true },
        }),
      ]).then(([pSum, eSum, dSum]) => {
        const total = (pSum._sum.amount ?? 0) + (eSum._sum.amount ?? 0) + (dSum._sum.cost ?? 0);
        return { name: months[d.getMonth()], amount: total };
      });
    });

    return await Promise.all(monthPromises);
  } catch {
    return [];
  }
}

async function getCategoryData() {
  const res = await getConsolidatedExpenses({
    period: "monthly",
    date: new Date().toISOString(),
  });
  if (!res.success || res.totalAmount === 0) return [];
  return res.breakdown.filter((item) => item.amount > 0);
}

export default async function DashboardPage() {
  const [stats, expenseData, categoryData, logs] = await Promise.all([
    getDashboardStats(),
    getMonthlyExpenseData(),
    getCategoryData(),
    getAuditLogs().then((res) => res.slice(0, 4)),
  ]);

  const statCards = [
    {
      title: "Active Workers",
      value: String(stats.activeWorkers),
      icon: <Users className="h-5 w-5" />,
      description: `${stats.presentToday} present today`,
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(stats.monthlyExpensesTotal),
      icon: <DollarSign className="h-5 w-5" />,
      description: "Wages + General + Diesel",
    },
    {
      title: "Monthly Diesel",
      value: formatCurrency(stats.monthlyDieselTotal),
      icon: <Droplets className="h-5 w-5" />,
      description: "Fuel cost this month",
    },
    {
      title: "Today's Wages Due",
      value: formatCurrency(stats.todayWagesDue),
      icon: <Wallet className="h-5 w-5" />,
      description: "Based on attendance",
    },
    {
      title: "Today's Paid Wages",
      value: formatCurrency(stats.todayWagesPaid),
      icon: <ArrowDownRight className="h-5 w-5 text-emerald-500" />,
      description: "Wages paid out today",
    },
    {
      title: "Outstanding Wages",
      value: formatCurrency(stats.outstandingWages),
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      description: "Accrued pending payments",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Real-world overview of your farm's performance and financial statements"
      >
        <Button asChild className="hidden sm:flex">
          <Link href="/daily-entry">
            <Zap className="mr-2 h-4 w-4" />
            Fast Daily Entry
          </Link>
        </Button>
      </PageHeader>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium mb-3 tracking-tight">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <ExpenseTrendChart data={expenseData} />
        <CategoryPieChart data={categoryData} />
        <RecentActivity logs={logs} />
      </div>
    </div>
  );
}
