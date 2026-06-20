"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteExpense } from "@/actions/expense-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteExpenseButton({ id, description }: { id: string; description: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the expense "${description}"?`)) {
      startTransition(async () => {
        const res = await deleteExpense(id);
        if (res.success) {
          toast.success("Expense deleted successfully");
          router.refresh();
        } else {
          toast.error(res.error || "Failed to delete expense");
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="h-8 w-8 text-destructive hover:bg-destructive/10"
      title="Delete Expense"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
