import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Receipt, Fuel, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "attendance",
    title: "Attendance Marked",
    description: "12 workers present today",
    time: "2 hours ago",
    icon: Users,
    color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    id: 2,
    type: "expense",
    title: "Expense Added",
    description: "₹4,500 for Fertilizers",
    time: "4 hours ago",
    icon: Receipt,
    color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  },
  {
    id: 3,
    type: "diesel",
    title: "Diesel Log",
    description: "45 L for Mahindra Tractor",
    time: "Yesterday",
    icon: Fuel,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    id: 4,
    type: "alert",
    title: "Low Diesel Warning",
    description: "Main storage tank below 20%",
    time: "Yesterday",
    icon: AlertCircle,
    color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  },
];

export function RecentActivity() {
  return (
    <Card className="col-span-1 lg:col-span-3 shadow-sm animate-fade-in animate-delay-300">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions on your farm</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className={cn("p-2 rounded-full", activity.color)}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
