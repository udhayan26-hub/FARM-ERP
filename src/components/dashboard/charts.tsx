"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DollarSign, Receipt } from "lucide-react";

const COLORS = ["#16a34a", "#eab308", "#92400e", "#0284c7", "#64748b", "#7c3aed"];

interface ExpenseDataPoint {
  name: string;
  amount: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
}

export function ExpenseTrendChart({
  data,
}: {
  data?: ExpenseDataPoint[] | null;
}) {
  const hasData = data && data.some((d) => d.amount > 0);

  return (
    <Card className="col-span-1 lg:col-span-4 shadow-sm animate-fade-in">
      <CardHeader>
        <CardTitle>Expense Trend</CardTitle>
        <CardDescription>Monthly expense breakdown for the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground text-sm">
            <DollarSign className="h-10 w-10 mb-2 opacity-30 text-primary" />
            <p className="font-semibold text-foreground">No expense data found</p>
            <p className="text-xs text-center mt-1">Logs will appear here once wages, diesel, or general expenses are recorded.</p>
          </div>
        ) : (
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--muted-foreground)/0.2)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--background))",
                  }}
                  formatter={(value: number) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    "Amount",
                  ]}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CategoryPieChart({
  data,
}: {
  data?: CategoryDataPoint[] | null;
}) {
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0);
  const totalValue = hasData && data ? data.reduce((s, d) => s + d.value, 0) : 0;

  return (
    <Card className="col-span-1 lg:col-span-3 shadow-sm animate-fade-in animate-delay-100">
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>By category for the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        {!hasData || !data ? (
          <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground text-sm">
            <Receipt className="h-10 w-10 mb-2 opacity-30 text-primary" />
            <p className="font-semibold text-foreground">No category details</p>
            <p className="text-xs text-center mt-1">Add general expenses or diesel logs to see category distribution.</p>
          </div>
        ) : (
          <>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Share"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--background))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{totalValue}%</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
            <div className="w-full mt-4 grid grid-cols-2 gap-x-2 gap-y-3">
              {data.map((item, index) => (
                <div key={item.name} className="flex items-center text-xs">
                  <div
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                  <span className="ml-auto font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
