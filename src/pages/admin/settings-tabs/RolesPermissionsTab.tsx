import React from "react";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Check, Minus } from "lucide-react";

const PERMISSIONS_DATA = [
  { module: "Inspection Management", admin: true, reviewer: true, lead: true },
  { module: "Assessment Review", admin: true, reviewer: true, lead: false },
  { module: "Vessel Management", admin: true, reviewer: false, lead: false },
  { module: "Report Approval", admin: true, reviewer: true, lead: false },
  { module: "Fleet Analytics", admin: true, reviewer: true, lead: true },
  { module: "User Management", admin: true, reviewer: false, lead: false },
  { module: "AI Configuration", admin: true, reviewer: false, lead: false },
  { module: "Platform Settings", admin: true, reviewer: false, lead: false },
];

export function RolesPermissionsTab() {
  return (
    <Box>
      <Box mb={4}>
        <Typography variant="body2" color="#94A3B8" mb={1}>
          Define operational boundaries and access capabilities for each system role.
        </Typography>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800, '& th, & td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2, px: 2 } }}>
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>CAPABILITY AREA</Typography></TableCell>
              <TableCell align="center"><Typography variant="caption" color="#F8FAFC" fontWeight={700}>PLATFORM ADMINISTRATOR</Typography></TableCell>
              <TableCell align="center"><Typography variant="caption" color="#F8FAFC" fontWeight={700}>REVIEW ENGINEER</Typography></TableCell>
              <TableCell align="center"><Typography variant="caption" color="#F8FAFC" fontWeight={700}>REGIONAL SURVEY LEAD</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {PERMISSIONS_DATA.map((row, idx) => (
              <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' } }}>
                <TableCell>
                  <Typography variant="body2" color="#F8FAFC" fontWeight={600}>{row.module}</Typography>
                </TableCell>
                <TableCell align="center">
                  {row.admin ? <Check size={18} color="#10B981" /> : <Minus size={18} color="#475569" />}
                </TableCell>
                <TableCell align="center">
                  {row.reviewer ? <Check size={18} color="#10B981" /> : <Minus size={18} color="#475569" />}
                </TableCell>
                <TableCell align="center">
                  {row.lead ? <Check size={18} color="#10B981" /> : <Minus size={18} color="#475569" />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
