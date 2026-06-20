"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTractors } from "@/actions/tractor-actions";
import { createDieselLog } from "@/actions/diesel-actions";
import { toast } from "sonner";

interface Tractor {
  id: string;
  name: string;
  driverName: string;
}

interface LogEntry {
  id: number;
  tractorId: string;
  liters: string;
  cost: string;
  hoursWorked: string;
  purpose: string;
}

const PURPOSES = [
  { value: "ploughing", label: "Ploughing" },
  { value: "transport", label: "Transport" },
  { value: "harvesting", label: "Harvesting" },
  { value: "cultivation", label: "Cultivation" },
  { value: "irrigation", label: "Irrigation" },
  { value: "other", label: "Other" },
];

export function DieselStep() {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: Date.now(), tractorId: "", liters: "", cost: "", hoursWorked: "", purpose: "" },
  ]);

  useEffect(() => {
    getTractors().then((data) => {
      setTractors(data);
      setLoading(false);
    });
  }, []);

  const addLog = () => {
    setLogs([
      ...logs,
      { id: Date.now(), tractorId: "", liters: "", cost: "", hoursWorked: "", purpose: "" },
    ]);
  };

  const removeLog = (id: number) => {
    setLogs(logs.filter((l) => l.id !== id));
  };

  const updateLog = (id: number, field: keyof LogEntry, value: string) => {
    setLogs(logs.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleSave = async () => {
    const today = new Date().toISOString().split("T")[0];
    let saved = 0;
    for (const log of logs) {
      if (!log.tractorId || !log.liters || !log.cost) continue;
      const result = await createDieselLog({
        date: today,
        tractorId: log.tractorId,
        liters: Number(log.liters),
        cost: Number(log.cost),
        hoursWorked: Number(log.hoursWorked) || 0,
        purpose: (log.purpose || "other") as "ploughing" | "transport" | "harvesting" | "cultivation" | "irrigation" | "other",
        notes: "",
      });
      if (result.success) saved++;
    }
    if (saved > 0) toast.success(`${saved} diesel log(s) saved!`);
    else toast.error("No complete diesel entries to save.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading tractors...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between border">
        <div>
          <p className="font-medium text-sm">Log diesel usage for today</p>
          <p className="text-xs text-muted-foreground">
            Skip this step if no diesel was purchased or used today.
          </p>
        </div>
        <Button type="button" size="sm" onClick={handleSave}>
          Save Diesel Logs
        </Button>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-4 border rounded-lg bg-card shadow-sm space-y-4 relative"
          >
            {logs.length > 1 && (
              <button
                type="button"
                onClick={() => removeLog(log.id)}
                className="absolute right-2 top-2 text-muted-foreground hover:text-destructive p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Tractor</Label>
                <Select
                  value={log.tractorId}
                  onValueChange={(v) => updateLog(log.id, "tractorId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Tractor" />
                  </SelectTrigger>
                  <SelectContent>
                    {tractors.length === 0 ? (
                      <SelectItem value="" disabled>
                        No tractors found — add one first
                      </SelectItem>
                    ) : (
                      tractors.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} ({t.driverName})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Liters</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={log.liters}
                  onChange={(e) => updateLog(log.id, "liters", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Cost (₹)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={log.cost}
                  onChange={(e) => updateLog(log.id, "cost", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Hours Worked</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={log.hoursWorked}
                  onChange={(e) => updateLog(log.id, "hoursWorked", e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-full md:col-span-2">
                <Label>Purpose</Label>
                <Select
                  value={log.purpose}
                  onValueChange={(v) => updateLog(log.id, "purpose", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed"
          onClick={addLog}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Another Diesel Entry
        </Button>
      </div>
    </div>
  );
}
