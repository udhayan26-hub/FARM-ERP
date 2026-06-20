"use client";

import { useState, useEffect } from "react";
import { Check, X, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWorkers } from "@/actions/worker-actions";
import { submitAttendance } from "@/actions/attendance-actions";
import { format } from "date-fns";

type AttendanceStatus = "present" | "absent" | "half";

interface Worker {
  id: string;
  name: string;
  village: string;
  dailyWage: number;
}

export function AttendanceStep() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getWorkers().then((data) => {
      const activeWorkers = data.filter((w) => w.status === "active");
      setWorkers(activeWorkers);
      // Default all to "present"
      const defaultAttendance = activeWorkers.reduce((acc, w) => {
        acc[w.id] = "present";
        return acc;
      }, {} as Record<string, AttendanceStatus>);
      setAttendance(defaultAttendance);
      setLoading(false);
    });
  }, []);

  const markAll = (status: AttendanceStatus) => {
    setAttendance(
      workers.reduce((acc, w) => {
        acc[w.id] = status;
        return acc;
      }, {} as Record<string, AttendanceStatus>)
    );
  };

  const setStatus = (id: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await submitAttendance({
        date: format(new Date(), "yyyy-MM-dd"),
        entries: Object.entries(attendance).map(([workerId, status]) => ({
          workerId,
          status,
        })),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter((v) => v === "present").length;
  const absentCount = Object.values(attendance).filter((v) => v === "absent").length;
  const halfCount = Object.values(attendance).filter((v) => v === "half").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading workers...</span>
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="font-medium">No active workers found.</p>
        <p className="text-xs mt-1">Add workers first to mark attendance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-green-600">{presentCount} Present</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-amber-600">{halfCount} Half Day</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-red-600">{absentCount} Absent</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => markAll("present")}
            className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
          >
            All Present
          </button>
          <button
            type="button"
            onClick={() => markAll("absent")}
            className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
          >
            All Absent
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "text-xs px-3 py-1.5 rounded transition",
              saved
                ? "bg-green-600 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save Attendance"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[400px] overflow-y-auto pr-1">
        {workers.map((worker) => (
          <div
            key={worker.id}
            className={cn(
              "p-3 rounded-lg border transition-colors flex items-center justify-between",
              attendance[worker.id] === "present" &&
                "border-green-500/50 bg-green-50/50 dark:bg-green-950/20",
              attendance[worker.id] === "absent" &&
                "border-red-500/50 bg-red-50/50 dark:bg-red-950/20",
              attendance[worker.id] === "half" &&
                "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20"
            )}
          >
            <div>
              <p className="font-medium text-sm">{worker.name}</p>
              <p className="text-xs text-muted-foreground">
                {worker.village} · ₹{worker.dailyWage}/day
              </p>
            </div>
            <div className="flex items-center bg-background rounded-md shadow-sm border overflow-hidden">
              <button
                type="button"
                onClick={() => setStatus(worker.id, "present")}
                className={cn(
                  "p-2 transition-colors",
                  attendance[worker.id] === "present"
                    ? "bg-green-500 text-white"
                    : "hover:bg-muted text-muted-foreground"
                )}
                title="Present"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setStatus(worker.id, "half")}
                className={cn(
                  "p-2 transition-colors border-x",
                  attendance[worker.id] === "half"
                    ? "bg-amber-500 text-white"
                    : "hover:bg-muted text-muted-foreground"
                )}
                title="Half Day"
              >
                <Clock className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setStatus(worker.id, "absent")}
                className={cn(
                  "p-2 transition-colors",
                  attendance[worker.id] === "absent"
                    ? "bg-red-500 text-white"
                    : "hover:bg-muted text-muted-foreground"
                )}
                title="Absent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
