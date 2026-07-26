import { useEffect, useState } from "react";
import { Sparkles, Plus } from "lucide-react";
import { aiService } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AIRecommendationsProps {
  cart: any[];
  onAdd: (item: any) => void;
}

export function AIRecommendations({ cart, onAdd }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      setRecommendations([]);
      return;
    }

    const fetchRecs = async () => {
      setIsLoading(true);
      try {
        const res = await aiService.getRecommendations(cart);
        setRecommendations(res.recommendations || []);
      } catch (err) {
        console.error("Failed to get AI recommendations", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce slightly to avoid spamming the AI on every quick quantity change
    const timeout = setTimeout(fetchRecs, 1000);
    return () => clearTimeout(timeout);
  }, [cart]);

  if (cart.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <h3 className="font-semibold text-lg">Smart Pairings</h3>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recommendations.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-3 flex items-center gap-3">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="size-12 rounded-md object-cover" />
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">₹{Number(item.price).toFixed(2)}</p>
                </div>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="size-8 rounded-full"
                  onClick={() => onAdd({
                    id: item.id, // For cart, we use item.id as menu item id
                    menuItemId: item.id,
                    name: item.name,
                    price: Number(item.price),
                    imageUrl: item.image_url
                  })}
                >
                  <Plus className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No recommendations at this time.</p>
      )}
    </div>
  );
}
