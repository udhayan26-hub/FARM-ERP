"use client";

import { useState, useEffect, useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recordPayment } from "@/actions/payment-actions";
import { DollarSign, Plus, Minus, Calculator, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";

interface PaySalaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  worker: {
    id: string;
    name: string;
    dailyWage: number;
    wageType: string;
    monthlyWage?: number | null;
    calculatedBase: number;
    daysWorked: number;
    halfDays: number;
    advanceBalance?: number;
  };
  month: number;
  year: number;
  onSuccess: () => void;
}

export function PaySalaryDialog({ isOpen, onClose, worker, month, year, onSuccess }: PaySalaryDialogProps) {
  const [wageType, setWageType] = useState(worker.wageType || "daily");
  const [baseWage, setBaseWage] = useState(String(worker.calculatedBase));
  const [overrideWage, setOverrideWage] = useState(false);
  const [bonus, setBonus] = useState("0");
  const [deduction, setDeduction] = useState("0");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isPending, startTransition] = useTransition();

  // Reset values when worker changes
  useEffect(() => {
    setWageType(worker.wageType || "daily");
    setBaseWage(String(worker.calculatedBase));
    setOverrideWage(false);
    setBonus("0");
    setDeduction("0");
    setNotes("");
  }, [worker, isOpen]);

  // Recalculate base wage if wage type changes (unless overridden)
  useEffect(() => {
    if (!overrideWage) {
      if (wageType === "monthly" && worker.monthlyWage) {
        setBaseWage(String(worker.monthlyWage));
      } else {
        setBaseWage(String(worker.calculatedBase));
      }
    }
  }, [wageType, overrideWage, worker]);

  const numBase = Number(baseWage) || 0;
  const numBonus = Number(bonus) || 0;
  const numDeduction = Number(deduction) || 0;
  const finalPayable = Math.max(0, numBase + numBonus - numDeduction);

  const handleSave = () => {
    if (numBase < 0 || numBonus < 0 || numDeduction < 0) {
      toast.error("Financial values cannot be negative");
      return;
    }
    if (!date) {
      toast.error("Payment date is required");
      return;
    }

    startTransition(async () => {
      const res = await recordPayment({
        workerId: worker.id,
        date,
        baseWage: numBase,
        bonus: numBonus,
        deduction: numDeduction,
        amount: finalPayable,
        notes: notes || `Base: ${numBase}, Bonus: ${numBonus}, Ded: ${numDeduction}`,
        paymentType: wageType as any,
      });

      if (res.success) {
        toast.success(`Payment of ₹${finalPayable} recorded for ${worker.name}`);
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Failed to record payment");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Worker Wage</DialogTitle>
          <DialogDescription>
            Compute and disburse wages for {worker.name} ({month}/{year})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-2 bg-muted/40 p-3 rounded-lg border text-xs">
            <div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Attendance</p>
              <p className="font-bold text-sm text-foreground mt-0.5 truncate">
                {worker.daysWorked}P, {worker.halfDays}H
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Daily Wage</p>
              <p className="font-bold text-sm text-foreground mt-0.5 truncate">
                ₹{worker.dailyWage}/d
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Advance Bal</p>
              <p className={`font-bold text-sm mt-0.5 truncate ${(worker.advanceBalance ?? 0) > 0 ? "text-destructive" : "text-emerald-600"}`}>
                ₹{(worker.advanceBalance ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Wage Frequency</Label>
              <Select value={wageType} onValueChange={setWageType} disabled={isPending}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Workers</SelectItem>
                  <SelectItem value="weekly">Weekly Workers</SelectItem>
                  <SelectItem value="monthly">Monthly Workers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Payment Date</Label>
              <Input
                type="date"
                className="h-9"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="baseWage">Base Wage (₹)</Label>
              <Button
                variant="link"
                className="h-auto p-0 text-[10px] text-primary"
                onClick={() => setOverrideWage(!overrideWage)}
                disabled={isPending}
              >
                {overrideWage ? "Use Calculated" : "Override Amount"}
              </Button>
            </div>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="baseWage"
                type="number"
                className="pl-9 h-9 font-semibold"
                value={baseWage}
                onChange={(e) => setBaseWage(e.target.value)}
                disabled={!overrideWage || isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bonus" className="flex items-center gap-1">
                <Plus className="h-3 w-3 text-emerald-500" /> Bonus (₹)
              </Label>
              <Input
                id="bonus"
                type="number"
                className="h-9"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deduction" className="flex items-center gap-1">
                <Minus className="h-3 w-3 text-red-500" /> Deduction (₹)
              </Label>
              <Input
                id="deduction"
                type="number"
                className="h-9"
                value={deduction}
                onChange={(e) => setDeduction(e.target.value)}
                disabled={isPending}
              />
              {Number(deduction) > 0 && (
                <div className="text-[10px] space-y-0.5 mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <p>✓ ₹{Number(deduction).toLocaleString()} will be auto-repaid against their outstanding advance.</p>
                  {worker.advanceBalance !== undefined && Number(deduction) > worker.advanceBalance && (
                    <p className="text-amber-600 font-bold">⚠️ Warning: Deduction exceeds outstanding advance (₹{worker.advanceBalance})</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Remarks / Notes</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Festival bonus, advance recovery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              className="min-h-16"
            />
          </div>

          <div className="border-t pt-4 mt-2 flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/20">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Final Payable</p>
              <p className="text-[10px] text-muted-foreground">Base + Bonus - Deduction</p>
            </div>
            <p className="text-2xl font-black text-primary">
              ₹{finalPayable.toLocaleString()}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Processing..." : "Submit Payout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
