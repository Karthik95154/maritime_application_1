import { Box, Button, Grid, Stack, Typography, Chip, IconButton, Tooltip, LinearProgress, InputAdornment, TextField } from "@mui/material";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Download, FileText, Share2, ShieldCheck, Search, FileBadge, Trash2 } from "lucide-react";
import { backendApi } from "../api/backendApi";
import { SectionCard } from "../components/SectionCard";
import { useState } from "react";

export function ReportsCenterPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["historical-inspections"],
    queryFn: backendApi.getHistoricalInspections,
  });

  const deleteMutation = useMutation({
    mutationFn: backendApi.deleteInspection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["historical-inspections"] });
    },
  });

  const handleDelete = (sessionId: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      deleteMutation.mutate(sessionId);
    }
  };

  const completedReports = historyData?.filter(item => item.progress === 100 || item.status === "Completed") || [];
  
  const filteredReports = completedReports.filter(report => 
    report.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    report.imoNumber.includes(searchTerm)
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
          Workspace / Report Center
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={800} color="primary.main">
            Final Reports
          </Typography>
          <TextField
            size="small"
            placeholder="Search by vessel or IMO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: "background.paper", width: 300 }
            }}
          />
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {isLoading ? (
          <Grid size={{ xs: 12 }}>
            <LinearProgress />
          </Grid>
        ) : filteredReports.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <SectionCard title="No Reports Available">
              <Typography color="text.secondary">There are no completed inspection reports yet.</Typography>
            </SectionCard>
          </Grid>
        ) : (
          filteredReports.map((report) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={report.sessionId}>
              <SectionCard 
                title={report.vesselName} 
                subtitle={`IMO: ${report.imoNumber}`}
                icon={<FileBadge size={20} color="#1E40AF" />}
                sx={{
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
                    borderColor: 'primary.main',
                  }
                }}
              >
                <Stack spacing={2.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">Health Score</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: 120 }}>
                      <LinearProgress
                        variant="determinate"
                        value={report.healthScore || 0}
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          "& .MuiLinearProgress-bar": {
                            backgroundColor:
                              (report.healthScore || 0) > 75 ? "#10B981" : (report.healthScore || 0) > 60 ? "#F59E0B" : "#EF4444",
                          },
                        }}
                      />
                      <Typography variant="body2" fontWeight={700}>{report.healthScore || 0}</Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Critical Defects</Typography>
                        <Typography variant="h6" fontWeight={700} color="error.main">{report.defectCount || 0}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Est. Cost</Typography>
                        <Typography variant="h6" fontWeight={700}>₹ {((report.defectCount || 0) * 150000).toLocaleString()}</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Stack direction="row" spacing={1} pt={1}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={() => navigate(`/inspections/${report.sessionId}/report`)}
                      startIcon={<FileText size={16} />}
                    >
                      View Report
                    </Button>
                    <Tooltip title="Download PDF">
                      <IconButton color="primary" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Download size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share Link">
                      <IconButton color="secondary" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Share2 size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Report">
                      <IconButton color="error" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }} onClick={() => handleDelete(report.sessionId)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </SectionCard>
            </Grid>
          ))
        )}
      </Grid>
    </Stack>
  );
}
