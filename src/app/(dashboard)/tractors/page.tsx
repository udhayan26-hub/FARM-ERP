import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getTractors } from "@/actions/tractor-actions";
import { TractorFormDialog } from "@/components/forms/tractor-form";
import { ExportButton } from "@/components/shared/export-button";
import { DeleteTractorButton } from "@/components/tractors/delete-tractor-button";

export const dynamic = 'force-dynamic';

export default async function TractorsPage() {
  const tractors = await getTractors();

  const exportData = tractors.map((t) => ({
    Name: t.name,
    "Registration No": t.registrationNo,
    Model: t.model || "-",
    Driver: t.driverName || "-",
    "Purchase Date": new Date(t.purchaseDate).toLocaleDateString(),
    Status: t.status.toUpperCase(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tractors" 
        description="Manage farm vehicles and machinery"
      >
        <div className="flex gap-2">
          <ExportButton data={exportData} filename="tractors_list" placeholder="Export Tractors" />
          <TractorFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tractor
            </Button>
          </TractorFormDialog>
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tractors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            <p className="mb-4">No tractors registered yet.</p>
            <TractorFormDialog>
              <Button variant="outline">Add your first tractor</Button>
            </TractorFormDialog>
          </div>
        ) : (
          tractors.map((tractor) => (
            <Card key={tractor.id} className="overflow-hidden hover:shadow-md transition-all border-t-4 border-t-primary">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold">{tractor.name}</CardTitle>
                  <Badge variant={tractor.status === "active" ? "success" : "warning"}>
                    {tractor.status === "active" ? "Active" : tractor.status === "maintenance" ? "In Maintenance" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{tractor.registrationNo}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Primary Driver</span>
                    <span className="font-medium">{tractor.driverName || "Not Assigned"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Model Year</span>
                    <span className="font-medium">{tractor.model || "N/A"}</span>
                  </div>
                  
                  <div className="pt-4 flex gap-2 items-center">
                    <Button variant="outline" className="w-full flex-1" size="sm">View Logs</Button>
                    <Button variant="outline" size="sm" className="px-3" title="Settings">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <DeleteTractorButton id={tractor.id} name={tractor.name} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
