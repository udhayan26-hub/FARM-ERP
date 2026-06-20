"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useEffect, useState, useTransition } from "react";
import { getUser, updateProfile, type AuthUser } from "@/lib/auth";
import { updateUserProfile } from "@/actions/user-actions";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    farmName: "",
    phone: "",
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        farmName: currentUser.farmName || "",
        phone: currentUser.phone || "",
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Valid email is required");
      return;
    }
    if (!formData.farmName.trim()) {
      toast.error("Farm name is required");
      return;
    }

    startTransition(async () => {
      // 1. Save to SQLite database via server action
      const res = await updateUserProfile({
        name: formData.name,
        email: formData.email,
        farmName: formData.farmName,
        phone: formData.phone,
      });

      if (res.success) {
        // 2. Update local storage profile
        const updatedUser = updateProfile({
          name: formData.name,
          email: formData.email,
          farmName: formData.farmName,
          phone: formData.phone,
        });

        if (updatedUser) {
          toast.success("Profile settings updated successfully!");
          // Force a full refresh to update the sidebar/topnav in real-time
          window.location.reload();
        } else {
          toast.error("Failed to update local storage session");
        }
      } else {
        toast.error(res.error || "Failed to update profile in database");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader 
        title="Settings" 
        description="Manage your farm profile and preferences"
      />

      <Card>
        <CardHeader>
          <CardTitle>Farm Profile</CardTitle>
          <CardDescription>Update your farm details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="farmName">Farm Name</Label>
            <Input 
              id="farmName"
              name="farmName"
              value={formData.farmName} 
              onChange={handleChange}
              placeholder="e.g. Green Valley Farms"
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Owner Name</Label>
              <Input 
                id="name"
                name="name"
                value={formData.name} 
                onChange={handleChange}
                placeholder="e.g. Rajesh Kumar"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Number</Label>
              <Input 
                id="phone"
                name="phone"
                value={formData.phone} 
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
                disabled={isPending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email"
              name="email"
              type="email"
              value={formData.email} 
              onChange={handleChange}
              placeholder="e.g. farmer@farmerp.com"
              disabled={isPending}
            />
          </div>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Application settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive weekly summary reports.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Low Diesel Alert</Label>
              <p className="text-sm text-muted-foreground">Get notified when stock is low.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
