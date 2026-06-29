import React from "react";
import { Box, Stack, Typography, Divider, LinearProgress } from "@mui/material";

function HealthMetric({ label, value, status }: { label: string, value: string, status: "healthy" | "warning" | "critical" }) {
  const color = status === "healthy" ? "#10B981" : status === "warning" ? "#F59E0B" : "#EF4444";
  return (
    <Box>
      <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={0.5}>
        {label}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, boxShadow: `0 0 10px ${color}` }} />
        <Typography variant="h5" color="#F8FAFC" fontWeight={700} fontFamily="monospace" letterSpacing={-0.5}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

function PerformanceBar({ label, current, max, unit }: { label: string, current: number, max: number, unit: string }) {
  const percentage = (current / max) * 100;
  const color = percentage > 90 ? "#EF4444" : percentage > 75 ? "#F59E0B" : "#3B82F6";
  
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={1}>
        <Typography variant="body2" color="#F8FAFC" fontWeight={600}>{label}</Typography>
        <Typography variant="caption" color="#94A3B8" fontFamily="monospace">{current} / {max} {unit}</Typography>
      </Stack>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        sx={{ 
          height: 4, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2,
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 }
        }} 
      />
    </Box>
  );
}

export function SystemHealthTab() {
  return (
    <Stack spacing={5}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 8 }}>
        <HealthMetric label="API Status" value="99.99% Uptime" status="healthy" />
        <HealthMetric label="MongoDB Cluster" value="Primary Active" status="healthy" />
        <HealthMetric label="Worker Nodes" value="42/45 Online" status="warning" />
        <HealthMetric label="AI Service" value="Fully Operational" status="healthy" />
      </Stack>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

      <Box>
        <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={3}>
          System Performance
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={8}>
          <Box flex={1}>
            <Stack spacing={3}>
              <PerformanceBar label="Storage Usage" current={18.4} max={50} unit="TB" />
              <PerformanceBar label="Worker Utilization" current={88} max={100} unit="%" />
              <PerformanceBar label="Queue Backlog" current={145} max={1000} unit="jobs" />
            </Stack>
          </Box>
          <Box flex={1}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="caption" color="#64748B" fontWeight={700}>AVG RESPONSE TIME</Typography>
                <Typography variant="h4" color="#F8FAFC" fontFamily="monospace">124ms</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="#64748B" fontWeight={700}>CURRENT ERROR RATE</Typography>
                <Typography variant="h4" color="#F8FAFC" fontFamily="monospace">0.012%</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="#64748B" fontWeight={700}>PROCESSING VOLUME (24H)</Typography>
                <Typography variant="h4" color="#F8FAFC" fontFamily="monospace">14,892 mins</Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
