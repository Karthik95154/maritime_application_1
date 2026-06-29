import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Box, Typography, Stack, Grid, CircularProgress, Chip, TextField, InputAdornment, LinearProgress } from "@mui/material";
import { Ship, Search, AlertTriangle, ShieldCheck } from "lucide-react";
import { backendApi } from "../api/backendApi";
import { SectionCard } from "../components/SectionCard";
import { useState } from "react";
import { motion } from "framer-motion";

export function VesselsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: vessels, isLoading } = useQuery({
    queryKey: ["vessels"],
    queryFn: backendApi.getVessels,
  });

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  const filteredVessels = vessels?.filter(v => 
    v.vesselName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.imoNumber?.includes(searchTerm)
  ) || [];

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={1.2} sx={{ textTransform: 'uppercase' }}>
            Workspace / Fleet Center
          </Typography>
          <Typography variant="h4" fontWeight={800} mt={0.5} color="primary.main">Fleet Intelligence Center</Typography>
        </Box>
        <TextField
          size="small"
          placeholder="Search IMO or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>
            }
          }}
          sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
        />
      </Stack>

      <Grid container spacing={3}>
        {filteredVessels.map((vessel, idx) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }}    key={vessel.imoNumber}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Link to={`/fleet/${vessel.imoNumber}`} style={{ textDecoration: 'none' }}>
                <SectionCard
                  sx={{
                    height: "100%",
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ p: 1.5, bgcolor: 'secondary.main', borderRadius: 2, color: 'white', display: 'flex' }}>
                        <Ship size={28} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="h6" fontWeight={700} color="text.primary" noWrap>
                          {vessel.vesselName || "Unknown Vessel"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          IMO: {vessel.imoNumber}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      <Chip label={vessel.vesselType || "Unknown"} size="small" sx={{ fontWeight: 600 }} />
                      {vessel.riskScore === "Critical" ? (
                         <Chip icon={<AlertTriangle size={14} />} label="Critical Risk" size="small" color="error" sx={{ fontWeight: 600 }} />
                      ) : vessel.riskScore === "High" ? (
                         <Chip icon={<AlertTriangle size={14} />} label="High Risk" size="small" color="warning" sx={{ fontWeight: 600 }} />
                      ) : vessel.riskScore === "Medium" ? (
                         <Chip icon={<AlertTriangle size={14} />} label="Medium Risk" size="small" color="info" sx={{ fontWeight: 600 }} />
                      ) : (
                         <Chip icon={<ShieldCheck size={14} />} label="Low Risk" size="small" color="success" sx={{ fontWeight: 600 }} />
                      )}
                    </Stack>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Health Score</Typography>
                        <Typography variant="caption" fontWeight={700} color={vessel.healthScore > 75 ? "success.main" : vessel.healthScore > 60 ? "warning.main" : "error.main"}>{vessel.healthScore}/100</Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={vessel.healthScore} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: "rgba(0,0,0,0.05)",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: vessel.healthScore > 75 ? "#10B981" : vessel.healthScore > 60 ? "#F59E0B" : "#EF4444"
                          }
                        }} 
                      />
                    </Box>
                    <Grid container spacing={1} pt={1} borderTop="1px solid" borderColor="divider">
                      <Grid size={{ xs: 6 }} >
                        <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">Critical Defects</Typography>
                        <Typography variant="body1" fontWeight={700} color={vessel.criticalDefects > 0 ? "error.main" : "text.primary"}>
                          {vessel.criticalDefects || 0}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }} >
                        <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">Last Inspected</Typography>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {vessel.lastInspectionDate ? new Date(vessel.lastInspectionDate).toLocaleDateString() : "Never"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Stack>
                </SectionCard>
              </Link>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      
      {filteredVessels.length === 0 && (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          No vessels found.
        </Typography>
      )}
    </Stack>
  );
}
