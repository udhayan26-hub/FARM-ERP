"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { z } from "zod";

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
import { createLand } from "@/actions/land-actions";

const landFormSchema = z.object({
  name: z.string().min(1, "Land name is required"),
  acres: z.coerce.number().min(0.1, "Acres must be greater than 0"),
  location: z.string().optional(),
  crop: z.string().optional(),
  sowingDate: z.string().optional(),
  harvestDate: z.string().optional(),
  status: z.enum(["active", "fallow", "harvested"]),
});

type LandFormValues = z.infer<typeof landFormSchema>;

export function LandFormDialog({ children, onSuccess }: { children: React.ReactNode; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LandFormValues>({
    resolver: zodResolver(landFormSchema),
    defaultValues: {
      name: "",
      acres: 5,
      location: "",
      crop: "",
      sowingDate: "",
      harvestDate: "",
      status: "active",
    },
  });

  const { formState: { errors } } = form;

  const onSubmit = async (data: LandFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createLand(data);
      if (result.success) {
        toast.success("Land parcel added successfully!", {
          description: `${data.name} (${data.acres} acres) has been added.`,
        });
        setOpen(false);
        form.reset();
        onSuccess?.();
      } else {
        toast.error("Failed to add land", {
          description: result.error || "An unexpected error occurred.",
        });
      }
    } catch {
      toast.error("Network error", { description: "Please try again." });
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
            <MapPin className="h-5 w-5 text-primary" />
            Add Land Parcel
          </DialogTitle>
          <DialogDescription>
            Enter the details of the land parcel below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="land-name">Land Name *</Label>
            <Input
              id="land-name"
              {...form.register("name")}
              placeholder="e.g. North Field, Survey No. 45"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Acres + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="land-acres">Acres *</Label>
              <Input
                id="land-acres"
                type="number"
                step="0.1"
                min="0.1"
                {...form.register("acres")}
              />
              {errors.acres && (
                <p className="text-xs text-destructive">{errors.acres.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="land-status">Status</Label>
              <Select
                defaultValue="active"
                onValueChange={(val) =>
                  form.setValue("status", val as "active" | "fallow" | "harvested")
                }
              >
                <SelectTrigger id="land-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="fallow">Fallow</SelectItem>
                  <SelectItem value="harvested">Harvested</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location + Crop */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="land-location">Location/Survey No.</Label>
              <Input
                id="land-location"
                {...form.register("location")}
                placeholder="Village / Survey No."
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="land-crop">Current Crop</Label>
              <Input
                id="land-crop"
                {...form.register("crop")}
                placeholder="e.g. Sugarcane, Wheat"
              />
            </div>
          </div>

          {/* Sowing + Harvest Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="land-sowing">Sowing Date</Label>
              <Input
                id="land-sowing"
                type="date"
                {...form.register("sowingDate")}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="land-harvest">Harvest Date</Label>
              <Input
                id="land-harvest"
                type="date"
                {...form.register("harvestDate")}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setOpen(false); form.reset(); }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Land"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
