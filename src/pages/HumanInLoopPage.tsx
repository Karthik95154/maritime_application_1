import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Alert, Avatar, Box, Button, Chip, Grid, LinearProgress, Stack, TextField, Typography, 
  Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox,
  ToggleButton, ToggleButtonGroup, Toolbar, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { CheckCheck, CircleAlert, RefreshCcw, Wrench, Save, Play, XCircle, LayoutGrid, List as ListIcon, CheckSquare, Maximize, ChevronLeft, ChevronRight, Flag, Monitor } from "lucide-react";
import { backendApi, getAssetUrl } from "../api/backendApi";
import { SectionCard } from "../components/SectionCard";

const PART_CLASSES = ["Hull", "Deck", "Bulkhead", "Ballast Tank", "Cargo Hold", "Propeller", "Rudder", "Superstructure", "Pipeline", "Machinery", "Engine Room", "Anchor System", "Other"];
const DEFECT_TYPES = ["Corrosion", "Pitting Corrosion", "Crack", "Fracture", "Dent", "Deformation", "Coating Failure", "Peeling Paint", "Weld Defect", "Structural Damage", "Hole / Perforation", "Marine Growth", "Biofouling", "Erosion", "Fatigue Damage", "Mechanical Damage", "Leakage", "Surface Defect", "Other"];
const SEVERITIES = ["Low", "Medium", "High"];
const PRIORITIES = ["Low", "Medium", "High", "Immediate"];
const REASONS = ["Visual verification", "Misclassification", "Engineering judgement", "Poor image quality", "Other"];

type ItemType = "frame" | "defect";
type ItemStatus = "pending" | "reviewed" | "corrected" | "auto_accepted" | "flagged";

interface ReviewItem {
  id: string;
  type: ItemType;
  thumbnail: string;
  frameId: string;
  aiPart: string;
  aiDefect: string;
  aiSeverity: string;
  confidence: number;
  bbox?: number[];
}

export function HumanInLoopPage() {
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [notes, setNotes] = useState("");
  
  // Correction State
  const [frameCorrections, setFrameCorrections] = useState<Record<string, any>>({});
  const [defectCorrections, setDefectCorrections] = useState<Record<string, any>>({});
  const [reviewStartTime, setReviewStartTime] = useState<number>(Date.now());
  const [itemStatuses, setItemStatuses] = useState<Record<string, ItemStatus>>({});

  // View & Bulk State
  const [viewMode, setViewMode] = useState<"focus" | "grid" | "card">("focus");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgSize, setImgSize] = useState<{w: number, h: number} | null>(null);

  // Clear image size when index changes
  useEffect(() => {
    setImgSize(null);
    setIsDrawingBbox(false);
  }, [currentIndex]);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  
  // BBox Drawing State
  const [isDrawingBbox, setIsDrawingBbox] = useState(false);
  const [drawStart, setDrawStart] = useState<{x: number, y: number} | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{x: number, y: number} | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Bulk Operation State
  const [bulkDefectType, setBulkDefectType] = useState("");
  const [bulkPart, setBulkPart] = useState("");
  const [bulkSeverity, setBulkSeverity] = useState("");
  const [bulkPriority, setBulkPriority] = useState("");

  const queueQuery = useQuery({
    queryKey: ["internal-review-queue"],
    queryFn: backendApi.getInternalReviewQueue,
    refetchInterval: 4000,
  });

  const queue = queueQuery.data ?? [];

  const activeQueue = useMemo(
    () => queue.filter((item) => item.reviewCheckpoint === "confidence_review" || item.reviewStatus === "pending" || item.status === "assessment_in_progress"),
    [queue],
  );

  useEffect(() => {
    if (!selectedSessionId && activeQueue.length > 0) {
      setSelectedSessionId(activeQueue[0].sessionId);
      setReviewStartTime(Date.now());
    }
  }, [activeQueue, selectedSessionId]);

  const detailQuery = useQuery({
    queryKey: ["internal-review-detail", selectedSessionId],
    queryFn: () => backendApi.getInternalReviewDetail(selectedSessionId),
    enabled: Boolean(selectedSessionId),
  });

  // Local storage restoration
  useEffect(() => {
    if (selectedSessionId) {
      const saved = localStorage.getItem(`review_${selectedSessionId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFrameCorrections(parsed.frameCorrections || {});
          setDefectCorrections(parsed.defectCorrections || {});
          setItemStatuses(parsed.itemStatuses || {});
        } catch (e) {
          console.error("Failed to parse local storage", e);
        }
      } else {
        setFrameCorrections({});
        setDefectCorrections({});
        setItemStatuses({});
        setCurrentIndex(0);
        setReviewStartTime(Date.now());
      }
      setNotes(detailQuery.data?.reviewNotes ?? "");
      setSelectedItemIds([]);
    }
  }, [selectedSessionId, detailQuery.data?.reviewNotes]);

  // Periodic Local Save
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedSessionId) {
        localStorage.setItem(`review_${selectedSessionId}`, JSON.stringify({
          frameCorrections, defectCorrections, itemStatuses
        }));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedSessionId, frameCorrections, defectCorrections, itemStatuses]);

  const reviewMutation = useMutation({
    mutationFn: (decision: "assess_continue" | "save_assessment" | "reject") => {
      const review_duration = Math.round((Date.now() - reviewStartTime) / 1000);
      return backendApi.submitInternalReviewDecision(selectedSessionId, {
        checkpoint: "confidence_review",
        decision,
        notes,
        reviewer: "Developer team",
        reviewer_role: "Maritime Engineer",
        review_duration,
        frame_corrections: frameCorrections,
        defect_corrections: defectCorrections
      });
    },
    onSuccess: async (data, decision) => {
      if (decision !== "save_assessment") {
        localStorage.removeItem(`review_${selectedSessionId}`);
        // Optimistically remove the completed session so it doesn't get re-selected instantly
        queryClient.setQueryData(["internal-review-queue"], (old: any) => {
          if (!old) return old;
          return old.filter((item: any) => item.sessionId !== selectedSessionId);
        });
        setSelectedSessionId("");
      }
      setShowSummaryDialog(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["internal-review-queue"] }),
        queryClient.invalidateQueries({ queryKey: ["internal-review-detail", selectedSessionId] }),
        queryClient.invalidateQueries({ queryKey: ["historical-inspections"] }),
      ]);
    },
  });

  const selected = detailQuery.data;
  const lowConfidenceFrames = selected?.confidenceReviewItems?.lowConfidenceFrames ?? [];
  const lowConfidenceDefects = selected?.confidenceReviewItems?.lowConfidenceDefects ?? [];

  const unifiedItems: ReviewItem[] = useMemo(() => {
    const items: ReviewItem[] = [];
    lowConfidenceDefects.forEach(d => items.push({
      id: `defect_${d.defectId}`, type: "defect", thumbnail: d.bestFramePath, frameId: d.defectId,
      aiPart: "-", aiDefect: d.defectName, aiSeverity: d.severity, confidence: d.bestFrameConfidence, bbox: d.bbox
    }));
    lowConfidenceFrames.forEach(f => items.push({
      id: `frame_${f.frameId}`, type: "frame", thumbnail: f.framePath, frameId: String(f.frameId),
      aiPart: f.label, aiDefect: "-", aiSeverity: "-", confidence: f.confidence
    }));
    // Sort logic placeholder (priority first)
    return items.sort((a, b) => a.confidence - b.confidence);
  }, [lowConfidenceFrames, lowConfidenceDefects]);

  const totalItems = unifiedItems.length;

  useEffect(() => {
    if (totalItems > 10 && viewMode === "card") {
      setViewMode("focus");
    }
  }, [totalItems, selectedSessionId]);

  const metrics = useMemo(() => {
    const pending = activeQueue.length;
    const reviewed = queue.filter((item) => item.reviewStatus === "approved").length;
    const rejected = queue.filter((item) => item.reviewStatus === "rejected").length;
    const flagged = totalItems;
    return { pending, reviewed, rejected, flagged };
  }, [activeQueue.length, totalItems, queue]);

  const handleUpdateStatus = useCallback((id: string, status: ItemStatus) => {
    setItemStatuses(prev => ({ ...prev, [id]: status }));
  }, []);

  const handleFrameCorrection = useCallback((frameId: string, field: string, value: string) => {
    setFrameCorrections(prev => ({ ...prev, [frameId]: { ...prev[frameId], [field]: value } }));
    handleUpdateStatus(`frame_${frameId}`, "corrected");
  }, [handleUpdateStatus]);

  const handleDefectCorrection = useCallback((defectId: string, field: string, value: any) => {
    setDefectCorrections(prev => ({ ...prev, [defectId]: { ...prev[defectId], [field]: value } }));
    handleUpdateStatus(`defect_${defectId}`, "corrected");
  }, [handleUpdateStatus]);

  const handleClick = (e: React.MouseEvent) => {
    if (!isDrawingBbox || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const transformed = pt.matrixTransform(ctm.inverse());
      
      if (!drawStart) {
        // First click: set the starting dot
        setDrawStart({ x: transformed.x, y: transformed.y });
        setDrawCurrent({ x: transformed.x, y: transformed.y });
      } else {
        // Second click: finalize the box
        const xMin = Math.min(drawStart.x, transformed.x);
        const xMax = Math.max(drawStart.x, transformed.x);
        const yMin = Math.min(drawStart.y, transformed.y);
        const yMax = Math.max(drawStart.y, transformed.y);
        
        if (xMax - xMin > 5 && yMax - yMin > 5) {
          const item = unifiedItems[currentIndex];
          const actualId = item.id.replace("defect_", "");
          
          const existingBboxes = defectCorrections[actualId]?.bboxes || [];
          handleDefectCorrection(actualId, "bboxes", [...existingBboxes, [xMin, yMin, xMax, yMax]]);
        }
        
        // Reset for the next box, but stay in drawing mode
        setDrawStart(null);
        setDrawCurrent(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawingBbox || !drawStart || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const transformed = pt.matrixTransform(ctm.inverse());
      setDrawCurrent({ x: transformed.x, y: transformed.y });
    }
  };

  const clearBoxes = () => {
    const item = unifiedItems[currentIndex];
    const actualId = item.id.replace("defect_", "");
    handleDefectCorrection(actualId, "bboxes", []);
    setDrawStart(null);
    setDrawCurrent(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedItemIds(unifiedItems.map(i => i.id));
    else setSelectedItemIds([]);
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) setSelectedItemIds(prev => [...prev, id]);
    else setSelectedItemIds(prev => prev.filter(i => i !== id));
  };

  const applyBulkAction = () => {
    selectedItemIds.forEach(id => {
      if (id.startsWith("frame_")) {
        const frameId = id.replace("frame_", "");
        if (bulkPart) handleFrameCorrection(frameId, "part_classification", bulkPart);
      } else if (id.startsWith("defect_")) {
        const defectId = id.replace("defect_", "");
        if (bulkDefectType) handleDefectCorrection(defectId, "defect_type", bulkDefectType);
        if (bulkSeverity) handleDefectCorrection(defectId, "severity", bulkSeverity);
        if (bulkPriority) handleDefectCorrection(defectId, "repair_priority", bulkPriority);
      }
    });
    setBulkDefectType("");
    setBulkPart("");
    setBulkSeverity("");
    setBulkPriority("");
    setSelectedItemIds([]);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (viewMode !== "focus") return;

      const currentItem = unifiedItems[currentIndex];
      if (!currentItem) return;

      const isDefect = currentItem.type === "defect";
      const actualId = isDefect ? currentItem.id.replace("defect_", "") : currentItem.id.replace("frame_", "");

      switch (e.key) {
        case "ArrowRight":
        case "Enter":
          if (itemStatuses[currentItem.id] === "pending" || !itemStatuses[currentItem.id]) {
            handleUpdateStatus(currentItem.id, "auto_accepted");
          }
          if (currentIndex < totalItems - 1) setCurrentIndex(prev => prev + 1);
          break;
        case "ArrowLeft":
          if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
          break;
        case "1":
          handleUpdateStatus(currentItem.id, "reviewed");
          if (currentIndex < totalItems - 1) setCurrentIndex(prev => prev + 1);
          break;
        case "2":
          if (isDefect) handleDefectCorrection(actualId, "defect_type", "Corrosion");
          break;
        case "3":
          if (isDefect) handleDefectCorrection(actualId, "defect_type", "Crack");
          break;
        case "4":
          if (isDefect) handleDefectCorrection(actualId, "defect_type", "Surface Defect");
          break;
        case "5":
          if (isDefect) handleDefectCorrection(actualId, "defect_type", "Other");
          break;
        case "s":
        case "S":
          reviewMutation.mutate("save_assessment");
          break;
        case "a":
        case "A":
          setShowSummaryDialog(true);
          break;
        case "f":
        case "F":
          setIsFullscreen(prev => !prev);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, currentIndex, unifiedItems, itemStatuses, handleUpdateStatus, handleDefectCorrection, reviewMutation, totalItems]);

  const stats = useMemo(() => {
    let corrected = 0, auto = 0, reviewed = 0, flagged = 0;
    Object.values(itemStatuses).forEach(s => {
      if (s === "corrected") corrected++;
      if (s === "auto_accepted") auto++;
      if (s === "reviewed") reviewed++;
      if (s === "flagged") flagged++;
    });
    const pending = totalItems - (corrected + auto + reviewed + flagged);
    return { corrected, auto, reviewed, flagged, pending };
  }, [itemStatuses, totalItems]);

  return (
    <Stack spacing={2.5}>
      <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing={1.2} sx={{ textTransform: "uppercase" }}>
        Engineering Workflow / Assessment Center
      </Typography>

      <Box>
        <Typography variant="h4" fontSize={32} fontWeight={900} color="#F8FAFC">
          AI Review & Assessment Center
        </Typography>
        <Typography color="#94A3B8" maxWidth={820} mt={1}>
          Review low-confidence AI predictions sequentially using Focus Mode, or manage them in bulk using the Grid. Use keyboard shortcuts (Arrows, 1-5, S, A) to review rapidly.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, xl: 3 }}>
          <SectionCard title="Assessment Queue" subtitle="Inspections requiring engineering verification">
            <Stack spacing={1.25}>
              {queueQuery.isLoading && <LinearProgress />}
              {activeQueue.map((item) => (
                <Box
                  key={item.sessionId}
                  onClick={() => setSelectedSessionId(item.sessionId)}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: selectedSessionId === item.sessionId ? "#38BDF8" : "rgba(148,163,184,0.18)",
                    bgcolor: selectedSessionId === item.sessionId ? "rgba(14, 165, 233, 0.08)" : "rgba(15,23,42,0.4)",
                  }}
                >
                  <Typography fontWeight={800} color="#F8FAFC">{item.vesselName}</Typography>
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>{item.sessionId}</Typography>
                  <Stack direction="row" spacing={1} mt={1.25} flexWrap="wrap" useFlexGap>
                    <Chip label={`Review: ${item.reviewCheckpoint}`} size="small" sx={{ bgcolor: "#0F3B57", color: "#BAE6FD", fontWeight: 700 }} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, xl: 9 }}>
          <SectionCard 
            title="Engineering Workspace" 
            subtitle="Apply overrides to inject verified data into the pipeline"
            action={
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, val) => val && setViewMode(val)}
                size="small"
                sx={{ bgcolor: "#0F172A" }}
              >
                <ToggleButton value="focus"><Monitor size={16} style={{marginRight: 6}} /> Focus Mode</ToggleButton>
                <ToggleButton value="grid"><ListIcon size={16} style={{marginRight: 6}} /> Compact Grid</ToggleButton>
                <ToggleButton value="card"><LayoutGrid size={16} style={{marginRight: 6}} /> Card View</ToggleButton>
              </ToggleButtonGroup>
            }
          >
            {!selected && <Typography color="#94A3B8">Select a queued inspection to assess.</Typography>}

            {selected && (
              <Stack spacing={3}>
                <Box sx={{ p: 2, bgcolor: "#020617", borderRadius: 2, border: "1px dashed rgba(148,163,184,0.3)" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight={700}>Review Progress: {totalItems - stats.pending} of {totalItems}</Typography>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="caption" color="success.light">Corrected: {stats.corrected}</Typography>
                      <Typography variant="caption" color="info.light">Auto Accepted: {stats.auto}</Typography>
                      <Typography variant="caption" color="text.secondary">Reviewed: {stats.reviewed}</Typography>
                      <Typography variant="caption" color="error.light">Flagged: {stats.flagged}</Typography>
                      <Typography variant="caption" color="warning.main" fontWeight={700}>Pending: {stats.pending}</Typography>
                    </Stack>
                  </Stack>
                  <LinearProgress variant="determinate" value={totalItems ? ((totalItems - stats.pending) / totalItems) * 100 : 0} sx={{ height: 8, borderRadius: 4 }} />
                </Box>

                {viewMode === "focus" && unifiedItems.length > 0 && (
                  <Paper sx={{ display: "flex", flexDirection: {xs: "column", md: "row"}, border: "1px solid rgba(148,163,184,0.2)", borderRadius: 3, overflow: "hidden" }}>
                    <Box sx={{ flex: "0 0 70%", bgcolor: "#020617", position: "relative", minHeight: 400, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <div style={{ position: "relative", width: "100%", height: isFullscreen ? "80vh" : "100%", maxHeight: isFullscreen ? "none" : 600 }}>
                        <img 
                          src={getAssetUrl(unifiedItems[currentIndex].thumbnail)} 
                          alt="Current focus" 
                          onLoad={(e) => setImgSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                          style={{ width: "100%", height: "100%", objectFit: "contain", cursor: isDrawingBbox ? "crosshair" : "default" }} 
                        />
                        {(() => {
                          const item = unifiedItems[currentIndex];
                          const isDefect = item.type === "defect";
                          const actualId = isDefect ? item.id.replace("defect_", "") : "";
                          const corr = isDefect ? (defectCorrections[actualId] || {}) : {};
                          
                          // Prioritize corrected boxes over original
                          const hasCorrections = corr.bboxes !== undefined;
                          const boxesToRender = hasCorrections ? corr.bboxes : (item.bbox ? [item.bbox] : []);

                          return (boxesToRender.length > 0 || isDrawingBbox) && imgSize ? (
                            <svg 
                              ref={svgRef}
                              viewBox={`0 0 ${imgSize.w} ${imgSize.h}`} 
                              preserveAspectRatio="xMidYMid meet" 
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: isDrawingBbox ? "auto" : "none", cursor: isDrawingBbox ? "crosshair" : "default" }}
                              onClick={handleClick}
                              onMouseMove={handleMouseMove}
                            >
                              {/* Render finalized boxes */}
                              {boxesToRender.map((box: number[], idx: number) => (
                                <g key={idx}>
                                  <rect 
                                    x={box[0]} 
                                    y={box[1]} 
                                    width={box[2] - box[0]} 
                                    height={box[3] - box[1]} 
                                    fill={hasCorrections ? "rgba(16, 185, 129, 0.15)" : "rgba(56, 189, 248, 0.15)"} 
                                    stroke={hasCorrections ? "#10B981" : "#38BDF8"} 
                                    strokeWidth={Math.max(4, imgSize.w / 200)} 
                                    strokeDasharray={hasCorrections ? "none" : "12 12"}
                                  />
                                  <text 
                                    x={box[0]} 
                                    y={Math.max(20, box[1] - (imgSize.w / 100))} 
                                    fill={hasCorrections ? "#10B981" : "#38BDF8"} 
                                    fontSize={Math.max(24, imgSize.w / 40)} 
                                    fontWeight="bold"
                                    style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                                  >
                                    {corr.defect_type || item.aiDefect} {hasCorrections ? "(Corrected)" : ""}
                                  </text>
                                </g>
                              ))}
                              
                              {/* Render the initial dot if drawing has started */}
                              {isDrawingBbox && drawStart && (
                                <circle 
                                  cx={drawStart.x} 
                                  cy={drawStart.y} 
                                  r={Math.max(6, imgSize.w / 150)} 
                                  fill="#10B981" 
                                />
                              )}

                              {/* Render preview box while drawing */}
                              {isDrawingBbox && drawStart && drawCurrent && (
                                <rect 
                                  x={Math.min(drawStart.x, drawCurrent.x)} 
                                  y={Math.min(drawStart.y, drawCurrent.y)} 
                                  width={Math.abs(drawStart.x - drawCurrent.x)} 
                                  height={Math.abs(drawStart.y - drawCurrent.y)} 
                                  fill="rgba(16, 185, 129, 0.15)" 
                                  stroke="#10B981" 
                                  strokeWidth={Math.max(4, imgSize.w / 200)} 
                                  strokeDasharray="8 8"
                                />
                              )}
                            </svg>
                          ) : null;
                        })()}
                      </div>
                      <Stack direction="row" spacing={1} sx={{ position: "absolute", top: 16, right: 16 }}>
                        <Chip label={`Item ${currentIndex + 1} of ${totalItems}`} size="small" sx={{ bgcolor: "rgba(15,23,42,0.8)" }} />
                        <IconButton size="small" onClick={() => setIsFullscreen(!isFullscreen)} sx={{ bgcolor: "rgba(15,23,42,0.8)" }}><Maximize size={16} /></IconButton>
                      </Stack>
                    </Box>
                    <Box sx={{ flex: "0 0 30%", bgcolor: "#0F172A", display: "flex", flexDirection: "column" }}>
                      {(() => {
                        const item = unifiedItems[currentIndex];
                        const isDefect = item.type === "defect";
                        const actualId = isDefect ? item.id.replace("defect_", "") : item.id.replace("frame_", "");
                        const corr = isDefect ? (defectCorrections[actualId] || {}) : (frameCorrections[actualId] || {});
                        return (
                          <>
                            <Box sx={{ p: 3, flexGrow: 1, overflowY: "auto" }}>
                              <Stack spacing={2.5}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary" sx={{textTransform: "uppercase", letterSpacing: 1}}>AI Prediction</Typography>
                                  <Typography variant="h6" fontWeight={800} color="primary.light" mb={0.5}>{isDefect ? item.aiDefect : item.aiPart}</Typography>
                                  <Chip size="small" label={`Confidence: ${(item.confidence * 100).toFixed(1)}%`} color={(item.confidence * 100) < 60 ? "error" : "success"} />
                                </Box>
                                
                                <Divider sx={{ borderColor: "rgba(148,163,184,0.1)" }} />
                                <Typography variant="caption" color="text.secondary" sx={{textTransform: "uppercase", letterSpacing: 1}}>Human Assessment</Typography>
                                
                                {isDefect ? (
                                  <>
                                    <FormControl fullWidth size="small">
                                      <InputLabel>Corrected Defect Type</InputLabel>
                                      <Select value={corr.defect_type || ""} onChange={(e) => handleDefectCorrection(actualId, "defect_type", e.target.value)} label="Corrected Defect Type">
                                        {DEFECT_TYPES.map(cls => <MenuItem key={cls} value={cls}>{cls}</MenuItem>)}
                                      </Select>
                                    </FormControl>
                                    <FormControl fullWidth size="small">
                                      <InputLabel>Override Severity</InputLabel>
                                      <Select value={corr.severity || ""} onChange={(e) => handleDefectCorrection(actualId, "severity", e.target.value)} label="Override Severity">
                                        {SEVERITIES.map(cls => <MenuItem key={cls} value={cls}>{cls}</MenuItem>)}
                                      </Select>
                                    </FormControl>
                                    <Stack direction="row" spacing={1} mt={1}>
                                      <Button 
                                        variant={isDrawingBbox ? "contained" : "outlined"} 
                                        color="info" 
                                        size="small" 
                                        onClick={() => setIsDrawingBbox(!isDrawingBbox)}
                                        startIcon={<CheckSquare size={16} />}
                                        sx={{ flex: 1 }}
                                      >
                                        {isDrawingBbox ? "Done Drawing" : "Plot Boxes"}
                                      </Button>
                                      <Button 
                                        variant="outlined" 
                                        color="error" 
                                        size="small" 
                                        onClick={clearBoxes}
                                        startIcon={<XCircle size={16} />}
                                      >
                                        Clear Boxes
                                      </Button>
                                    </Stack>
                                  </>
                                ) : (
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Corrected Part Class</InputLabel>
                                    <Select value={corr.part_classification || ""} onChange={(e) => handleFrameCorrection(actualId, "part_classification", e.target.value)} label="Corrected Part Class">
                                      {PART_CLASSES.map(cls => <MenuItem key={cls} value={cls}>{cls}</MenuItem>)}
                                    </Select>
                                  </FormControl>
                                )}
                                
                                <Grid container spacing={1} mt={1}>
                                  <Grid size={6}><Button fullWidth variant="outlined" color="success" size="small" onClick={() => { handleUpdateStatus(item.id, "reviewed"); if (currentIndex < totalItems - 1) setCurrentIndex(prev => prev + 1); }}>Accept (1)</Button></Grid>
                                  <Grid size={6}><Button fullWidth variant="outlined" color="warning" size="small" onClick={() => { handleUpdateStatus(item.id, "flagged"); if (currentIndex < totalItems - 1) setCurrentIndex(prev => prev + 1); }}><Flag size={14} style={{marginRight: 4}}/> Flag</Button></Grid>
                                </Grid>
                              </Stack>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: "#020617", borderTop: "1px solid rgba(148,163,184,0.1)" }}>
                              <Stack direction="row" justifyContent="space-between">
                                <Button disabled={currentIndex === 0} onClick={() => setCurrentIndex(prev => prev - 1)} startIcon={<ChevronLeft />} size="small" variant="outlined">Previous</Button>
                                <Button variant="contained" disabled={currentIndex === totalItems - 1} onClick={() => {
                                  if (itemStatuses[item.id] === "pending" || !itemStatuses[item.id]) handleUpdateStatus(item.id, "auto_accepted");
                                  setCurrentIndex(prev => prev + 1);
                                }} endIcon={<ChevronRight />} size="small">Next</Button>
                              </Stack>
                            </Box>
                          </>
                        );
                      })()}
                    </Box>
                  </Paper>
                )}

                {/* Grid and Card Views omitted for brevity, keeping same logic as before if they were rendered */}
                {viewMode === "grid" && (
                   <TableContainer component={Paper} sx={{ bgcolor: "#0F172A", maxHeight: 600 }}>
                     <Table stickyHeader size="small">
                       <TableHead>
                         <TableRow>
                           <TableCell padding="checkbox"><Checkbox checked={selectedItemIds.length === unifiedItems.length && unifiedItems.length > 0} onChange={(e) => handleSelectAll(e.target.checked)} /></TableCell>
                           <TableCell>Thumbnail</TableCell>
                           <TableCell>Type</TableCell>
                           <TableCell>AI Prediction</TableCell>
                           <TableCell>Confidence</TableCell>
                           <TableCell>Human Assessment</TableCell>
                           <TableCell>Status</TableCell>
                         </TableRow>
                       </TableHead>
                       <TableBody>
                         {unifiedItems.map((item) => {
                           const isSelected = selectedItemIds.includes(item.id);
                           const isFrame = item.type === "frame";
                           const actualId = isFrame ? item.id.replace("frame_", "") : item.id.replace("defect_", "");
                           const corr = isFrame ? (frameCorrections[actualId] || {}) : (defectCorrections[actualId] || {});
                           let humanText = "-";
                           if (corr.part_classification) humanText = corr.part_classification;
                           if (corr.defect_type) humanText = `${corr.defect_type} (${corr.severity || item.aiSeverity})`;
                           return (
                             <TableRow key={item.id} selected={isSelected} hover>
                               <TableCell padding="checkbox"><Checkbox checked={isSelected} onChange={(e) => handleSelectItem(item.id, e.target.checked)} /></TableCell>
                               <TableCell><img src={getAssetUrl(item.thumbnail)} alt="thumb" style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }} /></TableCell>
                               <TableCell><Chip size="small" label={isFrame ? "Frame" : "Defect"} color={isFrame ? "secondary" : "warning"} variant="outlined"/></TableCell>
                               <TableCell>{isFrame ? item.aiPart : `${item.aiDefect} (${item.aiSeverity})`}</TableCell>
                               <TableCell><Typography color={(item.confidence * 100) < 60 ? "error.light" : "success.light"}>{(item.confidence * 100).toFixed(1)}%</Typography></TableCell>
                               <TableCell><Typography fontWeight={700} color={humanText !== "-" ? "info.light" : "text.secondary"}>{humanText}</Typography></TableCell>
                               <TableCell><Chip size="small" label={itemStatuses[item.id] || "pending"} sx={{textTransform: "capitalize"}} /></TableCell>
                             </TableRow>
                           );
                         })}
                       </TableBody>
                     </Table>
                   </TableContainer>
                )}

                <Stack direction="row" spacing={1.5} justifyContent="flex-end" mt={2}>
                  <Button variant="outlined" color="error" startIcon={<XCircle size={18} />} onClick={() => reviewMutation.mutate("reject")} disabled={reviewMutation.isPending}>
                    Reject Analysis
                  </Button>
                  <Box flexGrow={1} />
                  <Button variant="contained" color="primary" startIcon={<Play size={18} />} onClick={() => setShowSummaryDialog(true)} disabled={reviewMutation.isPending}>
                    Assess & Continue
                  </Button>
                </Stack>
              </Stack>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog open={showSummaryDialog} onClose={() => setShowSummaryDialog(false)} PaperProps={{ sx: { bgcolor: "#0F172A", backgroundImage: "none" } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Review Summary</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ minWidth: 300, mt: 1 }}>
            {stats.pending > 0 && (
              <Alert severity="warning">You still have {stats.pending} unreviewed items. By continuing, you accept the AI predictions for these items implicitly.</Alert>
            )}
            <Box>
              <Typography variant="body2" color="text.secondary">Total Items: <strong style={{color: "#fff"}}>{totalItems}</strong></Typography>
              <Typography variant="body2" color="text.secondary">Corrected: <strong style={{color: "#38BDF8"}}>{stats.corrected}</strong></Typography>
              <Typography variant="body2" color="text.secondary">Auto Accepted: <strong style={{color: "#4ADE80"}}>{stats.auto}</strong></Typography>
              <Typography variant="body2" color="text.secondary">Flagged: <strong style={{color: "#F87171"}}>{stats.flagged}</strong></Typography>
              <Typography variant="body2" color="text.secondary">Review Duration: <strong style={{color: "#fff"}}>{Math.round((Date.now() - reviewStartTime) / 1000)}s</strong></Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setShowSummaryDialog(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={() => reviewMutation.mutate("assess_continue")}>Apply & Resume Pipeline</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
