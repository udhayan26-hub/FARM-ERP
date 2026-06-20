import { Plus, MoreHorizontal, UserCheck, UserX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatDate } from "@/lib/utils";

import { getWorkers } from "@/actions/worker-actions";
import { WorkerFormDialog } from "@/components/forms/worker-form";
import { WorkerStatusToggle } from "@/components/workers/worker-status-toggle";
import { ExportButton } from "@/components/shared/export-button";

export const dynamic = "force-dynamic";

export default async function WorkersPage() {
  const workers = await getWorkers();
  const activeCount = workers.filter((w) => w.status === "active").length;

  const exportData = workers.map((w) => ({
    Name: w.name,
    Phone: w.phone || "-",
    Village: w.village || "-",
    "Daily Wage Rate": `₹${w.dailyWage}`,
    "Wage Type": w.wageType.toUpperCase(),
    "Monthly Salary": w.monthlyWage ? `₹${w.monthlyWage}` : "-",
    "Join Date": new Date(w.joinDate).toLocaleDateString(),
    Status: w.status.toUpperCase(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workers"
        description="Manage your farm labor and staff"
      >
        <div className="flex gap-2">
          <ExportButton data={exportData} filename="workers_list" placeholder="Export Workers" />
          <WorkerFormDialog>
            <Button id="add-worker-btn">
              <Plus className="mr-2 h-4 w-4" />
              Add Worker
            </Button>
          </WorkerFormDialog>
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active Workers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border-muted">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-muted">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{workers.length - activeCount}</p>
              <p className="text-xs text-muted-foreground">Inactive Workers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{workers.length}</p>
              <p className="text-xs text-muted-foreground">Total Workers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Village</th>
                  <th className="px-4 py-3 font-medium text-right">Daily Wage</th>
                  <th className="px-4 py-3 font-medium">Join Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {workers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="h-10 w-10 text-muted-foreground/30" />
                        <p className="font-medium">No workers found.</p>
                        <p className="text-xs">Add your first worker to get started.</p>
                        <WorkerFormDialog>
                          <Button variant="outline" size="sm" className="mt-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Worker
                          </Button>
                        </WorkerFormDialog>
                      </div>
                    </td>
                  </tr>
                ) : (
                  workers.map((worker) => (
                    <tr
                      key={worker.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {getInitials(worker.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium whitespace-nowrap">
                            {worker.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {worker.phone || "—"}
                      </td>
                      <td className="px-4 py-3">{worker.village || "—"}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        ₹{worker.dailyWage.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {formatDate(worker.joinDate)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            worker.status === "active" ? "success" : "secondary"
                          }
                        >
                          {worker.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <WorkerStatusToggle
                          workerId={worker.id}
                          currentStatus={worker.status}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
