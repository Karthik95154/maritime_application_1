import React from "react";
import { Box, Stack, Typography, Grid, Divider } from "@mui/material";
import { AlertTriangle, ShieldX, Clock, Anchor } from "lucide-react";

function RiskCard({ title, value, icon, severity }: { title: string, value: string, icon: React.ReactNode, severity: "critical" | "high" | "medium" | "low" }) {
  const colorMap = {
    critical: "#EF4444",
    high: "#F59E0B",
    medium: "#3B82F6",
    low: "#10B981"
  };
  const color = colorMap[severity];

  return (
    <Box sx={{ p: 3, border: `1px solid rgba(255,255,255,0.05)`, borderTop: `2px solid ${color}`, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.4)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Typography variant="caption" color="#94A3B8" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Typography>
        <Box sx={{ color }}>{icon}</Box>
      </Stack>
      <Typography variant="h3" color="#F8FAFC" fontWeight={800} fontFamily="monospace" letterSpacing={-1}>
        {value}
      </Typography>
    </Box>
  );
}

function IssueRow({ vessel, issue, severity }: { vessel: string, issue: string, severity: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" py={2} borderBottom="1px solid rgba(255,255,255,0.05)">
      <Box>
        <Typography variant="body2" color="#F8FAFC" fontWeight={600}>{vessel}</Typography>
        <Typography variant="caption" color="#94A3B8">{issue}</Typography>
      </Box>
      <Typography variant="caption" fontWeight={700} color={severity === "Critical" ? "#EF4444" : "#F59E0B"}>
        {severity}
      </Typography>
    </Stack>
  );
}

export function RiskCompliancePage() {
  return (
    <Stack spacing={6} sx={{ pt: 2, pb: 6 }}>
      <Box>
        <Typography variant="h4" fontWeight={800} color="#F8FAFC" letterSpacing={-0.5}>Risk & Compliance</Typography>
        <Typography variant="body1" color="#94A3B8" mt={0.5}>Monitor fleet-wide exposure, class society warnings, and critical defects.</Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <RiskCard title="Critical Defects" value="12" icon={<AlertTriangle size={20} />} severity="critical" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <RiskCard title="High Risk Vessels" value="4" icon={<Anchor size={20} />} severity="high" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <RiskCard title="Compliance Violations" value="2" icon={<ShieldX size={20} />} severity="critical" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <RiskCard title="Overdue Inspections" value="8" icon={<Clock size={20} />} severity="medium" />
        </Grid>
      </Grid>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={6}>
        <Box flex={1}>
          <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={1}>
            Critical Defects by Vessel
          </Typography>
          <IssueRow vessel="Nordic Star" issue="Hull breaches detected in Starboard Tank 3" severity="Critical" />
          <IssueRow vessel="Global Harmony" issue="Severe coating failure spanning 400sqm" severity="Critical" />
          <IssueRow vessel="Ocean Titan" issue="Transverse web frame buckling" severity="Critical" />
        </Box>

        <Box flex={1}>
          <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={1}>
            Class Society & Port Compliance
          </Typography>
          <IssueRow vessel="Desert Rose" issue="Pending DNV Annual Survey (Due in 5 days)" severity="High" />
          <IssueRow vessel="Pacific Voyager" issue="Port state control warning (Singapore)" severity="High" />
          <IssueRow vessel="Atlantic Express" issue="Emissions reporting incomplete" severity="High" />
        </Box>
      </Stack>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

      <Box>
        <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={3}>
          Risk Heatmap Distribution
        </Typography>
        <Stack direction="row" spacing={1} height={40}>
          <Box flex={6} bgcolor="rgba(16, 185, 129, 0.2)" display="flex" alignItems="center" px={2} borderRadius={1} borderLeft="3px solid #10B981">
            <Typography variant="caption" color="#10B981" fontWeight={700}>LOW RISK (82 Vessels)</Typography>
          </Box>
          <Box flex={3} bgcolor="rgba(59, 130, 246, 0.2)" display="flex" alignItems="center" px={2} borderRadius={1} borderLeft="3px solid #3B82F6">
            <Typography variant="caption" color="#3B82F6" fontWeight={700}>MEDIUM (30)</Typography>
          </Box>
          <Box flex={1} bgcolor="rgba(245, 158, 11, 0.2)" display="flex" alignItems="center" px={2} borderRadius={1} borderLeft="3px solid #F59E0B">
            <Typography variant="caption" color="#F59E0B" fontWeight={700}>HIGH (10)</Typography>
          </Box>
          <Box flex={0.5} bgcolor="rgba(239, 68, 68, 0.2)" display="flex" alignItems="center" px={2} borderRadius={1} borderLeft="3px solid #EF4444">
            <Typography variant="caption" color="#EF4444" fontWeight={700}>CRIT (4)</Typography>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
