import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatisticsCard } from "@/components/shared/StatisticsCard";
import { ChartsPlaceholder } from "@/components/shared/ChartsPlaceholder";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants";
import { useDashboard } from "@/hooks/useDashboard";
import type { Order } from "@/types";

export function AdminDashboardPage() {
  const { data, isLoading, error, isEmpty, refetch } = useDashboard();

  const columns: DataTableColumn<Order>[] = [
    { key: "orderNumber", header: "Order #", render: (o) => `#${o.orderNumber}` },
    { key: "customerName", header: "Customer" },
    { key: "tableNumber", header: "Table", render: (o) => o.tableNumber ? `Table ${o.tableNumber}` : "Takeout" },
    {
      key: "status",
      header: "Status",
      render: (o) => (
        <Badge variant={o.status === "ready" ? "success" : o.status === "cooking" ? "default" : "warning"} className="capitalize">
          {o.status}
        </Badge>
      ),
    },
    { key: "total", header: "Total", render: (o) => `₹${o.total.toFixed(2)}` },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Executive Overview"
          description="Real-time operational summary and key restaurant metrics"
        />
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Executive Overview"
          description="Real-time operational summary and key restaurant metrics"
        />
        <ErrorState
          title="Failed to load dashboard data"
          message={error.message}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (isEmpty || !data) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Executive Overview"
          description="Real-time operational summary and key restaurant metrics"
        />
        <EmptyState
          title="No dashboard data found"
          description="There is currently no metric data available from the database."
          actionLabel="Refresh Data"
          onAction={refetch}
        />
      </div>
    );
  }

  const { stats, lowStockItems, recentOrders } = data;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Executive Overview"
        description="Real-time operational summary and key restaurant metrics"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatisticsCard
            key={stat.id}
            id={stat.id}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            changeLabel={stat.changeLabel}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartsPlaceholder
            id="daily-sales-chart"
            title="Daily Sales & Order Velocity"
            description="Hourly revenue breakdown comparing today vs average weekday"
          />
        </div>

        <Card className="border-warning/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-warning">
              <AlertTriangle className="size-4" /> Stock Alerts ({lowStockItems.length})
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.admin.inventory}>View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">All inventory items are fully stocked.</p>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 text-xs">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-muted-foreground">{item.quantity} {item.unit} remaining (Min: {item.minThreshold})</p>
                  </div>
                  <Badge variant={item.status === "out_of_stock" ? "destructive" : "warning"}>
                    {item.status === "out_of_stock" ? "Out" : "Low"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">Recent Live Orders</h3>
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.admin.orders} className="gap-1">
              All Orders <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
        <DataTable data={recentOrders} columns={columns} keyExtractor={(o) => o.id} />
      </div>
    </div>
  );
}
