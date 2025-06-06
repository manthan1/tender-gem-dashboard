import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const chartData = [
  { month: "Jan", tenders: 186, bids: 80 },
  { month: "Feb", tenders: 305, bids: 120 },
  { month: "Mar", tenders: 237, bids: 95 },
  { month: "Apr", tenders: 273, bids: 140 },
  { month: "May", tenders: 209, bids: 85 },
  { month: "Jun", tenders: 214, bids: 110 },
];

const chartConfig = {
  tenders: {
    label: "Total Tenders",
    color: "hsl(var(--chart-1))",
  },
  bids: {
    label: "Your Bids",
    color: "hsl(var(--chart-2))",
  },
};

const TenderTrendsChart = () => {
  return (
    <Card className="table-shadow border-0 rounded-2xl bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold brand-navy">Tender Trends</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="tenders"
                stackId="1"
                stroke="var(--color-tenders)"
                fill="var(--color-tenders)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="bids"
                stackId="2"
                stroke="var(--color-bids)"
                fill="var(--color-bids)"
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TenderTrendsChart;