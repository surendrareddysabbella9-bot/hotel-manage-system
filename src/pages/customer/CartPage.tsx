import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft, CheckCircle2, Utensils, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { ROUTES } from "@/constants";
import { mockMenuItems } from "@/mocks";

interface CartItemState {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItemState[]>([
    {
      id: "item-001",
      name: mockMenuItems[0].name,
      price: mockMenuItems[0].price,
      quantity: 2,
      imageUrl: mockMenuItems[0].imageUrl,
    },
    {
      id: "item-003",
      name: mockMenuItems[2].name,
      price: mockMenuItems[2].price,
      quantity: 1,
      imageUrl: mockMenuItems[2].imageUrl,
    },
  ]);

  const [orderType, setOrderType] = useState<"dine-in" | "takeout">("dine-in");
  const [tableNumber, setTableNumber] = useState("7");
  const [notes, setNotes] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItemState[]
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const serviceCharge = orderType === "dine-in" ? subtotal * 0.05 : 0;
  const total = subtotal + tax + serviceCharge;

  const handleCheckout = () => {
    setIsSuccessOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to={ROUTES.customer.menu}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <PageHeader title="Your Cart" description="Review items before sending your order to the kitchen" />
      </div>

      {items.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Itemized Cart List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Order Items ({items.length})</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {items.map((item) => (
                  <div key={item.id} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="size-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-7"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-7"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <span className="font-semibold text-sm w-16 text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Special Instructions & Dining Type */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Order Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={orderType === "dine-in" ? "default" : "outline"}
                      className="gap-2"
                      onClick={() => setOrderType("dine-in")}
                    >
                      <Utensils className="size-4" /> Dine-In
                    </Button>
                    <Button
                      type="button"
                      variant={orderType === "takeout" ? "default" : "outline"}
                      className="gap-2"
                      onClick={() => setOrderType("takeout")}
                    >
                      <ShoppingBag className="size-4" /> Takeout
                    </Button>
                  </div>
                </div>

                {orderType === "dine-in" && (
                  <div className="space-y-2">
                    <Label htmlFor="tableNumber">Table Number</Label>
                    <Input
                      id="tableNumber"
                      type="number"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="e.g. 7"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Preparation Instructions</Label>
                  <Input
                    id="notes"
                    placeholder="e.g. Extra sauce, no onions, allergy alert..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Pricing Breakdown */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {orderType === "dine-in" && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Service Fee (5%)</span>
                    <span>${serviceCharge.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Place Order Now
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center space-y-4">
          <ShoppingBag className="mx-auto size-12 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold">Your Cart is Empty</h3>
          <p className="text-sm text-muted-foreground">Looks like you haven&apos;t added any delicious items yet.</p>
          <Button asChild>
            <Link to={ROUTES.customer.menu}>Browse Menu</Link>
          </Button>
        </Card>
      )}

      {/* Order Sent Dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <CheckCircle2 className="size-12 text-success mb-2" />
            <DialogTitle>Order Sent to Kitchen!</DialogTitle>
            <DialogDescription>
              Your order <span className="font-semibold text-foreground">#1044</span> has been received and is being prepared by our kitchen team.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Button
              className="w-full"
              onClick={() => {
                setIsSuccessOpen(false);
                navigate(ROUTES.customer.tracking);
              }}
            >
              Track Order Progress
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setIsSuccessOpen(false)}>
              Back to Menu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
