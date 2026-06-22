import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Users,
  ClipboardCheck,
  Map,
  Fuel,
  Receipt,
  Wallet,
  Coins,
  Tractor,
  History,
} from "lucide-react";

interface AuditLog {
  id: string;
  createdAt: Date;
  action: string;
  module: string;
  entityId: string;
  notes?: string;
  user?: {
    name: string;
    email: string;
  } | null;
}

const MODULE_CONFIGS: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  worker: {
    icon: Users,
    color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  },
  attendance: {
    icon: ClipboardCheck,
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  land: {
    icon: Map,
    color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  },
  diesel: {
    icon: Fuel,
    color: "text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400",
  },
  expense: {
    icon: Receipt,
    color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400",
  },
  payment: {
    icon: Wallet,
    color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  advance: {
    icon: Coins,
    color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400",
  },
  tractor: {
    icon: Tractor,
    color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
  },
};

function formatRelativeTime(dateInput: Date | string) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function RecentActivity({ logs = [] }: { logs?: AuditLog[] }) {
  return (
    <Card className="col-span-1 lg:col-span-3 shadow-sm animate-fade-in animate-delay-300">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions on your farm</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-sm">
            <History className="h-10 w-10 mb-2 opacity-30 text-primary" />
            <p className="font-semibold text-foreground">No recent activity</p>
            <p className="text-xs text-center mt-1 max-w-[200px]">
              Activities will be logged as you manage workers, wages, lands, or expenses.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {logs.map((log) => {
              const config = MODULE_CONFIGS[log.module.toLowerCase()] || {
                icon: History,
                color: "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400",
              };
              const Icon = config.icon;

              return (
                <div key={log.id} className="flex items-start gap-4">
                  <div className={cn("p-2 rounded-full", config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium leading-none text-foreground">
                      {log.action}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {log.notes || `Activity recorded in ${log.module}`}
                    </p>
                  </div>
                  <div className="text-[10px] text-muted-foreground whitespace-nowrap self-start">
                    {formatRelativeTime(log.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
