import { Plus, Fuel, Tractor as TractorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DEMO_USER_ID = "demo-user-001";

async function getDieselData() {
  try {
    const [logs, totalStats] = await Promise.all([
      prisma.dieselLog.findMany({
        include: { tractor: true },
        where: { tractor: { userId: DEMO_USER_ID } },
        orderBy: { date: "desc" },
        take: 50,
      }),
      prisma.dieselLog.aggregate({
        where: { tractor: { userId: DEMO_USER_ID } },
        _sum: { cost: true, liters: true },
      }),
    ]);
    return { logs, totalCost: totalStats._sum.cost ?? 0, totalLiters: totalStats._sum.liters ?? 0 };
  } catch (error) {
    console.error("[Diesel] Failed to fetch:", error);
    return { logs: [], totalCost: 0, totalLiters: 0 };
  }
}

import { ExportButton } from "@/components/shared/export-button";

export default async function DieselPage() {
  const { logs, totalCost, totalLiters } = await getDieselData();

  const exportData = logs.map((log) => ({
    Date: new Date(log.date).toLocaleDateString(),
    Tractor: log.tractor.name,
    Liters: `${log.liters} L`,
    Cost: `₹${log.cost}`,
    Hours: `${log.hoursWorked} hrs`,
    Purpose: log.purpose.toUpperCase(),
    Notes: log.notes || "-",
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Diesel Logs" description="Track fuel consumption and costs">
        <div className="flex gap-2">
          <ExportButton data={exportData} filename="diesel_logs" placeholder="Export Logs" />
          <Button asChild variant="outline" size="sm" className="hidden sm:flex">
            <Link href="/daily-entry">
              <Plus className="mr-2 h-4 w-4" />
              Add Daily Log
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Fuel className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{totalLiters.toFixed(0)} L</p>
              <p className="text-xs text-muted-foreground">Total Diesel Used</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <TractorIcon className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-700">₹{totalCost.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">Total Diesel Cost</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Fuel className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No diesel logs yet.</p>
              <p className="text-xs mt-1">Add a tractor first, then log diesel usage.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground whitespace-nowrap">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Tractor</th>
                    <th className="px-4 py-3 font-medium text-right">Liters</th>
                    <th className="px-4 py-3 font-medium text-right">Cost</th>
                    <th className="px-4 py-3 font-medium text-right">Hours</th>
                    <th className="px-4 py-3 font-medium">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(log.date)}</td>
                      <td className="px-4 py-3 font-medium">{log.tractor.name}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">
                        {log.liters} L
                      </td>
                      <td className="px-4 py-3 text-right">₹{log.cost.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right">{log.hoursWorked} hrs</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="capitalize">
                          {log.purpose}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
