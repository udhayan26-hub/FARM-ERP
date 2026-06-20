"use client";

import { useRouter } from "next/navigation";
import { format, addDays, subDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttendanceDateNavProps {
  currentDate: string;
  todayStr: string;
}

export function AttendanceDateNav({ currentDate, todayStr }: AttendanceDateNavProps) {
  const router = useRouter();
  const date = parseISO(currentDate);
  const isToday = currentDate === todayStr;

  const navigate = (newDate: Date) => {
    const str = format(newDate, "yyyy-MM-dd");
    router.push(`/attendance?date=${str}`);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(subDays(date, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-md border min-w-[220px] justify-center">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{format(date, "MMMM d, yyyy")}</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(addDays(date, 1))}
          disabled={isToday}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {!isToday && (
        <Button variant="outline" size="sm" onClick={() => navigate(new Date())}>
          Today
        </Button>
      )}
    </div>
  );
}
