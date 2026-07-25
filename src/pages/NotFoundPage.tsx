import { Link } from "react-router-dom";
import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-bold text-muted-foreground/30">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild className="mt-8 gap-2">
        <Link to={ROUTES.landing}>
          <Home className="size-4" />
          Back to home
        </Link>
      </Button>
    </div>
  );
}
