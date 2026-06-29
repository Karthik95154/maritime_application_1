import { Box, Button, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { backendApi } from "../api/backendApi";
import { SectionCard } from "./SectionCard";

interface InspectionSelectionListProps {
  title: string;
  subtitle: string;
  onSelectPath: (sessionId: string) => string;
}

export function InspectionSelectionList({ title, subtitle, onSelectPath }: InspectionSelectionListProps) {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["historical-inspections"],
    queryFn: backendApi.getHistoricalInspections,
  });

  if (!data) return null;

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
      <Typography variant="h4" fontSize={28}>
        {title}
      </Typography>
      
      <SectionCard title="Available Inspections">
        <Box sx={{ display: "grid", gap: 1 }}>
          {data.map((item) => (
            <Box
              key={item.sessionId}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.5fr 1.5fr 1fr 1fr 1fr" },
                gap: 2,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                alignItems: "center",
                cursor: "pointer",
                transition: "background-color 0.2s",
                "&:hover": { bgcolor: "rgba(0,0,0,0.02)" }
              }}
              onClick={() => navigate(onSelectPath(item.sessionId))}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">Inspection ID</Typography>
                <Typography fontWeight={700}>{item.sessionId}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Vessel Name</Typography>
                <Typography>{item.vesselName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Date</Typography>
                <Typography>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Typography color="success.main" fontWeight={700}>{item.status}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" size="small">Select</Button>
              </Box>
            </Box>
          ))}
        </Box>
      </SectionCard>
    </Stack>
  );
}
