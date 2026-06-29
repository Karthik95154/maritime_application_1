import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Grid,
  Stack,
  Typography,
  CircularProgress,
  List,
  ListItem,
  Avatar,
  InputAdornment,
  TextField,
  IconButton,
  Chip,
  useTheme
} from "@mui/material";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { 
  Search, 
  Moon, 
  Sun, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  BrainCircuit,
  Ship
} from "lucide-react";
import { backendApi } from "../api/backendApi";
import { SectionCard } from "../components/SectionCard";
import { StatCard } from "../components/StatCard";
import { ColorModeContext } from "../components/ThemeContext";

// --- Mock Data ---
const kpisRow1 = [
  { label: "Fleet Health", value: "87 / 100", delta: "5.2%", trend: "up" as const },
  { label: "Active Inspections", value: "14", delta: "2", trend: "up" as const },
  { label: "Critical Defects", value: "42", delta: "12%", trend: "down" as const },
  { label: "Repair Cost Exposure", value: "₹45,50,000", delta: "8%", trend: "down" as const },
];

const kpisRow2 = [
  { label: "AI Accuracy", value: "96.4%", delta: "1.2%", trend: "up" as const },
  { label: "Reports Generated", value: "128", delta: "15", trend: "up" as const },
  { label: "Vessels Monitored", value: "56", delta: "0", trend: "up" as const },
  { label: "Defect Growth Trend", value: "+2.4%", delta: "0.5%", trend: "up" as const },
];

const fleetHealthTrendData = [
  { month: "Jan", health: 82 },
  { month: "Feb", health: 81 },
  { month: "Mar", health: 84 },
  { month: "Apr", health: 85 },
  { month: "May", health: 83 },
  { month: "Jun", health: 87 },
];

const defectSeverityData = [
  { name: "Minor", value: 450, color: "#10B981" },
  { name: "Moderate", value: 320, color: "#F59E0B" },
  { name: "Major", value: 150, color: "#F97316" },
  { name: "Critical", value: 80, color: "#EF4444" }
];

const inspectionActivityData = [
  { day: "Mon", count: 4 },
  { day: "Tue", count: 7 },
  { day: "Wed", count: 5 },
  { day: "Thu", count: 9 },
  { day: "Fri", count: 12 },
  { day: "Sat", count: 3 },
  { day: "Sun", count: 2 },
];

const recentAIFindings = [
  { vessel: "Ocean Titan", defect: "Hull Corrosion", severity: "Critical", confidence: "98%" },
  { vessel: "Pacific Star", defect: "Coating Breakdown", severity: "Major", confidence: "94%" },
  { vessel: "Nordic Explorer", defect: "Propeller Biofouling", severity: "Moderate", confidence: "91%" },
  { vessel: "Atlantic Voyager", defect: "Anchor Chain Wear", severity: "Critical", confidence: "97%" },
];

const activityFeed = [
  { vessel: "Ocean Titan", message: "Critical Corrosion Detected", time: "3 mins ago", status: "critical" },
  { vessel: "Sukshi", message: "Inspection Completed", time: "12 mins ago", status: "success" },
  { vessel: "Nordic Explorer", message: "AI Analysis Started", time: "45 mins ago", status: "info" },
  { vessel: "Pacific Star", message: "Report Generated", time: "2 hrs ago", status: "success" },
];

export function DashboardPage() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const { isLoading: loadingDash } = useQuery({
    queryKey: ["dashboard"],
    queryFn: backendApi.getDashboard,
  });

  if (loadingDash) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Stack spacing={3} sx={{ pb: 4 }}>
      {/* Header Section */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} mb={1}>
        <Box>
          <Typography variant="h3" fontWeight={800} sx={{ 
            background: theme.palette.mode === 'dark' ? 'linear-gradient(to right, #F8FAFC, #94A3B8)' : 'linear-gradient(to right, #0F172A, #334155)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Fleet Intelligence Center
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Welcome back, Inspector. {currentDate}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Active Inspections</Typography>
            <Typography variant="h6" color="info.main" fontWeight={800}>14 Active</Typography>
          </Box>
          <Box sx={{ width: '1px', height: 40, bgcolor: 'divider', display: { xs: 'none', sm: 'block' } }} />
          <TextField 
            size="small" 
            placeholder="Global Vessel Search..." 
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
              sx: { borderRadius: 8, bgcolor: 'background.paper', width: { xs: '100%', sm: 250 } }
            }}
          />
          <IconButton onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
        </Stack>
      </Stack>

      {/* KPI Rows */}
      <Grid container spacing={2}>
        {kpisRow1.map((metric, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`kpi1-${idx}`}>
            <StatCard metric={metric} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        {kpisRow2.map((metric, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`kpi2-${idx}`}>
            <StatCard metric={metric} />
          </Grid>
        ))}
      </Grid>

      {/* Demo Focused Widget & Cost Exposure */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard sx={{ background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' : 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)', border: `1px solid ${theme.palette.divider}` }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                  <Ship size={32} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={800}>Ocean Titan</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Vessel Health Overview (Demo)</Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={4} mt={{ xs: 3, md: 0 }}>
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>Health Score</Typography>
                  <Typography variant="h4" color="warning.main" fontWeight={800}>72</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>Critical Defects</Typography>
                  <Typography variant="h4" color="error.main" fontWeight={800}>4</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>Repair Cost</Typography>
                  <Typography variant="h4" color="text.primary" fontWeight={800}>₹6,50,000</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>Risk</Typography>
                  <Typography variant="h4" color="error.main" fontWeight={800}>HIGH</Typography>
                </Box>
              </Stack>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Total Repair Exposure">
             <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', pt: 2 }}>
               <Typography variant="h3" fontWeight={800} color="#F59E0B">₹12,50,000</Typography>
               <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                 <Chip label="↑ 14%" color="error" size="small" sx={{ fontWeight: 700, borderRadius: 1 }} />
                 <Typography variant="body2" color="text.secondary">vs previous quarter</Typography>
               </Stack>
             </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Main Charts */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard title="Fleet Health Trend">
            <Box sx={{ height: 280, width: "100%", mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fleetHealthTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 8, border: `1px solid ${theme.palette.divider}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                    itemStyle={{ color: theme.palette.text.primary, fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="health" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorHealth)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Defect Severity Distribution">
            <Box sx={{ height: 280, width: "100%", mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={defectSeverityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {defectSeverityData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} 
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12, fontWeight: 600, color: theme.palette.text.secondary }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Third Row: Critical Alerts, Recent AI Findings, Activity Feed */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Recent AI Findings">
            <List sx={{ width: "100%", p: 0, mt: 1 }}>
              {recentAIFindings.map((finding, index) => (
                <ListItem
                  key={index}
                  sx={{
                    px: 0,
                    py: 1.5,
                    borderBottom: index !== recentAIFindings.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 0.5
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" width="100%" alignItems="center">
                    <Typography variant="subtitle2" fontWeight={700}>{finding.vessel}</Typography>
                    <Chip size="small" label={`${finding.confidence} Confidence`} sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4' }} />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" width="100%" alignItems="center">
                    <Typography variant="body2" color="text.secondary">{finding.defect}</Typography>
                    <Typography variant="caption" fontWeight={700} color={finding.severity === 'Critical' ? 'error.main' : finding.severity === 'Major' ? '#F97316' : 'warning.main'}>
                      {finding.severity}
                    </Typography>
                  </Stack>
                </ListItem>
              ))}
            </List>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Inspection Activity (Weekly)">
            <Box sx={{ height: 250, width: "100%", mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inspectionActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} 
                  />
                  <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorActivity)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Activity Feed">
            <List sx={{ width: "100%", p: 0, mt: 1 }}>
              {activityFeed.map((activity, index) => {
                const isCritical = activity.status === 'critical';
                const isSuccess = activity.status === 'success';
                const Icon = isCritical ? AlertTriangle : isSuccess ? CheckCircle2 : Activity;
                const color = isCritical ? '#EF4444' : isSuccess ? '#10B981' : '#3B82F6';
                const bgColor = isCritical ? 'rgba(239, 68, 68, 0.1)' : isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)';

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <ListItem
                      sx={{
                        px: 1,
                        py: 1.5,
                        borderBottom: index !== activityFeed.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
                        alignItems: "flex-start",
                        borderRadius: 2,
                        transition: 'background-color 0.2s',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32, bgcolor: bgColor, color: color, mr: 2 }}>
                        <Icon size={16} />
                      </Avatar>
                      <Box width="100%">
                        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                            {activity.vessel}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {activity.time}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color={isCritical ? "error.main" : "text.secondary"} sx={{ mt: 0.25, fontWeight: isCritical ? 600 : 400 }}>
                          {activity.message}
                        </Typography>
                      </Box>
                    </ListItem>
                  </motion.div>
                );
              })}
            </List>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
