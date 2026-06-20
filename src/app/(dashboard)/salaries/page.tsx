"use client";

import { useEffect, useState } from "react";
import { Download, CreditCard, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonthlySalariesData } from "@/actions/payment-actions";
import { getMonthName } from "@/lib/utils";
import { SalariesTable } from "@/components/salaries/salaries-table";
import { toast } from "sonner";

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const data = await getMonthlySalariesData(month, year);
      setSalaries(data);
    } catch {
      toast.error("Failed to load salary calculations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [month, year]);

  const totalPayout = salaries.reduce((acc, s) => acc + (s.status === "paid" ? s.paidAmount : s.calculatedBase), 0);
  
  const paidPayout = salaries
    .filter((s) => s.status === "paid")
    .reduce((acc, s) => acc + s.paidAmount, 0);

  const pendingPayout = salaries
    .filter((s) => s.status === "pending")
    .reduce((acc, s) => acc + s.calculatedBase, 0);

  const pendingCount = salaries.filter((s) => s.status === "pending").length;

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    const isCurrent = month === now.getMonth() + 1 && year === now.getFullYear();
    if (isCurrent) return;

    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary Management"
        description="Calculate and track flexible worker payouts, overrides, bonuses, and deductions"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Total Salary Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              ₹{totalPayout.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              For {getMonthName(month)} {year}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-500" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-600">
              ₹{pendingPayout.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingCount} worker{pendingCount !== 1 ? "s" : ""} unpaid
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-600">
              ₹{paidPayout.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {salaries.filter((s) => s.status === "paid").length} workers paid
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                ← Prev
              </Button>
              <h2 className="text-lg font-bold min-w-[140px] text-center tracking-tight">
                {getMonthName(month)} {year}
              </h2>
              <Button
                variant="outline"
                size="sm"
                disabled={isCurrentMonth}
                onClick={handleNextMonth}
              >
                Next →
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading salaries information...
            </div>
          ) : salaries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No active workers found for this month.</p>
              <p className="text-xs mt-1">
                Add workers and mark attendance to generate salary records.
              </p>
            </div>
          ) : (
            <SalariesTable
              salaries={salaries}
              month={month}
              year={year}
              onRefresh={fetchSalaries}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
