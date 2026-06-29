import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Grid, Stack, Typography, Select, MenuItem, FormControl } from "@mui/material";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { backendApi, getAssetUrl } from "../api/backendApi";
import { SectionCard } from "../components/SectionCard";
import { SeverityChip } from "../components/SeverityChip";
import { VesselMap } from "../components/VesselMap";
import { InspectionSelectionList } from "../components/InspectionSelectionList";
import { defectRecords, vesselSideImage, vesselTopSchematic } from "../data/mockData";
import { useAppStore } from "../store/appStore";
import { ImagePreviewModal } from "../components/ImagePreviewModal";

export function VesselVisualizationPage() {
  const params = useParams<{ sessionId?: string }>();

  const historyQuery = useQuery({
    queryKey: ["inspectionHistory"],
    queryFn: backendApi.getHistoricalInspections,
    enabled: !params.sessionId
  });

  if (!params.sessionId) {
    if (historyQuery.isLoading) return null;
    if (historyQuery.data && historyQuery.data.length > 0) {
      return <Navigate to={`/inspections/${historyQuery.data[0].sessionId}/visualization`} replace />;
    }
    return <Typography>No vessels found.</Typography>;
  }

  return <VesselVisualizationDetail sessionId={params.sessionId} />;
}

function VesselVisualizationDetail({ sessionId }: { sessionId: string }) {
  const { selectedDefectId, setSelectedDefectId } = useAppStore();
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const { data } = useQuery({
    queryKey: ["visualization", sessionId],
    queryFn: () => backendApi.getInspectionVisualization(sessionId),
  });

  const historyQuery = useQuery({
    queryKey: ["inspectionHistory"],
    queryFn: backendApi.getHistoricalInspections,
  });

  useEffect(() => {
    if (data?.selectedDefectId) {
      setSelectedDefectId(data.selectedDefectId);
    }
  }, [data?.selectedDefectId, setSelectedDefectId]);

  if (!data) return null;

  const selected =
    data.defects.find((item) => item.defectId === selectedDefectId) ??
    data.defects[0] ??
    defectRecords[0];

  // Map backend markers to visually realistic coordinates for our specific generated images
  const topMarkers = data.markers.map((m, i) => ({
    ...m,
    x: [42, 58, 48, 52, 50, 45, 55][i % 7],
    y: [20, 35, 50, 65, 80, 28, 75][i % 7]
  }));

  const sideMarkers = data.markers.map((m, i) => ({
    ...m,
    x: [25, 40, 55, 70, 85, 30, 80][i % 7],
    y: [72, 75, 70, 76, 74, 68, 70][i % 7]
  }));

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">
        Vessel Assets / {sessionId} / Map
      </Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontSize={28}>
          Vessel Visualization
        </Typography>
        <FormControl size="small" sx={{ minWidth: 250, bgcolor: "background.paper", borderRadius: 1 }}>
          <Select
            value={sessionId}
            onChange={(e) => navigate(`/inspections/${e.target.value}/visualization`)}
            displayEmpty
          >
            {historyQuery.data?.map((h) => (
              <MenuItem key={h.sessionId} value={h.sessionId}>
                {h.vesselName} ({h.vesselType})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 3.2 }}>
          <SectionCard title="Top View Vessel Schematic">
            <VesselMap image={vesselTopSchematic} markers={topMarkers} />
            <Stack spacing={1.5} mt={2}>
              {[
                ["High Severity", "#E55252"],
                ["Medium Severity", "#F4B740"],
                ["Low Severity", "#22A861"],
              ].map(([label, color]) => (
                <Stack key={label} direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
                  <Typography variant="body2">{label}</Typography>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 8.8 }}>
          <SectionCard title="Port Side View">
            <VesselMap image={vesselSideImage} markers={sideMarkers} />
          </SectionCard>
          <Box sx={{ mt: 2 }}>
            <SectionCard title="Selected Defect Details">
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
                    <Box
                      component="img"
                      src={getAssetUrl(selected.thumbnail)}
                      alt={selected.defectId}
                      onClick={() => setPreviewImage(getAssetUrl(selected.thumbnail))}
                      sx={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 2.5, cursor: "pointer", transition: "transform 0.2s", "&:hover": { transform: "scale(1.05)" } }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 9 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="caption" color="text.secondary">Defect ID</Typography>
                      <Typography fontWeight={700}>{selected.defectId}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="caption" color="text.secondary">Vessel Part</Typography>
                      <Typography fontWeight={700}>{selected.partName}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                      <Typography variant="caption" color="text.secondary">Severity</Typography>
                      <Box mt={0.5}><SeverityChip severity={selected.severity} /></Box>
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                      <Typography variant="caption" color="text.secondary">Area</Typography>
                      <Typography fontWeight={700}>{selected.area.toFixed(2)} m²</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <Typography variant="caption" color="text.secondary">Estimated Cost</Typography>
                      <Typography fontWeight={700}>₹ {selected.repairCost.toLocaleString("en-IN")}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </SectionCard>
          </Box>
        </Grid>
      </Grid>
      
      <ImagePreviewModal 
        open={!!previewImage} 
        onClose={() => setPreviewImage(null)} 
        imageUrl={previewImage} 
      />
    </Stack>
  );
}
