import { Clock, Plus, Star } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency, FALLBACK_FOOD_IMAGE } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types";

interface FoodCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  className?: string;
}

export function FoodCard({ item, onAddToCart, className }: FoodCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("group h-full", className)}
    >
      <Card className="h-full flex flex-col overflow-hidden bg-background/60 backdrop-blur-xl border-border/40 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48 shrink-0 overflow-hidden">
          <img
            src={item.imageUrl || FALLBACK_FOOD_IMAGE}
            alt={item.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_FOOD_IMAGE;
            }}
          />
          {item.popular && (
            <Badge className="absolute left-3 top-3 gap-1" variant="warning">
              <Star className="size-3" aria-hidden="true" />
              Popular
            </Badge>
          )}
          <Badge
            className="absolute right-3 top-3"
            variant={item.available ? "success" : "destructive"}
          >
            {item.available ? "Available" : "Unavailable"}
          </Badge>
        </div>
        <div className="flex-1 flex flex-col">
          <CardContent className="space-y-2 p-4 flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold leading-tight">{item.name}</h3>
              <span className="shrink-0 font-semibold text-primary">
                {formatCurrency(item.price)}
              </span>
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-2">
              <Clock className="size-3.5" aria-hidden="true" />
              <span>{item.preparationTime} min prep</span>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 shrink-0">
            <Button
              className="w-full gap-2 bg-primary/90 hover:bg-primary backdrop-blur-sm shadow-sm"
              disabled={!item.available}
              onClick={() => onAddToCart?.(item)}
            >
              <Plus className="size-4" />
              Add to Cart
            </Button>
          </CardFooter>
        </div>
      </Card>
    </motion.article>
  );
}
