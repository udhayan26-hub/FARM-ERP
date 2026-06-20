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

const FALLBACK_EXPENSE_DATA = [
  { name: "Jan", amount: 45000 },
  { name: "Feb", amount: 52000 },
  { name: "Mar", amount: 38000 },
  { name: "Apr", amount: 65000 },
  { name: "May", amount: 48000 },
  { name: "Jun", amount: 55000 },
];

const FALLBACK_CATEGORY_DATA = [
  { name: "Diesel", value: 35 },
  { name: "Fertilizers", value: 25 },
  { name: "Labour", value: 20 },
  { name: "Seeds", value: 10 },
  { name: "Other", value: 10 },
];

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
  const chartData =
    data && data.some((d) => d.amount > 0) ? data : FALLBACK_EXPENSE_DATA;

  return (
    <Card className="col-span-1 lg:col-span-4 shadow-sm">
      <CardHeader>
        <CardTitle>Expense Trend</CardTitle>
        <CardDescription>Monthly expense breakdown for the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
      </CardContent>
    </Card>
  );
}

export function CategoryPieChart({
  data,
}: {
  data?: CategoryDataPoint[] | null;
}) {
  const chartData = data && data.length > 0 ? data : FALLBACK_CATEGORY_DATA;
  const totalValue = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="col-span-1 lg:col-span-3 shadow-sm">
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>By category for the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="h-[250px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
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
          {chartData.map((item, index) => (
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
      </CardContent>
    </Card>
  );
}
