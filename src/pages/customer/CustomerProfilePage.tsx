import { useState } from "react";
import { User, Mail, Phone, Award, ShoppingBag, ShieldCheck, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/app/providers/AuthContext";
import { useOrders } from "@/hooks/useOrders";

export function CustomerProfilePage() {
  const { user } = useAuth();
  const { orders, isLoading } = useOrders();

  const [fullName, setFullName] = useState(user?.fullName || "Sarah Chen");
  const [email, setEmail] = useState(user?.email || "sarah@example.com");
  const [phone, setPhone] = useState("+91 9876543210");
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <PageHeader
        title="Your Dining Profile"
        description="Manage your account preferences, view order history, and check loyalty points"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
              <User className="size-10" />
            </div>
            <CardTitle className="text-lg font-bold">{fullName}</CardTitle>
            <p className="text-xs text-muted-foreground">{email}</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t border-border text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
              <div className="flex items-center gap-2">
                <Award className="size-4 text-warning" />
                <span className="font-semibold">Loyalty Status</span>
              </div>
              <Badge variant="warning">Gold Member</Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <span className="font-semibold">Reward Points</span>
              </div>
              <span className="font-bold text-sm text-primary">850 pts</span>
            </div>
          </CardContent>
        </Card>

        {/* Edit Personal Information Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
          </CardHeader>
          <form onSubmit={handleSaveProfile}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-4 border-t border-border">
              {isSaved ? (
                <p className="text-xs text-success font-semibold flex items-center gap-1">
                  Profile updated successfully!
                </p>
              ) : <div />}
              <Button type="submit" size="sm" className="gap-2">
                <Save className="size-3.5" /> Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Order History */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <ShoppingBag className="size-4 text-primary" /> Order History ({orders.length})
        </h3>
        {isLoading ? (
          <LoadingSkeleton variant="table" count={3} />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-sm">Order #{order.orderNumber}</p>
                  <p className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items</p>
                </div>
                <div className="text-right">
                  <Badge variant={order.status === "served" ? "success" : "warning"} className="capitalize mb-1">
                    {order.status}
                  </Badge>
                  <p className="font-bold text-sm">₹{order.total.toFixed(2)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
