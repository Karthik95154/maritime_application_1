import React from "react";
import { Box, Stack, Typography, Divider, Grid } from "@mui/material";

function NakedMetric({ label, value, color = "#F8FAFC", subtext }: { label: string, value: string, color?: string, subtext?: string }) {
  return (
    <Box>
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

export function OwnerDashboardPage() {
  return (
    <Stack spacing={6} sx={{ pt: 2, pb: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h4" fontWeight={800} color="#F8FAFC" letterSpacing={-0.5}>Executive Dashboard</Typography>
          <Typography variant="body1" color="#94A3B8" mt={0.5}>Global Fleet Intelligence & Operations Command</Typography>
        </Box>
        <Typography variant="caption" color="#64748B" fontFamily="monospace">
          LAST REFRESH: {new Date().toLocaleTimeString()}
        </Typography>
      </Stack>

      <Box sx={{ p: 4, bgcolor: 'rgba(15, 23, 42, 0.4)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <NakedMetric label="Fleet Health" value="84/100" color="#10B981" subtext="Top 15% Industry Average" />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <NakedMetric label="Risk Level" value="MEDIUM" color="#F59E0B" subtext="Elevated due to 7 vessels" />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <NakedMetric label="Total Vessels" value="126" subtext="Active in platform" />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <NakedMetric label="Critical Vessels" value="7" color="#EF4444" subtext="Requires immediate review" />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <NakedMetric label="Est. Repair Exposure" value="₹4.2 Cr" color="#3B82F6" subtext="Based on AI defect analysis" />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <NakedMetric label="Compliance" value="92%" color="#10B981" subtext="Across all class societies" />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={6}>
        <Box flex={2}>
          <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={3}>
            Pending Executive Reviews
          </Typography>
          <Stack spacing={2}>
            {[
              { id: "EX-104", issue: "Structural integrity risk exceeding threshold", vessel: "Ocean Titan", severity: "Critical", time: "2 hours ago" },
              { id: "EX-105", issue: "Repair budget approval required", vessel: "Pacific Voyager", severity: "High", time: "5 hours ago" },
              { id: "EX-106", issue: "Class society compliance warning", vessel: "Nordic Star", severity: "High", time: "1 day ago" },
            ].map((review) => (
              <Box key={review.id} sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                <Box>
                  <Typography variant="body1" color="#F8FAFC" fontWeight={600}>{review.issue}</Typography>
                  <Stack direction="row" spacing={2} mt={0.5}>
                    <Typography variant="caption" color="#94A3B8">{review.vessel}</Typography>
                    <Typography variant="caption" color="#64748B" fontFamily="monospace">{review.time}</Typography>
                  </Stack>
                </Box>
                <Typography variant="caption" fontWeight={700} color={review.severity === "Critical" ? "#EF4444" : "#F59E0B"}>
                  {review.severity}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box flex={1}>
          <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={3}>
            Recent AI Detections
          </Typography>
          <Stack spacing={3}>
            {[
              { type: "Corrosion", count: 142, trend: "+12%" },
              { type: "Coating Breakdown", count: 89, trend: "-5%" },
              { type: "Structural Deformation", count: 14, trend: "+2%" },
            ].map((detection, idx) => (
              <Box key={idx}>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography variant="body2" color="#F8FAFC">{detection.type}</Typography>
                  <Typography variant="h5" color="#94A3B8" fontFamily="monospace">{detection.count}</Typography>
                </Stack>
                <Typography variant="caption" color={detection.trend.startsWith('+') ? "#EF4444" : "#10B981"}>
                  {detection.trend} this week
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}
