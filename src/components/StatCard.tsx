import { Box, Card, CardContent, Stack, Typography, useTheme } from "@mui/material";
import { ArrowUpRight, ArrowDownRight, Activity, AlertTriangle, Ship, DollarSign, BrainCircuit, BarChart3, Users, FolderKanban } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import type { KpiMetric } from "../types";

export function StatCard({ metric }: { metric: KpiMetric }) {
  const theme = useTheme();

  // Determine maritime color and icon based on label
  const labelLower = metric.label.toLowerCase();
  
  let color = "#3B82F6"; // Default Blue
  let gradient = "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 100%)";
  let Icon = Activity;
  
  if (labelLower.includes("health")) {
    color = "#10B981"; // Green
    gradient = "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 100%)";
    Icon = Ship;
  } else if (labelLower.includes("critical") || labelLower.includes("defect")) {
    color = "#EF4444"; // Red
    gradient = "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0) 100%)";
    Icon = AlertTriangle;
  } else if (labelLower.includes("cost") || labelLower.includes("exposure")) {
    color = "#F59E0B"; // Orange
    gradient = "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0) 100%)";
    Icon = DollarSign;
  } else if (labelLower.includes("ai")) {
    color = "#06B6D4"; // Cyan
    gradient = "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0) 100%)";
    Icon = BrainCircuit;
  } else if (labelLower.includes("vessel")) {
    color = "#8B5CF6"; // Purple
    gradient = "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 100%)";
    Icon = Users;
  } else if (labelLower.includes("report")) {
    color = "#14B8A6"; // Teal
    gradient = "linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(20, 184, 166, 0) 100%)";
    Icon = FolderKanban;
  }

  // Generate some dummy sparkline data to match trend
  const isUp = metric.trend === "up";
  const sparklineData = Array.from({ length: 6 }, (_, i) => ({
    value: isUp ? 20 + i * 5 + Math.random() * 10 : 50 - i * 5 + Math.random() * 10
  }));

  const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <Card sx={{ 
      backgroundColor: theme.palette.mode === 'dark' ? '#0F172A' : '#FFFFFF',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon size={16} color={color} />
              {metric.label}
            </Typography>
            <Typography variant="h4" fontSize={28} fontWeight={800} color="text.primary">
              {metric.value}
            </Typography>
          </Box>
          <Box sx={{ width: 60, height: 40 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <TrendIcon size={16} color={isUp ? "#10B981" : "#EF4444"} />
          <Typography variant="caption" fontWeight={700} color={isUp ? "success.main" : "error.main"}>
            {metric.delta}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            vs last month
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
