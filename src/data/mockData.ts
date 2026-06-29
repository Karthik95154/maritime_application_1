import type {
  DefectRecord,
  DefectTimelinePoint,
  HistoricalInspection,
  KpiMetric,
  ProgressLog,
} from "../types";

export const shipHero =
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1400&q=80";

export const vesselSideImage = "/images/vessel_side_profile.png";

export const vesselTopSchematic = "/images/vessel_top_schematic.png";

export const reportPreviewImage =
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80";

export const kpiMetrics: KpiMetric[] = [
  { label: "Total Inspections", value: "128", delta: "12% from last month", trend: "up" },
  { label: "Pending Reports", value: "15", delta: "8% from last month", trend: "up" },
  { label: "Completed Reports", value: "113", delta: "16% from last month", trend: "up" },
  { label: "Critical Defects", value: "32", delta: "5% from last month", trend: "up" },
  { label: "Total Estimated Cost", value: "₹ 48,75,000", delta: "10% from last month", trend: "up" },
];

export const defectsByType = [
  { name: "Corrosion", value: 35, color: "#2F80ED" },
  { name: "Crack", value: 25, color: "#27AE60" },
  { name: "Dent", value: 15, color: "#9B8AFB" },
  { name: "Paint Damage", value: 10, color: "#F59E0B" },
  { name: "Deformation", value: 10, color: "#E55252" },
  { name: "Others", value: 5, color: "#9AA8BC" },
];

export const costTrend = [
  { month: "Jan", cost: 12 },
  { month: "Feb", cost: 18 },
  { month: "Mar", cost: 15 },
  { month: "Apr", cost: 29 },
  { month: "May", cost: 22 },
  { month: "Jun", cost: 34 },
];

export const defectRecords: DefectRecord[] = [
  {
    defectId: "DEF-1001",
    thumbnail: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=300&q=80",
    partName: "Hull Plate",
    defectType: "Corrosion",
    severity: "High",
    area: 2.45,
    repairCost: 12500,
    frameNumber: 1023,
  },
  {
    defectId: "DEF-1002",
    thumbnail: "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=300&q=80",
    partName: "Bulkhead",
    defectType: "Crack",
    severity: "High",
    area: 1.2,
    repairCost: 16000,
    frameNumber: 1125,
  },
  {
    defectId: "DEF-1003",
    thumbnail: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=300&q=80",
    partName: "Deck Plate",
    defectType: "Dent",
    severity: "Medium",
    area: 0.75,
    repairCost: 5200,
    frameNumber: 1156,
  },
  {
    defectId: "DEF-1004",
    thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=300&q=80",
    partName: "Pipe",
    defectType: "Corrosion",
    severity: "Medium",
    area: 0.5,
    repairCost: 3800,
    frameNumber: 1178,
  },
  {
    defectId: "DEF-1005",
    thumbnail: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=300&q=80",
    partName: "Stiffener",
    defectType: "Deformation",
    severity: "Low",
    area: 0.3,
    repairCost: 2100,
    frameNumber: 1200,
  },
];

export const historicalInspections: HistoricalInspection[] = [
  { sessionId: "INS-2025-000123", videoName: "oceanic.mp4", status: "Completed", progress: 100, currentStage: "Completed", documentReady: true, createdAt: "2025-05-22T10:30:00Z", vesselName: "MV Oceanic Unity", imoNumber: "1234567", vesselType: "Bulk Carrier", grossTonnage: "45678", inspectorName: "John Inspector", location: "Mumbai Port, India", inspectionDate: "2025-05-22", comments: "", defectCount: 7, criticalDefects: 4, totalEstimatedCost: 4875000, healthScore: 78 },
  { sessionId: "INS-2025-000122", videoName: "atlantic.mp4", status: "Completed", progress: 100, currentStage: "Completed", documentReady: true, createdAt: "2025-05-18T10:30:00Z", vesselName: "MV Atlantic Star", imoNumber: "1234568", vesselType: "Container", grossTonnage: "42311", inspectorName: "John Inspector", location: "Chennai Port, India", inspectionDate: "2025-05-18", comments: "", defectCount: 4, criticalDefects: 2, totalEstimatedCost: 2210000, healthScore: 85 },
  { sessionId: "INS-2025-000121", videoName: "pacific.mp4", status: "Completed", progress: 100, currentStage: "Completed", documentReady: true, createdAt: "2025-05-14T10:30:00Z", vesselName: "MV Pacific Explorer", imoNumber: "1234569", vesselType: "Bulk Carrier", grossTonnage: "40221", inspectorName: "John Inspector", location: "Kandla Port, India", inspectionDate: "2025-05-14", comments: "", defectCount: 9, criticalDefects: 6, totalEstimatedCost: 3520000, healthScore: 65 },
  { sessionId: "INS-2025-000120", videoName: "indian.mp4", status: "Completed", progress: 100, currentStage: "Completed", documentReady: true, createdAt: "2025-05-10T10:30:00Z", vesselName: "MV Indian Ocean", imoNumber: "1234570", vesselType: "Tanker", grossTonnage: "48900", inspectorName: "John Inspector", location: "Cochin Port, India", inspectionDate: "2025-05-10", comments: "", defectCount: 11, criticalDefects: 7, totalEstimatedCost: 4210000, healthScore: 55 },
  { sessionId: "INS-2025-000119", videoName: "oceanic-2.mp4", status: "Completed", progress: 100, currentStage: "Completed", documentReady: true, createdAt: "2025-05-05T10:30:00Z", vesselName: "MV Oceanic Unity", imoNumber: "1234567", vesselType: "Bulk Carrier", grossTonnage: "45678", inspectorName: "John Inspector", location: "Mumbai Port, India", inspectionDate: "2025-05-05", comments: "", defectCount: 5, criticalDefects: 3, totalEstimatedCost: 2980000, healthScore: 82 },
];

export const progressLogs: ProgressLog[] = [
  { time: "10:34:12", message: "Frame 1000 extracted" },
  { time: "10:34:16", message: "Corrosion detected on hull plate" },
  { time: "10:34:20", message: "Crack detected on bulkhead" },
  { time: "10:34:30", message: "Tracking defects across frames" },
  { time: "10:34:45", message: "Running temporal consistency" },
];

export const defectTimeline: DefectTimelinePoint[] = [
  { label: "05 May 2024", area: 1.2, severity: "Medium", image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=300&q=80" },
  { label: "20 Aug 2024", area: 1.75, severity: "Medium", image: "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=300&q=80" },
  { label: "12 Dec 2024", area: 2.1, severity: "High", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=300&q=80" },
  { label: "22 May 2025", area: 2.45, severity: "High", image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=300&q=80" },
];
