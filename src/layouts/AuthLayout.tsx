import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES } from "@/constants";

interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function AuthLayout({
  title = "Welcome back",
  subtitle = "Sign in to your RestaurantOS account",
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen relative">
      {/* Home Button / Logo */}
      <Link to={ROUTES.landing} className="absolute top-4 left-6 z-50 flex items-center gap-2 font-semibold bg-background/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border hover:bg-background/80 transition-colors">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
          R
        </div>
        <span className="hidden sm:inline-block">RestaurantOS</span>
      </Link>
      
      <div className="hidden w-1/2 flex-col justify-between bg-card p-12 lg:flex">
        <div>
          <h2 className="mt-12 text-3xl font-semibold tracking-tight text-balance">
            Intelligent Restaurant Management
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Streamline operations, optimize kitchen workflows, and deliver
            exceptional dining experiences with AI-powered insights.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 RestaurantOS. Built for Vibeathon 6.0.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
