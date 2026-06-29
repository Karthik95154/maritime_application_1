import React, { useState } from "react";
import { Box, Stack, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, InputAdornment, Button, Chip } from "@mui/material";
import { Search, Download, Filter } from "lucide-react";

const MOCK_AUDIT_LOGS = [
  { id: "A-001", timestamp: "2026-06-11 12:45:12", user: "System Admin", action: "UPDATE_AI_THRESHOLD", entity: "AI Configuration", target: "Confidence Limit", ip: "192.168.1.45", result: "SUCCESS" },
  { id: "A-002", timestamp: "2026-06-11 11:30:05", user: "Review Engineer", action: "APPROVE_ASSESSMENT", entity: "Assessment Queue", target: "Insp_84729", ip: "10.0.4.22", result: "SUCCESS" },
  { id: "A-003", timestamp: "2026-06-11 10:15:44", user: "Survey Lead", action: "UPLOAD_VIDEO", entity: "Inspection Pipeline", target: "Ocean Titan", ip: "172.16.0.12", result: "SUCCESS" },
  { id: "A-004", timestamp: "2026-06-11 09:05:11", user: "System Admin", action: "REVOKE_ACCESS", entity: "User Management", target: "j.doe@example.com", ip: "192.168.1.45", result: "SUCCESS" },
  { id: "A-005", timestamp: "2026-06-11 08:55:00", user: "Review Engineer", action: "REJECT_ASSESSMENT", entity: "Assessment Queue", target: "Insp_84711", ip: "10.0.4.22", result: "SUCCESS" },
  { id: "A-006", timestamp: "2026-06-10 16:22:30", user: "System", action: "AUTO_ARCHIVE", entity: "Data Governance", target: "Insp_70001 to 70100", ip: "Internal", result: "SUCCESS" },
  { id: "A-007", timestamp: "2026-06-10 14:10:02", user: "Unknown", action: "LOGIN_ATTEMPT", entity: "Authentication", target: "admin_portal", ip: "45.22.11.9", result: "FAILED" },
];

export function AuditLogsTab() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = MOCK_AUDIT_LOGS.filter(l => 
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Search logs..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={16} color="#64748B" /></InputAdornment>,
            }}
            sx={{ 
              width: 300,
              '& .MuiOutlinedInput-root': { 
                color: '#F8FAFC', 
                bgcolor: 'rgba(255,255,255,0.02)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }
              } 
            }}
          />
          <Button startIcon={<Filter size={16} />} sx={{ color: '#94A3B8', textTransform: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
            Filters
          </Button>
        </Stack>
        <Button startIcon={<Download size={16} />} sx={{ color: '#F8FAFC', textTransform: 'none', bgcolor: 'rgba(255,255,255,0.05)' }}>
          Export CSV
        </Button>
      </Stack>

      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1000, '& th, & td': { borderBottom: '1px solid rgba(255,255,255,0.03)', py: 1.5, px: 1 } }}>
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>TIMESTAMP</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>USER</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>ACTION</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>ENTITY</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>TARGET</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>IP ADDRESS</Typography></TableCell>
              <TableCell align="right"><Typography variant="caption" color="#64748B" fontWeight={700}>RESULT</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                <TableCell>
                  <Typography variant="body2" color="#94A3B8" fontFamily="monospace">{log.timestamp}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="#F8FAFC" fontWeight={600}>{log.user}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="#60A5FA" fontFamily="monospace" fontSize={12}>{log.action}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="#94A3B8">{log.entity}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="#F8FAFC">{log.target}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="#64748B" fontFamily="monospace">{log.ip}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip size="small" label={log.result} sx={{ 
                    bgcolor: log.result === "SUCCESS" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    color: log.result === "SUCCESS" ? '#10B981' : '#EF4444',
                    fontWeight: 700, fontSize: 10, height: 20, fontFamily: 'monospace'
                  }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
