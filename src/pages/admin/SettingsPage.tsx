import { useState } from "react";
import { Save, Check, Building, Clock, Bell } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "hours" | "notifications">("general");
  const [saved, setSaved] = useState(false);

  const [restaurantName, setRestaurantName] = useState("RestaurantOS Bistro & Lounge");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [address, setAddress] = useState("124 Culinary Way, San Francisco, CA");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="System Settings" description="Configure restaurant profile, business hours, and operational preferences" />

      <div className="flex border-b border-border gap-4">
        <Button
          variant={activeTab === "general" ? "default" : "ghost"}
          className="rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
          onClick={() => setActiveTab("general")}
        >
          <Building className="size-4 mr-2" /> Restaurant Profile
        </Button>
        <Button
          variant={activeTab === "hours" ? "default" : "ghost"}
          className="rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
          onClick={() => setActiveTab("hours")}
        >
          <Clock className="size-4 mr-2" /> Business Hours
        </Button>
        <Button
          variant={activeTab === "notifications" ? "default" : "ghost"}
          className="rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
          onClick={() => setActiveTab("notifications")}
        >
          <Bell className="size-4 mr-2" /> Notifications
        </Button>
      </div>

      {activeTab === "general" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Restaurant Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Restaurant Name</Label>
                <Input id="restaurantName" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Physical Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <Button type="submit" className="gap-2">
                {saved ? <Check className="size-4 text-success" /> : <Save className="size-4" />}
                {saved ? "Settings Saved" : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "hours" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Operating Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {["Monday - Thursday", "Friday - Saturday", "Sunday"].map((day, idx) => (
              <div key={day} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="font-semibold">{day}</span>
                <div className="flex items-center gap-2">
                  <Input className="w-28 text-center text-xs" defaultValue={idx === 1 ? "11:00 AM" : "11:30 AM"} />
                  <span>to</span>
                  <Input className="w-28 text-center text-xs" defaultValue={idx === 1 ? "11:00 PM" : "10:00 PM"} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Alert Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div>
                <p className="font-semibold">Low Inventory Alerts</p>
                <p className="text-xs text-muted-foreground">Notify staff when ingredient stock falls below minimum threshold</p>
              </div>
              <input type="checkbox" defaultChecked className="size-4 accent-primary" />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div>
                <p className="font-semibold">Order Delay Notifications</p>
                <p className="text-xs text-muted-foreground">Alert manager if cooking time exceeds 25 minutes</p>
              </div>
              <input type="checkbox" defaultChecked className="size-4 accent-primary" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
