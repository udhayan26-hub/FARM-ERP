"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { createTractor } from "@/actions/tractor-actions";

export function TractorFormDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: "",
      registrationNo: "",
      model: "",
      driverName: "",
      purchaseDate: new Date().toISOString().split('T')[0],
      status: "active"
    }
  });

  const onSubmit = async (data: {
    name: string;
    registrationNo: string;
    model: string;
    driverName: string;
    purchaseDate: string;
    status: string;
  }) => {
    if (!data.name || !data.registrationNo || !data.driverName) {
      toast.error("Name, Registration Number and Driver Name are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createTractor(data);
      if (result.success) {
        toast.success("Tractor added successfully!");
        setOpen(false);
        form.reset();
      } else {
        toast.error(result.error || "Failed to add tractor");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Tractor</DialogTitle>
          <DialogDescription>
            Register a new farm vehicle or machinery.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label>Tractor Name/Brand</Label>
            <Input {...form.register("name")} placeholder="e.g. Mahindra 575 DI" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Registration No.</Label>
              <Input {...form.register("registrationNo")} placeholder="KA-01-AB-1234" />
            </div>
            <div className="grid gap-2">
              <Label>Model Year</Label>
              <Input {...form.register("model")} placeholder="2023" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Primary Driver</Label>
            <Input {...form.register("driverName")} placeholder="Driver's name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Purchase Date</Label>
              <Input type="date" {...form.register("purchaseDate")} />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select onValueChange={(v: string) => form.setValue("status", v)} defaultValue={form.getValues("status")}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">In Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Tractor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
