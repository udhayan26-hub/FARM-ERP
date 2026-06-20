"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteTractor } from "@/actions/tractor-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteTractorButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete tractor "${name}"? This will delete all its registered diesel logs too.`)) {
      startTransition(async () => {
        const res = await deleteTractor(id);
        if (res.success) {
          toast.success("Tractor deleted successfully");
          router.refresh();
        } else {
          toast.error(res.error || "Failed to delete tractor");
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
      title="Delete Tractor"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
