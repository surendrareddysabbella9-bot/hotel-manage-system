import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, ShieldAlert, Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants";
import { useAuth } from "@/app/providers/AuthContext";

export function AdminLogin() {
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
      
      if (loggedUser.role !== "admin") {
        setErrorMsg("Access Denied: You do not have Administrator privileges.");
        return;
      }

      navigate(ROUTES.admin.dashboard);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Invalid email or password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
      
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 relative z-10 text-zinc-100">
        <div className="flex flex-col items-center space-y-3 mb-8 text-center">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Shield className="size-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Admin Console</h2>
          <p className="text-sm text-zinc-400">
            Secure management dashboard access
          </p>
        </div>

        {successMsg && (
          <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-400 flex items-center gap-2">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm font-semibold text-red-400 flex items-center gap-2">
            <ShieldAlert className="size-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Admin Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@restaurantos.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-lg bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Link
                to={ROUTES.forgotPassword}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-indigo-500"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold rounded-lg shadow-md bg-indigo-600 hover:bg-indigo-700 text-white border-0 mt-4"
            disabled={isSubmitting}
          >
            <Key className="size-4 mr-2" />
            {isSubmitting ? "Authenticating..." : "Authorize Access"}
          </Button>
        </form>
      </div>
    </div>
  );
}
