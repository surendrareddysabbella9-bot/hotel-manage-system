import { useState } from "react";
import { AlertTriangle, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { InventoryCard } from "@/components/cards/InventoryCard";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useInventory } from "@/hooks/useInventory";
import { useAuth } from "@/app/providers/AuthContext";
import type { InventoryItem } from "@/types";

export function InventoryPage() {
  const { inventory, lowStockCount, isLoading, error, isEmpty, refetch, restockItem, updateItem } = useInventory();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState("10");

  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editThreshold, setEditThreshold] = useState("0");

  const filteredInventory = inventory.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const addQty = parseFloat(restockAmount) || 0;
    await restockItem(selectedItem.id, addQty);
    setSelectedItem(null);
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditThreshold(item.minThreshold.toString());
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    await updateItem(editingItem.id, {
      name: editName,
      category: editCategory,
      minThreshold: parseFloat(editThreshold) || 0,
    });
    setEditingItem(null);
  };

  const columns: DataTableColumn<InventoryItem>[] = [
    { key: "name", header: "Ingredient Name" },
    { key: "category", header: "Category" },
    { key: "quantity", header: "Current Stock", render: (i) => `${i.quantity} ${i.unit}` },
    { key: "minThreshold", header: "Threshold", render: (i) => `${i.minThreshold} ${i.unit}` },
    {
      key: "status",
      header: "Status",
      render: (i) => (
        <Badge variant={i.status === "in_stock" ? "success" : i.status === "low_stock" ? "warning" : "destructive"}>
          {i.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "id",
      header: "Action",
      render: (i) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setSelectedItem(i)}>
            Restock
          </Button>
          {user?.role === "admin" && (
            <Button size="sm" variant="secondary" onClick={() => openEditDialog(i)}>
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Raw Inventory & Stock Control" description="Track ingredient stock levels, receive automated low-stock warnings, and record restocks" />

      {lowStockCount > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 flex items-center justify-between text-warning">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">
              Attention: {lowStockCount} ingredient(s) are currently below minimum thresholds.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Search ingredient stock..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="card" count={6} />
      ) : error ? (
        <ErrorState title="Failed to load inventory" message={error.message} onRetry={refetch} />
      ) : isEmpty ? (
        <EmptyState title="No inventory items found" description="There are currently no raw ingredients in stock." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredInventory.map((item) => (
              <InventoryCard key={item.id} item={item} />
            ))}
          </div>

          <DataTable data={filteredInventory} columns={columns} keyExtractor={(i) => i.id} />
        </>
      )}

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        {selectedItem && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Restock {selectedItem.name}</DialogTitle>
              <DialogDescription>
                Current stock: {selectedItem.quantity} {selectedItem.unit} (Min Threshold: {selectedItem.minThreshold} {selectedItem.unit})
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRestock} className="space-y-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="qty">Add Quantity ({selectedItem.unit})</Label>
                <Input
                  id="qty"
                  type="number"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full">Confirm Restock</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        {editingItem && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit {editingItem.name}</DialogTitle>
              <DialogDescription>
                Update item details and stock thresholds.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCategory">Category</Label>
                <Input
                  id="editCategory"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editThreshold">Min Threshold ({editingItem.unit})</Label>
                <Input
                  id="editThreshold"
                  type="number"
                  value={editThreshold}
                  onChange={(e) => setEditThreshold(e.target.value)}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
