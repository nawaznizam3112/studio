
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";

interface AnalyticsChartProps {
    data: { date: string; count: number }[];
}

const chartConfig = {
    count: {
        label: "Businesses",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

export function AnalyticsChart({ data }: AnalyticsChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[350px] w-full items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">No data available to display.</p>
            </div>
        );
    }
    
    return (
        <div className="h-[350px] w-full">
            <ChartContainer config={chartConfig}>
                <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                     <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                     />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
            </ChartContainer>
        </div>
    );
}
