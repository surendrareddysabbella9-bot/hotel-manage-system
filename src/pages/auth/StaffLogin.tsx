import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChefHat, ShieldAlert, Mail, Lock, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants";
import { useAuth } from "@/app/providers/AuthContext";

export function StaffLogin() {
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
      
      if (loggedUser.role !== "staff" && loggedUser.role !== "admin") {
        setErrorMsg("Access Denied: Staff ID required.");
        return;
      }

      navigate(ROUTES.staff.kitchen);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Invalid credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 p-4 font-sans text-slate-900 relative overflow-hidden">
      {/* Decorative ambient background blur elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Admin-Style Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-8 sm:p-10 relative z-10 transition-all">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3.5 bg-gradient-to-tr from-amber-500 to-amber-600 text-white rounded-2xl shadow-lg shadow-amber-500/20 ring-4 ring-amber-500/10 flex items-center justify-center">
            <ChefHat className="size-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-4">STAFF POS</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
            Terminal Login
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-sm font-medium text-emerald-800 flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-sm font-medium text-rose-800 flex items-start gap-3 shadow-xs">
            <ShieldAlert className="size-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Staff ID (EMAIL)
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="e.g. waiter1@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 pl-10 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Passcode Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Passcode
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pl-10 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Clock In</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>

          {/* Reset Passcode Link */}
          <div className="text-center pt-2">
            <Link
              to={ROUTES.forgotPassword}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider hover:underline underline-offset-4"
            >
              Reset Passcode
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

