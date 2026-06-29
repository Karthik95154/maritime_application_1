import React, { useState } from "react";
import { Box, Stack, Typography, Divider, Switch, Select, MenuItem, TextField, Button } from "@mui/material";

export function PlatformConfigTab() {
  const [retention, setRetention] = useState("90");
  const [region, setRegion] = useState("ap-southeast-1");
  const [maintenance, setMaintenance] = useState(false);

  return (
    <Stack spacing={5}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="body2" color="#94A3B8">
          Global platform settings and operational boundaries. Changes here affect all users.
        </Typography>
        <Button variant="contained" sx={{ bgcolor: "#3B82F6", borderRadius: 1, textTransform: "none", px: 3 }}>
          Save Configuration
        </Button>
      </Stack>

      <Box>
        <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={3}>
          Data Governance
        </Typography>
        <Stack spacing={3} maxWidth={600}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="#F8FAFC" fontWeight={600}>Raw Video Retention</Typography>
              <Typography variant="caption" color="#94A3B8">Number of days to keep raw inspection videos before archiving.</Typography>
            </Box>
            <Select size="small" value={retention} onChange={(e) => setRetention(e.target.value)} sx={{ width: 150, color: '#F8FAFC', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}>
              <MenuItem value="30">30 Days</MenuItem>
              <MenuItem value="90">90 Days</MenuItem>
              <MenuItem value="365">1 Year</MenuItem>
            </Select>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="#F8FAFC" fontWeight={600}>Assessment Archive Policy</Typography>
              <Typography variant="caption" color="#94A3B8">When to move assessment data to cold storage.</Typography>
            </Box>
            <Select size="small" value="3" sx={{ width: 150, color: '#F8FAFC', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}>
              <MenuItem value="1">1 Year</MenuItem>
              <MenuItem value="3">3 Years</MenuItem>
              <MenuItem value="7">7 Years</MenuItem>
            </Select>
          </Stack>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

      <Box>
        <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={3}>
          Regional Configuration
        </Typography>
        <Stack spacing={3} maxWidth={600}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="#F8FAFC" fontWeight={600}>Default Processing Region</Typography>
              <Typography variant="caption" color="#94A3B8">Primary datacenter for AI inference.</Typography>
            </Box>
            <Select size="small" value={region} onChange={(e) => setRegion(e.target.value)} sx={{ width: 150, color: '#F8FAFC', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}>
              <MenuItem value="us-east-1">US East</MenuItem>
              <MenuItem value="eu-west-1">Europe</MenuItem>
              <MenuItem value="ap-southeast-1">Asia Pacific</MenuItem>
            </Select>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="#F8FAFC" fontWeight={600}>System Timezone</Typography>
              <Typography variant="caption" color="#94A3B8">Used for daily digests and audit logs.</Typography>
            </Box>
            <Select size="small" value="UTC" sx={{ width: 150, color: '#F8FAFC', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}>
              <MenuItem value="UTC">UTC</MenuItem>
              <MenuItem value="SGT">SGT (UTC+8)</MenuItem>
              <MenuItem value="EST">EST (UTC-5)</MenuItem>
            </Select>
          </Stack>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

      <Box>
        <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={3}>
          Operations
        </Typography>
        <Stack spacing={3} maxWidth={600}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="#F8FAFC" fontWeight={600}>Maintenance Mode</Typography>
              <Typography variant="caption" color="#EF4444">Blocks new inspection uploads. Ongoing jobs will finish.</Typography>
            </Box>
            <Switch checked={maintenance} onChange={(e) => setMaintenance(e.target.checked)} color="error" />
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="#F8FAFC" fontWeight={600}>Max Concurrent Pipelines</Typography>
              <Typography variant="caption" color="#94A3B8">Limit parallel processing to manage costs.</Typography>
            </Box>
            <TextField size="small" value="100" sx={{ width: 150, '& .MuiOutlinedInput-root': { color: '#F8FAFC', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }} />
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
