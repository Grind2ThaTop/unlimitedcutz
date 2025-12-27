import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Percent, Scissors, User } from "lucide-react";
import { useAccountRole } from "@/hooks/useAccountRole";
import { CLIENT_MATCHING, BARBER_MATCHING } from "@/lib/rankConfig";

const chartConfig = {
  percentage: {
    label: "Match %",
    color: "hsl(262, 83%, 58%)",
  },
} satisfies ChartConfig;

const MatchingBonusChart = () => {
  const { accountType, matchingL1, matchingL2, matchingL3, isBarber } = useAccountRole();

  // Create chart data based on user's role (barbers get L3)
  const chartData = [
    { level: "Level 1", percentage: matchingL1, description: "Match on direct referrals' earnings" },
    { level: "Level 2", percentage: matchingL2, description: "Match on 2nd generation earnings" },
    ...(isBarber && matchingL3 ? [{ level: "Level 3", percentage: matchingL3, description: "Match on 3rd generation earnings" }] : []),
  ];

  // Calculate max for chart domain
  const maxPercent = Math.max(BARBER_MATCHING.l1, BARBER_MATCHING.l2, BARBER_MATCHING.l3 || 0) + 5;

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Percent className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-display text-lg">Matching Bonuses</h3>
            <p className="text-xs text-muted-foreground">Earn % of your team's earnings</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isBarber 
            ? 'bg-primary/20 text-primary' 
            : 'bg-blue-500/20 text-blue-500'
        }`}>
          {isBarber ? <Scissors className="w-3 h-3" /> : <User className="w-3 h-3" />}
          <span className="capitalize">{accountType}</span>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[160px] w-full">
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            domain={[0, maxPercent]} 
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
                fill={isBarber ? `hsl(var(--primary))` : `hsl(262, 83%, ${58 + index * 10}%)`}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">If Level 1 earns $100:</span>
          <span className="font-medium text-purple-500">You earn ${matchingL1}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">If Level 2 earns $100:</span>
          <span className="font-medium text-purple-500">You earn ${matchingL2}</span>
        </div>
        {isBarber && matchingL3 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">If Level 3 earns $100:</span>
            <span className="font-medium text-purple-500">You earn ${matchingL3}</span>
          </div>
        )}
      </div>

      {/* Role comparison */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground mb-2">Rate Comparison:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2 rounded-lg ${!isBarber ? 'bg-blue-500/10 ring-1 ring-blue-500/30' : 'bg-muted/30'}`}>
            <div className="flex items-center gap-1 mb-1">
              <User className="w-3 h-3" />
              <span className="font-medium">Client</span>
            </div>
            <p className="text-muted-foreground">L1: {CLIENT_MATCHING.l1}% • L2: {CLIENT_MATCHING.l2}%</p>
          </div>
          <div className={`p-2 rounded-lg ${isBarber ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/30'}`}>
            <div className="flex items-center gap-1 mb-1">
              <Scissors className="w-3 h-3" />
              <span className="font-medium">Barber</span>
            </div>
            <p className="text-muted-foreground">L1: {BARBER_MATCHING.l1}% • L2: {BARBER_MATCHING.l2}% • L3: {BARBER_MATCHING.l3}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingBonusChart;
