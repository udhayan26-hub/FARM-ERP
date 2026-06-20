import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, X, Clock, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { AttendanceDateNav } from "@/components/attendance/attendance-date-nav";

const DEMO_USER_ID = "demo-user-001";

export const dynamic = "force-dynamic";

async function getAttendanceData(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [workers, attendanceRecords] = await Promise.all([
      prisma.worker.findMany({
        where: { userId: DEMO_USER_ID, status: "active" },
        orderBy: { name: "asc" },
      }),
      prisma.attendance.findMany({
        where: { date: { gte: startOfDay, lte: endOfDay } },
        include: { worker: { select: { userId: true } } },
      }),
    ]);

    // Filter attendance to only demo user's workers
    const userWorkerIds = new Set(workers.map((w) => w.id));
    const attendanceMap = new Map(
      attendanceRecords
        .filter((a) => userWorkerIds.has(a.workerId))
        .map((a) => [a.workerId, a.status])
    );

    const summary = workers.map((w) => ({
      id: w.id,
      name: w.name,
      village: w.village,
      dailyWage: w.dailyWage,
      status: attendanceMap.get(w.id) ?? "not_marked",
    }));

    const presentCount = summary.filter((s) => s.status === "present").length;
    const absentCount = summary.filter((s) => s.status === "absent").length;
    const halfCount = summary.filter((s) => s.status === "half").length;
    const notMarkedCount = summary.filter((s) => s.status === "not_marked").length;

    return { summary, presentCount, absentCount, halfCount, notMarkedCount };
  } catch (error) {
    console.error("[Attendance] Failed to fetch:", error);
    return {
      summary: [],
      presentCount: 0,
      absentCount: 0,
      halfCount: 0,
      notMarkedCount: 0,
    };
  }
}

import { ExportButton } from "@/components/shared/export-button";

interface AttendancePageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const params = await searchParams;
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const dateStr = params.date || todayStr;
  const selectedDate = new Date(dateStr);

  const { summary, presentCount, absentCount, halfCount, notMarkedCount } =
    await getAttendanceData(dateStr);

  const exportData = summary.map((w) => ({
    Date: format(selectedDate, "yyyy-MM-dd"),
    Worker: w.name,
    Village: w.village || "-",
    Rate: `₹${w.dailyWage}`,
    Status: w.status.replace("_", " ").toUpperCase(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance History"
        description="View and manage daily worker attendance"
      >
        <ExportButton data={exportData} filename={`attendance_${dateStr}`} placeholder="Export Attendance" />
      </PageHeader>

      {/* Date Navigation (client component) */}
      <AttendanceDateNav currentDate={dateStr} todayStr={todayStr} />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{presentCount}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <X className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-700">{absentCount}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-amber-700">{halfCount}</p>
              <p className="text-xs text-muted-foreground">Half Day</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{notMarkedCount}</p>
              <p className="text-xs text-muted-foreground">Not Marked</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarIcon className="h-4 w-4" />
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No active workers found.</p>
              <p className="text-xs mt-1">Add workers first to track attendance.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {summary.map((worker) => (
                <div
                  key={worker.id}
                  className={`p-4 rounded-lg border flex items-center justify-between transition-colors ${
                    worker.status === "present"
                      ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                      : worker.status === "absent"
                      ? "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"
                      : worker.status === "half"
                      ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20"
                      : "border-muted"
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">{worker.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {worker.village || "—"} · ₹{worker.dailyWage}/day
                    </p>
                  </div>
                  <div>
                    {worker.status === "present" && (
                      <Badge variant="success">
                        <Check className="mr-1 h-3 w-3" /> Present
                      </Badge>
                    )}
                    {worker.status === "half" && (
                      <Badge variant="warning">
                        <Clock className="mr-1 h-3 w-3" /> Half Day
                      </Badge>
                    )}
                    {worker.status === "absent" && (
                      <Badge variant="destructive">
                        <X className="mr-1 h-3 w-3" /> Absent
                      </Badge>
                    )}
                    {worker.status === "not_marked" && (
                      <Badge variant="secondary">Not Marked</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
