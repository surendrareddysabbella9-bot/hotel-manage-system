import { PageHeader } from "@/components/shared/PageHeader";
import { ChartsPlaceholder } from "@/components/shared/ChartsPlaceholder";
import { StatisticsCard } from "@/components/shared/StatisticsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAnalytics } from "@/hooks/useAnalytics";

export function AnalyticsPage() {
  const { data, isLoading, error, isEmpty, refetch } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Business Intelligence & Analytics"
          description="Comprehensive performance metrics, revenue growth trends, and menu item demand"
        />
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Business Intelligence & Analytics"
          description="Comprehensive performance metrics, revenue growth trends, and menu item demand"
        />
        <ErrorState
          title="Failed to load analytics data"
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
          title="Business Intelligence & Analytics"
          description="Comprehensive performance metrics, revenue growth trends, and menu item demand"
        />
        <EmptyState
          title="No analytics data available"
          description="There is currently no transaction data available in the database to calculate business metrics."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Business Intelligence & Analytics"
        description="Comprehensive performance metrics, revenue growth trends, and menu item demand"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticsCard id="stat-rev" label="Monthly Revenue" value={data.monthlyRevenue} change={data.monthlyRevenueChange} changeLabel="vs last month" icon="DollarSign" />
        <StatisticsCard id="stat-aov" label="Avg Order Value" value={data.avgOrderValue} change={data.avgOrderValueChange} changeLabel="vs last week" icon="TrendingUp" />
        <StatisticsCard id="stat-turnover" label="Table Turnover Rate" value={data.turnoverRate} change={data.turnoverChange} changeLabel="faster prep" icon="Clock" />
        <StatisticsCard id="stat-retention" label="Customer Retention" value={data.customerRetention} change={data.customerRetentionChange} changeLabel="repeat diners" icon="Award" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartsPlaceholder id="rev-progression" title="Monthly Revenue Progression (₹)" description="Comparative revenue growth across Q1 - Q3" />
        <ChartsPlaceholder id="peak-hours-heatmap" title="Peak Dining Hours Heatmap" description="Order density across morning, lunch, and dinner shifts" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Top Performing Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border text-sm">
            {data.topDishes.map((dish, idx) => (
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
