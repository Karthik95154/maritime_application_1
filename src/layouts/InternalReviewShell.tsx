import { Avatar, Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import { ShieldCheck, Workflow } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";

export function InternalReviewShell() {
  const navigate = useNavigate();
  const { user, logout } = useAppStore();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(31, 122, 224, 0.16), transparent 30%), linear-gradient(180deg, #061120 0%, #0B1729 100%)",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          px: { xs: 2, md: 4 },
          py: 2,
          borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
          backdropFilter: "blur(16px)",
          backgroundColor: "rgba(6, 17, 32, 0.82)",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: "#123B67", color: "#7DD3FC" }}>
              <ShieldCheck size={18} />
            </Avatar>
            <Box>
              <Typography variant="overline" sx={{ color: "#7DD3FC", letterSpacing: 1.4, fontWeight: 700 }}>
                Internal Verification Workspace
              </Typography>
              <Typography variant="h6" sx={{ color: "#F8FAFC", fontWeight: 800 }}>
                Human-in-the-Loop Review Console
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <Chip
              icon={<Workflow size={14} />}
              label="Separate from customer application"
              sx={{ bgcolor: "rgba(125, 211, 252, 0.12)", color: "#BAE6FD", fontWeight: 700 }}
            />
            <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(148, 163, 184, 0.2)" }} />
            <Box>
              <Typography variant="body2" sx={{ color: "#F8FAFC", fontWeight: 700 }}>
                {user?.name || "Internal reviewer"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                {user?.role || "Developer team"}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() => {
                logout();
                navigate("/internal/login", { replace: true });
              }}
              sx={{
                borderColor: "rgba(148, 163, 184, 0.35)",
                color: "#E2E8F0",
              }}
            >
              Log out
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
