import React, { useState } from "react";
import { Box, Stack, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, InputAdornment, Button, Tabs, Tab } from "@mui/material";
import { Search, Plus } from "lucide-react";

const MOCK_USERS = [
  { id: 1, name: "Sarah Chen", role: "Review Engineer", status: "Active", inspections: 0, reviews: 450, avgTime: "14m", lastActive: "Today, 10:20 AM" },
  { id: 2, name: "Marcus Johnson", role: "Survey Lead", status: "Active", inspections: 124, reviews: 0, avgTime: "-", lastActive: "Today, 08:15 AM" },
  { id: 3, name: "Elena Rodriguez", role: "Administrator", status: "Active", inspections: 0, reviews: 85, avgTime: "22m", lastActive: "Yesterday" },
  { id: 4, name: "James Wilson", role: "Survey Lead", status: "Active", inspections: 89, reviews: 0, avgTime: "-", lastActive: "Jun 09, 2026" },
  { id: 5, name: "Aisha Patel", role: "Review Engineer", status: "Inactive", inspections: 0, reviews: 210, avgTime: "18m", lastActive: "May 20, 2026" },
];

export function OrgManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const filterRole = activeTab === 0 ? "All" : activeTab === 1 ? "Administrator" : activeTab === 2 ? "Review Engineer" : "Survey Lead";
  
  const filteredUsers = MOCK_USERS.filter(u => 
    (filterRole === "All" || u.role === filterRole) &&
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Stack spacing={5} sx={{ pt: 2, pb: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h4" fontWeight={800} color="#F8FAFC" letterSpacing={-0.5}>Organization Management</Typography>
          <Typography variant="body1" color="#94A3B8" mt={0.5}>Manage personnel, operational permissions, and performance KPIs.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          sx={{ bgcolor: "#F8FAFC", color: '#0F172A', borderRadius: 1, textTransform: "none", px: 3, fontWeight: 700, '&:hover': { bgcolor: '#E2E8F0' } }}
        >
          Add Personnel
        </Button>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              textTransform: 'none', fontWeight: 600, fontSize: 14, color: '#64748B', minHeight: 40, py: 1, px: 2,
              '&.Mui-selected': { color: '#F8FAFC' }
            },
            '& .MuiTabs-indicator': { backgroundColor: '#3B82F6', height: 2 }
          }}
        >
          <Tab label="All Personnel" />
          <Tab label="Administrators" />
          <Tab label="Review Engineers" />
          <Tab label="Survey Leads" />
        </Tabs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <TextField
          placeholder="Search personnel by name..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search size={16} color="#64748B" /></InputAdornment>,
          }}
          sx={{ 
            width: 350,
            '& .MuiOutlinedInput-root': { 
              color: '#F8FAFC', 
              bgcolor: 'rgba(255,255,255,0.02)',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }
            } 
          }}
        />
      </Stack>

      <Box sx={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
        <Table sx={{ minWidth: 1000, '& th, & td': { borderBottom: '1px solid rgba(255,255,255,0.03)', py: 2, px: 2 } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>PERSONNEL</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>SYSTEM ROLE</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>INSPECTIONS UPLOADED</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>REVIEWS COMPLETED</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>AVG. REVIEW TIME</Typography></TableCell>
              <TableCell align="right"><Typography variant="caption" color="#64748B" fontWeight={700}>LAST ACTIVE</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                <TableCell>
                  <Typography variant="body2" color={user.status === 'Active' ? "#F8FAFC" : "#64748B"} fontWeight={700}>{user.name}</Typography>
                  <Typography variant="caption" color={user.status === 'Active' ? "#10B981" : "#EF4444"}>{user.status}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="#94A3B8">{user.role}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="#F8FAFC" fontFamily="monospace">{user.inspections}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="#F8FAFC" fontFamily="monospace">{user.reviews}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="#F8FAFC" fontFamily="monospace">{user.avgTime}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="#94A3B8">{user.lastActive}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
}
