import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Zap } from "lucide-react";

const chartData = [
  { level: "Level 1", amount: 25, description: "Direct referral bonus" },
  { level: "Level 2", amount: 10, description: "2nd generation bonus" },
  { level: "Level 3", amount: 5, description: "3rd generation bonus" },
];

const chartConfig = {
  amount: {
    label: "Bonus",
    color: "hsl(142, 76%, 36%)",
  },
} satisfies ChartConfig;

const FastStartChart = () => {
  return (
    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h3 className="font-display text-lg">Fast Start Bonuses</h3>
          <p className="text-xs text-muted-foreground">One-time bonuses when referrals join</p>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            domain={[0, 30]} 
            tickFormatter={(value) => `$${value}`}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            type="category" 
            dataKey="level" 
            width={65}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [`$${value}`, "Bonus"]}
              />
            }
          />
          <Bar 
            dataKey="amount" 
            radius={[0, 6, 6, 0]}
            maxBarSize={40}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`hsl(142, 76%, ${36 + index * 10}%)`}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Total potential: <span className="font-medium text-green-500">$40</span> per referral chain
        </p>
      </div>
    </div>
  );
};

export default FastStartChart;
