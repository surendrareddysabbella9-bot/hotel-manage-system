import { useState, useEffect } from "react";
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
  const { loginWithEmail, user, logout } = useAuth();

  const [email, setEmail] = useState<string>(location.state?.prefillEmail || "admin@gmail.com");
  const [password, setPassword] = useState("Admin@123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg] = useState<string>(location.state?.successMessage || "");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Automatically clear session if visiting login page while authenticated
  useEffect(() => {
    if (user) {
      logout();
    }
  }, []);

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#030712] relative overflow-hidden font-sans">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/djpbf946o/image/upload/v1709210214/grid_pattern.svg')] bg-[length:32px_32px] opacity-10 pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-[420px] bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl shadow-2xl shadow-indigo-900/10 p-10 relative z-10 mx-4">
        
        {/* Header */}
        <div className="flex flex-col items-center space-y-4 mb-10 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
            <div className="p-3.5 bg-gradient-to-b from-indigo-500/20 to-indigo-900/20 rounded-2xl border border-indigo-500/30 relative z-10 flex items-center justify-center">
              <Shield className="size-8 text-indigo-400" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-white">System Admin</h2>
            <p className="text-sm font-medium text-zinc-400/80 uppercase tracking-widest">
              Secure Terminal Access
            </p>
          </div>
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
            <Label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@restaurantos.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-indigo-500 focus-visible:bg-zinc-900 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Passphrase</Label>
              <Link
                to={ROUTES.forgotPassword}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
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
              className="h-12 rounded-xl bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-indigo-500 focus-visible:bg-zinc-900 transition-all"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-sm font-bold tracking-wide rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] bg-indigo-600 hover:bg-indigo-500 text-white border-0 mt-6 transition-all"
            disabled={isSubmitting}
          >
            <Key className="size-4 mr-2" />
            {isSubmitting ? "Authenticating..." : "AUTHORIZE ACCESS"}
          </Button>
        </form>
      </div>
    </div>
  );
}
