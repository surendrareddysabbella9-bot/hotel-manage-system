import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ChartPlaceholderConfig } from "@/types";

interface ChartsPlaceholderProps extends ChartPlaceholderConfig {
  className?: string;
}

export function ChartsPlaceholder({
  title,
  description,
  height = 280,
  className,
}: ChartsPlaceholderProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div
          className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30"
          style={{ height }}
          role="img"
          aria-label={`${title} chart placeholder`}
        >
          <BarChart3 className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            Chart visualization
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Connect analytics data source to render
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
