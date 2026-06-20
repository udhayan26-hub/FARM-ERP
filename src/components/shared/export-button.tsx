"use client";

import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportData } from "@/lib/export-utils";

interface ExportButtonProps {
  data: Array<Record<string, any>>;
  filename: string;
  placeholder?: string;
}

export function ExportButton({ data, filename, placeholder = "Export" }: ExportButtonProps) {
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    exportData(data, format, filename);
  };

  return (
    <Select onValueChange={(val: any) => handleExport(val)}>
      <SelectTrigger className="w-[140px] h-9">
        <Download className="h-4 w-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="csv">CSV Sheet</SelectItem>
        <SelectItem value="excel">Excel Sheet</SelectItem>
        <SelectItem value="pdf">PDF Document</SelectItem>
      </SelectContent>
    </Select>
  );
}
