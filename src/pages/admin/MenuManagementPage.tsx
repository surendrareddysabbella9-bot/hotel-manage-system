import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useMenu } from "@/hooks/useMenu";
import type { MenuItem } from "@/types";

export function MenuManagementPage() {
  const { categories, items, isLoading, toggleAvailability, addMenuItem } = useMenu();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [category, setCategory] = useState(categories[0]?.id || "cat-001");
  const [description, setDescription] = useState("");

  const filteredItems = items.filter((i) => {
    const matchesCat = selectedCategory === "all" || i.categoryId === selectedCategory;
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: Omit<MenuItem, "id"> = {
      categoryId: category || categories[0]?.id || "cat-001",
      name,
      description,
      price: parseFloat(price) || 250.0,
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      preparationTime: parseInt(prepTime, 10) || 15,
      available: true,
      tags: ["new"],
    };

    await addMenuItem(newItem);
    setIsAddModalOpen(false);
    setName("");
    setPrice("");
    setPrepTime("");
    setDescription("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <PageHeader title="Menu Management" description="Create, update, and toggle restaurant menu items and categories" />
        <Button className="gap-2 shrink-0" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="size-4" /> Add Dish Item
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Search dishes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          <Button size="sm" variant={selectedCategory === "all" ? "default" : "outline"} onClick={() => setSelectedCategory("all")}>
            All
          </Button>
          {categories.map((c) => (
            <Button key={c.id} size="sm" variant={selectedCategory === c.id ? "default" : "outline"} onClick={() => setSelectedCategory(c.id)}>
              {c.name}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="card" count={6} />
      ) : filteredItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-4 space-y-3 flex flex-col justify-between">
              <div className="flex gap-3">
                <img src={item.imageUrl} alt={item.name} className="size-16 rounded-lg object-cover shrink-0" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-sm">{item.name}</h4>
                    <span className="font-bold text-primary text-sm">₹{item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs">
                <Badge variant={item.available ? "success" : "destructive"}>
                  {item.available ? "Available" : "Sold Out"}
                </Badge>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toggleAvailability(item.id)}>
                  Toggle Availability
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No menu items found"
          description="Try adjusting your category selection or search term."
        />
      )}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
            <DialogDescription>Enter details for the new dish item</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddItem} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Dish Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Butter Chicken Special" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" step="1" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="350" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prepTime">Prep Time (min)</Label>
                <Input id="prepTime" type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} required placeholder="15" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short dish description..." />
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full">Create Dish</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
