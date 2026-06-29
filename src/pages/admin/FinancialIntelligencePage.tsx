import React from "react";
import { Box, Stack, Typography, Grid, Divider } from "@mui/material";

function FinancialMetric({ label, value, subtext, color = "#F8FAFC" }: { label: string, value: string, subtext?: string, color?: string }) {
  return (
    <Box sx={{ p: 3, bgcolor: 'rgba(15, 23, 42, 0.4)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
      <Typography variant="caption" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Typography>
      <Typography variant="h3" color={color} fontWeight={800} letterSpacing={-1} sx={{ mt: 1, mb: 0.5, fontFamily: 'monospace' }}>
        {value}
      </Typography>
      {subtext && (
        <Typography variant="body2" color="#94A3B8">
          {subtext}
        </Typography>
      )}
    </Box>
  );
}

function CostRow({ label, value, percentage }: { label: string, value: string, percentage: number }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="body2" color="#F8FAFC">{label}</Typography>
        <Typography variant="body2" color="#94A3B8" fontFamily="monospace">{value}</Typography>
      </Stack>
      <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
        <Box sx={{ width: `${percentage}%`, height: '100%', bgcolor: '#3B82F6', borderRadius: 2 }} />
      </Box>
    </Box>
  );
}

export function FinancialIntelligencePage() {
  return (
    <Stack spacing={6} sx={{ pt: 2, pb: 6 }}>
      <Box>
        <Typography variant="h4" fontWeight={800} color="#F8FAFC" letterSpacing={-0.5}>Financial Intelligence</Typography>
        <Typography variant="body1" color="#94A3B8" mt={0.5}>Global repair cost exposure and AI ROI analysis.</Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <FinancialMetric label="Total Repair Exposure" value="₹4.2 Cr" color="#EF4444" subtext="+12% from last quarter" />
        </Grid>
        <Grid item xs={12} md={4}>
          <FinancialMetric label="Drydock Forecast (Q3)" value="₹12.5 Cr" color="#F59E0B" subtext="Estimated budget required" />
        </Grid>
        <Grid item xs={12} md={4}>
          <FinancialMetric label="AI Annual Savings" value="₹1.8 Cr" color="#10B981" subtext="Through optimized inspections" />
        </Grid>
      </Grid>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={6}>
        <Box flex={1}>
          <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={3}>
            Cost Exposure by Vessel
          </Typography>
          <Box sx={{ p: 3, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <CostRow label="Global Harmony" value="₹3.8 Cr" percentage={90} />
            <CostRow label="Nordic Star" value="₹1.4 Cr" percentage={33} />
            <CostRow label="Pacific Voyager" value="₹25.4 L" percentage={6} />
            <CostRow label="Desert Rose" value="₹8.5 L" percentage={2} />
          </Box>
        </Box>

        <Box flex={1}>
          <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={3}>
            Cost Exposure by Defect Type
          </Typography>
          <Box sx={{ p: 3, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <CostRow label="Structural Deformation" value="₹2.5 Cr" percentage={60} />
            <CostRow label="Coating Breakdown" value="₹1.1 Cr" percentage={26} />
            <CostRow label="Severe Corrosion" value="₹45 L" percentage={10} />
            <CostRow label="Pitting" value="₹15 L" percentage={4} />
          </Box>
        </Box>
      </Stack>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

      <Box>
        <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={3}>
          AI ROI Dashboard
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 3, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Typography variant="caption" color="#10B981" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Inspection Efficiency</Typography>
              <Typography variant="h3" color="#10B981" fontWeight={800} mt={1}>+42%</Typography>
              <Typography variant="body2" color="#94A3B8" mt={1}>Reduction in manual survey time.</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 3, bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: 2, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Typography variant="caption" color="#3B82F6" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Early Detection Savings</Typography>
              <Typography variant="h3" color="#3B82F6" fontWeight={800} mt={1}>₹85 L</Typography>
              <Typography variant="body2" color="#94A3B8" mt={1}>From preventing major structural failures.</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 3, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 2, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <Typography variant="caption" color="#F59E0B" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Review Time Saved</Typography>
              <Typography variant="h3" color="#F59E0B" fontWeight={800} mt={1}>4,250 hrs</Typography>
              <Typography variant="body2" color="#94A3B8" mt={1}>Engineering hours saved by auto-approval.</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
}
