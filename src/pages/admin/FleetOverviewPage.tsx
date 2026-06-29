import React, { useState } from "react";
import { Box, Stack, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, InputAdornment, Button, Chip } from "@mui/material";
import { Search, Filter, ArrowUpDown } from "lucide-react";

const MOCK_FLEET = [
  { id: 1, name: "Ocean Titan", imo: "IMO 9123456", health: 92, risk: "Low", criticalDefects: 0, repairCost: "₹1.2 L", lastInspection: "2026-06-01" },
  { id: 2, name: "Pacific Voyager", imo: "IMO 9234567", health: 65, risk: "Medium", criticalDefects: 2, repairCost: "₹25.4 L", lastInspection: "2026-05-15" },
  { id: 3, name: "Nordic Star", imo: "IMO 9345678", health: 41, risk: "High", criticalDefects: 5, repairCost: "₹1.4 Cr", lastInspection: "2026-05-28" },
  { id: 4, name: "Atlantic Express", imo: "IMO 9456789", health: 88, risk: "Low", criticalDefects: 0, repairCost: "₹0", lastInspection: "2026-06-10" },
  { id: 5, name: "Desert Rose", imo: "IMO 9567890", health: 78, risk: "Medium", criticalDefects: 1, repairCost: "₹8.5 L", lastInspection: "2026-04-22" },
  { id: 6, name: "Global Harmony", imo: "IMO 9678901", health: 35, risk: "Critical", criticalDefects: 12, repairCost: "₹3.8 Cr", lastInspection: "2026-06-05" },
];

export function FleetOverviewPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFleet = MOCK_FLEET.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.imo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Stack spacing={5} sx={{ pt: 2, pb: 6 }}>
      <Box>
        <Typography variant="h4" fontWeight={800} color="#F8FAFC" letterSpacing={-0.5}>Fleet Overview</Typography>
        <Typography variant="body1" color="#94A3B8" mt={0.5}>Vessel health rankings and global risk metrics.</Typography>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Search vessels by name or IMO..."
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
          <Button startIcon={<Filter size={16} />} sx={{ color: '#94A3B8', textTransform: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
            Filter by Risk
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
        <Table sx={{ minWidth: 1000, '& th, & td': { borderBottom: '1px solid rgba(255,255,255,0.03)', py: 2, px: 2 } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>VESSEL NAME & IMO</Typography></TableCell>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ cursor: 'pointer' }}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>HEALTH SCORE</Typography>
                  <ArrowUpDown size={12} color="#64748B" />
                </Stack>
              </TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>RISK SCORE</Typography></TableCell>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>CRITICAL DEFECTS</Typography></TableCell>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ cursor: 'pointer' }}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>EST. REPAIR COST</Typography>
                  <ArrowUpDown size={12} color="#64748B" />
                </Stack>
              </TableCell>
              <TableCell align="right"><Typography variant="caption" color="#64748B" fontWeight={700}>LAST INSPECTION</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFleet.map((vessel) => (
              <TableRow key={vessel.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                <TableCell>
                  <Typography variant="body2" color="#F8FAFC" fontWeight={700}>{vessel.name}</Typography>
                  <Typography variant="caption" color="#94A3B8" fontFamily="monospace">{vessel.imo}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color={vessel.health > 80 ? "#10B981" : vessel.health > 50 ? "#F59E0B" : "#EF4444"} fontWeight={700}>
                    {vessel.health}/100
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={vessel.risk} sx={{ 
                    bgcolor: vessel.risk === "Low" ? 'rgba(16, 185, 129, 0.1)' : vessel.risk === "Medium" ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    color: vessel.risk === "Low" ? '#10B981' : vessel.risk === "Medium" ? '#F59E0B' : '#EF4444',
                    fontWeight: 700, fontSize: 11, height: 24, borderRadius: 1
                  }} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color={vessel.criticalDefects > 0 ? "#EF4444" : "#F8FAFC"} fontWeight={vessel.criticalDefects > 0 ? 700 : 400}>
                    {vessel.criticalDefects}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="#F8FAFC" fontFamily="monospace">{vessel.repairCost}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="#94A3B8" fontFamily="monospace">{vessel.lastInspection}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
}
