import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, CreditCard, Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ROUTES, RESTAURANT_TAX_RATE } from "@/constants";
import { useTables } from "@/hooks/useTables";
import { AIRecommendations } from "@/components/customer/AIRecommendations";
import { useCart } from "@/hooks/useCart";
import { orderService } from "@/services/orderService";
import { useAuth } from "@/app/providers/AuthContext";

export function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tables, isLoading } = useTables();
  const { cart, updateQuantity, removeItem, addToCart, clearCart } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [orderType, setOrderType] = useState<"dine_in" | "takeout">("dine_in");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

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
    setTimeLeft(30);
    
    // We will handle the countdown in a useEffect or inside the modal component.
    // For simplicity, we just trigger the modal state and let the user click "Simulate Scan" or wait.
  };

  const processPaymentSuccess = async () => {
    setPaymentStatus("success");
    
    // Wait for user to see the success checkmark
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const orderPayload = {
        order_number: "ORD-" + Math.floor(1000 + Math.random() * 9000),
        customer_id: user?.id || null, // pass the customer ID so points are awarded
        customer_name: user?.fullName || "Guest Diner",
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

  // Timer for auto-payment success (15 seconds)
  useEffect(() => {
    if (paymentStatus === "processing" && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (paymentStatus === "processing" && timeLeft === 0) {
      processPaymentSuccess();
    }
  }, [paymentStatus, timeLeft]);

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
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center py-8 text-center bg-background/80 backdrop-blur-xl border-border/40 shadow-2xl">
          {paymentStatus === "processing" ? (
            <div className="space-y-6 w-full flex flex-col items-center">
              <DialogTitle className="text-xl">Scan to Pay ₹{total.toFixed(2)}</DialogTitle>
              <div className="p-4 bg-white rounded-xl shadow-inner border">
                {/* Mock QR Code using a public API to generate it based on total */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=pay_mock_${total}`} 
                  alt="Payment QR Code"
                  className="size-48"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Waiting for payment...</p>
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                  <Loader2 className="size-3 animate-spin" />
                  <span>Auto-confirming in {timeLeft}s</span>
                </div>
              </div>

              <div className="pt-4 border-t w-full flex flex-col gap-2">
                <Button onClick={processPaymentSuccess} className="w-full bg-primary/90 hover:bg-primary gap-2">
                  <CheckCircle2 className="size-4" /> Simulate Scan
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setPaymentStatus("idle"); setIsSubmitting(false); }}>
                  Cancel Payment
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-8">
              <CheckCircle2 className="size-16 text-emerald-500 mx-auto" />
              <DialogTitle className="text-xl">Payment Successful!</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Your order has been placed. Redirecting to tracking...
              </p>
              {user && user.role !== "guest" && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-amber-800 text-sm font-semibold">
                    🎉 You earned {Math.floor(total / 10)} Loyalty Points!
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
