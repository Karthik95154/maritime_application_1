import React, { useState } from "react";
import { Box, Stack, Typography, Tabs, Tab, Dialog, DialogTitle, DialogContent, TextField, FormControl, InputLabel, Select, MenuItem, DialogActions, Button } from "@mui/material";
import { UserManagementTab } from "./admin/settings-tabs/UserManagementTab";
import { RolesPermissionsTab } from "./admin/settings-tabs/RolesPermissionsTab";
import { AuditLogsTab } from "./admin/settings-tabs/AuditLogsTab";
import { SystemHealthTab } from "./admin/settings-tabs/SystemHealthTab";
import { PlatformConfigTab } from "./admin/settings-tabs/PlatformConfigTab";
import { AiConfigTab } from "./admin/settings-tabs/AiConfigTab";
import { NotificationsTab } from "./admin/settings-tabs/NotificationsTab";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { backendApi } from "../api/backendApi";
import toast from "react-hot-toast";

const SETTINGS_TABS = [
  "User Management",
  "Roles & Permissions",
  "Audit Logs",
  "System Health",
  "Platform Configuration",
  "AI Configuration",
  "Notifications",
];

export const AdminSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);

  // User Management State hoisted for modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "Regional Survey Lead" });
  const [resetPasswordEmail, setResetPasswordEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const createUserMutation = useMutation({
    mutationFn: (data: any) => backendApi.signup({ ...data, isAdmin: data.role === "Platform Administrator", organization: "Maritime Inspect" }),
    onSuccess: () => {
      toast.success("Employee created successfully!");
      setIsAddUserOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "Regional Survey Lead" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to create employee"),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => backendApi.resetUserPassword(email, password),
    onSuccess: () => {
      toast.success("Password reset successfully!");
      setResetPasswordEmail(null);
      setNewPassword("");
    },
    onError: () => toast.error("Failed to reset password"),
  });

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill all fields");
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return <UserManagementTab onAddUser={() => setIsAddUserOpen(true)} onResetPassword={setResetPasswordEmail} />;
      case 1: return <RolesPermissionsTab />;
      case 2: return <AuditLogsTab />;
      case 3: return <SystemHealthTab />;
      case 4: return <PlatformConfigTab />;
      case 5: return <AiConfigTab />;
      case 6: return <NotificationsTab />;
      default: return null;
    }
  };

  return (
    <Stack spacing={5}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h4" fontWeight={800} color="#F8FAFC" letterSpacing={-0.5}>Platform Settings</Typography>
          <Typography variant="body2" color="#94A3B8" mt={0.5}>Manage organization personnel, system configuration, and audit logs.</Typography>
        </Box>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 14,
              color: '#64748B',
              minHeight: 40,
              py: 1,
              px: 2,
              '&.Mui-selected': { color: '#F8FAFC' }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#3B82F6',
              height: 2
            }
          }}
        >
          {SETTINGS_TABS.map((tab, idx) => (
            <Tab key={idx} label={tab} />
          ))}
        </Tabs>
      </Box>

      <Box>
        {renderTabContent()}
      </Box>

      {/* Dialogs */}
      <Dialog open={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#0F172A', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#F8FAFC', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Create Employee Login</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <TextField label="Full Name" fullWidth value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} InputLabelProps={{ sx: { color: '#94A3B8' } }} sx={{ '& .MuiOutlinedInput-root': { color: '#F8FAFC', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }} />
            <TextField label="Email Address" fullWidth type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} InputLabelProps={{ sx: { color: '#94A3B8' } }} sx={{ '& .MuiOutlinedInput-root': { color: '#F8FAFC', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }} />
            <TextField label="Temporary Password" fullWidth type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} InputLabelProps={{ sx: { color: '#94A3B8' } }} sx={{ '& .MuiOutlinedInput-root': { color: '#F8FAFC', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }} />
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#94A3B8' }}>System Role</InputLabel>
              <Select value={newUser.role} label="System Role" onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} sx={{ color: '#F8FAFC', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '.MuiSvgIcon-root': { color: '#94A3B8' } }} MenuProps={{ PaperProps: { sx: { bgcolor: '#1E293B', color: '#F8FAFC' } } }}>
                <MenuItem value="Regional Survey Lead">Regional Survey Lead (Inspector)</MenuItem>
                <MenuItem value="Review Engineer">Review Engineer (Approver)</MenuItem>
                <MenuItem value="Platform Administrator">Platform Administrator</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button onClick={() => setIsAddUserOpen(false)} sx={{ color: '#94A3B8', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained" disabled={createUserMutation.isPending} sx={{ bgcolor: "#3B82F6", borderRadius: 1, textTransform: 'none' }}>{createUserMutation.isPending ? "Creating..." : "Create Personnel"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!resetPasswordEmail} onClose={() => setResetPasswordEmail(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: '#0F172A', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#F8FAFC', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Reset Password</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="#94A3B8" mb={3}>Set a new temporary password for <span style={{ color: '#F8FAFC' }}>{resetPasswordEmail}</span>.</Typography>
          <TextField label="New Password" fullWidth type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoFocus InputLabelProps={{ sx: { color: '#94A3B8' } }} sx={{ '& .MuiOutlinedInput-root': { color: '#F8FAFC', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button onClick={() => setResetPasswordEmail(null)} sx={{ color: '#94A3B8', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={() => resetPasswordEmail && resetPasswordMutation.mutate({ email: resetPasswordEmail, password: newPassword })} variant="contained" disabled={!newPassword || resetPasswordMutation.isPending} sx={{ bgcolor: "#3B82F6", borderRadius: 1, textTransform: 'none' }}>{resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
