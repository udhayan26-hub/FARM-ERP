"use client";

import { useState, useTransition } from "react";
import { Download, FileText, Eye, RefreshCw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { exportData } from "@/lib/export-utils";
import { getMonthName } from "@/lib/utils";

import {
  getExpenseReportData,
  getWorkerSalarySheetReportData,
  getTractorUtilizationReportData,
  getFarmSummaryReportData,
} from "@/actions/report-actions";

interface ReportType {
  id: string;
  title: string;
  desc: string;
  color: string;
  fetcher: (month: number, year: number) => Promise<any[]>;
}

const REPORT_TYPES: ReportType[] = [
  {
    id: "expense_report",
    title: "Monthly Expense Report",
    desc: "Detailed breakdown of all farm expenses, fuel costs, and wages by category",
    color: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    fetcher: getExpenseReportData,
  },
  {
    id: "salary_sheet",
    title: "Worker Salary Sheet",
    desc: "Monthly worker roster attendance, base wage calculations, and payout reports",
    color: "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400",
    fetcher: getWorkerSalarySheetReportData,
  },
  {
    id: "tractor_utilization",
    title: "Tractor Utilization",
    desc: "Tractor fuel consumption metrics, diesel costs, and total operated hours",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    fetcher: getTractorUtilizationReportData,
  },
  {
    id: "farm_summary",
    title: "Farm Summary Report",
    desc: "High-level metrics, active lands count, and overall monthly expenditures",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
    fetcher: getFarmSummaryReportData,
  },
];

export default function ReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // View report state
  const [viewReport, setViewReport] = useState<ReportType | null>(null);
  const [viewData, setViewData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [isPending, startTransition] = useTransition();

  const handleView = (report: ReportType) => {
    setViewReport(report);
    setLoadingData(true);
    startTransition(async () => {
      try {
        const data = await report.fetcher(month, year);
        setViewData(data);
      } catch (error) {
        toast.error(`Failed to load ${report.title}`);
        setViewReport(null);
      } finally {
        setLoadingData(false);
      }
    });
  };

  const handleDownload = (report: ReportType, format: "csv" | "pdf") => {
    let printWindow: Window | null = null;
    if (format === "pdf") {
      printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <body style="font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; background:#f8fafc; color:#475569;">
              <div style="text-align:center; padding:20px; border-radius:8px; border:1px solid #e2e8f0; background:white; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
                <h3 style="color:#16a34a; margin:0 0 10px 0;">Generating Report PDF...</h3>
                <p style="font-size:12px; margin:0;">Please wait while farmland records are fetched.</p>
              </div>
            </body>
          </html>
        `);
      }
    }

    startTransition(async () => {
      try {
        const data = await report.fetcher(month, year);
        if (data.length === 0) {
          toast.error("No data available for export in this period.");
          if (printWindow) printWindow.close();
          return;
        }

        const dateStr = `${getMonthName(month).toLowerCase()}_${year}`;
        const filename = `${report.id}_${dateStr}`;
        exportData(data, format, filename, printWindow);
      } catch (error) {
        toast.error(`Failed to export ${report.title}`);
        if (printWindow) printWindow.close();
      }
    });
  };

  const renderReportTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground text-xs font-semibold">
          No records found for this period.
        </div>
      );
    }

    const headers = Object.keys(data[0]);

    return (
      <div className="rounded-md border overflow-x-auto max-h-[400px] overflow-y-auto mt-2 bg-card">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/80 text-muted-foreground whitespace-nowrap sticky top-0 border-b">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-2.5 font-semibold text-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                {headers.map((h) => {
                  const val = row[h];
                  const isAmount =
                    typeof val === "number" &&
                    (h.toLowerCase().includes("cost") ||
                      h.toLowerCase().includes("amount") ||
                      h.toLowerCase().includes("base") ||
                      h.toLowerCase().includes("bonus") ||
                      h.toLowerCase().includes("deductions") ||
                      h.toLowerCase().includes("expense") ||
                      h.toLowerCase().includes("wages") ||
                      h.toLowerCase().includes("rate") ||
                      h.toLowerCase().includes("payout"));

                  const formattedVal = isAmount
                    ? `₹${val.toLocaleString("en-IN")}`
                    : val === null || val === undefined
                    ? "-"
                    : String(val);

                  return (
                    <td key={h} className="px-4 py-2.5 font-medium whitespace-nowrap text-muted-foreground">
                      {formattedVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and download farm analytics" />

      {/* Filter Card */}
      <Card className="shadow-sm">
        <CardContent className="p-5 flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 min-w-[160px]">
            <Label htmlFor="month" className="text-xs font-semibold text-muted-foreground">Select Month</Label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Select value={String(month)} onValueChange={(val) => setMonth(Number(val))}>
                <SelectTrigger id="month" className="h-9 pl-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {getMonthName(i + 1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5 min-w-[130px]">
            <Label htmlFor="year" className="text-xs font-semibold text-muted-foreground">Select Year</Label>
            <Select value={String(year)} onValueChange={(val) => setYear(Number(val))}>
              <SelectTrigger id="year" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const y = new Date().getFullYear() - 2 + i;
                  return (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {REPORT_TYPES.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1 pr-2">
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription className="text-sm">{report.desc}</CardDescription>
              </div>
              <div className={`p-2 rounded-lg flex-shrink-0 ${report.color}`}>
                <FileText className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex flex-wrap gap-2 mt-auto">
              <Button
                variant="outline"
                className="flex-1 min-w-[100px]"
                onClick={() => handleView(report)}
                disabled={isPending}
              >
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
              <Button
                variant="outline"
                className="flex-1 min-w-[100px]"
                onClick={() => handleDownload(report, "csv")}
                disabled={isPending}
              >
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button
                className="flex-1 min-w-[120px]"
                onClick={() => handleDownload(report, "pdf")}
                disabled={isPending}
              >
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Dialog Modal */}
      {viewReport && (
        <Dialog open={!!viewReport} onOpenChange={() => setViewReport(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <FileText className="h-5 w-5 text-primary" />
                {viewReport.title}
              </DialogTitle>
              <DialogDescription className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Period: {getMonthName(month)} {year}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 py-4 overflow-hidden flex flex-col justify-center">
              {loadingData ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground font-medium">Fetching report records...</p>
                </div>
              ) : (
                renderReportTable(viewData)
              )}
            </div>

            <DialogFooter className="flex flex-row justify-between items-center border-t pt-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(viewReport, "csv")}
                  disabled={loadingData || viewData.length === 0}
                >
                  Export CSV
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownload(viewReport, "pdf")}
                  disabled={loadingData || viewData.length === 0}
                >
                  Print PDF
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewReport(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
