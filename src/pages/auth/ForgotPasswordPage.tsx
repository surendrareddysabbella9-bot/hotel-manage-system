import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants";
import { authService } from "@/services/authService";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFetchQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword(email);
      setSecurityQuestion(res.question);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch security question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityAnswer || !newPassword) return;

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await authService.resetPassword(email, securityAnswer, newPassword);
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password. Check your answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
        <p className="text-xs text-muted-foreground">
          {step === 1 && "Enter your email to retrieve your security question"}
          {step === 2 && "Answer your security question to reset password"}
          {step === 3 && "Password reset successful!"}
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive flex items-center gap-2">
          <ShieldAlert className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {step === 3 ? (
        <div className="rounded-lg border border-success/30 bg-success/10 p-6 text-center space-y-4">
          <CheckCircle2 className="mx-auto size-12 text-success" />
          <div>
            <h3 className="font-semibold text-lg">Reset Successful</h3>
            <p className="text-sm text-muted-foreground">
              Your password has been securely reset.
            </p>
          </div>
          <Button className="w-full" onClick={() => navigate(ROUTES.login)}>
            Return to Sign in
          </Button>
        </div>
      ) : step === 1 ? (
        <form className="space-y-6" onSubmit={handleFetchQuestion}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Searching..." : "Continue"}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Security Question</Label>
            <p className="font-medium">{securityQuestion}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="securityAnswer">Your Answer</Label>
            <Input
              id="securityAnswer"
              type="text"
              placeholder="Enter your answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
          
          <Button variant="ghost" type="button" className="w-full text-xs" onClick={() => setStep(1)}>
            Back
          </Button>
        </form>
      )}

      {step !== 3 && (
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to={ROUTES.login} className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
