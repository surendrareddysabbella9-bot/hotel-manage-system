import type { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/types";

interface StatisticsCardProps extends DashboardStat {
  className?: string;
  index?: number;
}

export function StatisticsCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  className,
  index = 0,
}: StatisticsCardProps) {
  const Icon = (Icons[icon as keyof typeof Icons] as LucideIcon) ?? Icons.Activity;
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <div className="rounded-lg bg-muted p-2">
            <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              {isPositive ? (
                <TrendingUp className="size-3 text-success" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3 text-destructive" aria-hidden="true" />
              )}
              <span className={isPositive ? "text-success" : "text-destructive"}>
                {isPositive ? "+" : ""}
                {change}%
              </span>
              {changeLabel && <span>{changeLabel}</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
