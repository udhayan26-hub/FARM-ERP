"use client";

import { useEffect, useState, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuditLogs, getAuditLogsCount, deleteAuditLog, clearAllAuditLogs } from "@/actions/audit-actions";
import { Search, Calendar, SlidersHorizontal, RefreshCw, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ExportButton } from "@/components/shared/export-button";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const limit = 50;

  const fetchLogs = async (currentPage: number = 1) => {
    setLoading(true);
    try {
      const filters = {
        search: search.trim() || undefined,
        module: module !== "all" ? module : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        limit,
      };

      const [data, count] = await Promise.all([
        getAuditLogs(filters),
        getAuditLogsCount(filters),
      ]);

      setLogs(data);
      setTotalCount(count);
    } catch (error) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search and trigger fetch on filter change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchLogs(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, module, startDate, endDate]);

  // Fetch when page changes
  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const handleDeleteLog = (id: string) => {
    if (confirm("Are you sure you want to delete this log entry?")) {
      startTransition(async () => {
        const res = await deleteAuditLog(id);
        if (res.success) {
          toast.success("Log entry deleted successfully");
          fetchLogs(page);
        } else {
          toast.error(res.error || "Failed to delete log entry");
        }
      });
    }
  };

  const handleClearAllLogs = () => {
    if (confirm("WARNING: Are you sure you want to permanently delete ALL activity logs? This action cannot be undone.")) {
      startTransition(async () => {
        const res = await clearAllAuditLogs();
        if (res.success) {
          toast.success("All logs cleared successfully");
          setPage(1);
          fetchLogs(1);
        } else {
          toast.error(res.error || "Failed to clear logs");
        }
      });
    }
  };



  const getModuleBadgeColor = (mod: string) => {
    switch (mod.toLowerCase()) {
      case "worker":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "attendance":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "land":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "diesel":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "expense":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      case "payment":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "advance":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const clearFilters = () => {
    setSearch("");
    setModule("all");
    setStartDate("");
    setEndDate("");
    toast.success("Filters cleared");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Activity Logs" description="Audit trail of all operations and database modifications">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchLogs(page)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleClearAllLogs} 
            disabled={loading || isPending || logs.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
          <ExportButton
            data={logs.map((log) => ({
              Timestamp: new Date(log.createdAt).toLocaleString(),
              User: log.user?.name || "Admin",
              Module: log.module.toUpperCase(),
              Action: log.action,
              "Entity ID": log.entityId,
              Notes: log.notes || "-",
            }))}
            filename={`activity_logs_${new Date().toISOString().split("T")[0]}`}
            placeholder="Export Logs"
          />
        </div>
      </PageHeader>

      {/* Filter Card */}
      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border-b pb-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Search & Filter Logs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="search">Search Keywords</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Action, notes, user..."
                  className="pl-9 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="module">Filter by Module</Label>
              <Select value={module} onValueChange={setModule}>
                <SelectTrigger id="module" className="h-9">
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="diesel">Diesel Logs</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                  <SelectItem value="payment">Wage Payouts</SelectItem>
                  <SelectItem value="advance">Advances/Loans</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9 h-9"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9 h-9"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {(search || module !== "all" || startDate || endDate) && (
            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive hover:bg-destructive/10">
                Clear Active Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground whitespace-nowrap border-b">
                <tr>
                  <th className="px-5 py-3 font-medium">Timestamp</th>
                  <th className="px-5 py-3 font-medium">User/Admin</th>
                  <th className="px-5 py-3 font-medium">Module</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Notes</th>
                  <th className="px-5 py-3 font-medium text-center">Details</th>
                  <th className="px-5 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                        <p>Loading activity logs...</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                      No logs match the current search or filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const isExpanded = expandedLog === log.id;
                    const hasValues = log.oldValue || log.newValue;

                    return (
                      <optgroup key={log.id} label="Log row block" className="contents">
                        <tr className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 font-medium">
                            {log.user?.name || "Admin"}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <Badge className={getModuleBadgeColor(log.module)}>
                              {log.module.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 font-medium text-foreground">
                            {log.action}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground max-w-xs truncate">
                            {log.notes || "-"}
                          </td>
                          <td className="px-5 py-3 text-center whitespace-nowrap">
                            {hasValues ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                              >
                                {isExpanded ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-primary" />
                                )}
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-center whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteLog(log.id)}
                              disabled={isPending}
                              title="Delete Log"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                        {isExpanded && hasValues && (
                          <tr className="bg-muted/10">
                            <td colSpan={7} className="px-8 py-3 border-l-2 border-primary bg-muted/20">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                                <div>
                                  <p className="font-semibold text-muted-foreground mb-1 text-[10px] uppercase">
                                    Before Changes (Old Value)
                                  </p>
                                  <pre className="bg-background border rounded p-2.5 overflow-x-auto whitespace-pre-wrap max-h-48">
                                    {log.oldValue ? JSON.stringify(JSON.parse(log.oldValue), null, 2) : "Empty"}
                                  </pre>
                                </div>
                                <div>
                                  <p className="font-semibold text-muted-foreground mb-1 text-[10px] uppercase">
                                    After Changes (New Value)
                                  </p>
                                  <pre className="bg-background border rounded p-2.5 overflow-x-auto whitespace-pre-wrap max-h-48">
                                    {log.newValue ? JSON.stringify(JSON.parse(log.newValue), null, 2) : "Empty"}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </optgroup>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        {/* Pagination Footer */}
        {totalCount > limit && (
          <div className="flex items-center justify-between px-5 py-3 bg-muted/10 border-t border-muted rounded-b-md">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(totalCount / limit) || loading}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{(page - 1) * limit + 1}</span> to{" "}
                  <span className="font-semibold text-foreground">
                    {Math.min(page * limit, totalCount)}
                  </span>{" "}
                  of <span className="font-semibold text-foreground">{totalCount}</span> results
                </p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={page >= Math.ceil(totalCount / limit) || loading}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
