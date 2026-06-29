import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Grid, MenuItem, Stack, TextField, Typography, Card, CardContent, CircularProgress } from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { Download, ExternalLink, Activity, AlertTriangle } from "lucide-react";
import { backendApi, getAssetUrl } from "../api/backendApi";
import { SectionCard } from "../components/SectionCard";
import { SeverityChip } from "../components/SeverityChip";
import { ImagePreviewModal } from "../components/ImagePreviewModal";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function DefectReviewPage() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: defects, isLoading } = useQuery({
    queryKey: ["all_defects"],
    queryFn: backendApi.getAllDefects,
  });

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      { accessorKey: "defectId", header: "Defect ID", Cell: ({ cell }) => cell.getValue<string>().split('-')[0] },
      { accessorKey: "vesselId", header: "Vessel IMO" },
      {
        accessorKey: "thumbnail",
        header: "Image",
        Cell: ({ cell }) => (
          <Box
            component="img"
            src={getAssetUrl(cell.getValue<string>() || "/outputs/sessions/e6d097c3-a69b-4ff3-9b33-1ecd9646512b/module_1_frame_extraction_output/frame_000000.jpg")}
            alt="defect"
            onClick={() => setPreviewImage(getAssetUrl(cell.getValue<string>() || "/outputs/sessions/e6d097c3-a69b-4ff3-9b33-1ecd9646512b/module_1_frame_extraction_output/frame_000000.jpg"))}
            sx={{ width: 64, height: 48, borderRadius: 1.5, objectFit: "cover", cursor: "pointer", transition: "transform 0.2s", "&:hover": { transform: "scale(1.1)" } }}
          />
        ),
      },
      { accessorKey: "partName", header: "Location" },
      { accessorKey: "defectType", header: "Defect Type", Cell: ({ cell }) => cell.getValue<string>().replace("_", " ").toUpperCase() },
      {
        accessorKey: "severity",
        header: "Severity",
        Cell: ({ cell }) => <SeverityChip severity={cell.getValue<string>() as any} />,
      },
      {
        accessorKey: "area",
        header: "Area",
        Cell: ({ cell }) => `${cell.getValue<number>()?.toFixed(2)} m²`,
      },
      {
        accessorKey: "growth",
        header: "Growth",
        Cell: ({ row }) => {
            const hist = row.original.history || [];
            if (hist.length < 2) return <Typography variant="caption" color="text.secondary">N/A</Typography>;
            const first = hist[0].area;
            const last = hist[hist.length - 1].area;
            const pct = ((last - first) / first) * 100;
            return (
                <Typography variant="body2" fontWeight={700} color={pct > 0 ? "error.main" : "success.main"}>
                    {pct > 0 ? "+" : ""}{pct.toFixed(1)}%
                </Typography>
            );
        }
      },
      {
        accessorKey: "lastDetected",
        header: "Last Detected",
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString(),
      },
    ],
    [],
  );

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  // Mock progression data for the chart based on aggregated defects (Rust specific for demo)
  const progressionData = [
    { year: '2023 Q1', area: 12.5 },
    { year: '2023 Q3', area: 15.2 },
    { year: '2024 Q1', area: 22.8 },
    { year: '2024 Q3', area: 35.4 },
    { year: '2025 Q1', area: 54.1 },
  ];

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={1.2} sx={{ textTransform: 'uppercase' }}>
            Workspace / Defect Intelligence
          </Typography>
          <Typography variant="h4" fontWeight={800} mt={0.5} color="primary.main">Defect Intelligence Center</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Download size={16} />}
          onClick={() => {
            import("react-hot-toast").then((toast) => toast.default.success("Defect registry exported successfully."));
          }}
        >
          Export Registry
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}  >
          <SectionCard title="Defect Distribution by Severity" icon={<AlertTriangle size={20} />}>
            <Stack spacing={2} mt={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" fontWeight={600}>Critical</Typography>
                  <Typography variant="body2" fontWeight={700} color="error.main">{defects?.filter((d: any) => d.severity === 'Critical').length || 0}</Typography>
                </Stack>
                <Box sx={{ height: 6, bgcolor: 'error.100', borderRadius: 3 }}>
                   <Box sx={{ height: '100%', width: '15%', bgcolor: 'error.main', borderRadius: 3 }} />
                </Box>
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" fontWeight={600}>Major</Typography>
                  <Typography variant="body2" fontWeight={700} color="warning.main">{defects?.filter((d: any) => d.severity === 'Major').length || 0}</Typography>
                </Stack>
                <Box sx={{ height: 6, bgcolor: 'warning.100', borderRadius: 3 }}>
                   <Box sx={{ height: '100%', width: '35%', bgcolor: 'warning.main', borderRadius: 3 }} />
                </Box>
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" fontWeight={600}>Minor</Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main">{defects?.filter((d: any) => d.severity === 'Minor').length || 0}</Typography>
                </Stack>
                <Box sx={{ height: 6, bgcolor: 'success.100', borderRadius: 3 }}>
                   <Box sx={{ height: '100%', width: '50%', bgcolor: 'success.main', borderRadius: 3 }} />
                </Box>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}  >
          <SectionCard title="Rust Progression (Fleet Average)" icon={<Activity size={20} />}>
            <Box sx={{ height: 180, width: "100%", mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ stroke: "rgba(0,0,0,0.1)", strokeWidth: 2 }} contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={(value: number) => [`${value} m²`, 'Avg Area']} />
                  <Line type="monotone" dataKey="area" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard title="Global Defect Registry">
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}   >
            <TextField select fullWidth size="small" label="Vessel" defaultValue="All Vessels">
              <MenuItem value="All Vessels">All Vessels</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}   >
            <TextField select fullWidth size="small" label="Severity" defaultValue="All Severity">
              <MenuItem value="All Severity">All Severity</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
              <MenuItem value="Major">Major</MenuItem>
              <MenuItem value="Minor">Minor</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}   >
            <TextField select fullWidth size="small" label="Defect Type" defaultValue="All Defect Types">
              <MenuItem value="All Defect Types">All Defect Types</MenuItem>
              <MenuItem value="Rust">Rust</MenuItem>
              <MenuItem value="Corrosion">Corrosion</MenuItem>
              <MenuItem value="Paint Peeling">Paint Peeling</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}   >
            <TextField fullWidth size="small" label="Search Location/ID" placeholder="e.g. Hull, Deck..." />
          </Grid>
        </Grid>

        <MaterialReactTable
          columns={columns}
          data={defects || []}
          enableColumnActions={false}
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          initialState={{ pagination: { pageSize: 5, pageIndex: 0 } }}
          muiTablePaperProps={{ elevation: 0, sx: { boxShadow: "none" } }}
          muiTableContainerProps={{ sx: { borderRadius: 3, border: "1px solid", borderColor: "divider" } }}
        />
      </SectionCard>

      <ImagePreviewModal 
        open={!!previewImage} 
        onClose={() => setPreviewImage(null)} 
        imageUrl={previewImage} 
      />
    </Stack>
  );
}
