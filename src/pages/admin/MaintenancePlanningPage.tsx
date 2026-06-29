import React from "react";
import { Box, Stack, Typography, Grid, Button, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { Calendar, Wrench, TrendingUp, AlertCircle } from "lucide-react";

function PlanningCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <Box sx={{ p: 3, border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.4)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Typography variant="caption" color="#94A3B8" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Typography>
        <Box sx={{ color }}>{icon}</Box>
      </Stack>
      <Typography variant="h3" color="#F8FAFC" fontWeight={800} fontFamily="monospace" letterSpacing={-1}>
        {value}
      </Typography>
    </Box>
  );
}

export function MaintenancePlanningPage() {
  return (
    <Stack spacing={6} sx={{ pt: 2, pb: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h4" fontWeight={800} color="#F8FAFC" letterSpacing={-0.5}>Maintenance Planning</Typography>
          <Typography variant="body1" color="#94A3B8" mt={0.5}>Future planning workspace and predictive repair tracking.</Typography>
        </Box>
      </Stack>

      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <PlanningCard title="Upcoming Drydocks" value="14" icon={<Calendar size={20} />} color="#3B82F6" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <PlanningCard title="Pending Repairs" value="86" icon={<Wrench size={20} />} color="#F59E0B" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <PlanningCard title="Budget Forecast (Q3)" value="₹12.5 Cr" icon={<TrendingUp size={20} />} color="#10B981" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <PlanningCard title="Predicted Risks" value="5" icon={<AlertCircle size={20} />} color="#EF4444" />
        </Grid>
      </Grid>

      <Box>
        <Typography variant="body2" color="#64748B" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={2}>
          Upcoming Drydock Schedule & Repair Planning
        </Typography>
        <Box sx={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
          <Table sx={{ minWidth: 800, '& th, & td': { borderBottom: '1px solid rgba(255,255,255,0.03)', py: 2, px: 2 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>VESSEL</Typography></TableCell>
                <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>SCHEDULED DATE</Typography></TableCell>
                <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>LOCATION</Typography></TableCell>
                <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>AI RECOMMENDED REPAIRS</Typography></TableCell>
                <TableCell><Typography variant="caption" color="#64748B" fontWeight={700}>EST. COST</Typography></TableCell>
                <TableCell align="right"><Typography variant="caption" color="#64748B" fontWeight={700}>ACTIONS</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: "Nordic Star", date: "Aug 15, 2026", location: "Singapore Yard", repairs: "Hull Coating, Web Frame Reinforcement", cost: "₹1.4 Cr" },
                { name: "Pacific Voyager", date: "Sep 02, 2026", location: "Dubai Drydocks", repairs: "Cargo Hold Cleaning, Minor Steel Renewal", cost: "₹25.4 L" },
                { name: "Global Harmony", date: "Sep 20, 2026", location: "Rotterdam", repairs: "Major Structural Overhaul", cost: "₹3.8 Cr" },
              ].map((row, idx) => (
                <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell><Typography variant="body2" color="#F8FAFC" fontWeight={700}>{row.name}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="#94A3B8">{row.date}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="#94A3B8">{row.location}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="#F8FAFC">{row.repairs}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="#F59E0B" fontFamily="monospace" fontWeight={700}>{row.cost}</Typography></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" sx={{ color: '#3B82F6', textTransform: 'none', fontSize: 12 }}>Prioritize</Button>
                      <Button size="small" sx={{ color: '#10B981', textTransform: 'none', fontSize: 12 }}>View Estimate</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Stack>
  );
}
