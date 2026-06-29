import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Grid, Stack, Typography, LinearProgress, Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { backendApi } from "../api/backendApi";
import { ProgressStepper } from "../components/ProgressStepper";
import { SectionCard } from "../components/SectionCard";
import { shipHero } from "../data/mockData";
import { useResolvedSessionId } from "../hooks/useResolvedSessionId";
import { ReportContent } from "./ReportPage";

export function InspectionProgressPage() {
  const { sessionId } = useResolvedSessionId();
  const [showReport, setShowReport] = useState(false);

  const { data } = useQuery({
    queryKey: ["inspection-progress", sessionId],
    queryFn: () => backendApi.getInspectionProgress(sessionId!),
    enabled: Boolean(sessionId),
  });

  useEffect(() => {
    if (data?.progress === 100) {
      setShowReport(true);
    }
  }, [data?.progress]);

  if (!data) return null;

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">
        Inspections / INS-2025-000123
      </Typography>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography variant="h4" fontSize={28}>
          Inspection Progress
        </Typography>
        <Box sx={{ px: 1.25, py: 0.75, borderRadius: 2, bgcolor: "#E8F7EF", color: "#22A861", fontWeight: 700, fontSize: 12 }}>
          {data.sessionId}
        </Box>
      </Stack>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title="Processing Pipeline">
            <Box mb={1}>
              <Box
                sx={{
                  height: 190,
                  borderRadius: 3,
                  mb: 3,
                  background: `linear-gradient(180deg, rgba(11,31,58,0.05), rgba(11,31,58,0.18)), url(${shipHero}) center/cover`,
                }}
              />
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" fontWeight={700}>
                    {data.steps.find((s) => s.status === "active")?.label || "Processing Complete"}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="secondary.main">
                    {data.progress}%
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={data.progress} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: data.progress === 100 ? "#22A861" : "#2F80ED",
                    }
                  }} 
                />
              </Stack>
            </Box>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="Inspection Information">
            <Stack spacing={1.5}>
              {[
                ["Vessel Name", data.vesselName],
                ["IMO Number", data.imoNumber],
                ["Inspector", data.inspectorName],
                ["Upload Date", data.createdAt ? new Date(data.createdAt).toLocaleString() : "-"],
              ].map(([label, value]) => (
                <Box key={label}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography fontWeight={600}>{value}</Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <SectionCard title="Live Logs" subtitle="Streaming pipeline events">
            <Box
              sx={{
                bgcolor: "#07111f",
                color: "#d7e6ff",
                borderRadius: 3,
                p: 2,
                fontFamily: "monospace",
              }}
            >
              {data.logs.map((log) => (
                <Typography key={log.time} sx={{ py: 0.5 }}>
                  <Box component="span" sx={{ color: "#7DD3FC", mr: 1.5 }}>
                    {log.time}
                  </Box>
                  {log.message}
                </Typography>
              ))}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog 
        open={showReport} 
        onClose={() => setShowReport(false)} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{ sx: { bgcolor: "background.default", height: "90vh" } }}
      >
        <DialogContent sx={{ p: 4 }}>
          <ReportContent sessionId={data.sessionId} hideHeader />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "background.paper" }}>
          <Button onClick={() => setShowReport(false)} variant="contained" color="primary">
            Close Report
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
