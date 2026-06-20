"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UserCheck, UserX, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleWorkerStatus, deleteWorker } from "@/actions/worker-actions";

interface WorkerStatusToggleProps {
  workerId: string;
  currentStatus: string;
}

export function WorkerStatusToggle({
  workerId,
  currentStatus,
}: WorkerStatusToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  const handleToggleStatus = () => {
    startTransition(async () => {
      const result = await toggleWorkerStatus(workerId, status);
      if (result.success) {
        const newStatus = status === "active" ? "inactive" : "active";
        setStatus(newStatus);
        toast.success(
          newStatus === "active"
            ? "Worker reactivated successfully"
            : "Worker deactivated successfully"
        );
      } else {
        toast.error(result.error || "Failed to update worker status");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWorker(workerId);
      if (result.success) {
        toast.success("Worker deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete worker");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {status === "active" ? (
          <DropdownMenuItem
            className="text-amber-600 focus:text-amber-600"
            onClick={handleToggleStatus}
            disabled={isPending}
          >
            <UserX className="mr-2 h-4 w-4" />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-green-600 focus:text-green-600"
            onClick={handleToggleStatus}
            disabled={isPending}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Reactivate
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Worker
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
