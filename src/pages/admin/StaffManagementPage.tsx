import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useStaff } from "@/hooks/useStaff";
import type { StaffMember } from "@/types";

export function StaffManagementPage() {
  const { staffList, isLoading, error, isEmpty, refetch, addStaffMember } = useStaff();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffMember["role"]>("chef");
  const [shift, setShift] = useState("Evening");

  const filtered = staffList.filter((s) =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Omit<StaffMember, "id"> = {
      fullName,
      email,
      role,
      status: "active",
      shift,
    };
    await addStaffMember(newMember);
    setIsAddOpen(false);
    setFullName("");
    setEmail("");
  };

  const columns: DataTableColumn<StaffMember>[] = [
    { key: "fullName", header: "Staff Name" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (s) => (
        <Badge variant="outline" className="capitalize">
          {s.role}
        </Badge>
      ),
    },
    { key: "shift", header: "Shift" },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <Badge variant={s.status === "active" ? "success" : "muted"} className="capitalize">
          {s.status.replace("_", " ")}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <PageHeader title="Staff & Roster Management" description="Manage restaurant team members, roles, permissions, and shifts" />
        <Button className="gap-2 shrink-0" onClick={() => setIsAddOpen(true)}>
          <Plus className="size-4" /> Add Staff Member
        </Button>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="table" count={5} />
      ) : error ? (
        <ErrorState title="Failed to load staff roster" message={error.message} onRetry={refetch} />
      ) : isEmpty ? (
        <EmptyState title="No staff members found" description="There are currently no staff profiles registered in the database." />
      ) : (
        <DataTable data={filtered} columns={columns} keyExtractor={(s) => s.id} />
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>Register a new staff member to the restaurant roster</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddStaff} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="e.g. David Miller" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="david@restaurantos.app" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffMember["role"])}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
                >
                  <option value="chef">Chef / Kitchen</option>
                  <option value="waiter">Waiter / Server</option>
                  <option value="manager">Manager</option>
                  <option value="host">Host</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <select
                  id="shift"
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-1 focus:ring-ring"
                >
                  <option value="Morning">Morning Shift</option>
                  <option value="Evening">Evening Shift</option>
                  <option value="Night">Night Shift</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full">Save Staff Member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
