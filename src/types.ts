export type Severity = "High" | "Medium" | "Low";

export interface KpiMetric {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
}

export interface DefectRecord {
  defectId: string;
  thumbnail: string;
  partName: string;
  defectType: string;
  severity: Severity;
  area: number;
  repairCost: number;
  frameNumber: number;
  description?: string;
  repairProcess?: string;
  marker?: {
    x: number;
    y: number;
  };
}

export interface InspectionSessionSummary {
  sessionId: string;
  videoName: string;
  status: string;
  progress: number;
  currentStage: string;
  reviewCheckpoint?: string | null;
  reviewStatus?: string | null;
  reviewNotes?: string | null;
  reviewUpdatedAt?: string | null;
  reviewUpdatedBy?: string | null;
  pipelineResumeFrom?: string | null;
  documentReady: boolean;
  documentPath?: string | null;
  createdAt?: string | null;
  vesselName: string;
  imoNumber: string;
  vesselType: string;
  grossTonnage: string;
  inspectorName: string;
  location: string;
  inspectionDate?: string | null;
  comments: string;
  defectCount: number;
  criticalDefects: number;
  totalEstimatedCost: number;
  healthScore: number;
}

export type HistoricalInspection = InspectionSessionSummary;

export interface ProgressLog {
  time: string;
  message: string;
}

export interface DefectTimelinePoint {
  label: string;
  area: number;
  severity: Severity;
  image: string;
  sessionId?: string;
}

export interface DashboardResponse {
  metrics: KpiMetric[];
  defectsByType: Array<{ name: string; value: number }>;
  costTrend: Array<{ month: string; cost: number }>;
  healthScore: number;
  latestSessionId?: string | null;
}

export interface InspectionProgressResponse extends InspectionSessionSummary {
  steps: Array<{ label: string; status: "done" | "active" | "todo" }>;
  logs: ProgressLog[];
}

export interface DefectListResponse extends InspectionSessionSummary {
  defects: DefectRecord[];
}

export interface VisualizationResponse extends InspectionSessionSummary {
  defects: DefectRecord[];
  markers: Array<{
    defectId: string;
    x: number;
    y: number;
    severity: Severity;
  }>;
  selectedDefectId?: string | null;
}

export interface InspectionReportResponse extends InspectionSessionSummary {
  sections: string[];
  executiveSummary: string;
  defects: DefectRecord[];
  downloadDocxUrl: string;
  downloadPdfUrl?: string | null;
}

export interface ProgressionResponse extends InspectionSessionSummary {
  defectId: string;
  location: string;
  timeline: DefectTimelinePoint[];
  areaGrowthPercent: number;
  severityChange: string;
  recommendedAction: string;
}

export interface InspectionUploadPayload {
  video: File;
  vesselName: string;
  imoNumber: string;
  vesselType: string;
  grossTonnage: string;
  inspectorName: string;
  location: string;
  inspectionDate: string;
  comments: string;
}

export interface InspectionBatchUploadPayload {
  videos: File[];
  visitId?: string;
  vesselName: string;
  imoNumber: string;
  vesselType: string;
  grossTonnage: string;
  inspectorName: string;
  location: string;
  inspectionDate: string;
  comments: string;
}

export interface BatchReportResponse {
  batchId: string;
  sessionIds: string[];
  videoCount: number;
  completedVideoCount: number;
  vesselName: string;
  imoNumber: string;
  vesselType: string;
  grossTonnage: string;
  inspectorName: string;
  location: string;
  inspectionDate?: string | null;
  comments: string;
  status: string;
  progress: number;
  currentStage: string;
  documentReady: boolean;
  documentPath?: string | null;
  createdAt?: string | null;
  defectCount: number;
  criticalDefects: number;
  totalEstimatedCost: number;
  healthScore: number;
  sections: string[];
  executiveSummary: string;
  defects: Array<DefectRecord & { sourceVideo?: string }>;
  downloadDocxUrl?: string | null;
  downloadPdfUrl?: string | null;
}

export interface ReviewFrameItem {
  frameId?: number;
  timestamp?: number | string;
  imageUrl: string;
  sourceVideo?: string;
}

export interface InternalReviewDetail extends InspectionSessionSummary {
  frameReviewItems: ReviewFrameItem[];
  defectReviewItems: DefectRecord[];
}
