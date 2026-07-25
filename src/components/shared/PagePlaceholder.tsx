import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  features?: string[];
  className?: string;
}

export function PagePlaceholder({
  title,
  description,
  icon: Icon = Construction,
  features,
  className,
}: PagePlaceholderProps) {
  return (
    <section className={cn("space-y-8", className)}>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Icon className="size-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold">Coming in next sprint</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            This page shell is wired with routing and layout. Full UI will be
            implemented in a dedicated prompt.
          </p>
          {features && features.length > 0 && (
            <ul className="mt-6 space-y-2 text-left text-sm text-muted-foreground">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
