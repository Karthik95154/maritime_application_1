import React from "react";
import { Box, Stack, Typography, Grid, Button, IconButton } from "@mui/material";
import { FileText, Download, Mail, CalendarClock, FileSpreadsheet } from "lucide-react";

function ReportCard({ title, description, lastGenerated }: { title: string, description: string, lastGenerated: string }) {
  return (
    <Box sx={{ p: 3, border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.4)', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Box sx={{ p: 1.5, bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: 2, color: '#3B82F6' }}>
          <FileText size={24} />
        </Box>
        <Box>
          <Typography variant="body1" color="#F8FAFC" fontWeight={700}>{title}</Typography>
          <Typography variant="caption" color="#94A3B8" fontFamily="monospace">Last generated: {lastGenerated}</Typography>
        </Box>
      </Stack>
      <Typography variant="body2" color="#94A3B8" mb={3} sx={{ minHeight: 40 }}>
        {description}
      </Typography>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 2, mx: -3 }} />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1}>
          <IconButton size="small" sx={{ color: '#64748B', '&:hover': { color: '#F8FAFC' } }} title="Export PDF">
            <Download size={16} />
          </IconButton>
          <IconButton size="small" sx={{ color: '#64748B', '&:hover': { color: '#10B981' } }} title="Export Excel">
            <FileSpreadsheet size={16} />
          </IconButton>
          <IconButton size="small" sx={{ color: '#64748B', '&:hover': { color: '#3B82F6' } }} title="Email Report">
            <Mail size={16} />
          </IconButton>
        </Stack>
        <Button startIcon={<CalendarClock size={14} />} size="small" sx={{ color: '#94A3B8', textTransform: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
          Schedule
        </Button>
      </Stack>
    </Box>
  );
}

// Temporary divider for internal component use
const Divider = ({ sx }: any) => <Box sx={{ borderBottom: 1, ...sx }} />;

export function ExecutiveReportsPage() {
  return (
    <Stack spacing={6} sx={{ pt: 2, pb: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h4" fontWeight={800} color="#F8FAFC" letterSpacing={-0.5}>Executive Reports</Typography>
          <Typography variant="body1" color="#94A3B8" mt={0.5}>Generate, export, and schedule board-level intelligence reports.</Typography>
        </Box>
        <Button variant="contained" sx={{ bgcolor: "#F8FAFC", color: '#0F172A', borderRadius: 1, textTransform: "none", px: 3, fontWeight: 700, '&:hover': { bgcolor: '#E2E8F0' } }}>
          Generate Custom Report
        </Button>
      </Stack>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6} lg={4}>
          <ReportCard 
            title="Fleet Health Report" 
            description="Comprehensive analysis of overall fleet condition, broken down by vessel class and region." 
            lastGenerated="Today, 08:00 AM" 
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <ReportCard 
            title="Financial Exposure Report" 
            description="Detailed breakdown of estimated repair costs, drydock budgets, and AI-driven ROI metrics." 
            lastGenerated="Yesterday, 18:30 PM" 
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <ReportCard 
            title="Risk Assessment Report" 
            description="Executive summary of critical defects, high-risk vessels, and emerging structural trends." 
            lastGenerated="Jun 10, 2026" 
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <ReportCard 
            title="Maintenance Planning Report" 
            description="Forecasted drydock schedules alongside AI-recommended repair prioritization." 
            lastGenerated="Jun 01, 2026" 
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <ReportCard 
            title="Compliance Report" 
            description="Current standing across major classification societies and port state control requirements." 
            lastGenerated="May 31, 2026" 
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
