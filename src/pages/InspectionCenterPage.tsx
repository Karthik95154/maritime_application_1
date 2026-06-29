import { useState, useEffect } from "react";
import { Film, Trash2, Scissors, Layers, Box as BoxIcon, Cpu, DollarSign, UploadCloud, FileText, Download, Eye, Wrench, Search, X, Play } from "lucide-react";
import { Avatar, Box, Button, Grid, IconButton, MenuItem, Stack, TextField, Typography, LinearProgress, Dialog, DialogContent, DialogActions, Stepper, Step, StepLabel, Chip, Tabs, Tab, Tooltip, DialogTitle } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SectionCard } from "../components/SectionCard";
import { UploadDropzone } from "../components/UploadDropzone";
import { useAppStore } from "../store/appStore";
import { ReportContent } from "./ReportPage";
import { backendApi, API_BASE_URL } from "../api/backendApi";
import { motion } from "framer-motion";

const PIPELINE_STAGES = [
  { id: "Uploading files...", title: "Step 1: Video Upload", subtitle: "Receive inspection video", icon: UploadCloud },
  { id: "Frame Extraction", title: "Step 2: Frame Extraction", subtitle: "Sample frames at chosen FPS", icon: Scissors },
  { id: "CDS Detection", title: "Step 3: Frame Classification", subtitle: "Identify Deck or Hull per frame", icon: Layers },
  { id: "Temporal Consistency", title: "Step 4: Defect Detection", subtitle: "Locate damage regions (boxes)", icon: BoxIcon },
  { id: "Unique Defect Extraction", title: "Step 5: Segmentation", subtitle: "Pixel-level damage masks", icon: Cpu },
  { id: "Repair Estimation", title: "Step 6: Cost Estimation", subtitle: "Aggregate repair cost", icon: DollarSign },
  { id: "Document Generation", title: "Step 7: Report Generation", subtitle: "Generate final documents", icon: FileText },
];

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inspection-tabpanel-${index}`}
      aria-labelledby={`inspection-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function InspectionCenterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [completedBatchId, setCompletedBatchId] = useState<string | null>(null);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  const { 
    inspectionForm: form, 
    setInspectionForm: setForm,
    inspectionVideos: videos, 
    setInspectionVideos: setVideos,
    uploadStatus,
    uploadProgress,
    uploadError,
    uploadLogs,
    currentStage,
    startInspectionUpload,
    resetInspection,
  } = useAppStore();

  const { data: historyData } = useQuery({
    queryKey: ["historical-inspections"],
    queryFn: backendApi.getHistoricalInspections,
    refetchInterval: 3000,
  });

  const deleteMutation = useMutation({
    mutationFn: backendApi.deleteInspection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["historical-inspections"] }),
  });

  const isUploading = uploadStatus === "uploading";
  const showPipeline = uploadStatus !== "idle";

  useEffect(() => {
    const imo = searchParams.get("imoNumber");
    const name = searchParams.get("vesselName");
    const visitId = searchParams.get("visitId");

    if (imo || name || visitId) {
      setActiveTab(0); // Force "New Inspection" tab if passing params
      setForm((prev) => ({
        ...prev,
        imoNumber: imo || prev.imoNumber,
        vesselName: name || prev.vesselName,
        visitId: visitId || "",
      }));
    }
  }, [searchParams, setForm]);

  const getCurrentStageIndex = () => {
    if (uploadStatus === "success" || currentStage === "Completed") return PIPELINE_STAGES.length;
    if (currentStage === "Awaiting Frame Review") return 1;
    if (currentStage === "Awaiting Defect Review") return 4;

    const index = PIPELINE_STAGES.findIndex(s => s.id === currentStage);
    if (index === -1) {
      if (currentStage === "Awaiting Confidence Review") return 5;
      if (currentStage === "Queued" || currentStage === "Uploading files...") return 0;
      return 1;
    }
    return index;
  };

  const stageIndex = getCurrentStageIndex();

  const isFormValid = !!(
    form.vesselName &&
    form.imoNumber &&
    form.vesselType &&
    form.grossTonnage &&
    form.inspectorName &&
    form.location &&
    form.inspectionDate
  );

  const handleCreate = () => {
    startInspectionUpload((batchId) => {
      setCompletedBatchId(batchId);
    });
  };

  const addVideos = (selectedFiles: File[]) => {
    setVideos((current) => {
      const next = [...current];
      for (const file of selectedFiles) {
        const alreadyExists = next.some((v) => v.file.name === file.name && v.file.size === file.size);
        if (!alreadyExists) {
          next.push({ id: `${file.name}-${file.lastModified}`, file, previewUrl: URL.createObjectURL(file) });
        }
      }
      return next;
    });
  };

  const removeVideo = (id: string) => {
    setVideos((current) => {
      const target = current.find((v) => v.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((v) => v.id !== id);
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderInspectionList = (filterStatus: string) => {
    if (!historyData) return <LinearProgress />;
    
    let filtered = historyData;
    if (filterStatus === "in_progress") {
      filtered = historyData.filter(item => item.progress < 100 && item.status !== "error" && item.status !== "Failed");
    } else if (filterStatus === "completed") {
      filtered = historyData.filter(item => (item.progress === 100 || item.status === "Completed") && item.status !== "error");
    } else if (filterStatus === "archived") {
      filtered = historyData.filter(item => item.status === "error" || item.status === "Failed" || item.status === "Archived");
    }

    if (filtered.length === 0) {
      return (
        <Box p={4} textAlign="center" bgcolor="background.paper" borderRadius={2} border="1px solid" borderColor="divider">
          <Typography color="text.secondary">No inspections found in this category.</Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={2}>
        {filtered.map((item) => (
          <SectionCard key={item.sessionId}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}  >
                <Typography variant="caption" color="text.secondary" display="block">Vessel / IMO</Typography>
                <Typography variant="body1" fontWeight={700} color="primary.main">{item.vesselName}</Typography>
                <Typography variant="body2" color="text.secondary">{item.imoNumber}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12, md: 3 }}  >
                <Typography variant="caption" color="text.secondary" display="block">Status</Typography>
                {item.progress < 100 && item.status !== "error" && item.status !== "Failed" ? (
                  <Box sx={{ mt: 0.5 }}>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption" color="primary.main" fontWeight={700} noWrap sx={{ maxWidth: 100 }}>
                        {item.currentStage || "Processing"}
                      </Typography>
                      <Typography variant="caption" color="primary.main" fontWeight={700}>
                        {Math.round(item.progress)}%
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={item.progress} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                ) : item.status === "error" || item.status === "Failed" ? (
                  <Chip label="Failed" color="error" size="small" />
                ) : (
                  <Chip label="Completed" color="success" size="small" />
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}  >
                <Typography variant="caption" color="text.secondary" display="block">Health Score</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mt: 0.75 }}>
                  <LinearProgress
                    variant="determinate"
                    value={item.healthScore || 0}
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 999,
                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          (item.healthScore || 0) > 75 ? "#10B981" : (item.healthScore || 0) > 60 ? "#F59E0B" : "#EF4444",
                      },
                    }}
                  />
                  <Typography fontWeight={700}>{item.healthScore || 0}</Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}  >
                <Typography variant="caption" color="text.secondary" display="block">Total Defects</Typography>
                <Typography variant="h6" fontWeight={700}>{item.defectCount || 0}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}   display="flex" justifyContent="flex-end" gap={1}>
                {item.progress < 100 && item.status !== "error" ? (
                  <Button variant="outlined" size="small" onClick={() => setActiveTab(1)}>View Progress</Button>
                ) : (
                  <>
                    <Tooltip title="Re-run Analysis (Add Videos)">
                      <IconButton color="info" onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          vesselName: item.vesselName,
                          imoNumber: item.imoNumber,
                          visitId: item.sessionId // Or visitId if it was present
                        }));
                        setActiveTab(0);
                      }}>
                        <Layers size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Report">
                      <IconButton color="primary" onClick={() => setSelectedReportId(item.sessionId)}>
                        <FileText size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Defects">
                      <IconButton color="secondary" onClick={() => navigate(`/inspections/${item.sessionId}/defects`)}>
                        <Wrench size={18} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Grid>
            </Grid>
          </SectionCard>
        ))}
      </Stack>
    );
  };

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={1.2} sx={{ textTransform: 'uppercase' }}>
        Workspace / Inspection Center
      </Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h4" fontWeight={800} color="primary.main">
          Inspection Center
        </Typography>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="New Inspection" />
          <Tab label="Completed" />
          <Tab label="Archived" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 4 }}  >
            <SectionCard title="Upload Videos" subtitle="Attach multiple inspection passes for the same vessel">
              <UploadDropzone
                progress={uploadProgress}
                fileCount={videos.length}
                onFilesSelect={addVideos}
                disabled={isUploading}
              />
              {videos.length > 0 ? (
                <Stack spacing={1.25} mt={2}>
                  {videos.map((video, index) => (
                      <Box
                        key={video.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "160px 1fr auto",
                        gap: 1.5,
                        alignItems: "center",
                        p: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3,
                        bgcolor: "#fff",
                      }}
                    >
                        <Box
                          component="video"
                          src={video.previewUrl}
                          muted
                          controls
                          preload="metadata"
                          sx={{
                            width: 160,
                            height: 100,
                            borderRadius: 2,
                            objectFit: "cover",
                            bgcolor: "primary.main",
                          }}
                        />
                      <Box minWidth={0}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: "rgba(30,64,175,0.12)", color: "secondary.main" }}>
                            <Film size={14} />
                          </Avatar>
                          <Typography variant="body2" fontWeight={700}>
                            Video {index + 1}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {video.file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(video.file.size / (1024 * 1024)).toFixed(1)} MB
                        </Typography>
                      </Box>
                      <IconButton onClick={() => removeVideo(video.id)} color="error" disabled={isUploading}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              ) : null}
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}  >
            <Stack spacing={2}>
              <SectionCard title="Vessel Information">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}  >
                    <TextField required size="small" fullWidth disabled={isUploading} label="Vessel Name" value={form.vesselName} onChange={(e) => setForm((curr) => ({ ...curr, vesselName: e.target.value }))} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}  >
                    <TextField required size="small" fullWidth disabled={isUploading} label="IMO Number" value={form.imoNumber} onChange={(e) => setForm((curr) => ({ ...curr, imoNumber: e.target.value }))} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}  >
                    <TextField required size="small" select fullWidth disabled={isUploading} label="Vessel Type" value={form.vesselType} onChange={(e) => setForm((curr) => ({ ...curr, vesselType: e.target.value }))}>
                      <MenuItem value="Bulk Carrier">Bulk Carrier</MenuItem>
                      <MenuItem value="Container">Container</MenuItem>
                      <MenuItem value="Tanker">Tanker</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}  >
                    <TextField required size="small" fullWidth disabled={isUploading} label="Gross Tonnage" value={form.grossTonnage} onChange={(e) => setForm((curr) => ({ ...curr, grossTonnage: e.target.value }))} />
                  </Grid>
                </Grid>
              </SectionCard>

              <SectionCard title="Inspection Metadata">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}  >
                    <TextField required size="small" fullWidth disabled={isUploading} label="Inspector Name" value={form.inspectorName} onChange={(e) => setForm((curr) => ({ ...curr, inspectorName: e.target.value }))} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}  >
                    <TextField required size="small" fullWidth disabled={isUploading} label="Location" value={form.location} onChange={(e) => setForm((curr) => ({ ...curr, location: e.target.value }))} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}  >
                    <TextField required size="small" fullWidth disabled={isUploading} type="datetime-local" label="Inspection Date & Time" value={form.inspectionDate} onChange={(e) => setForm((curr) => ({ ...curr, inspectionDate: e.target.value }))} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}  >
                    <TextField size="small" fullWidth disabled={isUploading} multiline minRows={2} placeholder="Comments" value={form.comments} onChange={(e) => setForm((curr) => ({ ...curr, comments: e.target.value }))} />
                  </Grid>
                </Grid>
                <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
                  <Button 
                    variant="outlined" 
                    disabled={isUploading} 
                    onClick={resetInspection}
                    sx={{ 
                      px: 3, 
                      py: 1, 
                      borderRadius: 2, 
                      textTransform: 'none', 
                      fontWeight: 600,
                      borderColor: 'divider',
                      color: 'text.secondary',
                      '&:hover': { borderColor: 'text.primary', bgcolor: 'transparent' }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleCreate} 
                    disabled={isUploading || !videos.length || !isFormValid}
                    startIcon={!isUploading && <Play size={18} />}
                    sx={{
                      px: 4,
                      py: 1.2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.23)',
                        transform: 'translateY(-1px)'
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    {isUploading ? `Processing ${videos.length} video${videos.length > 1 ? "s" : ""}...` : "Start Analysis"}
                  </Button>
                </Stack>
              </SectionCard>

              {showPipeline && (
                <Box 
                  sx={{ 
                    mt: 3, 
                    p: 4, 
                    borderRadius: 4, 
                    bgcolor: uploadStatus === "error" ? "#fee2e2" : "primary.main", 
                    color: uploadStatus === "error" ? "error.main" : "#fff",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <Stack spacing={4} sx={{ position: "relative", zIndex: 1 }}>
                    <Stepper activeStep={stageIndex} alternativeLabel sx={{ '& .MuiStepConnector-line': { borderColor: 'rgba(255,255,255,0.1)' } }}>
                      {PIPELINE_STAGES.map((stage, index) => {
                        const isCompleted = index < stageIndex;
                        const isCurrent = index === stageIndex;
                        const isFailed = isCurrent && uploadStatus === "error";

                        return (
                          <Step key={stage.id} completed={isCompleted}>
                            <StepLabel
                              error={isFailed}
                              StepIconProps={{
                                sx: {
                                  color: isCompleted ? '#10B981' : isCurrent ? '#06B6D4' : 'rgba(255,255,255,0.2)',
                                  '&.Mui-active': { color: '#06B6D4' },
                                  '&.Mui-completed': { color: '#10B981' },
                                  '&.Mui-error': { color: '#EF4444' },
                                }
                              }}
                              sx={{
                                '& .MuiStepLabel-label': {
                                  color: isCompleted || isCurrent ? '#fff' : 'rgba(255,255,255,0.5)',
                                  fontWeight: isCurrent ? 700 : 500,
                                  fontSize: 12,
                                  mt: 1,
                                }
                              }}
                            >
                              {stage.title.split(': ')[1] || stage.title}
                            </StepLabel>
                          </Step>
                        );
                      })}
                    </Stepper>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight={800}>
                        {uploadStatus === "error" 
                          ? "Pipeline Failure" 
                          : uploadStatus === "success"
                            ? "Inspection Analysis Complete"
                            : currentStage || PIPELINE_STAGES[stageIndex]?.title}
                      </Typography>
                      <Stack direction="row" alignItems="center" gap={2}>
                        {uploadStatus === "success" && completedBatchId && (
                          <Button 
                            variant="contained" 
                            color="success" 
                            onClick={() => setShowReportPopup(true)}
                            startIcon={<FileText size={16} />}
                          >
                            View Document
                          </Button>
                        )}
                        <Typography variant="h4" fontWeight={800} color={uploadStatus === "error" ? "error.main" : "secondary.light"}>
                          {Math.round(uploadProgress)}%
                        </Typography>
                      </Stack>
                    </Stack>
                    
                    <Box sx={{ position: 'relative' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress} 
                        sx={{ 
                          height: 16, 
                          borderRadius: 8,
                          bgcolor: uploadStatus === "error" ? "error.100" : "rgba(255, 255, 255, 0.1)",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: uploadStatus === "error" ? "#EF4444" : "#06B6D4",
                          }
                        }} 
                      />
                    </Box>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {renderInspectionList("completed")}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        {renderInspectionList("archived")}
      </TabPanel>

      <Dialog 
        open={showReportPopup} 
        onClose={() => {
          setShowReportPopup(false);
          setCompletedBatchId(null);
          resetInspection();
        }} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{ sx: { bgcolor: "background.default", height: "90vh" } }}
      >
        <DialogContent sx={{ p: 4 }}>
          {completedBatchId && <ReportContent batchId={completedBatchId} hideHeader />}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "background.paper" }}>
          <Button onClick={() => {
            setShowReportPopup(false);
            setCompletedBatchId(null);
            resetInspection();
          }} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={Boolean(selectedReportId)} 
        onClose={() => setSelectedReportId(null)}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { bgcolor: "background.default", height: "90vh" } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 1 }}>
          <Typography component="div" variant="h5">Inspection Report</Typography>
          <IconButton onClick={() => setSelectedReportId(null)}>
            <X />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedReportId && <ReportContent sessionId={selectedReportId} hideHeader />}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
