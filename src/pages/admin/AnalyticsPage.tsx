import { PageHeader } from "@/components/shared/PageHeader";
import { ChartsPlaceholder } from "@/components/shared/ChartsPlaceholder";
import { StatisticsCard } from "@/components/shared/StatisticsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AnalyticsPage() {
  const topDishes = [
    { name: "Wagyu Ribeye", orders: 142, revenue: "$9,656.00" },
    { name: "Truffle Arancini", orders: 210, revenue: "$3,045.00" },
    { name: "Dark Chocolate Soufflé", orders: 185, revenue: "$2,220.00" },
    { name: "Smoked Old Fashioned", orders: 310, revenue: "$4,960.00" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Business Intelligence & Analytics"
        description="Comprehensive performance metrics, revenue growth trends, and menu item demand"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticsCard id="stat-rev" label="Monthly Revenue" value="$48,920" change={14.2} changeLabel="vs last month" icon="DollarSign" />
        <StatisticsCard id="stat-aov" label="Avg Order Value" value="$64.50" change={3.8} changeLabel="vs last week" icon="TrendingUp" />
        <StatisticsCard id="stat-turnover" label="Table Turnover Rate" value="42 min" change={-5.1} changeLabel="faster prep" icon="Clock" />
        <StatisticsCard id="stat-retention" label="Customer Retention" value="68%" change={8.4} changeLabel="repeat diners" icon="Award" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartsPlaceholder id="rev-progression" title="Monthly Revenue Progression ($)" description="Comparative revenue growth across Q1 - Q3" />
        <ChartsPlaceholder id="peak-hours-heatmap" title="Peak Dining Hours Heatmap" description="Order density across morning, lunch, and dinner shifts" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Top Performing Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border text-sm">
            {topDishes.map((dish, idx) => (
              <div key={dish.name} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="size-6 rounded-full flex items-center justify-center p-0 text-xs font-bold">
                    #{idx + 1}
                  </Badge>
                  <div>
                    <p className="font-semibold">{dish.name}</p>
                    <p className="text-xs text-muted-foreground">{dish.orders} total orders</p>
                  </div>
                </div>
                <span className="font-bold text-primary">{dish.revenue}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
