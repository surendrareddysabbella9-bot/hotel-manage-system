import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, Filter, Check, Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FoodCard } from "@/components/cards/FoodCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ROUTES } from "@/constants";
import { apiFetch } from "@/lib/api";
import { useMenu } from "@/hooks/useMenu";
import { useCart } from "@/hooks/useCart";
import type { MenuItem } from "@/types";

export function DigitalMenuPage() {
  const { categories, items, isLoading } = useMenu();

  const { cart, addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // AI Predictive Search States
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced predictive search effect
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsPredicting(true);
      try {
        const res = await apiFetch('/ai/autocomplete', {
          method: 'POST',
          body: JSON.stringify({ query: searchQuery })
        });
        if (res.suggestions && res.suggestions.length > 0) {
          setSuggestions(res.suggestions);
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error('Autocomplete failed', err);
      } finally {
        setIsPredicting(false);
      }
    }, 1000); // 1-second debounce to save Gemini tokens!

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const tags = ["all", "signature", "vegetarian", "seafood", "gluten-free", "bestseller", "spicy"];

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "all" || item.tags.includes(selectedTag);
    return matchesCategory && matchesSearch && matchesTag;
  });

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl || ""
    });
  };

  const totalCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartPrice = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  return (
    <div className="relative min-h-screen space-y-6 pb-20 pt-4">
      {/* Subtle background gradient to make glassmorphism pop */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <PageHeader
        title="Digital Menu"
        description="Explore our chef-crafted dishes and handcrafted beverages"
      />

      {/* Search & Category Filter Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search dishes or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-9"
          />
          
          {/* AI Suggestions Dropdown */}
          {(showSuggestions || isPredicting) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 overflow-hidden flex flex-col">
              <div className="px-3 py-2 text-xs font-semibold text-primary bg-primary/5 border-b flex items-center gap-1">
                <Sparkles className="size-3" />
                AI Suggestions
              </div>
              {isPredicting ? (
                <div className="p-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Predicting...
                </div>
              ) : (
                suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                    onClick={() => {
                      setSearchQuery(s);
                      setShowSuggestions(false);
                    }}
                  >
                    {s}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <Button
            size="sm"
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
          >
            All Items
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Dietary Tags */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
        <Filter className="size-3.5 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground font-medium shrink-0">Tags:</span>
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? "default" : "outline"}
            className="cursor-pointer capitalize text-xs shrink-0"
            onClick={() => setSelectedTag(tag)}
          >
            {tag === selectedTag && <Check className="size-3 mr-1" />}
            {tag}
          </Badge>
        ))}
      </div>

      {/* Food Items Grid */}
      {isLoading ? (
        <LoadingSkeleton variant="card" count={6} />
      ) : filteredItems.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-2">
          {filteredItems.map((item) => (
            <FoodCard key={item.id} item={item} onAddToCart={handleAddToCart} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No menu items found"
          description="Try adjusting your search criteria or filters to find what you are looking for."
        />
      )}

      {/* Floating Cart Drawer Preview Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg rounded-full bg-primary text-primary-foreground p-3 px-6 shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="relative flex size-9 items-center justify-center rounded-full bg-primary-foreground/20">
              <ShoppingBag className="size-5" />
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {totalCartCount}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold">{totalCartCount} items selected</p>
              <p className="text-xs opacity-90">₹{totalCartPrice.toFixed(2)}</p>
            </div>
          </div>

          <Button size="sm" variant="secondary" className="rounded-full gap-2 font-semibold" asChild>
            <Link to={ROUTES.customer.cart}>
              View Cart & Checkout
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
