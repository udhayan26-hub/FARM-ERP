"use client";

import { useEffect, useState, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAdvancesLedger, getWorkerAdvanceHistory, giveAdvance, repayAdvance, getWorkerSalaryAndAdvanceStatus } from "@/actions/payment-actions";
import { Coins, Plus, Minus, FileText, ArrowDownRight, ArrowUpRight, History, Calendar, DollarSign, Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { exportData } from "@/lib/export-utils";
import { getMonthName } from "@/lib/utils";

export default function AdvancesPage() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Modal Dialog states
  const [actionType, setActionType] = useState<"give" | "repay">("give");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Summary stats states
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchLedger = async () => {
    setLoadingLedger(true);
    try {
      const data = await getAdvancesLedger();
      setLedger(data);
      if (data.length > 0 && !selectedWorkerId) {
        setSelectedWorkerId(data[0].id);
      }
    } catch {
      toast.error("Failed to load advances ledger");
    } finally {
      setLoadingLedger(false);
    }
  };

  const fetchHistory = async (workerId: string) => {
    if (!workerId) return;
    setLoadingHistory(true);
    try {
      const data = await getWorkerAdvanceHistory(workerId);
      setHistory(data);
    } catch {
      toast.error("Failed to load worker advance history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchStats = async (workerId: string, m: number, y: number) => {
    if (!workerId) return;
    setLoadingStats(true);
    try {
      const data = await getWorkerSalaryAndAdvanceStatus(workerId, m, y);
      setSummaryStats(data);
    } catch {
      console.error("Failed to fetch worker attendance and wage details");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  useEffect(() => {
    if (selectedWorkerId) {
      fetchHistory(selectedWorkerId);
      fetchStats(selectedWorkerId, month, year);
    }
  }, [selectedWorkerId, month, year]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const selectedWorker = ledger.find((w) => w.id === selectedWorkerId);

  const handleSubmit = () => {
    const numAmount = Number(amount);
    if (!selectedWorkerId) {
      toast.error("Please select a worker");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }
    if (!date) {
      toast.error("Date is required");
      return;
    }

    startTransition(async () => {
      let res;
      if (actionType === "give") {
        res = await giveAdvance({ workerId: selectedWorkerId, date, amount: numAmount, notes });
      } else {
        res = await repayAdvance({ workerId: selectedWorkerId, date, amount: numAmount, notes });
      }

      if (res.success) {
        toast.success(actionType === "give" ? "Advance recorded successfully" : "Repayment recorded successfully");
        setDialogOpen(false);
        setAmount("");
        setNotes("");
        // Reload
        fetchLedger();
        fetchHistory(selectedWorkerId);
        fetchStats(selectedWorkerId, month, year);
      } else {
        toast.error(res.error || "Operation failed");
      }
    });
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (!selectedWorker) {
      toast.error("Select a worker first");
      return;
    }
    if (history.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const exportItems = history.map((tx) => ({
      Date: new Date(tx.date).toLocaleDateString(),
      "Amount Given (Dr)": tx.amountGiven > 0 ? `₹${tx.amountGiven}` : "-",
      "Amount Repaid (Cr)": tx.amountReturned > 0 ? `₹${tx.amountReturned}` : "-",
      "Outstanding Balance": `₹${tx.balance}`,
      Notes: tx.notes || "-",
    }));

    exportData(
      exportItems,
      format,
      `${selectedWorker.name.replace(/\s+/g, "_")}_advance_statement`
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Advance Ledger" description="Track employee advances, repayments, and outstanding balances">
        <div className="flex gap-2">
          {selectedWorker && (
            <Select onValueChange={(val: any) => handleExport(val)}>
              <SelectTrigger className="w-[140px] h-9">
                <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Export Ledger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV Sheet</SelectItem>
                <SelectItem value="excel">Excel Sheet</SelectItem>
                <SelectItem value="pdf">PDF Statement</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => { setActionType("give"); setAmount(""); setNotes(""); }}>
                <Plus className="mr-2 h-4 w-4" /> Issue Advance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{actionType === "give" ? "Disburse Loan / Advance" : "Record Repayment"}</DialogTitle>
                <DialogDescription>
                  Update the advance account balance for {selectedWorker?.name || "the worker"}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label>Select Worker</Label>
                  <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Choose a worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {ledger.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name} (Bal: ₹{w.balance})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="amount">Transaction Amount (₹)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g. 5000"
                      className="pl-9 h-9"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="date">Transaction Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      className="pl-9 h-9"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Remarks / Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g. Personal emergency, deduction source..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isPending}>
                  {isPending ? "Recording..." : "Record Transaction"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workers List Ledger */}
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Workers Ledger</CardTitle>
            <CardDescription>Select a worker to see statement</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingLedger ? (
              <div className="p-8 text-center text-muted-foreground">Loading ledger...</div>
            ) : ledger.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No workers found.</div>
            ) : (
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {ledger.map((w) => {
                  const isSelected = w.id === selectedWorkerId;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWorkerId(w.id)}
                      className={`w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between border-l-2 ${
                        isSelected ? "bg-muted border-primary" : "border-transparent"
                      }`}
                    >
                      <div className="flex flex-col truncate pr-2">
                        <span className="font-semibold truncate">{w.name}</span>
                        <span className="text-xs text-muted-foreground">{w.village || "No Village"}</span>
                      </div>
                      <Badge variant={w.balance > 0 ? "destructive" : "secondary"} className="text-xs">
                        ₹{w.balance.toLocaleString()}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Worker Statement */}
        <Card className="col-span-2 shadow-sm">
          {selectedWorker ? (
            <>
              <CardHeader className="border-b bg-muted/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{selectedWorker.name}</CardTitle>
                    <CardDescription>
                      Phone: {selectedWorker.phone || "N/A"} | Village: {selectedWorker.village || "N/A"}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Current Balance</p>
                    <p className={`text-2xl font-bold ${selectedWorker.balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600"}`}>
                      ₹{selectedWorker.balance.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-red-200 text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800"
                    onClick={() => {
                      setActionType("give");
                      setDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Give Advance
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800"
                    onClick={() => {
                      setActionType("repay");
                      setDialogOpen(true);
                    }}
                    disabled={selectedWorker.balance === 0}
                  >
                    <Minus className="mr-1 h-3.5 w-3.5" /> Record Repayment
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Monthly Work & Wage Summary Section */}
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-primary/10 pb-3">
                    <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
                      <Calendar className="h-4 w-4 text-primary" />
                      Work & Wage Summary
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 bg-background" 
                        onClick={handlePrevMonth}
                        disabled={loadingStats}
                      >
                        ←
                      </Button>
                      <span className="text-xs font-bold min-w-[90px] text-center text-primary-foreground/90 bg-primary px-2 py-0.5 rounded-full">
                        {getMonthName(month)} {year}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 bg-background" 
                        onClick={handleNextMonth}
                        disabled={loadingStats}
                      >
                        →
                      </Button>
                    </div>
                  </div>

                  {loadingStats ? (
                    <div className="py-6 text-center text-xs text-muted-foreground font-medium">Loading monthly summary data...</div>
                  ) : summaryStats ? (
                    <div className="space-y-4">
                      {/* Stats grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="bg-card p-3 rounded-lg border shadow-sm">
                          <p className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">Days Worked</p>
                          <p className="text-base font-black text-foreground mt-1">
                            {summaryStats.effectiveDays} Days
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            ({summaryStats.daysWorked}P, {summaryStats.halfDays}H)
                          </p>
                        </div>
                        <div className="bg-card p-3 rounded-lg border shadow-sm">
                          <p className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">Wages Earned</p>
                          <p className="text-base font-black text-foreground mt-1">
                            ₹{summaryStats.calculatedBase.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                            {summaryStats.wageType} Frequency
                          </p>
                        </div>
                        <div className="bg-card p-3 rounded-lg border shadow-sm">
                          <p className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">Wages Paid</p>
                          <p className="text-base font-black text-emerald-600 mt-1">
                            ₹{summaryStats.paidAmount.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Wages disbursed
                          </p>
                        </div>
                        <div className="bg-card p-3 rounded-lg border shadow-sm">
                          <p className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">Remaining Due</p>
                          <p className="text-base font-black text-amber-600 mt-1">
                            ₹{summaryStats.remainingWageDue.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Wages unpaid
                          </p>
                        </div>
                      </div>

                      {/* Net Offset Bar */}
                      <div className="border-t border-primary/10 pt-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-muted/65 p-3 rounded-lg border border-dashed text-xs">
                        <div>
                          <p className="font-bold text-foreground text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <Coins className="h-3 w-3 text-muted-foreground" />
                            Net Offset Calculator
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Outstanding Advance (₹{summaryStats.advanceBalance.toLocaleString()}) minus Remaining Wage Due (₹{summaryStats.remainingWageDue.toLocaleString()})
                          </p>
                        </div>
                        <div className="text-right w-full md:w-auto">
                          {summaryStats.advanceBalance >= summaryStats.remainingWageDue ? (
                            <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-md text-left md:text-right">
                              <p className="font-bold text-red-600 dark:text-red-400">
                                ₹{(summaryStats.advanceBalance - summaryStats.remainingWageDue).toLocaleString()} Net Due
                              </p>
                              <p className="text-[9px] text-muted-foreground">(Worker still owes the farm)</p>
                            </div>
                          ) : (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-md text-left md:text-right">
                              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                ₹{(summaryStats.remainingWageDue - summaryStats.advanceBalance).toLocaleString()} Net Credit
                              </p>
                              <p className="text-[9px] text-muted-foreground">(Farm owes the worker after full offset)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-muted-foreground font-medium">No calculation details available for this worker.</div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b pb-2 text-muted-foreground font-bold text-xs uppercase tracking-wider">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span>Transaction History Ledger</span>
                  </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 text-muted-foreground whitespace-nowrap border-b">
                      <tr>
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium text-right">Given (Debit)</th>
                        <th className="px-5 py-3 font-medium text-right">Repaid (Credit)</th>
                        <th className="px-5 py-3 font-medium text-right">Balance</th>
                        <th className="px-5 py-3 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {loadingHistory ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                            Loading history ledger...
                          </td>
                        </tr>
                      ) : history.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                            No loan/advance history exists for this worker.
                          </td>
                        </tr>
                      ) : (
                        history.map((tx) => (
                          <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                              {new Date(tx.date).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-3 text-right font-bold text-red-600 whitespace-nowrap">
                              {tx.amountGiven > 0 ? `+₹${tx.amountGiven.toLocaleString()}` : "-"}
                            </td>
                            <td className="px-5 py-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                              {tx.amountReturned > 0 ? `-₹${tx.amountReturned.toLocaleString()}` : "-"}
                            </td>
                            <td className="px-5 py-3 text-right font-semibold text-foreground whitespace-nowrap">
                              ₹{tx.balance.toLocaleString()}
                            </td>
                            <td className="px-5 py-3 text-muted-foreground max-w-xs truncate">
                              {tx.notes || "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-muted-foreground space-y-3">
              <Coins className="h-12 w-12 text-muted-foreground/50" />
              <p>No worker selected. Please select a worker from the sidebar.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
