import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Menu,
  MenuItem,
  Drawer,
  alpha,
} from "@mui/material";
import {
  LayoutDashboard,
  BarChart4,
  ActivitySquare,
  ListChecks,
  Users,
  BrainCircuit,
  FileBarChart,
  ShieldAlert,
  ServerCrash,
  Settings,
  Bell,
  ChevronDown,
  Menu as MenuIcon,
  Globe2
} from "lucide-react";
import { useAppStore } from "../store/appStore";

// The Owner Command Center has 8 specific modules
const adminNavItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Fleet Overview", path: "/admin/fleet", icon: Globe2 },
  { label: "Risk & Compliance", path: "/admin/risk", icon: ShieldAlert },
  { label: "Maintenance Planning", path: "/admin/maintenance", icon: ActivitySquare },
  { label: "Financial Intelligence", path: "/admin/finance", icon: FileBarChart },
  { label: "Executive Reports", path: "/admin/reports", icon: FileBarChart },
  { label: "Organization Management", path: "/admin/org", icon: Users },
  { label: "Platform Settings", path: "/admin/settings", icon: Settings },
];

export function AdminShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  // Dark Mode First Theme overrrides for Admin Shell
  const darkBg = "#020617";
  const darkSurface = "#0F172A";
  const borderCol = "rgba(255,255,255,0.05)";

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", bgcolor: darkBg, color: "#F8FAFC" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: sidebarOpen ? 280 : 80,
          flexShrink: 0,
          height: "100%",
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          background: darkSurface,
          borderRight: `1px solid ${borderCol}`,
          p: 2,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={4} px={sidebarOpen ? 1 : 0} justifyContent={sidebarOpen ? "flex-start" : "center"}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ActivitySquare size={20} color="#fff" />
          </Box>
          {sidebarOpen && (
            <Box>
              <Typography variant="body1" fontWeight={800} letterSpacing={0.5} color="#fff">
                COMMAND CENTER
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: -0.5 }}>
                Fleet Intelligence
              </Typography>
            </Box>
          )}
        </Stack>

        <List sx={{ p: 0, display: "flex", flexDirection: "column", gap: 1.5, overflowY: "auto", overflowX: "hidden", flex: 1, mr: -1, pr: 1,
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: alpha("#fff", 0.1), borderRadius: "4px" },
        }}>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);
            return (
              <ListItemButton
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1.5,
                  minHeight: 40,
                  px: sidebarOpen ? 2 : 1.5,
                  mb: 0,
                  justifyContent: sidebarOpen ? "initial" : "center",
                  bgcolor: "transparent",
                  color: active ? "#F8FAFC" : "#64748B",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "transparent",
                    color: "#F8FAFC",
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: sidebarOpen ? 32 : "auto", color: "inherit", justifyContent: "center" }}>
                  <Icon size={16} />
                </ListItemIcon>
                {sidebarOpen && (
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ variant: "body2", fontWeight: active ? 600 : 500, sx: { transition: "font-weight 0.2s ease" } }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, minWidth: 0, height: "100%", overflowY: "auto", overflowX: "hidden", bgcolor: darkBg }}>
        <Box sx={{ height: 64, position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", px: 4, background: alpha(darkBg, 0.8), backdropFilter: "blur(12px)", borderBottom: `1px solid ${borderCol}` }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: "#fff" }}>
              <MenuIcon size={18} />
            </IconButton>
          </Stack>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton sx={{ color: "#94A3B8" }}>
              <Bell size={18} />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ borderColor: borderCol, my: 1.5 }} />
            <Stack direction="row" spacing={1.5} alignItems="center" onClick={handleMenuOpen} sx={{ cursor: 'pointer' }}>
              <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" fontWeight={700} color="#fff">
                  {user?.name || "Admin"}
                </Typography>
                <Typography variant="caption" color="#94A3B8">
                  {user?.role || "Global Operations"}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "#1E293B", color: "#60A5FA", width: 32, height: 32, fontSize: "0.875rem", fontWeight: 700, border: `1px solid ${borderCol}` }}>
                {user?.name?.[0]?.toUpperCase() || "A"}
              </Avatar>
              <ChevronDown size={14} color="#94A3B8" />
            </Stack>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { bgcolor: darkSurface, color: "#fff", border: `1px solid ${borderCol}` } }}
            >
              <MenuItem onClick={handleLogout} sx={{ '&:hover': { bgcolor: alpha("#fff", 0.05) } }}>Log out</MenuItem>
            </Menu>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, margin: "0 auto", position: "relative" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}
