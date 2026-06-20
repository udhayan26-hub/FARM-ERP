import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "FarmERP - Farm Management System",
  description: "Complete farm management solution for modern agriculture. Track workers, attendance, salaries, tractors, diesel, expenses, and more.",
  keywords: ["farm", "agriculture", "ERP", "management", "attendance", "salary"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
