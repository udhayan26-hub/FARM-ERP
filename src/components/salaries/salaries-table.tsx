"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaySalaryDialog } from "./pay-salary-dialog";
import { Wallet, Eye, CheckCircle2, AlertCircle, FileSpreadsheet, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { exportData } from "@/lib/export-utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SalariesTableProps {
  salaries: any[];
  month: number;
  year: number;
  onRefresh: () => void;
}

export function SalariesTable({ salaries, month, year, onRefresh }: SalariesTableProps) {
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDetailsWorker, setViewDetailsWorker] = useState<any | null>(null);

  const handlePayClick = (worker: any) => {
    setSelectedWorker(worker);
    setDialogOpen(true);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (salaries.length === 0) {
      toast.error("No salary data to export");
      return;
    }

    const exportItems = salaries.map((s) => ({
      Worker: s.name,
      Village: s.village || "-",
      "Days Present": s.daysWorked,
      "Half Days": s.halfDays,
      "Daily Wage (Rate)": `₹${s.dailyWage}`,
      "Calculated Base": `₹${s.calculatedBase}`,
      "Wage Frequency": s.wageType.toUpperCase(),
      "Paid Amount": s.status === "paid" ? `₹${s.paidAmount}` : "-",
      Status: s.status.toUpperCase(),
      "Bonus Paid": s.bonus > 0 ? `₹${s.bonus}` : "-",
      "Deductions Recovery": s.deduction > 0 ? `₹${s.deduction}` : "-",
      Notes: s.notes || "-",
    }));

    exportData(exportItems, format, `salary_sheet_month_${month}_year_${year}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border">
        <span className="text-sm font-semibold text-muted-foreground">Action Toolkit</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleExport("csv")}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleExport("pdf")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export PDF Sheet
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground whitespace-nowrap">
            <tr>
              <th className="px-5 py-3 font-semibold">Worker Name</th>
              <th className="px-5 py-3 font-semibold text-center">Frequency</th>
              <th className="px-5 py-3 font-semibold text-right">Days Worked</th>
              <th className="px-5 py-3 font-semibold text-right">Half Days</th>
              <th className="px-5 py-3 font-semibold text-right">Calculated Base</th>
              <th className="px-5 py-3 font-semibold text-right text-primary">Final Payable</th>
              <th className="px-5 py-3 font-semibold text-center">Status</th>
              <th className="px-5 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {salaries.map((salary) => {
              const isPaid = salary.status === "paid";
              return (
                <tr key={salary.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium">
                    <div>
                      <p className="text-foreground">{salary.name}</p>
                      <p className="text-xs text-muted-foreground font-normal">
                        {salary.village || "—"}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center capitalize">
                    <Badge variant="outline">{salary.wageType}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{salary.daysWorked} d</td>
                  <td className="px-5 py-3 text-right font-medium">{salary.halfDays} d</td>
                  <td className="px-5 py-3 text-right">
                    {formatCurrency(salary.calculatedBase)}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-base text-primary">
                    {formatCurrency(isPaid ? salary.paidAmount : salary.calculatedBase)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Badge
                      variant={isPaid ? "success" : "warning"}
                      className="inline-flex items-center gap-1"
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" /> Pending
                        </>
                      )}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-center whitespace-nowrap">
                    {isPaid ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewDetailsWorker(salary)}
                        className="h-8 text-xs"
                      >
                        <Eye className="mr-1 h-3 w-3 text-muted-foreground" /> Details
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handlePayClick(salary)}
                        className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Wallet className="mr-1 h-3 w-3" /> Pay Wage
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedWorker && (
        <PaySalaryDialog
          isOpen={dialogOpen}
          onClose={() => {
            setSelectedWorker(null);
            setDialogOpen(false);
          }}
          worker={selectedWorker}
          month={month}
          year={year}
          onSuccess={onRefresh}
        />
      )}

      {/* View Details Modal for Paid Salary */}
      {viewDetailsWorker && (
        <Dialog open={!!viewDetailsWorker} onOpenChange={() => setViewDetailsWorker(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Payout Receipt / Details</DialogTitle>
              <DialogDescription>
                Transaction record details for {viewDetailsWorker.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 border-y my-2 text-sm">
              <div className="grid grid-cols-2 gap-y-3">
                <div className="text-muted-foreground">Worker:</div>
                <div className="font-semibold">{viewDetailsWorker.name}</div>

                <div className="text-muted-foreground">Month / Year:</div>
                <div>{month}/{year}</div>

                <div className="text-muted-foreground">Wage Frequency:</div>
                <div className="capitalize">{viewDetailsWorker.wageType}</div>

                <div className="text-muted-foreground">Base Wage:</div>
                <div className="font-semibold">{formatCurrency(viewDetailsWorker.calculatedBase)}</div>

                <div className="text-muted-foreground">Bonus Paid:</div>
                <div className="text-emerald-600 font-semibold">+ {formatCurrency(viewDetailsWorker.bonus || 0)}</div>

                <div className="text-muted-foreground">Deductions:</div>
                <div className="text-red-600 font-semibold">- {formatCurrency(viewDetailsWorker.deduction || 0)}</div>

                <div className="text-muted-foreground border-t pt-3 mt-1 font-bold">Total Paid:</div>
                <div className="border-t pt-3 mt-1 text-lg font-black text-primary">
                  {formatCurrency(viewDetailsWorker.paidAmount)}
                </div>
              </div>

              <div className="bg-muted/30 p-3 rounded-lg border text-xs">
                <p className="font-semibold text-muted-foreground mb-1">Remarks / Remarks</p>
                <p className="italic text-muted-foreground">{viewDetailsWorker.notes || "No remarks added"}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setViewDetailsWorker(null)}>Close Receipt</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
