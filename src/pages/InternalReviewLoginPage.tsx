import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ShieldCheck, Waypoints } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";

export function InternalReviewLoginPage() {
  const navigate = useNavigate();
  const { login, authError } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setLocalError("Enter internal team email and password.");
      return;
    }

    setLocalError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/internal/review", { replace: true });
    } catch (error: any) {
      setLocalError(error.message || "Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        background:
          "radial-gradient(circle at 20% 20%, rgba(23, 163, 152, 0.18), transparent 22%), radial-gradient(circle at 80% 15%, rgba(59, 130, 246, 0.24), transparent 24%), linear-gradient(160deg, #020817 0%, #071427 50%, #0C1D34 100%)",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 6,
          bgcolor: "rgba(7, 20, 39, 0.82)",
          border: "1px solid rgba(148, 163, 184, 0.16)",
          boxShadow: "0 30px 80px rgba(2, 8, 23, 0.45)",
          color: "#F8FAFC",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(125, 211, 252, 0.1)",
                  color: "#7DD3FC",
                }}
              >
                <ShieldCheck size={24} />
              </Box>
              <Box>
                <Typography variant="overline" sx={{ color: "#7DD3FC", letterSpacing: 1.4, fontWeight: 700 }}>
                  Developer Team Only
                </Typography>
                <Typography variant="h4" fontWeight={900}>
                  Internal Review Login
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                bgcolor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(148, 163, 184, 0.14)",
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center" mb={1}>
                <Waypoints size={18} color="#7DD3FC" />
                <Typography fontWeight={800}>Separate verification pipeline</Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: "#CBD5E1", lineHeight: 1.7 }}>
                This interface is for the developer and reviewer team to inspect AI output, verify correctness, and release the result to the next process only after approval. It is separate from the customer-facing application.
              </Typography>
            </Box>

            {(localError || authError) && (
              <Alert severity="error" sx={{ borderRadius: 3 }}>
                {localError || authError}
              </Alert>
            )}

            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Internal work email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void handleSubmit();
                }}
                InputLabelProps={{ sx: { color: "#94A3B8" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.04)",
                    color: "#F8FAFC",
                  },
                }}
              />
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void handleSubmit();
                }}
                InputLabelProps={{ sx: { color: "#94A3B8" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.04)",
                    color: "#F8FAFC",
                  },
                }}
              />
            </Stack>

            <Stack spacing={1.25}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => void handleSubmit()}
                disabled={isLoading}
                sx={{
                  height: 52,
                  bgcolor: "#7DD3FC",
                  color: "#082032",
                  fontWeight: 800,
                  "&:hover": { bgcolor: "#BAE6FD" },
                }}
              >
                {isLoading ? <CircularProgress size={22} color="inherit" /> : "Open internal review console"}
              </Button>
              <Button variant="text" onClick={() => navigate("/login")} sx={{ color: "#CBD5E1" }}>
                Return to customer application login
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
