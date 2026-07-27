import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, CreditCard, Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ROUTES, RESTAURANT_TAX_RATE } from "@/constants";
import { useTables } from "@/hooks/useTables";
import { AIRecommendations } from "@/components/customer/AIRecommendations";
import { useCart } from "@/hooks/useCart";
import { orderService } from "@/services/orderService";

export function CartPage() {
  const navigate = useNavigate();
  const { tables, isLoading } = useTables();
  const { cart, updateQuantity, removeItem, addToCart, clearCart } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [orderType, setOrderType] = useState<"dine_in" | "takeout">("dine_in");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTables = tables.filter((t) => t.status === "available");

  const handleAddRecommendation = (item: any) => {
    addToCart({
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * RESTAURANT_TAX_RATE;
  const finalDiscount = (subtotal * discount) / 100;
  const total = subtotal + tax - finalDiscount;

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "SAVE10") {
      setDiscount(10);
    } else {
      setDiscount(0);
    }
  };

  const handleCheckout = async () => {
    setPaymentStatus("processing");
    setIsSubmitting(true);
    
    // Simulate payment gateway delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPaymentStatus("success");
    
    // Wait for user to see the success checkmark
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const orderPayload = {
        order_number: "ORD-" + Math.floor(1000 + Math.random() * 9000),
        customer_name: "Guest Diner",
        table_id: orderType === 'dine_in' ? selectedTableId : null,
        order_type: orderType,
        subtotal,
        tax,
        total,
        items: cart.map(item => ({
          menu_item_id: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          notes: ""
        }))
      };

      await orderService.createOrder(orderPayload);
      clearCart();
      setPaymentStatus("idle");
      navigate(ROUTES.customer.tracking);
    } catch (err) {
      console.error("Failed to checkout", err);
      setPaymentStatus("idle");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        title="Your Dining Basket"
        description="Review selected dishes, select table availability, and place your order"
      />

      {isLoading ? (
        <LoadingSkeleton variant="page" />
      ) : cart.length === 0 ? (
        <EmptyState
          title="Your basket is empty"
          description="You have no dishes currently in your cart. Explore our digital menu to add delicious items."
          actionLabel="Explore Menu"
          onAction={() => navigate(ROUTES.customer.menu)}
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

            {/* AI Recommendations Widget */}
            <AIRecommendations cart={cart} onAdd={handleAddRecommendation} />

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
                    <Label htmlFor="tableSelect">Select Table</Label>
                    <select
                      id="tableSelect"
                      value={selectedTableId}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Select an available table...</option>
                      {availableTables.map((t) => (
                        <option key={t.id} value={t.id}>
                          Table #{t.number} ({t.section} - {t.capacity} Seats)
                        </option>
                      ))}
                    </select>
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
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="text-xs"
                  />
                  <Button type="submit" variant="secondary" size="sm">
                    Apply
                  </Button>
                </form>

                <Button
                  className="w-full gap-2 font-semibold"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  <CreditCard className="size-4" />
                  {isSubmitting ? "Processing..." : `Place Order · ₹${total.toFixed(2)}`}
                  <ArrowRight className="size-4 ml-auto" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* Mock Payment Modal */}
      <Dialog open={paymentStatus !== "idle"} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center py-10 text-center">
          {paymentStatus === "processing" ? (
            <>
              <Loader2 className="size-16 text-primary animate-spin mb-4" />
              <DialogTitle className="text-xl">Processing Payment...</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Securely connecting to payment gateway. Please do not close this window.
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-16 text-success mb-4" />
              <DialogTitle className="text-xl">Payment Successful!</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Redirecting to order tracking...
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
