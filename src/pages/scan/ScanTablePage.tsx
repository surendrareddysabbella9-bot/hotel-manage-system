import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Gift,
  ArrowRight,
  User,
  Mail,
  Lock,
  Loader2,
  Utensils,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/app/providers/AuthContext";
import { scanService, type ScannedTable } from "@/services/scanService";
import { APP_NAME } from "@/constants";

type ScanStep = "loading" | "unavailable" | "choose" | "login" | "guest" | "booking" | "confirmed";

export function ScanTablePage() {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const navigate = useNavigate();
  const { user, loginWithEmail, loginAsGuest, isGuest } = useAuth();

  const [step, setStep] = useState<ScanStep>("loading");
  const [table, setTable] = useState<ScannedTable | null>(null);
  const [error, setError] = useState<string>("");
  const [partySize, setPartySize] = useState(2);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Booking result
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Fetch table info on mount
  useEffect(() => {
    const fetchTable = async () => {
      const num = parseInt(tableNumber || "0", 10);
      if (!num || num <= 0) {
        setError("Invalid table number");
        setStep("unavailable");
        return;
      }

      try {
        const data = await scanService.getTableByNumber(num);
        setTable(data);

        if (data.status !== "available") {
          setError(`Table #${data.number} is currently ${data.status}`);
          setStep("unavailable");
        } else {
          // If user is already logged in, skip to booking directly
          if (user) {
            setStep("booking");
            handleBookTable();
          } else {
            setStep("choose");
          }
        }
      } catch (err: any) {
        setError(err.message || "Table not found");
        setStep("unavailable");
      }
    };

    fetchTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableNumber]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      await loginWithEmail(email, password);
      setStep("booking");
      // Small delay so AuthContext updates
      setTimeout(() => handleBookTable(), 300);
    } catch (err: any) {
      setFormError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      await loginAsGuest(guestName.trim() || "Guest");
      setStep("booking");
      setTimeout(() => handleBookTable(), 300);
    } catch (err: any) {
      setFormError(err.message || "Failed to create guest session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookTable = async () => {
    if (!table) return;
    setStep("booking");

    try {
      const result = await scanService.bookTable(table.number, partySize);
      
      // Save active table session
      sessionStorage.setItem('activeTableId', table.id);
      sessionStorage.setItem('activeTableNumber', table.number.toString());
      
      setBookingResult(result);
      setStep("confirmed");
    } catch (err: any) {
      setFormError(err.message || "Failed to book table");
      setStep("choose");
    }
  };

  const goToMenu = () => {
    navigate("/customer/menu");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-success/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-warning/3 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-8">
        {/* Branding Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-8"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <ChefHat className="size-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
        </motion.div>

        {/* Main Content */}
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* ─── LOADING ─── */}
            {step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-4 py-20"
              >
                <div className="relative">
                  <QrCode className="size-16 text-primary animate-pulse" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 border-2 border-primary/20 border-t-primary rounded-full"
                  />
                </div>
                <p className="text-muted-foreground text-sm">Scanning table...</p>
              </motion.div>
            )}

            {/* ─── UNAVAILABLE ─── */}
            {step === "unavailable" && (
              <motion.div
                key="unavailable"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="glass">
                  <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                      <AlertCircle className="size-8 text-destructive" />
                    </div>
                    <h2 className="text-xl font-semibold">Table Unavailable</h2>
                    <p className="text-muted-foreground text-sm max-w-xs">{error}</p>
                    <Button variant="outline" onClick={() => navigate("/")} className="mt-4">
                      Go to Home
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ─── CHOOSE: Guest or Login ─── */}
            {step === "choose" && table && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5"
              >
                {/* Table Info Card */}
                <Card className="glass overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Table</p>
                        <h2 className="text-3xl font-bold mt-1">#{table.number}</h2>
                      </div>
                      <Badge variant="success" className="text-xs px-3 py-1">
                        Available
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        <span>{table.section}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        <span>{table.capacity} seats</span>
                      </div>
                    </div>

                    {/* Party Size Selector */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Party Size</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0"
                          onClick={() => setPartySize(Math.max(1, partySize - 1))}
                          disabled={partySize <= 1}
                        >
                          <Minus className="size-4" />
                        </Button>
                        <span className="text-2xl font-bold w-8 text-center">{partySize}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0"
                          onClick={() => setPartySize(Math.min(table.capacity, partySize + 1))}
                          disabled={partySize >= table.capacity}
                        >
                          <Plus className="size-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground ml-1">guest{partySize !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sign In Card */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setStep("login")}
                  className="w-full text-left"
                >
                  <Card className="glass cursor-pointer hover:shadow-lg transition-all hover:border-primary/30 group">
                    <CardContent className="py-5">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Gift className="size-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm">Sign In / Sign Up</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Earn loyalty points, unlock exclusive offers & track your orders across visits
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <Sparkles className="size-3 text-warning" />
                            <span className="text-[11px] text-warning font-medium">
                              Get 10% off on your next visit!
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.button>

                {/* Guest Card */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setStep("guest")}
                  className="w-full text-left"
                >
                  <Card className="glass cursor-pointer hover:shadow-lg transition-all hover:border-muted-foreground/30 group">
                    <CardContent className="py-5">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted shrink-0 group-hover:bg-muted/80 transition-colors">
                          <User className="size-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm">Continue as Guest</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Quick access — no account needed. Start ordering right away.
                          </p>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.button>
              </motion.div>
            )}

            {/* ─── LOGIN FORM ─── */}
            {step === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <Card className="glass">
                  <CardContent className="py-6">
                    <button
                      type="button"
                      onClick={() => setStep("choose")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1"
                    >
                      ← Back
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                        <Gift className="size-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Sign In for Rewards</h3>
                        <p className="text-xs text-muted-foreground">Table #{table?.number} · {table?.section}</p>
                      </div>
                    </div>

                    {formError && (
                      <div className="bg-destructive/10 text-destructive text-xs rounded-lg p-3 mb-4">
                        {formError}
                      </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="scan-email" className="text-xs">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            id="scan-email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="scan-password" className="text-xs">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            id="scan-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <><Loader2 className="size-4 animate-spin mr-2" /> Signing In...</>
                        ) : (
                          "Sign In & Book Table"
                        )}
                      </Button>
                    </form>

                    <div className="mt-4 text-center">
                      <p className="text-xs text-muted-foreground">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => navigate("/signup")}
                          className="text-primary hover:underline font-medium"
                        >
                          Sign up
                        </button>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ─── GUEST FORM ─── */}
            {step === "guest" && (
              <motion.div
                key="guest"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <Card className="glass">
                  <CardContent className="py-6">
                    <button
                      type="button"
                      onClick={() => setStep("choose")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1"
                    >
                      ← Back
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted">
                        <User className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Quick Guest Access</h3>
                        <p className="text-xs text-muted-foreground">Table #{table?.number} · {table?.section}</p>
                      </div>
                    </div>

                    {formError && (
                      <div className="bg-destructive/10 text-destructive text-xs rounded-lg p-3 mb-4">
                        {formError}
                      </div>
                    )}

                    <form onSubmit={handleGuestContinue} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="guest-name" className="text-xs">Your Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            id="guest-name"
                            type="text"
                            placeholder="What should we call you?"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="pl-10"
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <><Loader2 className="size-4 animate-spin mr-2" /> Setting Up...</>
                        ) : (
                          <>Book Table & Start Ordering <ArrowRight className="size-4 ml-2" /></>
                        )}
                      </Button>

                      <div className="bg-warning/10 rounded-lg p-3 mt-2">
                        <p className="text-[11px] text-warning flex items-start gap-2">
                          <Gift className="size-3.5 shrink-0 mt-0.5" />
                          <span>
                            <strong>Tip:</strong> Create an account to earn loyalty points and get exclusive offers on your next visit!
                          </span>
                        </p>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ─── BOOKING IN PROGRESS ─── */}
            {step === "booking" && (
              <motion.div
                key="booking"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-4 py-20"
              >
                <Loader2 className="size-12 text-primary animate-spin" />
                <p className="text-muted-foreground text-sm">Booking your table...</p>
              </motion.div>
            )}

            {/* ─── CONFIRMED ─── */}
            {step === "confirmed" && bookingResult && (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <Card className="glass overflow-hidden">
                  {/* Success Header */}
                  <div className="bg-gradient-to-r from-success/15 via-success/5 to-transparent p-6 text-center border-b border-border/50">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                      <CheckCircle2 className="size-16 text-success mx-auto mb-3" />
                    </motion.div>
                    <h2 className="text-xl font-bold">Table Booked!</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      You're all set. Welcome to {APP_NAME}!
                    </p>
                  </div>

                  <CardContent className="py-5">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Table</p>
                        <p className="text-2xl font-bold mt-1">#{bookingResult.table.number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Section</p>
                        <p className="text-lg font-semibold mt-1">{bookingResult.table.section}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Party Size</p>
                        <p className="text-lg font-semibold mt-1">{bookingResult.reservation.partySize}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge variant="success" className="mt-1">Seated</Badge>
                      </div>
                    </div>

                    {isGuest && (
                      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted-foreground flex items-start gap-2">
                          <Sparkles className="size-3.5 text-primary shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-foreground">Want offers?</strong> Sign up before you leave to earn loyalty points for this visit!
                          </span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button onClick={goToMenu} className="w-full" size="lg">
                  <Utensils className="size-4 mr-2" />
                  Browse Menu & Order
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
