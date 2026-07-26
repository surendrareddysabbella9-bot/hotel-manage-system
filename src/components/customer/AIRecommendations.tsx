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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-indigo-500 animate-pulse" />
          <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            AI Chef's Pairings
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Sparkles className="size-3 text-indigo-500" />
          <span className="text-[10px] font-bold text-indigo-500 tracking-wider uppercase">Powered by Gemini</span>
        </div>
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
            <Card key={item.id} className="overflow-hidden border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-shadow">
              <CardContent className="p-3 flex items-center gap-3 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="size-12 rounded-md object-cover ring-2 ring-indigo-500/20" />
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-semibold line-clamp-1">{item.name}</h4>
                  <p className="text-xs font-medium text-indigo-600/70">₹{Number(item.price).toFixed(2)}</p>
                </div>
                <Button 
                  size="icon" 
                  className="size-8 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
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
