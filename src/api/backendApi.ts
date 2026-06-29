import type {
  BatchReportResponse,
  DashboardResponse,
  DefectListResponse,
  HistoricalInspection,
  InternalReviewDetail,
  InspectionBatchUploadPayload,
  InspectionProgressResponse,
  InspectionReportResponse,
  InspectionSessionSummary,
  InspectionUploadPayload,
  ProgressionResponse,
  VisualizationResponse,
} from "../types";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const token = localStorage.getItem("auth_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.status}`;
    try {
      const errData = await response.json();
      if (errData.detail) errorMsg = errData.detail;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export function getAssetUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const backendApi = {
  login: (data: any) =>
    requestJson<{ access_token: string; user: any }>("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  signup: (data: any) =>
    requestJson<{ access_token: string; user: any }>("/api/v1/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  getUsers: () => requestJson<any[]>("/api/v1/auth/users"),
  updateUserRole: (email: string, role: string) =>
    requestJson<{ status: string; message: string }>(`/api/v1/auth/users/${email}/role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }),
  resetUserPassword: (email: string, password: string) =>
    requestJson<{ status: string; message: string }>(`/api/v1/auth/users/${email}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }),
  getDashboard: () => requestJson<DashboardResponse>("/api/v1/dashboard"),
  getLatestInspection: () =>
    requestJson<InspectionSessionSummary>("/api/v1/inspections/latest"),
  getInspectionProgress: (sessionId: string) =>
    requestJson<InspectionProgressResponse>(`/api/v1/inspections/${sessionId}/progress`),
  getInspectionDefects: (sessionId: string) =>
    requestJson<DefectListResponse>(`/api/v1/inspections/${sessionId}/defects`),
  getHistoricalInspections: () =>
    requestJson<HistoricalInspection[]>("/api/v1/inspections"),
  getInternalReviewQueue: () =>
    requestJson<HistoricalInspection[]>("/api/v1/internal/reviews"),
  getInternalReviewDetail: (sessionId: string) =>
    requestJson<InternalReviewDetail>(`/api/v1/internal/reviews/${sessionId}`),
  submitInternalReviewDecision: (
    sessionId: string,
    payload: { 
      checkpoint: string; 
      decision: "assess_continue" | "save_assessment" | "reject"; 
      notes?: string; 
      reviewer?: string;
      reviewer_role?: string;
      review_duration?: number;
      defect_corrections?: Record<string, {
        defect_type?: string;
        severity?: string;
        repair_recommendation?: string;
        repair_priority?: string;
        reason?: string;
      }>;
      frame_corrections?: Record<string, {
        part_classification?: string;
        reason?: string;
      }>;
    },
  ) =>
    requestJson<{ status: string; message: string }>(`/api/v1/internal/reviews/${sessionId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  getBatches: () =>
    requestJson<any[]>("/api/v1/batches"),
  getVessels: () => requestJson<any[]>("/api/v1/vessels"),
  getVessel: (imoNumber: string) => requestJson<any>(`/api/v1/vessels/${imoNumber}`),
  getVesselVisits: (imoNumber: string) => requestJson<any[]>(`/api/v1/vessels/${imoNumber}/visits`),
  getVesselDefects: (imoNumber: string) => requestJson<any[]>(`/api/v1/vessels/${imoNumber}/defects`),
  getAllDefects: () => requestJson<any[]>("/api/v1/defects"),
  deleteVessel: (imoNumber: string) =>
    requestJson<{status: string, message: string}>(`/api/v1/vessels/${imoNumber}`, { method: "DELETE" }),
  deleteInspection: (sessionId: string) =>
    requestJson<{status: string, message: string}>(`/api/v1/inspections/${sessionId}`, { method: "DELETE" }),
  getInspectionVisualization: (sessionId: string) =>
    requestJson<VisualizationResponse>(`/api/v1/inspections/${sessionId}/visualization`),
  getInspectionReport: (sessionId: string) =>
    requestJson<InspectionReportResponse>(`/api/v1/inspections/${sessionId}/report`),
  getDefectProgression: (sessionId: string) =>
    requestJson<ProgressionResponse>(`/api/v1/inspections/${sessionId}/progression`),
  compareReports: (imoNumber: string, v1: string, v2: string) =>
    requestJson<any>(`/api/v1/vessels/${imoNumber}/reports/compare?v1=${v1}&v2=${v2}`),
  uploadInspection: (payload: InspectionUploadPayload, onProgress?: (value: number) => void) =>
    new Promise<{ session_id: string; status: string }>((resolve, reject) => {
      const formData = new FormData();
      formData.append("video", payload.video);
      formData.append("vessel_name", payload.vesselName);
      formData.append("imo_number", payload.imoNumber);
      formData.append("vessel_type", payload.vesselType);
      formData.append("gross_tonnage", payload.grossTonnage);
      formData.append("inspector_name", payload.inspectorName);
      formData.append("location", payload.location);
      formData.append("inspection_date", payload.inspectionDate);
      formData.append("comments", payload.comments);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/api/v1/predict`);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(formData);
    }),
  uploadInspectionBatch: (payload: InspectionBatchUploadPayload, onProgress?: (value: number) => void) =>
    new Promise<{ batch_id: string; session_ids: string[]; status: string; count: number }>((resolve, reject) => {
      const formData = new FormData();

      for (const video of payload.videos) {
        formData.append("videos", video);
      }

      if (payload.visitId) {
        formData.append("visit_id", payload.visitId);
      }

      formData.append("vessel_name", payload.vesselName);
      formData.append("imo_number", payload.imoNumber);
      formData.append("vessel_type", payload.vesselType);
      formData.append("gross_tonnage", payload.grossTonnage);
      formData.append("inspector_name", payload.inspectorName);
      formData.append("location", payload.location);
      formData.append("inspection_date", payload.inspectionDate);
      formData.append("comments", payload.comments);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/api/v1/predict/batch`);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Batch upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Batch upload failed"));
      xhr.send(formData);
    }),
  appendInspectionBatch: (batchId: string, videos: File[], onProgress?: (value: number) => void) =>
    new Promise<{ batch_id: string; appended_session_ids: string[]; status: string }>((resolve, reject) => {
      const formData = new FormData();
      videos.forEach((video) => {
        formData.append("videos", video);
      });

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/api/v1/predict/batch/${batchId}/append`);
      
      const token = localStorage.getItem("auth_token");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Append upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Append upload failed"));
      xhr.send(formData);
    }),
  getBatchReport: (batchId: string) =>
    requestJson<BatchReportResponse>(`/api/v1/batches/${batchId}/report`),
  streamBatchProgress: (batchId: string, onEvent: (data: {progress: number, stage: string, status: string, log_line: string}) => void) => {
    const source = new EventSource(`${API_BASE_URL}/api/v1/stream/inspections/${batchId}`);
    
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          source.close();
          return;
        }
        onEvent(data);
        if (data.status === "completed" || data.status === "failed") {
          source.close();
        }
      } catch (err) {
        // ignore parse error
      }
    };
    
    source.onerror = (err) => {
      console.error("SSE Error:", err);
      // We do NOT call source.close() here.
      // EventSource will automatically attempt to reconnect!
    };
    
    return () => source.close(); // Cleanup function
  }
};
