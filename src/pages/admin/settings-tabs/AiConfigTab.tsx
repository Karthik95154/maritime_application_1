import React, { useState } from "react";
import { Box, Stack, Typography, Divider, Select, MenuItem, Slider, Button } from "@mui/material";
import { BrainCircuit } from "lucide-react";

function AiMetric({ label, value }: { label: string, value: string }) {
  return (
    <Box p={3} sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
      <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={1}>
        {label}
      </Typography>
      <Typography variant="h4" color="#F8FAFC" fontWeight={700} fontFamily="monospace" letterSpacing={-0.5}>
        {value}
      </Typography>
    </Box>
  );
}

export function AiConfigTab() {
  const [model, setModel] = useState("v2.4.1-prod");
  const [autoApprove, setAutoApprove] = useState<number>(95);
  const [assessment, setAssessment] = useState<number>(80);

  return (
    <Stack spacing={5}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="body2" color="#94A3B8">
          Manage AI model behavior, confidence thresholds, and automated operations.
        </Typography>
        <Button variant="contained" sx={{ bgcolor: "#3B82F6", borderRadius: 1, textTransform: "none", px: 3 }}>
          Deploy Changes
        </Button>
      </Stack>

      <Box>
        <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={3}>
          Current Model Performance
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <AiMetric label="Global Accuracy" value="96.4%" />
          <AiMetric label="Precision" value="94.8%" />
          <AiMetric label="Recall" value="98.1%" />
          <AiMetric label="False Positive Rate" value="1.2%" />
        </Stack>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

      <Box>
        <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={3}>
          Model Governance
        </Typography>
        <Stack spacing={4} maxWidth={700}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="#F8FAFC" fontWeight={600} display="flex" alignItems="center" gap={1}>
                <BrainCircuit size={16} color="#3B82F6" /> Active Model Version
              </Typography>
              <Typography variant="caption" color="#94A3B8">The primary model used for fleet inspections.</Typography>
            </Box>
            <Select size="small" value={model} onChange={(e) => setModel(e.target.value)} sx={{ width: 250, color: '#F8FAFC', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}>
              <MenuItem value="v2.4.1-prod">Vision-Net v2.4.1 (Stable)</MenuItem>
              <MenuItem value="v2.5.0-rc1">Vision-Net v2.5.0 (Release Candidate)</MenuItem>
              <MenuItem value="v2.3.9-lts">Vision-Net v2.3.9 (Legacy LTS)</MenuItem>
            </Select>
          </Stack>

          <Box>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="#F8FAFC" fontWeight={600}>Auto-Approve Threshold</Typography>
              <Typography variant="body2" color="#10B981" fontWeight={700}>{autoApprove}%</Typography>
            </Stack>
            <Typography variant="caption" color="#94A3B8" display="block" mb={2}>
              Findings above this confidence are automatically approved without human review.
            </Typography>
            <Slider 
              value={autoApprove} 
              onChange={(_, newValue) => setAutoApprove(newValue as number)} 
              valueLabelDisplay="auto" 
              sx={{ color: '#10B981' }} 
            />
          </Box>

          <Box>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="#F8FAFC" fontWeight={600}>Assessment Threshold</Typography>
              <Typography variant="body2" color="#F59E0B" fontWeight={700}>{assessment}%</Typography>
            </Stack>
            <Typography variant="caption" color="#94A3B8" display="block" mb={2}>
              Findings between Assessment and Auto-Approve thresholds are sent to the human Assessment Queue.
            </Typography>
            <Slider 
              value={assessment} 
              onChange={(_, newValue) => setAssessment(newValue as number)} 
              valueLabelDisplay="auto" 
              sx={{ color: '#F59E0B' }} 
            />
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="#F8FAFC" fontWeight={600}>Fallback Strategy</Typography>
              <Typography variant="caption" color="#94A3B8">Action to take if model inference fails or times out.</Typography>
            </Box>
            <Select size="small" value="QUEUE" sx={{ width: 250, color: '#F8FAFC', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}>
              <MenuItem value="QUEUE">Route to Manual Review</MenuItem>
              <MenuItem value="RETRY">Retry Inference (Up to 3x)</MenuItem>
              <MenuItem value="FAIL">Fail Pipeline</MenuItem>
            </Select>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
