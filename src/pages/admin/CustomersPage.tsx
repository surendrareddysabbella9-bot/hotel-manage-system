import { useState } from "react";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyTier: "Gold" | "Silver" | "Platinum";
}

const mockCustomersList: CustomerRecord[] = [
  { id: "cust-001", name: "Sarah Chen", email: "sarah@example.com", phone: "+1 555-0192", totalOrders: 14, totalSpent: 642.50, loyaltyTier: "Gold" },
  { id: "cust-002", name: "Michael Torres", email: "michael@example.com", phone: "+1 555-0184", totalOrders: 8, totalSpent: 380.00, loyaltyTier: "Silver" },
  { id: "cust-003", name: "Lisa Anderson", email: "lisa@example.com", phone: "+1 555-0129", totalOrders: 22, totalSpent: 1250.00, loyaltyTier: "Platinum" },
  { id: "cust-004", name: "James Wilson", email: "james@example.com", phone: "+1 555-0177", totalOrders: 5, totalSpent: 210.00, loyaltyTier: "Silver" },
];

export function CustomersPage() {
  const [search, setSearch] = useState("");
  const [selectedCust, setSelectedCust] = useState<CustomerRecord | null>(null);

  const filtered = mockCustomersList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns: DataTableColumn<CustomerRecord>[] = [
    { key: "name", header: "Customer Name" },
    { key: "email", header: "Email Address" },
    { key: "totalOrders", header: "Orders Placed" },
    { key: "totalSpent", header: "Lifetime Spent", render: (c) => `$${c.totalSpent.toFixed(2)}` },
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
      key: "actions",
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

      <DataTable data={filtered} columns={columns} keyExtractor={(c) => c.id} />

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
              <p><span className="font-semibold">Lifetime Spent:</span> ${selectedCust.totalSpent.toFixed(2)}</p>
              <p><span className="font-semibold">Loyalty Status:</span> {selectedCust.loyaltyTier} Tier</p>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
