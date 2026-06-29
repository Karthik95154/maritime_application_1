import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { backendApi, getAssetUrl } from "../api/backendApi";
import { SectionCard } from "../components/SectionCard";
import { SeverityChip } from "../components/SeverityChip";
import { useResolvedSessionId } from "../hooks/useResolvedSessionId";

export function DefectProgressionPage() {
  const { sessionId } = useResolvedSessionId();
  const { data } = useQuery({
    queryKey: ["defect-progression", sessionId],
    queryFn: () => backendApi.getDefectProgression(sessionId!),
    enabled: Boolean(sessionId),
  });

  if (!data) return null;

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">
        Insights / Defect Progression
      </Typography>
      <Typography variant="h4" fontSize={28}>
        Defect Progression Analysis
      </Typography>

      <SectionCard title="Tracked Defect">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Defect</Typography>
            <Typography variant="h6">{data.defectId}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Location</Typography>
            <Typography variant="h6">{data.location}</Typography>
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard title="Timeline View">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "repeat(7, 1fr)" },
            gap: 2,
            alignItems: "center",
          }}
        >
          {data.timeline.map((point, index) => (
            <Box key={point.label} sx={{ display: "contents" }}>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  p: 1.5,
                }}
              >
                <Typography variant="body2" fontWeight={700} mb={1}>
                  {point.label}
                </Typography>
                <Box
                  component="img"
                  src={getAssetUrl(point.image)}
                  alt={point.label}
                  sx={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 2, mb: 1 }}
                />
                <Typography variant="body2">Area: {point.area.toFixed(2)} m²</Typography>
                <Box mt={1}>
                  <SeverityChip severity={point.severity} />
                </Box>
              </Box>
              {index < data.timeline.length - 1 ? (
                <Box sx={{ display: "grid", placeItems: "center" }}>
                  <ArrowRight size={22} color="#6d7b8f" />
                </Box>
              ) : null}
            </Box>
          ))}
        </Box>
      </SectionCard>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Area Growth %">
            <Typography variant="h3" color="success.main">+{data.areaGrowthPercent}%</Typography>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Severity Change">
            <Typography variant="h6">{data.severityChange}</Typography>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Recommended Action">
            <Typography color="success.main" fontWeight={700}>
              {data.recommendedAction}
            </Typography>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
