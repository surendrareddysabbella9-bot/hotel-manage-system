import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants";
import { useAuth } from "@/app/providers/AuthContext";
import type { UserRole } from "@/types";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail } = useAuth();

  // Detect which portal login page is active
  const pathname = location.pathname;
  let targetPortal: "Customer" | "Admin" | "Staff" = "Customer";
  let targetRole: UserRole = "customer";

  if (pathname.includes("/admin")) {
    targetPortal = "Admin";
    targetRole = "admin";
  } else if (pathname.includes("/staff")) {
    targetPortal = "Staff";
    targetRole = "staff";
  }

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

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await loginWithEmail(email, password);

      // Verify user's role from profiles table against target portal requirement
      if (loggedUser.role !== targetRole) {
        setErrorMsg(
          `You do not have permission to access the ${targetPortal} Portal.`
        );
        return;
      }

      // Navigate to portal home on successful authorization
      if (targetRole === "admin") {
        navigate(ROUTES.admin.dashboard);
      } else if (targetRole === "staff") {
        navigate(ROUTES.staff.kitchen);
      } else {
        navigate(ROUTES.customer.home);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Invalid email or password. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          {targetPortal} Portal Sign In
        </h2>
        <p className="text-xs text-muted-foreground">
          Enter your account credentials to access the {targetPortal.toLowerCase()} console
        </p>
      </div>

      {successMsg && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-xs font-semibold text-green-400 flex items-center gap-2">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive flex items-center gap-2">
          <ShieldAlert className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@restaurantos.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Label htmlFor="password">Password</Label>
            <Link
              to={ROUTES.forgotPassword}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
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
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full gap-2 font-semibold"
          disabled={isSubmitting}
        >
          <LogIn className="size-4" />{" "}
          {isSubmitting ? "Authenticating..." : `Sign In to ${targetPortal}`}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <GoogleLoginButton />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          to={ROUTES.signup}
          className="font-medium text-foreground hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
