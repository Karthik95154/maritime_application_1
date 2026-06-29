import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Box, Typography, Stack, Grid, CircularProgress, Chip, Table, TableBody, TableCell, TableHead, TableRow, Button, Tabs, Tab, Avatar, FormControl, InputLabel, Select, MenuItem, Card, CardContent, LinearProgress } from "@mui/material";
import { FileText, ShieldAlert, ArrowLeft, Plus, Trash2, Download, AlertTriangle, ShieldCheck, Activity, Eye } from "lucide-react";
import { backendApi, getAssetUrl, API_BASE_URL } from "../api/backendApi";
import { SectionCard } from "../components/SectionCard";
import { SeverityChip } from "../components/SeverityChip";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function VesselProfilePage() {
  const { imoNumber } = useParams<{ imoNumber: string }>();
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const [baselineSessionId, setBaselineSessionId] = useState("");
  const [comparisonSessionId, setComparisonSessionId] = useState("");

  const { data: compareData, isLoading: loadingCompare, refetch: runComparison } = useQuery({
    queryKey: ["compare_reports", imoNumber, baselineSessionId, comparisonSessionId],
    queryFn: () => backendApi.compareReports(imoNumber!, baselineSessionId, comparisonSessionId),
    enabled: false,
  });

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this vessel? This action cannot be undone.")) {
      try {
        await backendApi.deleteVessel(imoNumber!);
        navigate("/fleet");
      } catch (err) {
        alert("Failed to delete vessel");
      }
    }
  };

  const { data: vessel, isLoading: loadingVessel } = useQuery({
    queryKey: ["vessel", imoNumber],
    queryFn: () => backendApi.getVessel(imoNumber!),
    enabled: !!imoNumber,
  });

  const { data: visits, isLoading: loadingVisits } = useQuery({
    queryKey: ["vessel_visits", imoNumber],
    queryFn: () => backendApi.getVesselVisits(imoNumber!),
    enabled: !!imoNumber,
  });

  const { data: defects, isLoading: loadingDefects } = useQuery({
    queryKey: ["vessel_defects", imoNumber],
    queryFn: () => backendApi.getVesselDefects(imoNumber!),
    enabled: !!imoNumber,
  });

  if (loadingVessel || loadingVisits || loadingDefects) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  if (!vessel) {
    return <Typography>Vessel not found.</Typography>;
  }

  const estimatedRepairCost = defects?.reduce((acc: number, curr: any) => acc + (curr.repairCost || 0), 0) || 0;

  // Mock analytics data
  const costTrendData = [
    { year: "2023", cost: estimatedRepairCost * 0.7 },
    { year: "2024", cost: estimatedRepairCost * 0.85 },
    { year: "2025", cost: estimatedRepairCost * 1.1 },
    { year: "2026", cost: estimatedRepairCost }
  ];

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Button component={Link} to="/fleet" startIcon={<ArrowLeft size={16} />} sx={{ color: 'text.secondary' }}>
          Back to Fleet Center
        </Button>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<Trash2 size={16} />}
            onClick={handleDelete}
          >
            Delete Vessel
          </Button>
          <Button 
            component={Link} 
            to={`/inspections?imoNumber=${vessel.imoNumber}&vesselName=${encodeURIComponent(vessel.vesselName)}`} 
            variant="outlined" 
            color="primary"
          >
            New Inspection
          </Button>
          <Button 
            component={Link} 
            to={`/inspections?imoNumber=${vessel.imoNumber}&vesselName=${encodeURIComponent(vessel.vesselName)}${visits?.length > 0 ? `&visitId=${visits[0].visitId}` : ''}`} 
            variant="contained" 
            color="primary" 
            startIcon={<Plus size={16} />}
            disabled={!visits || visits.length === 0}
          >
            Continue Inspection
          </Button>
        </Stack>
      </Stack>
      
      <Box sx={{ p: 4, borderRadius: 4, background: 'linear-gradient(135deg, #1E40AF 0%, #0F172A 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(0,0,0,0) 70%)' }} />
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" position="relative" zIndex={1}>
          <Box>
            <Typography variant="overline" sx={{ color: 'info.main', fontWeight: 800, letterSpacing: 1.5 }}>
              VESSEL PROFILE
            </Typography>
            <Typography variant="h2" fontWeight={800} mt={0.5} mb={0.5}>{vessel.vesselName}</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>IMO: {vessel.imoNumber}</Typography>
              <Chip label={`${vessel.healthScore}/100 Health`} size="small" sx={{ bgcolor: vessel.healthScore > 75 ? 'success.dark' : vessel.healthScore > 60 ? 'warning.dark' : 'error.dark', color: '#fff', fontWeight: 700 }} />
              {vessel.riskScore === "Critical" ? (
                 <Chip icon={<AlertTriangle size={14} color="#fff" />} label="Critical Risk" size="small" sx={{ bgcolor: 'error.main', color: '#fff', fontWeight: 600 }} />
              ) : vessel.riskScore === "High" ? (
                 <Chip icon={<AlertTriangle size={14} color="#fff" />} label="High Risk" size="small" sx={{ bgcolor: 'warning.main', color: '#fff', fontWeight: 600 }} />
              ) : vessel.riskScore === "Medium" ? (
                 <Chip icon={<AlertTriangle size={14} color="#fff" />} label="Medium Risk" size="small" sx={{ bgcolor: 'info.main', color: '#fff', fontWeight: 600 }} />
              ) : (
                 <Chip icon={<ShieldCheck size={14} color="#fff" />} label="Low Risk" size="small" sx={{ bgcolor: 'success.main', color: '#fff', fontWeight: 600 }} />
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, nv) => setTabValue(nv)}
          sx={{
            minHeight: 40,
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 40,
              minWidth: 'auto',
              px: 3,
              py: 1,
              mr: 1,
              fontWeight: 600,
              borderRadius: 8,
              color: 'text.secondary',
              transition: 'all 0.2s',
              '&.Mui-selected': {
                color: 'primary.main',
                bgcolor: 'primary.50',
                boxShadow: '0 2px 8px rgba(30, 64, 175, 0.15)',
              },
              '&:hover:not(.Mui-selected)': {
                bgcolor: 'rgba(0,0,0,0.04)',
              }
            }
          }}
        >
          <Tab label="Overview" />
          <Tab label="Inspections" />
          <Tab label="Defects" />
          <Tab label="Documents" />
          <Tab label="Analytics" />
          <Tab label="Compare Reports" />
        </Tabs>
      </Box>

      {/* OVERVIEW TAB */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}  >
            <SectionCard title="Vessel Information">
              <Stack spacing={2}>
                <Box><Typography variant="caption" color="text.secondary">IMO Number</Typography><Typography variant="body1" fontWeight={700}>{vessel.imoNumber}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Vessel Type</Typography><Typography variant="body1" fontWeight={700}>{vessel.vesselType || "Unknown"}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Gross Tonnage</Typography><Typography variant="body1" fontWeight={700}>{vessel.grossTonnage || "Unknown"}</Typography></Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Fleet Health Score</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mt: 0.75 }}>
                    <LinearProgress
                      variant="determinate"
                      value={vessel.healthScore}
                      sx={{ flex: 1, height: 8, borderRadius: 999, "& .MuiLinearProgress-bar": { backgroundColor: vessel.healthScore > 75 ? "#10B981" : vessel.healthScore > 60 ? "#F59E0B" : "#EF4444" } }}
                    />
                    <Typography fontWeight={700}>{vessel.healthScore}</Typography>
                  </Box>
                </Box>
                <Box><Typography variant="caption" color="text.secondary">Risk Level</Typography><Typography variant="body1" fontWeight={700} color={vessel.riskScore === "Critical" ? "error.main" : "text.primary"}>{vessel.riskScore}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Total Visits</Typography><Typography variant="body1" fontWeight={700}>{vessel.totalVisits || 0}</Typography></Box>
              </Stack>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}  >
            <SectionCard title="Exposure & Activity">
              <Grid container spacing={2}>
                 <Grid size={{ xs: 12, sm: 6 }}  >
                    <Card variant="outlined" sx={{ bgcolor: 'error.50', borderColor: 'error.200' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="error.main" gutterBottom>Estimated Repair Cost</Typography>
                        <Typography variant="h4" fontWeight={800} color="error.dark">₹ {estimatedRepairCost.toLocaleString()}</Typography>
                        <Typography variant="caption" color="error.main">Based on latest defect data</Typography>
                      </CardContent>
                    </Card>
                 </Grid>
                 <Grid size={{ xs: 12, sm: 6 }}  >
                    <Card variant="outlined" sx={{ bgcolor: 'info.50', borderColor: 'info.200' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="info.main" gutterBottom>Last Inspection Date</Typography>
                        <Typography variant="h4" fontWeight={800} color="info.dark">{visits?.length > 0 ? new Date(visits[0].startDate).toLocaleDateString() : 'None'}</Typography>
                        <Typography variant="caption" color="info.main">Pending next scheduled inspection</Typography>
                      </CardContent>
                    </Card>
                 </Grid>
              </Grid>
            </SectionCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* INSPECTIONS TAB */}
      <TabPanel value={tabValue} index={1}>
        <SectionCard title="Dry Dock Visits">
          {visits?.length > 0 ? (
            <Stack spacing={3}>
              {visits.map((visit: any) => (
                <Box key={visit.visitId} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>Visit {visit.visitNumber}</Typography>
                      <Typography variant="subtitle2" color="text.secondary">Started: {visit.startDate ? new Date(visit.startDate).toLocaleDateString() : 'Unknown'}</Typography>
                      <Typography variant="body2">Current Report Version: V{visit.reportVersion}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip label={visit.status} color={visit.status === "Completed" ? "success" : "primary"} />
                    </Stack>
                  </Stack>
                  <Typography variant="subtitle2" mb={1} color="text.secondary">Analysis Sessions (Video Uploads)</Typography>
                  {visit.sessions.map((session: any) => (
                    <Box key={session.sessionId} sx={{ p: 1, mb: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Videos: {session.videos.join(", ")}</Typography>
                        <Chip label={session.status} size="small" />
                      </Stack>
                    </Box>
                  ))}
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">No visits recorded.</Typography>
          )}
        </SectionCard>
      </TabPanel>

      {/* DEFECT REGISTRY TAB */}
      <TabPanel value={tabValue} index={2}>
        <SectionCard title="Defect Gallery" icon={<ShieldAlert size={20} />}>
          {defects && defects.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Defect</TableCell>
                    <TableCell>Classification</TableCell>
                    <TableCell>Timeline</TableCell>
                    <TableCell align="right">Area</TableCell>
                    <TableCell align="right">Est. Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {defects.map((defect: any, idx: number) => (
                    <TableRow key={`${defect.defectId}-${idx}`} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar 
                             variant="rounded" 
                             src={getAssetUrl(defect.thumbnail || "/outputs/sessions/e6d097c3-a69b-4ff3-9b33-1ecd9646512b/module_1_frame_extraction_output/frame_000000.jpg")} 
                             sx={{ width: 56, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} 
                          />
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>{defect.partName}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              ID: {defect.defectId.split('-')[0]} • {defect.defectType.replace("_", " ").toUpperCase()}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1} alignItems="flex-start">
                          <SeverityChip severity={defect.severity} />
                          <Chip size="small" label={defect.status} color={defect.status === 'New' ? 'primary' : 'default'} sx={{ height: 20, fontSize: '0.65rem' }} />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(defect.firstDetected).toLocaleDateString()}</Typography>
                        <Typography variant="caption" color="text.secondary">Last: {new Date(defect.lastDetected).toLocaleDateString()}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>{defect.area?.toFixed(2)} m²</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>₹ {defect.repairCost?.toLocaleString()}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Typography color="text.secondary">No defects recorded for this vessel.</Typography>
          )}
        </SectionCard>
      </TabPanel>

      {/* DOCUMENTS TAB */}
      <TabPanel value={tabValue} index={3}>
        <SectionCard title="Vessel Documents" icon={<FileText size={20} />}>
           <Table>
             <TableHead>
               <TableRow>
                 <TableCell>Document Name</TableCell>
                 <TableCell>Type</TableCell>
                 <TableCell>Uploaded</TableCell>
                 <TableCell align="right">Action</TableCell>
               </TableRow>
             </TableHead>
             <TableBody>
                {visits?.flatMap((visit: any) => 
                  visit.sessions.map((session: any) => ({
                    name: `Inspection Report - Visit ${visit.visitNumber} (v${visit.reportVersion})`,
                    type: "Report",
                    date: session.createdAt ? new Date(session.createdAt).toLocaleDateString() : "Unknown",
                    url: getAssetUrl(`/outputs/sessions/${session.sessionId}/module_6_document_generation_output/vessel_inspection_report.pdf`)
                  }))
                )?.map((doc: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FileText size={16} color="#64748B" />
                        <Typography variant="body2" fontWeight={600}>{doc.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={doc.type} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.05)' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{doc.date}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button component="a" href={doc.url} target="_blank" rel="noopener noreferrer" startIcon={<Eye size={14} />} size="small" variant="outlined" sx={{ textTransform: 'none' }}>View</Button>
                        <Button component="a" href={doc.url} download startIcon={<Download size={14} />} size="small" variant="outlined" sx={{ textTransform: 'none' }}>Download</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">No documents available.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
           </Table>
        </SectionCard>
      </TabPanel>

      {/* ANALYTICS TAB */}
      <TabPanel value={tabValue} index={4}>
        <SectionCard title="Cost Trend Analytics" icon={<Activity size={20} />}>
          <Box sx={{ height: 300, width: "100%", mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val/100000).toFixed(1)}L`} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={(value: number) => [`₹ ${value.toLocaleString()}`, 'Estimated Cost']} />
                <Bar dataKey="cost" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>
      </TabPanel>

      {/* COMPARE TAB */}
      <TabPanel value={tabValue} index={5}>
        <SectionCard title="Compare Reports">
          <Typography color="text.secondary" mb={2}>
            Select two past report versions from a Dry Dock Visit to view the evolution of the vessel's health, including newly discovered defects and growth of existing ones.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}  >
              <FormControl fullWidth size="small">
                <InputLabel id="baseline-select-label">Select Baseline Report</InputLabel>
                <Select
                  labelId="baseline-select-label"
                  value={baselineSessionId}
                  label="Select Baseline Report"
                  onChange={(e) => setBaselineSessionId(e.target.value)}
                >
                  {visits?.flatMap((v: any) => v.sessions).map((session: any) => (
                    <MenuItem key={session.sessionId} value={session.sessionId}>
                      {new Date(session.createdAt).toLocaleDateString()} - {session.videos.length} videos
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}  >
              <FormControl fullWidth size="small">
                <InputLabel id="comparison-select-label">Select Comparison Report</InputLabel>
                <Select
                  labelId="comparison-select-label"
                  value={comparisonSessionId}
                  label="Select Comparison Report"
                  onChange={(e) => setComparisonSessionId(e.target.value)}
                >
                  {visits?.flatMap((v: any) => v.sessions).map((session: any) => (
                    <MenuItem key={session.sessionId} value={session.sessionId}>
                      {new Date(session.createdAt).toLocaleDateString()} - {session.videos.length} videos
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Button 
            variant="contained" 
            sx={{ mt: 3 }} 
            disabled={!baselineSessionId || !comparisonSessionId || baselineSessionId === comparisonSessionId || loadingCompare}
            onClick={() => runComparison()}
          >
            {loadingCompare ? <CircularProgress size={24} color="inherit" /> : "Compare Snapshot"}
          </Button>
          
          {compareData && (
            <Box mt={4}>
              <Typography variant="h6" mb={2} fontWeight={700}>Comparison Results</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}  >
                  <Card variant="outlined" sx={{ bgcolor: 'error.50', borderColor: 'error.200' }}>
                    <CardContent>
                      <Typography color="error.main" fontWeight={700} gutterBottom>New Defects Discovered</Typography>
                      {compareData.newDefects.length > 0 ? (
                        <Stack spacing={1}>
                          {compareData.newDefects.map((def: string, i: number) => (
                            <Typography key={i} variant="body2">• {def}</Typography>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">None</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}  >
                  <Card variant="outlined" sx={{ bgcolor: 'success.50', borderColor: 'success.200' }}>
                    <CardContent>
                      <Typography color="success.main" fontWeight={700} gutterBottom>Resolved Defects</Typography>
                      {compareData.resolvedDefects.length > 0 ? (
                        <Stack spacing={1}>
                          {compareData.resolvedDefects.map((def: string, i: number) => (
                            <Typography key={i} variant="body2">• {def}</Typography>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">None</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}  >
                  <Card variant="outlined" sx={{ bgcolor: 'info.50', borderColor: 'info.200' }}>
                    <CardContent>
                      <Typography color="info.main" fontWeight={700} gutterBottom>Updated Defects</Typography>
                      {compareData.updatedDefects.length > 0 ? (
                        <Stack spacing={1}>
                          {compareData.updatedDefects.map((def: string, i: number) => (
                            <Typography key={i} variant="body2">• {def}</Typography>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">None</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Box mt={3} p={3} sx={{ bgcolor: 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  Net Cost Difference: <Box component="span" sx={{ color: compareData.costDifference > 0 ? 'error.main' : 'success.main' }}>
                    {compareData.costDifference > 0 ? '+' : ''}₹ {compareData.costDifference.toLocaleString()}
                  </Box>
                </Typography>
              </Box>

              <Box mt={4}>
                <Typography variant="h6" mb={2} fontWeight={700}>Side-by-Side Document Review</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>Baseline Report</Typography>
                    <Box sx={{ height: 600, width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                      <iframe 
                        src={getAssetUrl(`/outputs/sessions/${baselineSessionId}/module_6_document_generation_output/vessel_inspection_report.pdf`)}
                        width="100%" 
                        height="100%" 
                        style={{ border: 'none' }}
                        title="Baseline Report"
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>Comparison Report</Typography>
                    <Box sx={{ height: 600, width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                      <iframe 
                        src={getAssetUrl(`/outputs/sessions/${comparisonSessionId}/module_6_document_generation_output/vessel_inspection_report.pdf`)}
                        width="100%" 
                        height="100%" 
                        style={{ border: 'none' }}
                        title="Comparison Report"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </SectionCard>
      </TabPanel>

    </Stack>
  );
}
