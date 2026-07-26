import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, Filter, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FoodCard } from "@/components/cards/FoodCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ROUTES } from "@/constants";
import { useMenu } from "@/hooks/useMenu";
import { useCart } from "@/hooks/useCart";
import type { MenuItem } from "@/types";

export function DigitalMenuPage() {
  const { categories, items, isLoading } = useMenu();

  const { cart, addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

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
    <div className="space-y-6 pb-20">
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
            className="pl-9"
          />
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
