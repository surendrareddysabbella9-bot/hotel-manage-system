import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatisticsCard } from "@/components/shared/StatisticsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AIInsightsPanel } from "@/components/admin/AIInsightsPanel";

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

      <AIInsightsPanel />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticsCard id="stat-rev" label="Monthly Revenue" value={data.monthlyRevenue} change={data.monthlyRevenueChange} changeLabel="vs last month" icon="DollarSign" />
        <StatisticsCard id="stat-aov" label="Avg Order Value" value={data.avgOrderValue} change={data.avgOrderValueChange} changeLabel="vs last week" icon="TrendingUp" />
        <StatisticsCard id="stat-turnover" label="Table Turnover Rate" value={data.turnoverRate} change={data.turnoverChange} changeLabel="faster prep" icon="Clock" />
        <StatisticsCard id="stat-retention" label="Customer Retention" value={data.customerRetention} change={data.customerRetentionChange} changeLabel="repeat diners" icon="Award" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monthly Revenue Progression (₹)</CardTitle>
            <p className="text-sm text-muted-foreground">Comparative revenue growth across Q1 - Q3</p>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak Dining Hours Heatmap (BarChart) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Peak Dining Hours Heatmap</CardTitle>
            <p className="text-sm text-muted-foreground">Order density across morning, lunch, and dinner shifts</p>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.peakHoursData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value} Orders`, 'Density']}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
