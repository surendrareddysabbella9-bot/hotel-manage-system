import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChefHat, ShieldAlert } from "lucide-react";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-100 p-4 font-mono">
      <div className="w-full max-w-sm bg-white border-2 border-zinc-900 rounded-none shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] p-8">
        
        <div className="flex flex-col items-center space-y-4 mb-8 text-center border-b-2 border-dashed border-zinc-300 pb-6">
          <div className="p-4 bg-zinc-900 text-white rounded-full">
            <ChefHat className="size-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-900">Staff POS</h2>
            <p className="text-xs font-bold text-zinc-500 uppercase mt-1">
              Terminal Login
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 border-2 border-green-600 bg-green-50 p-3 text-sm font-bold text-green-700 flex items-center gap-2">
            <span>✓ {successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 border-2 border-red-600 bg-red-50 p-3 text-sm font-bold text-red-700 flex items-center gap-2">
            <ShieldAlert className="size-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold uppercase text-zinc-900">Staff ID (Email)</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. waiter1@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-2 border-zinc-900 rounded-none text-base font-medium focus-visible:ring-0 focus-visible:border-primary focus-visible:bg-primary/5"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-bold uppercase text-zinc-900">Passcode</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-2 border-zinc-900 rounded-none text-base font-medium focus-visible:ring-0 focus-visible:border-primary focus-visible:bg-primary/5"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-black uppercase rounded-none border-2 border-transparent hover:border-zinc-900 bg-zinc-900 text-white transition-all shadow-[4px_4px_0px_0px_rgba(24,24,27,0.3)] active:shadow-none active:translate-x-1 active:translate-y-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Authenticating..." : "Clock In"}
          </Button>

          <div className="text-center pt-4">
            <Link
              to={ROUTES.forgotPassword}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900 uppercase underline decoration-2 underline-offset-4"
            >
              Reset Passcode
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
