import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ROUTES } from "@/constants";
import { useMenu } from "@/hooks/useMenu";

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export function CartPage() {
  const { items: menuItems, isLoading } = useMenu();

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (menuItems.length >= 2) {
      return [
        {
          id: "cart-1",
          menuItemId: menuItems[0].id,
          name: menuItems[0].name,
          price: menuItems[0].price,
          quantity: 2,
          imageUrl: menuItems[0].imageUrl,
        },
        {
          id: "cart-2",
          menuItemId: menuItems[1].id,
          name: menuItems[1].name,
          price: menuItems[1].price,
          quantity: 1,
          imageUrl: menuItems[1].imageUrl,
        },
      ];
    }
    return [
      {
        id: "cart-1",
        menuItemId: "item-001",
        name: "Butter Chicken",
        price: 350,
        quantity: 2,
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      },
    ];
  });

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [tableNumber, setTableNumber] = useState("4");
  const [orderType, setOrderType] = useState<"dine_in" | "takeout">("dine_in");

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% GST
  const finalDiscount = (subtotal * discount) / 100;
  const total = subtotal + tax - finalDiscount;

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === "WELCOME10") {
      setDiscount(10);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        title="Your Dining Basket"
        description="Review selected dishes, apply discounts, and place your order"
      />

      {isLoading ? (
        <LoadingSkeleton variant="page" />
      ) : cart.length === 0 ? (
        <EmptyState
          title="Your basket is empty"
          description="Looks like you haven't added any dishes to your basket yet."
          actionLabel="Explore Menu"
          onAction={() => window.location.href = ROUTES.customer.menu}
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShoppingBag className="size-4 text-primary" />
                  Order Items ({cart.length})
                </CardTitle>
                <Badge variant="outline" className="capitalize">
                  {orderType.replace("_", " ")}
                </Badge>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {cart.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 items-center">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="size-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} each</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 border border-border rounded-lg p-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 rounded-md"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 rounded-md"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 text-muted-foreground hover:text-destructive mt-1"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Preference Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Dining Details</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={orderType === "dine_in" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOrderType("dine_in")}
                    >
                      Dine In
                    </Button>
                    <Button
                      variant={orderType === "takeout" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOrderType("takeout")}
                    >
                      Takeout
                    </Button>
                  </div>
                </div>

                {orderType === "dine_in" && (
                  <div className="space-y-2">
                    <Label htmlFor="tableNumber">Table Number</Label>
                    <Input
                      id="tableNumber"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="e.g. Table 4"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Checkout */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Bill Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes (5% GST)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-success font-medium">
                    <span>Discount ({discount}%)</span>
                    <span>-₹{finalDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </CardContent>

              <CardFooter className="flex-col space-y-3">
                <form onSubmit={applyPromo} className="flex gap-2 w-full">
                  <Input
                    placeholder="Promo code (WELCOME10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="text-xs"
                  />
                  <Button type="submit" variant="secondary" size="sm">
                    Apply
                  </Button>
                </form>

                <Button className="w-full gap-2 font-semibold" size="lg" asChild>
                  <Link to={ROUTES.customer.tracking}>
                    <CreditCard className="size-4" /> Place & Pay ₹{total.toFixed(2)}
                    <ArrowRight className="size-4 ml-auto" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
