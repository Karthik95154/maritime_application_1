import React, { useState } from "react";
import { Box, Stack, Typography, Divider, Switch, Button, TextField } from "@mui/material";

function NotificationToggle({ title, description, defaultChecked = false }: { title: string, description: string, defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" py={1.5} borderBottom="1px solid rgba(255,255,255,0.02)">
      <Box>
        <Typography variant="body2" color="#F8FAFC" fontWeight={600}>{title}</Typography>
        <Typography variant="caption" color="#94A3B8">{description}</Typography>
      </Box>
      <Switch checked={checked} onChange={(e) => setChecked(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#3B82F6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#3B82F6' } }} />
    </Stack>
  );
}

export function NotificationsTab() {
  return (
    <Stack spacing={5}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="body2" color="#94A3B8">
          Configure how and when the platform sends alerts to personnel and external systems.
        </Typography>
        <Button variant="contained" sx={{ bgcolor: "#3B82F6", borderRadius: 1, textTransform: "none", px: 3 }}>
          Save Preferences
        </Button>
      </Stack>

      <Box>
        <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={2}>
          Critical Alerts
        </Typography>
        <Stack maxWidth={700}>
          <NotificationToggle title="Critical Defect Detected" description="Immediate alert when AI detects a severity 5 (Critical) defect." defaultChecked />
          <NotificationToggle title="High Risk Vessel Threshold" description="Alert when a vessel's health score drops below 40." defaultChecked />
          <NotificationToggle title="Pipeline Failure" description="System alerts when an inspection pipeline stalls or fails." defaultChecked />
        </Stack>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

      <Box>
        <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={2}>
          Operations & Reporting
        </Typography>
        <Stack maxWidth={700}>
          <NotificationToggle title="Daily Fleet Digest" description="A morning summary of fleet health and pending assessments." defaultChecked />
          <NotificationToggle title="Weekly AI Accuracy Report" description="Weekly performance metrics for the active AI model." />
          <NotificationToggle title="Assessment Queue Backlog" description="Alert when the human review queue exceeds 50 pending items." defaultChecked />
        </Stack>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

      <Box>
        <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={3}>
          External Integrations
        </Typography>
        <Stack spacing={4} maxWidth={700}>
          <Box>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="#F8FAFC" fontWeight={600}>Global Webhook URL</Typography>
              <Button size="small" sx={{ color: '#3B82F6', textTransform: 'none', minWidth: 0, p: 0 }}>Test Payload</Button>
            </Stack>
            <Typography variant="caption" color="#94A3B8" display="block" mb={1}>
              Send all platform events (JSON) to an external endpoint.
            </Typography>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="https://api.yourcompany.com/webhooks/maritime"
              sx={{ '& .MuiOutlinedInput-root': { color: '#F8FAFC', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }} 
            />
          </Box>

          <Box>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="#F8FAFC" fontWeight={600}>Slack / Teams Integration</Typography>
              <Button size="small" sx={{ color: '#3B82F6', textTransform: 'none', minWidth: 0, p: 0 }}>Connect</Button>
            </Stack>
            <Typography variant="caption" color="#94A3B8" display="block" mb={1}>
              Route critical alerts directly to a channel.
            </Typography>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="Slack Webhook URL"
              sx={{ '& .MuiOutlinedInput-root': { color: '#F8FAFC', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }} 
            />
          </Box>
        </Stack>
      </Box>

    </Stack>
  );
}
