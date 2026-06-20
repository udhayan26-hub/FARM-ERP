"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, MapPin, Sprout, Trash2, RotateCcw, HelpCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandFormDialog } from "@/components/forms/land-form";
import { formatDate } from "@/lib/utils";
import { getLands, getDeletedLands, deleteLand, restoreLand } from "@/actions/land-actions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportData } from "@/lib/export-utils";
import { toast } from "sonner";

export default function LandsPage() {
  const [activeLands, setActiveLands] = useState<any[]>([]);
  const [deletedLands, setDeletedLands] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Deletion Modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>("");

  const fetchLands = async () => {
    setLoading(true);
    try {
      const [active, deleted] = await Promise.all([getLands(), getDeletedLands()]);
      setActiveLands(active);
      setDeletedLands(deleted);
    } catch {
      toast.error("Failed to load lands parcels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, []);

  const handleDeleteClick = (id: string, name: string) => {
    setConfirmDeleteId(id);
    setConfirmDeleteName(name);
  };

  const executeDelete = () => {
    if (!confirmDeleteId) return;

    startTransition(async () => {
      const res = await deleteLand(confirmDeleteId);
      if (res.success) {
        toast.success(`Land "${confirmDeleteName}" has been soft-deleted successfully.`);
        setConfirmDeleteId(null);
        fetchLands();
      } else {
        toast.error(res.error || "Failed to delete land");
      }
    });
  };

  const executeRestore = (id: string, name: string) => {
    startTransition(async () => {
      const res = await restoreLand(id);
      if (res.success) {
        toast.success(`Land "${name}" has been restored successfully.`);
        fetchLands();
      } else {
        toast.error(res.error || "Failed to restore land");
      }
    });
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const list = activeTab === "active" ? activeLands : deletedLands;
    if (list.length === 0) {
      toast.error("No lands data to export");
      return;
    }

    const exportItems = list.map((l) => ({
      "Land Name": l.name,
      Acres: l.acres,
      Location: l.location || "-",
      "Current Crop": l.crop || "-",
      "Sowing Date": l.sowingDate ? new Date(l.sowingDate).toLocaleDateString() : "-",
      "Harvest Date": l.harvestDate ? new Date(l.harvestDate).toLocaleDateString() : "-",
      Status: l.status.toUpperCase(),
    }));

    exportData(exportItems, format, `${activeTab}_lands_list`);
  };

  const totalAcres = activeLands.reduce((s, l) => s + l.acres, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Land Parcels" description="Manage your crop parcels, locations, and soft delete logs">
        <div className="flex gap-2">
          <Select onValueChange={(val: any) => handleExport(val)}>
            <SelectTrigger className="w-[140px] h-9">
              <Download className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Export Lands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV Sheet</SelectItem>
              <SelectItem value="excel">Excel Sheet</SelectItem>
              <SelectItem value="pdf">PDF Report</SelectItem>
            </SelectContent>
          </Select>

          <LandFormDialog onSuccess={fetchLands}>
            <Button id="add-land-btn" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Land
            </Button>
          </LandFormDialog>
        </div>
      </PageHeader>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{totalAcres.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Total Active Acres</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Sprout className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold text-primary">
                {activeLands.filter((l) => l.status === "active").length}
              </p>
              <p className="text-xs text-muted-foreground">Cultivated Parcels</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold text-foreground">{deletedLands.length}</p>
              <p className="text-xs text-muted-foreground">Recycled (Trash) Lands</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-muted">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "active"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Active Parcels ({activeLands.length})
        </button>
        <button
          onClick={() => setActiveTab("deleted")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "deleted"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Trash / Bin ({deletedLands.length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading lands parcels...</div>
      ) : activeTab === "active" ? (
        activeLands.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No land records found.</p>
              <p className="text-xs mt-1">Add your first land parcel to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeLands.map((land) => (
              <Card key={land.id} className="overflow-hidden hover:shadow-md transition-all border shadow-sm flex flex-col justify-between">
                <div>
                  <div
                    className={`h-2.5 ${
                      land.status === "active"
                        ? "bg-green-500"
                        : land.status === "harvested"
                        ? "bg-amber-500"
                        : "bg-muted"
                    }`}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-black">{land.name}</CardTitle>
                      <Badge
                        variant={
                          land.status === "active"
                            ? "success"
                            : land.status === "harvested"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {land.status.charAt(0).toUpperCase() + land.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>{land.acres} Acres</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5 mt-2">
                      {land.location && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> Location
                          </span>
                          <span className="font-medium text-foreground">{land.location}</span>
                        </div>
                      )}
                      {land.crop && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Sprout className="h-3.5 w-3.5" /> Current Crop
                          </span>
                          <span className="font-medium text-foreground">{land.crop}</span>
                        </div>
                      )}
                      {land.sowingDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sowing Date</span>
                          <span className="font-medium text-foreground">{formatDate(land.sowingDate)}</span>
                        </div>
                      )}
                      {land.harvestDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Harvest Date</span>
                          <span className="font-medium text-foreground">{formatDate(land.harvestDate)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>
                <CardFooter className="bg-muted/10 border-t p-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteClick(land.id, land.name)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      ) : deletedLands.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground bg-card rounded-lg border">
          Trash is empty. Soft-deleted lands will appear here.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {deletedLands.map((land) => (
            <Card key={land.id} className="overflow-hidden opacity-75 border shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-2 bg-slate-400" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-muted-foreground">{land.name}</CardTitle>
                    <Badge variant="outline">Deleted</Badge>
                  </div>
                  <CardDescription>{land.acres} Acres</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground py-2 space-y-1">
                  <p>Deleted At: {land.deletedAt ? new Date(land.deletedAt).toLocaleString() : "Unknown"}</p>
                  <p>Was Crop: {land.crop || "None"}</p>
                </CardContent>
              </div>
              <CardFooter className="bg-muted/10 border-t p-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-primary border-primary/20 hover:bg-primary/5"
                  onClick={() => executeRestore(land.id, land.name)}
                  disabled={isPending}
                >
                  <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore Land
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="flex flex-col items-center text-center space-y-2">
            <div className="h-10 w-10 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-2">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle>Soft Delete Land Parcel?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete land &quot;{confirmDeleteName}&quot;? 
              This will safely hide it from active operations.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="grid grid-cols-2 gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={executeDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
