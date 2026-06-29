import React, { useState } from "react";
import { Box, Stack, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Select, MenuItem, Chip, TextField, InputAdornment } from "@mui/material";
import { Plus, Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { backendApi } from "../../../api/backendApi";

export function UserManagementTab({ onAddUser, onResetPassword }: { onAddUser: () => void; onResetPassword: (email: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  // In a real app this would be a specific GET /admin/users endpoint with these fields
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: backendApi.getUsers,
  });

  // Mocking the extra data for the realistic UI
  const enrichedUsers = users.map((u: any) => ({
    ...u,
    region: u.role === "Platform Administrator" ? "Global" : ["APAC", "EMEA", "AMER"][Math.floor(Math.random() * 3)],
    lastActive: ["2 mins ago", "1 hour ago", "Yesterday", "3 days ago"][Math.floor(Math.random() * 4)],
    assignedVessels: u.role === "Platform Administrator" ? "All" : Math.floor(Math.random() * 12) + 1
  }));

  const filteredUsers = enrichedUsers.filter((u: any) => 
    (roleFilter === "All Roles" || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search personnel..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={16} color="#64748B" /></InputAdornment>,
            }}
            sx={{ 
              width: 250,
              '& .MuiOutlinedInput-root': { 
                color: '#F8FAFC', 
                bgcolor: 'rgba(255,255,255,0.02)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }
              } 
            }}
          />
          <Select
            value={roleFilter}
            size="small"
            onChange={(e) => setRoleFilter(e.target.value)}
            startAdornment={<InputAdornment position="start"><Filter size={16} color="#64748B" /></InputAdornment>}
            sx={{ 
              minWidth: 180, color: '#F8FAFC', bgcolor: 'rgba(255,255,255,0.02)',
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
              '.MuiSvgIcon-root': { color: '#94A3B8' }
            }}
            MenuProps={{ PaperProps: { sx: { bgcolor: '#1E293B', color: '#F8FAFC' } } }}
          >
            <MenuItem value="All Roles">All Roles</MenuItem>
            <MenuItem value="Platform Administrator">Platform Administrator</MenuItem>
            <MenuItem value="Review Engineer">Review Engineer</MenuItem>
            <MenuItem value="Regional Survey Lead">Regional Survey Lead</MenuItem>
          </Select>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={onAddUser}
          sx={{ bgcolor: "#3B82F6", borderRadius: 1, textTransform: "none", px: 2, height: 36, fontSize: 13, '&:hover': { bgcolor: '#2563EB' } }}
        >
          Add Personnel
        </Button>
      </Stack>
      
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1000, '& th, & td': { borderBottom: '1px solid rgba(255,255,255,0.03)', py: 1.5, px: 1 } }}>
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>NAME</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>ROLE</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>REGION</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>STATUS</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>LAST ACTIVE</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>VESSELS</Typography></TableCell>
              <TableCell align="right"><Typography variant="caption" color="#64748B" fontWeight={700}>ACTIONS</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((u: any) => (
              <TableRow key={u.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                <TableCell>
                  <Typography variant="body2" color="#F8FAFC" fontWeight={600}>{u.name}</Typography>
                  <Typography variant="caption" color="#64748B">{u.email}</Typography>
                </TableCell>
                <TableCell>
                  <Select
                    value={u.role}
                    size="small"
                    sx={{ 
                      minWidth: 200, height: 30, fontSize: 13, color: '#F8FAFC', bgcolor: 'rgba(255,255,255,0.03)',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.05)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                      '.MuiSvgIcon-root': { color: '#94A3B8' }
                    }}
                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1E293B', color: '#F8FAFC' } } }}
                  >
                    <MenuItem value="Regional Survey Lead" sx={{ fontSize: 13 }}>Regional Survey Lead</MenuItem>
                    <MenuItem value="Review Engineer" sx={{ fontSize: 13 }}>Review Engineer</MenuItem>
                    <MenuItem value="Platform Administrator" sx={{ fontSize: 13 }}>Platform Administrator</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="#94A3B8">{u.region}</Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={u.status} sx={{ 
                    bgcolor: u.status === "Active" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', 
                    color: u.status === "Active" ? '#10B981' : '#94A3B8',
                    fontWeight: 600, fontSize: 11, height: 24
                  }} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="#94A3B8">{u.lastActive}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="#F8FAFC" fontFamily="monospace">{u.assignedVessels}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" sx={{ color: '#94A3B8', textTransform: 'none', fontSize: 12, minWidth: 0 }}>Edit</Button>
                    <Button size="small" onClick={() => onResetPassword(u.email)} sx={{ color: '#60A5FA', textTransform: 'none', fontSize: 12, minWidth: 0 }}>Reset</Button>
                    <Button size="small" sx={{ color: '#EF4444', textTransform: 'none', fontSize: 12, minWidth: 0 }}>Disable</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
