"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { workerFormSchema, WorkerFormValues } from "@/lib/validations/worker";
import { createWorker } from "@/actions/worker-actions";

export function WorkerFormDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkerFormValues>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      village: "",
      dailyWage: 400,
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
    },
  });

  const { formState: { errors } } = form;

  const onSubmit = async (data: WorkerFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createWorker(data);
      if (result.success) {
        toast.success("Worker added successfully!", {
          description: `${data.name} has been added to your farm roster.`,
        });
        setOpen(false);
        form.reset();
      } else {
        toast.error("Failed to add worker", {
          description: result.error || "An unexpected error occurred. Please try again.",
        });
      }
    } catch {
      toast.error("Network error", {
        description: "Could not connect to the server. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add New Worker
          </DialogTitle>
          <DialogDescription>
            Enter the details of the new farm worker below.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 pt-2"
        >
          {/* Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="worker-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="worker-name"
              {...form.register("name")}
              placeholder="e.g. Ramesh Singh"
              autoComplete="off"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Phone + Village */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="worker-phone">Mobile Number</Label>
              <Input
                id="worker-phone"
                {...form.register("phone")}
                placeholder="+91 9876543210"
                autoComplete="off"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="worker-village">
                Village / Town <span className="text-destructive">*</span>
              </Label>
              <Input
                id="worker-village"
                {...form.register("village")}
                placeholder="Village name"
              />
              {errors.village && (
                <p className="text-xs text-destructive">
                  {errors.village.message}
                </p>
              )}
            </div>
          </div>

          {/* Daily Wage + Join Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="worker-wage">
                Daily Wage (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="worker-wage"
                type="number"
                min={1}
                step={50}
                {...form.register("dailyWage")}
              />
              {errors.dailyWage && (
                <p className="text-xs text-destructive">
                  {errors.dailyWage.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="worker-joindate">
                Join Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="worker-joindate"
                type="date"
                {...form.register("joinDate")}
              />
              {errors.joinDate && (
                <p className="text-xs text-destructive">
                  {errors.joinDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="grid gap-1.5">
            <Label htmlFor="worker-status">Status</Label>
            <Select
              defaultValue="active"
              onValueChange={(val) =>
                form.setValue("status", val as "active" | "inactive")
              }
            >
              <SelectTrigger id="worker-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                form.reset();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : (
                "Save Worker"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
