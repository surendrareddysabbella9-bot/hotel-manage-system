import { useState } from "react";
import { User as UserIcon, Award, ShoppingBag, Save, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/PageHeader";
import { OrderCard } from "@/components/cards/OrderCard";
import { mockCustomerUser, mockOrders } from "@/mocks";

export function CustomerProfilePage() {
  const [fullName, setFullName] = useState(mockCustomerUser.fullName);
  const [email, setEmail] = useState(mockCustomerUser.email);
  const [phone, setPhone] = useState("+1 (555) 234-5678");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Account Profile"
        description="Manage your personal details, dining preferences, and order history"
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 text-center p-6 space-y-4">
          <Avatar className="size-20 mx-auto border-2 border-primary">
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              SC
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-lg">{fullName}</h3>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-primary font-semibold">
              <Award className="size-4" /> Gold Tier Member
            </div>
            <p className="text-xs text-muted-foreground">340 Loyalty Points</p>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UserIcon className="size-4 text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button type="submit" className="gap-2">
                {saved ? <Check className="size-4 text-success" /> : <Save className="size-4" />}
                {saved ? "Saved Changes" : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <ShoppingBag className="size-4 text-primary" /> Order History ({mockOrders.length})
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {mockOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}
