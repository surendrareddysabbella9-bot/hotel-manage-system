import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, ListFilter } from "lucide-react";
import { aiService } from "@/services/aiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AIInsightsPanel() {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await aiService.getAnalytics();
        setReport(res);
      } catch (err) {
        console.error("Failed to load AI analytics", err);
        setError("Failed to load AI insights. Make sure the Gemini API key is configured.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
            <Sparkles className="size-5" />
            Generating AI Operational Intelligence...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !report) {
    return null; // Fail gracefully or we could show an error box
  }

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
          <Sparkles className="size-5" />
          Gemini AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        
        {/* Demand Forecasting */}
        <div className="space-y-2 bg-background p-4 rounded-xl border border-border shadow-xs">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <TrendingUp className="size-4" />
            Demand Forecast
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {report.demandForecast || "Not enough data to forecast demand yet."}
          </p>
        </div>

        {/* Bottleneck Summary */}
        <div className="space-y-2 bg-background p-4 rounded-xl border border-border shadow-xs">
          <div className="flex items-center gap-2 text-sm font-semibold text-orange-500">
            <ListFilter className="size-4" />
            Bottleneck Summary
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {report.bottleneckSummary || "Kitchen operations are running smoothly with no detected bottlenecks."}
          </p>
        </div>

        {/* Inventory Warnings */}
        <div className="space-y-2 bg-background p-4 rounded-xl border border-border shadow-xs">
          <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <AlertTriangle className="size-4" />
            Inventory Alerts
          </div>
          {report.inventoryWarnings && report.inventoryWarnings.length > 0 ? (
            <ul className="space-y-2">
              {report.inventoryWarnings.map((warning: string, i: number) => (
                <li key={i} className="text-xs flex items-start gap-1 text-muted-foreground">
                  <span className="text-destructive mt-0.5">•</span> {warning}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No immediate inventory shortages detected.</p>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
