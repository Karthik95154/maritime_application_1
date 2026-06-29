import { Box, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, alpha, CircularProgress } from "@mui/material";
import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp, Ship } from "lucide-react";
import { SectionCard } from "../components/SectionCard";
import { useQuery } from "@tanstack/react-query";
import { backendApi } from "../api/backendApi";

export function PortfolioInsightsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["inspections", "history"],
    queryFn: backendApi.getHistoricalInspections,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const inspections = data || [];

  // Compute some macro-level statistics based on actual data
  const totalVessels = inspections.length;
  const avgHealth = totalVessels > 0 ? Math.round(inspections.reduce((acc, v) => acc + v.healthScore, 0) / totalVessels) : 0;
  const totalExposure = inspections.reduce((acc, v) => acc + v.totalEstimatedCost, 0);
  
  const criticalVessels = inspections.filter(v => v.healthScore < 60).length;
  const monitorVessels = inspections.filter(v => v.healthScore >= 60 && v.healthScore < 75).length;
  const goodVessels = inspections.filter(v => v.healthScore >= 75).length;

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
        Enterprise / Portfolio Insights
      </Typography>
      <Typography variant="h4" fontSize={28} mb={2}>
        Fleet Command Center
      </Typography>

      {/* KPI Overview */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <SectionCard title="">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary">Total Inspections</Typography>
                <Typography variant="h3" fontWeight={700} mt={1}>{totalVessels}</Typography>
              </Box>
              <Ship size={32} color="#94a3b8" />
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <SectionCard title="">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary">Avg Fleet Health</Typography>
                <Stack direction="row" alignItems="flex-end" spacing={1} mt={1}>
                  <Typography variant="h3" fontWeight={700} color={avgHealth >= 75 ? "success.main" : avgHealth >= 60 ? "warning.main" : "error.main"}>
                    {avgHealth}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" pb={0.5}>/100</Typography>
                </Stack>
              </Box>
              <TrendingDown size={32} color="#E55252" />
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <SectionCard title="">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary">Total Repair Exposure</Typography>
                <Typography variant="h3" fontWeight={700} mt={1}>${(totalExposure / 1000).toFixed(1)}k</Typography>
              </Box>
              <AlertCircle size={32} color="#F59E0B" />
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <SectionCard title="">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary">Active Inspections</Typography>
                <Typography variant="h3" fontWeight={700} mt={1}>{inspections.filter(i => i.status !== "Completed").length}</Typography>
              </Box>
              <CheckCircle2 size={32} color="#22A861" />
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Risk Distribution */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="Fleet Risk Distribution">
            <Stack spacing={3} mt={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={600} color="error.main">Critical Action Required</Typography>
                  <Typography variant="body2" fontWeight={700}>{criticalVessels} Vessels</Typography>
                </Stack>
                <Box sx={{ width: '100%', height: 12, bgcolor: alpha("#E55252", 0.1), borderRadius: 6, overflow: "hidden" }}>
                  <Box sx={{ width: `${totalVessels > 0 ? (criticalVessels / totalVessels) * 100 : 0}%`, height: '100%', bgcolor: "#E55252" }} />
                </Box>
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={600} color="warning.main">Monitor Closely</Typography>
                  <Typography variant="body2" fontWeight={700}>{monitorVessels} Vessels</Typography>
                </Stack>
                <Box sx={{ width: '100%', height: 12, bgcolor: alpha("#F59E0B", 0.1), borderRadius: 6, overflow: "hidden" }}>
                  <Box sx={{ width: `${totalVessels > 0 ? (monitorVessels / totalVessels) * 100 : 0}%`, height: '100%', bgcolor: "#F59E0B" }} />
                </Box>
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={600} color="success.main">Good Condition</Typography>
                  <Typography variant="body2" fontWeight={700}>{goodVessels} Vessels</Typography>
                </Stack>
                <Box sx={{ width: '100%', height: 12, bgcolor: alpha("#22A861", 0.1), borderRadius: 6, overflow: "hidden" }}>
                  <Box sx={{ width: `${totalVessels > 0 ? (goodVessels / totalVessels) * 100 : 0}%`, height: '100%', bgcolor: "#22A861" }} />
                </Box>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>

        {/* Vessel Watchlist */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title="Priority Watchlist (Worst Performing)">
            <Box sx={{ overflowX: "auto", mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha("#0f172a", 0.04) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Vessel</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Health Score</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Critical Defects</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Cost Exposure</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...inspections].sort((a, b) => a.healthScore - b.healthScore).slice(0, 10).map(vessel => (
                    <TableRow key={vessel.sessionId}>
                      <TableCell sx={{ fontWeight: 600 }}>{vessel.vesselName}</TableCell>
                      <TableCell>{vessel.vesselType}</TableCell>
                      <TableCell>
                        <Box component="span" sx={{
                          color: vessel.healthScore >= 75 ? "success.main" : vessel.healthScore >= 60 ? "warning.main" : "error.main",
                          fontWeight: 700
                        }}>
                          {vessel.healthScore}/100
                        </Box>
                      </TableCell>
                      <TableCell>
                        {vessel.criticalDefects > 5 ? (
                          <Typography color="error.main" fontWeight={700}>{vessel.criticalDefects}</Typography>
                        ) : vessel.criticalDefects}
                      </TableCell>
                      <TableCell align="right">${vessel.totalEstimatedCost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
