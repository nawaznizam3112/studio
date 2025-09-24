
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface CustomerChartProps {
    loyaltyData: Record<string, number>;
    visitData: { date: string; visits: number }[];
}

const loyaltyColors: {[key: string]: string} = {
    Bronze: "hsl(var(--chart-5))",
    Silver: "hsl(var(--chart-2))",
    Gold: "hsl(var(--chart-1))",
};

export function CustomerChart({ loyaltyData, visitData }: CustomerChartProps) {
    const loyaltyChartData = Object.entries(loyaltyData).map(([name, value]) => ({ name, value }));

    return (
        <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
                <CardTitle>Customer Analytics</CardTitle>
                <CardDescription>An overview of customer loyalty and recent activity.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-around gap-6">
                <div>
                    <h4 className="text-sm font-semibold mb-2">Customer Loyalty Distribution</h4>
                    {loyaltyChartData.length > 0 ? (
                        <div className="w-full h-48">
                           <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={loyaltyChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {loyaltyChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={loyaltyColors[entry.name] || '#000000'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-10">No loyalty data yet.</p>
                    )}
                </div>
                 <div>
                    <h4 className="text-sm font-semibold mb-2">Recent Visit Trend (Last 30 Days)</h4>
                     {visitData.length > 0 ? (
                        <div className="w-full h-48">
                           <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={visitData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }}/>
                                    <Tooltip contentStyle={{fontSize: '12px', padding: '4px 8px'}} />
                                    <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                         <p className="text-xs text-muted-foreground text-center py-10">No visit data yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
