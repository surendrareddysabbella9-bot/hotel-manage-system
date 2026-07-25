import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, UserCheck, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants";
import type { UserRole } from "@/types";

export function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("admin@restaurantos.app");
  const [password, setPassword] = useState("password123");

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === "admin") {
      setEmail("admin@restaurantos.app");
      setPassword("admin123");
    } else if (role === "staff") {
      setEmail("chef@restaurantos.app");
      setPassword("staff123");
    } else {
      setEmail("sarah@example.com");
      setPassword("customer123");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === "admin") {
      navigate(ROUTES.admin.dashboard);
    } else if (selectedRole === "staff") {
      navigate(ROUTES.staff.kitchen);
    } else {
      navigate(ROUTES.customer.home);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Selection */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Select Role Persona (Demo)
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant={selectedRole === "admin" ? "default" : "outline"}
            size="sm"
            className="flex flex-col items-center gap-1 py-3 text-xs"
            onClick={() => handleRoleSelect("admin")}
          >
            <ShieldCheck className="size-4" />
            Admin
          </Button>
          <Button
            type="button"
            variant={selectedRole === "staff" ? "default" : "outline"}
            size="sm"
            className="flex flex-col items-center gap-1 py-3 text-xs"
            onClick={() => handleRoleSelect("staff")}
          >
            <Utensils className="size-4" />
            Staff
          </Button>
          <Button
            type="button"
            variant={selectedRole === "customer" ? "default" : "outline"}
            size="sm"
            className="flex flex-col items-center gap-1 py-3 text-xs"
            onClick={() => handleRoleSelect("customer")}
          >
            <UserCheck className="size-4" />
            Customer
          </Button>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Sign in as {selectedRole.toUpperCase()}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to={ROUTES.signup} className="font-medium text-foreground hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

