import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/AuthContext";

export function GuestUpsellBanner() {
  const { isGuest } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (!isGuest || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-warning/10 border-b border-primary/20">
          <div className="page-container flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <Gift className="size-4 text-primary shrink-0" />
              <p className="text-xs text-foreground truncate">
                <span className="font-semibold">Create an account</span>{" "}
                <span className="text-muted-foreground">to earn loyalty points & unlock exclusive offers on your next visit!</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="default"
                className="h-7 text-xs px-3 gap-1"
                onClick={() => navigate("/signup")}
              >
                Sign Up <ArrowRight className="size-3" />
              </Button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
