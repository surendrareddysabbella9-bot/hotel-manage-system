import { useEffect, useState } from "react";
import { User, Mail, Phone, Award, ShoppingBag, ShieldCheck, Save, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/app/providers/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const TIER_COLORS: Record<string, string> = {
  Bronze: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  Silver: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  Gold: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20 shadow-yellow-500/20 shadow-lg",
};

export function CustomerProfilePage() {
  const { user } = useAuth();
  const { orders, isLoading: isOrdersLoading } = useOrders();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [loyaltyTier, setLoyaltyTier] = useState("Silver");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const data = await apiFetch('/profiles?id=' + user.id).then(r => r[0]);

        if (data) {
          setFullName(data.full_name || user.fullName);
          setEmail(data.email || user.email);
          setPhone(data.phone || "");
          setLoyaltyTier(data.loyalty_tier || "Silver");
          setLoyaltyPoints(data.loyalty_points || 0);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProfile();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    try {
      await apiFetch(`/profiles/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: fullName,
          phone,
          updated_at: new Date().toISOString(),
        })
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const getTierProgress = (points: number, currentTier: string) => {
    if (currentTier === 'Bronze' || points <= 500) {
      return { percentage: Math.min((points / 500) * 100, 100), nextTier: 'Silver', pointsNeeded: 501 - points };
    }
    if (currentTier === 'Silver' || points <= 2000) {
      return { percentage: Math.min(((points - 500) / 1500) * 100, 100), nextTier: 'Gold', pointsNeeded: 2001 - points };
    }
    return { percentage: 100, nextTier: 'Max Tier Reached', pointsNeeded: 0 };
  };

  const progress = getTierProgress(loyaltyPoints, loyaltyTier);

  return (
    <div className="relative min-h-screen space-y-8 max-w-4xl mx-auto pb-16 pt-4">
      {/* Background gradient for glassmorphism */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      
      <PageHeader
        title="Your Dining Profile"
        description="Manage your account preferences, view order history, and check loyalty points"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 overflow-hidden bg-background/60 backdrop-blur-xl border-border/40 shadow-lg">
          <CardHeader className="text-center pb-2 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-background border-2 border-primary/20 text-primary mb-2 shadow-sm relative z-10">
              <User className="size-10" />
            </div>
            <CardTitle className="text-lg font-bold relative z-10">{fullName || "Valued Diner"}</CardTitle>
            <p className="text-xs text-muted-foreground relative z-10">{email}</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t border-border/50 text-xs">
            <div className={cn("flex items-center justify-between p-3 rounded-lg border", TIER_COLORS[loyaltyTier] || TIER_COLORS.Bronze)}>
              <div className="flex items-center gap-2">
                <Award className="size-4" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Loyalty Tier</span>
              </div>
              <span className="font-bold text-sm">{loyaltyTier}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10 text-primary">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Reward Points</span>
              </div>
              <span className="font-bold text-lg">{loyaltyPoints}</span>
            </div>

            {/* Progress to next tier */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                <span>{loyaltyTier}</span>
                <span>{progress.nextTier}</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              {progress.pointsNeeded > 0 && (
                <p className="text-[10px] text-muted-foreground text-center">
                  Earn <span className="font-bold text-foreground">{progress.pointsNeeded}</span> more points to reach {progress.nextTier}!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Personal Information Form */}
        <Card className="md:col-span-2 bg-background/60 backdrop-blur-xl border-border/40 shadow-lg">
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
                    required
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
                    disabled
                    className="pl-9 bg-muted/50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+91 9876543210"
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
                  Profile updated successfully in database!
                </p>
              ) : <div />}
              <Button type="submit" size="sm" className="gap-2" disabled={isSaving}>
                <Save className="size-3.5" /> {isSaving ? "Saving..." : "Save Changes"}
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
        {isOrdersLoading ? (
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
