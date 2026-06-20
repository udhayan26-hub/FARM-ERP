"use client";

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const reportTypes = [
  { title: "Monthly Expense Report", desc: "Detailed breakdown of all expenses by category", color: "bg-red-100 text-red-600" },
  { title: "Worker Salary Sheet", desc: "Monthly attendance and payout calculation", color: "bg-green-100 text-green-600" },
  { title: "Tractor Utilization", desc: "Diesel consumption vs hours worked", color: "bg-blue-100 text-blue-600" },
  { title: "Farm Summary Report", desc: "High-level overview of farm performance", color: "bg-purple-100 text-purple-600" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports" 
        description="Generate and download farm analytics"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {reportTypes.map((report, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription>{report.desc}</CardDescription>
              </div>
              <div className={`p-2 rounded-lg ${report.color}`}>
                <FileText className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex gap-2">
              <Button variant="outline" className="w-full">View</Button>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
