import { useState } from "react";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCustomers } from "@/hooks/useCustomers";
import type { CustomerRecord } from "@/services/customerService";

export function CustomersPage() {
  const { customers, isLoading, error, isEmpty, refetch } = useCustomers();
  const [search, setSearch] = useState("");
  const [selectedCust, setSelectedCust] = useState<CustomerRecord | null>(null);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns: DataTableColumn<CustomerRecord>[] = [
    { key: "name", header: "Customer Name" },
    { key: "email", header: "Email Address" },
    { key: "totalOrders", header: "Orders Placed" },
    { key: "totalSpent", header: "Lifetime Spent", render: (c) => `₹${c.totalSpent.toFixed(2)}` },
    {
      key: "loyaltyTier",
      header: "Loyalty Tier",
      render: (c) => (
        <Badge variant={c.loyaltyTier === "Platinum" ? "default" : c.loyaltyTier === "Gold" ? "warning" : "outline"}>
          {c.loyaltyTier}
        </Badge>
      ),
    },
    {
      key: "id",
      header: "Action",
      render: (c) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedCust(c)}>
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Directory" description="View dining profiles, order frequencies, and loyalty membership tiers" />

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="table" count={5} />
      ) : error ? (
        <ErrorState title="Failed to load customer directory" message={error.message} onRetry={refetch} />
      ) : isEmpty ? (
        <EmptyState title="No customer profiles found" description="There are currently no customer profiles registered in Supabase." />
      ) : (
        <DataTable data={filtered} columns={columns} keyExtractor={(c) => c.id} />
      )}

      <Dialog open={!!selectedCust} onOpenChange={(open) => !open && setSelectedCust(null)}>
        {selectedCust && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedCust.name}</DialogTitle>
              <DialogDescription>{selectedCust.email}</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-sm">
              <p><span className="font-semibold">Phone:</span> {selectedCust.phone}</p>
              <p><span className="font-semibold">Total Orders:</span> {selectedCust.totalOrders}</p>
              <p><span className="font-semibold">Lifetime Spent:</span> ₹{selectedCust.totalSpent.toFixed(2)}</p>
              <p><span className="font-semibold">Loyalty Status:</span> {selectedCust.loyaltyTier} Tier</p>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
