import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Building2, ChevronDown, Menu as MenuIcon, Settings } from "lucide-react";
import {
  alpha,
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
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  ShipWheel,
  FileText,
  Wrench
} from "lucide-react";
import { Logo } from "../components/Logo";
import { useAppStore } from "../store/appStore";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Inspections", path: "/inspections", icon: ClipboardList },
  { label: "Fleet", path: "/fleet", icon: ShipWheel },
  { label: "Defects", path: "/defects", icon: Wrench },
  { label: "Reports", path: "/reports", icon: FileText },
];

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen, user, logout } = useAppStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const currentNavItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Inspections", path: "/inspections", icon: ClipboardList },
    { label: "Fleet", path: "/fleet", icon: ShipWheel },
    { label: "Defects", path: "/defects", icon: Wrench },
    { label: "Reports", path: "/reports", icon: FileText },
  ];

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

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { 
            boxSizing: "border-box", 
            width: 260, 
            color: "#fff", 
            p: 2, 
            overflow: "hidden",
            background: "#020617",
            borderRight: "1px solid #1E293B"
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Logo light />
          <IconButton onClick={() => setSidebarOpen(false)} sx={{ color: "#fff" }}>
            <MenuIcon size={18} />
          </IconButton>
        </Stack>

        <List sx={{ p: 0, display: "flex", flexDirection: "column", gap: 0.75, overflowY: "auto", overflowX: "hidden", flex: 1, mr: -1, pr: 1, "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { backgroundColor: alpha("#fff", 0.2), borderRadius: "4px" }, "&::-webkit-scrollbar-track": { backgroundColor: "transparent" } }}>
          {currentNavItems?.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <ListItemButton key={item.label} onClick={(e) => { e.currentTarget.blur(); navigate(item.path); setSidebarOpen(false); }} sx={{ borderRadius: 2, minHeight: 48, px: 2, mb: 0.5, bgcolor: active ? alpha("#3B82F6", 0.15) : "transparent", color: active ? "#3B82F6" : alpha("#fff", 0.7), borderLeft: active ? "3px solid #3B82F6" : "3px solid transparent", transition: "all 0.2s ease" }}>
                <ListItemIcon sx={{ minWidth: 36, color: "inherit", justifyContent: "center" }}><Icon size={20} /></ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ variant: "body2", fontWeight: active ? 600 : 500, sx: { transition: "font-weight 0.2s ease" } }} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box
        sx={{
          width: sidebarOpen ? 260 : 80,
          flexShrink: 0,
          height: "100%",
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "#020617",
          borderRight: "1px solid #1E293B",
          color: "#fff",
          p: 2,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          {sidebarOpen ? <Logo light /> : <Avatar sx={{ bgcolor: alpha("#fff", 0.12) }}>M</Avatar>}
        </Stack>

        <List sx={{ 
          p: 0, 
          display: "flex", 
          flexDirection: "column",
          gap: 0.75, 
          overflowY: "auto", 
          overflowX: "hidden",
          flex: 1,
          mr: -1, 
          pr: 1,
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha("#fff", 0.2),
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          }
        }}>
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  px: sidebarOpen ? 2 : 1.5,
                  mb: 0.5,
                  justifyContent: sidebarOpen ? "initial" : "center",
                  bgcolor: active ? alpha("#3B82F6", 0.15) : "transparent",
                  color: active ? "#3B82F6" : alpha("#fff", 0.7),
                  borderLeft: active ? "3px solid #3B82F6" : "3px solid transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: active ? alpha("#3B82F6", 0.2) : alpha("#fff", 0.05),
                    color: active ? "#3B82F6" : "#fff",
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: sidebarOpen ? 36 : "auto", 
                  color: "inherit",
                  justifyContent: "center"
                }}>
                  <Icon size={20} />
                </ListItemIcon>
                {sidebarOpen ? (
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: active ? 600 : 500,
                      sx: { transition: "font-weight 0.2s ease" }
                    }}
                  />
                ) : null}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          bgcolor: "background.default",
        }}
      >
        <Box
          sx={{
            height: 72,
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            background: "#FFFFFF",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <MenuIcon size={18} />
            </IconButton>
            <Stack spacing={0.1} sx={{ display: { xs: 'flex', md: sidebarOpen ? 'none' : 'flex' } }}>
              <Logo />
              <Typography variant="caption" color="text.secondary" sx={{ pl: 5.25, display: { xs: "none", md: "block" } }}>
                Fleet inspection command center
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1.25} alignItems="center">

            <IconButton sx={{ border: "1px solid", borderColor: "divider" }}>
              <Bell size={18} />
            </IconButton>
            <Divider orientation="vertical" flexItem />
            <Stack 
              direction="row" 
              spacing={1} 
              alignItems="center" 
              onClick={handleMenuOpen}
              sx={{ cursor: 'pointer' }}
            >
              <Avatar sx={{ bgcolor: "primary.main", color: "#fff", width: 36, height: 36, fontSize: "1rem" }}>
                {user?.name?.[0]?.toUpperCase() || "U"}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" fontWeight={700}>
                  {user?.name || "John Inspector"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role || "Regional Survey Lead"}
                </Typography>
              </Box>
              <ChevronDown size={16} />
            </Stack>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleLogout}>Log out</MenuItem>
            </Menu>
          </Stack>
        </Box>
        <Box sx={{ p: 3, position: "relative" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto" }} className="page-transition">
                <Outlet />
              </Box>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}
