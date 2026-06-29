import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { shipHero } from "../data/mockData";
import { useAppStore } from "../store/appStore";

const glassTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#60A5FA",
    },
    background: {
      default: "transparent",
      paper: "transparent",
    },
  },
  typography: {
    fontFamily: '"Public Sans", sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 14,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            transition: "all 0.2s ease-in-out",
            "& fieldset": { borderColor: "rgba(255, 255, 255, 0.14)" },
            "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.28)" },
            "&.Mui-focused fieldset": { borderColor: "#60A5FA", borderWidth: "2px" },
            "&.Mui-error fieldset": { borderColor: "#F87171" },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
  },
});

export function LoginPage() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, authError } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const validateForm = () => {
    const nextErrors: { email?: string; password?: string } = {};

    if (!email) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(email, password);
      
      const user = useAppStore.getState().user;
      
      if (isAdminMode && !user?.isAdmin) {
        useAppStore.getState().logout();
        setErrors({ email: "Access Denied: This account does not have administrator privileges." });
        return;
      }

      const defaultRoute = user?.isAdmin ? "/admin/dashboard" : "/dashboard";
      const from = location.state?.from?.pathname || defaultRoute;
      navigate(from, { replace: true });
    } catch (error: any) {
      setErrors({ email: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsAdminMode((current) => !current);
    setErrors({});
    setPassword("");
  };

  return (
    <ThemeProvider theme={glassTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 6 },
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, rgba(2, 6, 23, 0.96) 0%, rgba(7, 15, 33, 0.88) 38%, rgba(10, 37, 64, 0.82) 100%), url(${shipHero}) center/cover`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 15% 20%, rgba(96, 165, 250, 0.22), transparent 24%), radial-gradient(circle at 80% 25%, rgba(45, 212, 191, 0.16), transparent 22%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.18), transparent 25%)",
          }}
        />

        <Card
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 460,
            borderRadius: 6,
            background: "rgba(15, 23, 42, 0.58)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 30px 70px rgba(2, 8, 23, 0.45)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3}>
              <Box>
                <Logo />
                <Typography variant="h4" sx={{ color: "#ffffff", fontWeight: 800, mt: 3, mb: 1 }}>
                  Welcome aboard
                </Typography>
                <Typography sx={{ color: "rgba(226, 232, 240, 0.72)", lineHeight: 1.7 }}>
                  Sign in to review inspections, track defects, and generate vessel reports.
                </Typography>
              </Box>

              {(errors.email || authError) && (
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {errors.email || authError}
                </Alert>
              )}

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Work email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void handleSubmit();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((current) => !current)}
                          edge="end"
                          size="small"
                          sx={{ color: "rgba(255,255,255,0.55)", mr: 0.4 }}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              {!isAdminMode && (
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                  <FormControlLabel
                    control={<Checkbox size="small" />}
                    label={
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
                        Remember for 30 days
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                  <Link underline="hover" sx={{ cursor: "pointer", color: "#93C5FD", fontSize: "0.85rem", fontWeight: 600 }}>
                    Forgot password?
                  </Link>
                </Stack>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => void handleSubmit()}
                disabled={isLoading}
                sx={{
                  height: 52,
                  bgcolor: "#60A5FA",
                  color: "#03111f",
                  fontSize: "1rem",
                  "&:hover": { bgcolor: "#93C5FD" },
                }}
              >
                {isLoading ? <CircularProgress size={22} color="inherit" /> : "Sign in to MaritimeInspect"}
              </Button>

              <Typography variant="body2" sx={{ textAlign: "center", color: "rgba(255,255,255,0.68)" }}>
                Looking for the product overview?{" "}
                <Link underline="hover" sx={{ cursor: "pointer", color: "#dbeafe", fontWeight: 600 }} onClick={() => navigate("/")}>
                  Back to landing page
                </Link>
              </Typography>

              <Typography variant="body2" textAlign="center">
                <Link
                  underline="hover"
                  sx={{ cursor: "pointer", color: "#dbeafe", fontWeight: 600 }}
                  onClick={toggleMode}
                >
                  {isAdminMode ? "Return to standard login" : "Switch to admin portal"}
                </Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
