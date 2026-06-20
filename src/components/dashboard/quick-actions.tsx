"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Zap, Users, Receipt, Fuel, CalendarPlus } from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    title: "Daily Entry",
    description: "Mark attendance & diesel",
    icon: Zap,
    href: "/daily-entry",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    title: "Add Expense",
    description: "Record new farm expense",
    icon: Receipt,
    href: "/expenses",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  {
    title: "Add Worker",
    description: "Register new farm labor",
    icon: Users,
    href: "/workers",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    title: "Diesel Entry",
    description: "Log tractor fuel usage",
    icon: Fuel,
    href: "/diesel",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
      {quickActions.map((action, i) => (
        <Link key={action.title} href={action.href} className="block group">
          <Card className="h-full border border-border/50 hover:border-primary/50 hover:shadow-md transition-all">
            <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center space-y-3">
              <div className={`p-3 rounded-full ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium leading-none mb-1 text-foreground">{action.title}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
