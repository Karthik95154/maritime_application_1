import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowRight, ShieldCheck, ShipWheel, Waves, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { shipHero } from "../data/mockData";

const highlights = [
  {
    icon: <Zap size={18} />,
    title: "AI-first inspection pipeline",
    description: "Turn raw hull footage into defect intelligence, timelines, and reports in one flow.",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Faster risk decisions",
    description: "Identify critical corrosion, cracks, deformation, and paint failures before dry dock costs escalate.",
  },
  {
    icon: <ShipWheel size={18} />,
    title: "Built for marine teams",
    description: "Give operators, superintendents, and surveyors one place to review vessel health and repairs.",
  },
];

const stats = [
  { value: "92%", label: "faster review cycles" },
  { value: "6x", label: "quicker defect triage" },
  { value: "24/7", label: "portfolio visibility" },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        color: "#000000",
      }}
    >
      <AnimatedBackground />

      <Container maxWidth="xl" sx={{ position: "relative", py: { xs: 1.5, md: 2 }, flex: 1, display: "flex", flexDirection: "column", zIndex: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            border: "1px solid #e4e4e7",
            borderRadius: 99,
            px: { xs: 2, md: 3 },
            py: 1,
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
            mb: { xs: 3, md: 4 },
          }}
        >
            <Logo />
            <Chip
              icon={<Waves size={14} color="#8b5cf6" />}
              label="Smart maritime inspection platform"
              sx={{
                color: "#6d28d9",
                bgcolor: alpha("#8b5cf6", 0.08),
                border: "1px solid rgba(139, 92, 246, 0.15)",
                display: { xs: "none", sm: "inline-flex" },
                fontWeight: 600,
              }}
            />
          </Stack>

          <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(320px, 400px)" },
                gap: { xs: 3, lg: 4 },
                alignItems: "center",
                width: "100%",
              }}
            >
            <Stack spacing={2.5} sx={{ maxWidth: 760 }}>
              <Stack spacing={1.5}>
                <Chip
                  label="AI-powered vessel intelligence"
                  sx={{
                    width: "fit-content",
                    color: "#ffffff",
                    bgcolor: "#000000",
                    fontWeight: 700,
                    size: "small",
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2rem", md: "2.75rem" },
                    lineHeight: 1.1,
                    color: "#000000",
                    maxWidth: 720,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Make every vessel inspection feel clear, fast, and confidence-driven.
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#52525b",
                    fontWeight: 400,
                    maxWidth: 640,
                    lineHeight: 1.5,
                    fontSize: { xs: "0.95rem", md: "1.05rem" },
                  }}
                >
                  MaritimeInspect helps your team transform inspection footage into defect detection, repair estimates,
                  visual vessel maps, and executive-ready reports from one elegant workspace.
                </Typography>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={18} />}
                  onClick={() => navigate("/login")}
                  sx={{
                    px: 3,
                    py: 1.2,
                    fontSize: "0.95rem",
                    bgcolor: "#8b5cf6",
                    color: "#ffffff",
                    boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
                    "&:hover": { bgcolor: "#7c3aed" },
                  }}
                >
                  Launch dashboard
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/login")}
                  sx={{
                    px: 3,
                    py: 1.2,
                    color: "#000000",
                    borderColor: "#e4e4e7",
                    backgroundColor: "#ffffff",
                    "&:hover": {
                      borderColor: "#000000",
                      backgroundColor: "#fafafa",
                    },
                  }}
                >
                  Explore platform value
                </Button>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                  gap: 1.5,
                }}
              >
                {stats.map((item) => (
                  <Card
                    key={item.label}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      color: "#000000",
                      background: "#fafafa",
                      border: "1px solid #e4e4e7",
                      boxShadow: "none",
                    }}
                  >
                    <Typography variant="h5" sx={{ mb: 0.25, color: "#8b5cf6" }}>
                      {item.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#52525b", fontSize: "0.85rem", fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Stack>

            <Card
              sx={{
                borderRadius: 4,
                background: "#ffffff",
                border: "1px solid #e4e4e7",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.06)",
                color: "#000000",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={1.5}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    From footage to repair strategy
                  </Typography>
                  <Typography sx={{ color: "#52525b", lineHeight: 1.6, fontSize: "0.95rem" }}>
                    Review inspection progress, prioritize severe defects, visualize damage on the vessel, and export
                    polished reports without jumping between tools.
                  </Typography>
                  {highlights.map((item) => (
                    <Box
                      key={item.title}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        backgroundColor: "#fafafa",
                        border: "1px solid transparent",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "#8b5cf6",
                          backgroundColor: "#ffffff",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(139, 92, 246, 0.08)"
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "#000000",
                            color: "#ffffff",
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ mb: 0.2, fontWeight: 700, fontSize: "0.95rem" }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#52525b", lineHeight: 1.4, fontSize: "0.8rem" }}>
                            {item.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
            </Box>
          </Box>
      </Container>
    </Box>
  );
}
