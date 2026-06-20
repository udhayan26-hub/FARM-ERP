import { toast } from "sonner";

export function exportData(
  data: Array<Record<string, any>>,
  format: "csv" | "excel" | "pdf",
  filename: string
) {
  try {
    if (!data || data.length === 0) {
      toast.error("No data available to export");
      return;
    }

    if (format === "csv" || format === "excel") {
      // 1. Generate CSV content
      const headers = Object.keys(data[0]);
      const csvRows = [];
      
      // Add headers row
      csvRows.push(headers.map(header => `"${header.replace(/"/g, '""')}"`).join(","));

      // Add data rows
      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header];
          const stringVal = val === null || val === undefined ? "" : String(val);
          return `"${stringVal.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(","));
      }

      const csvContent = csvRows.join("\n");
      
      // Use UTF-8 BOM so Excel opens it with correct encoding
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.${format === "excel" ? "csv" : "csv"}`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${format.toUpperCase()} exported successfully!`);
    } else if (format === "pdf") {
      // 2. Generate PDF using browser printing window
      const headers = Object.keys(data[0]);
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Popup blocked! Please allow popups to export PDF.");
        return;
      }

      const title = filename.replace(/_/g, " ").toUpperCase();
      const generatedAt = new Date().toLocaleString();

      const html = `
        <html>
          <head>
            <title>${title}</title>
            <style>
              body {
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                color: #333;
                padding: 40px;
                line-height: 1.4;
              }
              .header {
                border-bottom: 2px solid #16a34a;
                padding-bottom: 15px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
              }
              .header h1 {
                margin: 0;
                color: #16a34a;
                font-size: 26px;
                font-weight: 700;
              }
              .header .meta {
                text-align: right;
                font-size: 12px;
                color: #666;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
                font-size: 13px;
              }
              th, td {
                border: 1px solid #e2e8f0;
                padding: 10px 12px;
                text-align: left;
              }
              th {
                background-color: #f8fafc;
                font-weight: 600;
                color: #475569;
              }
              tr:nth-child(even) {
                background-color: #f8fafc;
              }
              .footer {
                margin-top: 50px;
                border-top: 1px solid #e2e8f0;
                padding-top: 15px;
                font-size: 11px;
                color: #94a3b8;
                text-align: center;
              }
              @media print {
                body { padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>🌾 FARMLAND ERP</h1>
                <div style="font-size: 14px; font-weight: 500; color: #475569; margin-top: 5px;">${title}</div>
              </div>
              <div class="meta">
                <div>Generated: ${generatedAt}</div>
                <div>Total Records: ${data.length}</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  ${headers.map(h => `<th>${h}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${data.map(row => `
                  <tr>
                    ${headers.map(h => `<td>${row[h] === null || row[h] === undefined ? "" : String(row[h])}</td>`).join("")}
                  </tr>
                `).join("")}
              </tbody>
            </table>
            <div class="footer">
              This report was generated dynamically by Farmland ERP. Page of 1
            </div>
            <script>
              window.onload = function() {
                window.print();
                // Close tab after print dialog closes (with delay to allow load)
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      toast.success("PDF print layout opened successfully!");
    }
  } catch (error: any) {
    console.error("[EXPORT] Export failed:", error);
    toast.error(`Export failed: ${error.message}`);
  }
}
