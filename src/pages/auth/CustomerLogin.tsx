import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants";
import { useAuth } from "@/app/providers/AuthContext";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export function CustomerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail } = useAuth();

  const [email, setEmail] = useState<string>(location.state?.prefillEmail || "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg] = useState<string>(location.state?.successMessage || "");
  const [errorMsg, setErrorMsg] = useState<string>(
    location.state?.unauthorized ? (location.state?.message || "") : ""
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await loginWithEmail(email, password);
      
      if (loggedUser.role !== "customer") {
        setErrorMsg("This portal is for diners only.");
        return;
      }

      navigate(ROUTES.customer.home);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Invalid email or password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Left Side - Image / Branding */}
      <div className="md:w-1/2 lg:w-3/5 relative hidden md:block overflow-hidden bg-primary/10">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2574&auto=format&fit=crop"
          alt="Restaurant Interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 lg:p-24 text-white">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Welcome to RestaurantOS</h1>
          <p className="text-lg lg:text-xl text-white/80 max-w-lg">
            Experience seamless dining. Order ahead, skip the queue, and enjoy personalized culinary recommendations.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Sign In</h2>
            <p className="text-sm text-muted-foreground">
              Welcome back! Please enter your details.
            </p>
          </div>

          {successMsg && (
            <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm font-semibold text-success flex items-center gap-2">
              <span>✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive flex items-center gap-2">
              <ShieldAlert className="size-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to={ROUTES.forgotPassword}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-lg"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold rounded-lg shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-semibold">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleLoginButton />

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don&apos;t have an account?{" "}
            <Link
              to={ROUTES.signup}
              className="font-semibold text-primary hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
