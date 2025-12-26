import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Percent } from "lucide-react";

const chartData = [
  { level: "Level 1", percentage: 10, description: "Match on direct referrals' earnings" },
  { level: "Level 2", percentage: 5, description: "Match on 2nd generation earnings" },
];

const chartConfig = {
  percentage: {
    label: "Match %",
    color: "hsl(262, 83%, 58%)",
  },
} satisfies ChartConfig;

const MatchingBonusChart = () => {
  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Percent className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h3 className="font-display text-lg">Matching Bonuses</h3>
          <p className="text-xs text-muted-foreground">Earn % of your team's earnings</p>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[160px] w-full">
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            domain={[0, 12]} 
            tickFormatter={(value) => `${value}%`}
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
                formatter={(value) => [`${value}%`, "Match"]}
              />
            }
          />
          <Bar 
            dataKey="percentage" 
            radius={[0, 6, 6, 0]}
            maxBarSize={40}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`hsl(262, 83%, ${58 + index * 10}%)`}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">If Level 1 earns $100:</span>
          <span className="font-medium text-purple-500">You earn $10</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">If Level 2 earns $100:</span>
          <span className="font-medium text-purple-500">You earn $5</span>
        </div>
      </div>
    </div>
  );
};

export default MatchingBonusChart;
