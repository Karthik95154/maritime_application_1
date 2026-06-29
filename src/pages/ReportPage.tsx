import { useQuery } from "@tanstack/react-query";
import { Box, Button, Divider, Grid, List, ListItemButton, ListItemText, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, alpha } from "@mui/material";
import { Download, FileText, Share2, ShieldCheck, MapPin, Calendar, Ship } from "lucide-react";
import { backendApi, getAssetUrl } from "../api/backendApi";
import { useParams } from "react-router-dom";
import { useResolvedSessionId } from "../hooks/useResolvedSessionId";
import type { BatchReportResponse, InspectionReportResponse } from "../types";
import { Logo } from "../components/Logo";
import { useState } from "react";
import { ImagePreviewModal } from "../components/ImagePreviewModal";

export function ReportContent({ batchId, sessionId, hideHeader }: { batchId?: string, sessionId?: string, hideHeader?: boolean }) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const isBatchReport = Boolean(batchId);
  const { data, isLoading } = useQuery<InspectionReportResponse | BatchReportResponse>({
    queryKey: ["report", batchId ?? sessionId],
    queryFn: () =>
      batchId
        ? backendApi.getBatchReport(batchId)
        : backendApi.getInspectionReport(sessionId!),
    enabled: Boolean(batchId || sessionId),
    refetchInterval: isBatchReport ? 10000 : false,
  });

  if (isLoading) return <Box p={4}>Loading...</Box>;
  if (!data) return null;

  const reportData = data as InspectionReportResponse | BatchReportResponse;
  const batchReportData = isBatchReport ? (reportData as BatchReportResponse) : null;

  return (
    <Stack spacing={2}>
      {!hideHeader && (
        <Stack spacing={0.5} mb={1}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
            {batchId ? `Inspection Batches / ${batchId} / Combined Report` : "Inspections / Final Report"}
          </Typography>
          <Typography variant="h4" fontSize={26}>
            {batchId ? "Combined Inspection Report" : "Inspection Report"}
          </Typography>
        </Stack>
      )}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 3,
              p: { xs: 2, md: 3 },
              minHeight: 800,
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            {/* EMBEDDED PDF DOCUMENT */}
            <Box
              sx={{
                mx: "auto",
                maxWidth: 800,
                height: 840,
                borderRadius: 1,
                bgcolor: "#fff",
                boxShadow: "0 10px 40px rgba(15, 23, 42, 0.08)",
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              }}
            >
              {reportData.downloadPdfUrl ? (
                <iframe 
                  src={getAssetUrl(reportData.downloadPdfUrl)} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none' }}
                  title="Inspection Report PDF"
                />
              ) : (
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    The PDF document is still being generated or is not available.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <Box sx={{ bgcolor: "background.paper", borderRadius: 3, p: 2.5, position: "sticky", top: 24, mb: 2 }}>
            <Typography variant="h6" fontSize={14} mb={2} textTransform="uppercase" color="text.secondary">
              Report Intelligence
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Health Score</Typography>
                <Typography variant="h4" fontWeight={800} color="primary.main">85/100</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Risk Level</Typography>
                <Typography variant="h5" fontWeight={700} color="warning.main">Medium</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Est. Cost Exposure</Typography>
                <Typography variant="h5" fontWeight={700} color="error.main">₹ 4,50,000</Typography>
              </Box>
            </Stack>
          </Box>
          <Box sx={{ bgcolor: "background.paper", borderRadius: 3, p: 2.5, position: "sticky", top: 280 }}>
            <Typography variant="h6" fontSize={14} mb={2} textTransform="uppercase" color="text.secondary">
              Report Actions
            </Typography>
            <Stack spacing={1.5}>
              <Button fullWidth variant="outlined" startIcon={<FileText size={16} />} component="a" href={reportData.downloadDocxUrl ? getAssetUrl(reportData.downloadDocxUrl) : undefined} disabled={!reportData.downloadDocxUrl} sx={{ justifyContent: "flex-start", textAlign: "left", lineHeight: 1.2 }}>
                Download DOCX
              </Button>
              <Button fullWidth variant="outlined" startIcon={<Download size={16} />} disabled={!reportData.downloadPdfUrl} sx={{ justifyContent: "flex-start", textAlign: "left", lineHeight: 1.2 }}>
                Download PDF
              </Button>
              <Divider sx={{ my: 1 }} />
              <Button fullWidth variant="outlined" startIcon={<Share2 size={16} />} sx={{ justifyContent: "flex-start", textAlign: "left", lineHeight: 1.2 }}>
                Share Link
              </Button>
              <Button fullWidth variant="contained" color="success" startIcon={<ShieldCheck size={16} />} sx={{ justifyContent: "flex-start", textAlign: "left", lineHeight: 1.2 }}>
                Approve & Sign-off
              </Button>
            </Stack>
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

export function ReportPage() {
  const { batchId } = useParams<{ batchId?: string }>();
  const { sessionId } = useResolvedSessionId();
  
  return <ReportContent batchId={batchId} sessionId={sessionId} />;
}
