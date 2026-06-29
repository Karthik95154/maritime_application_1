import { alpha, createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0F172A", 
      light: "#334155",
      dark: "#020617",
      contrastText: "#FFFFFF"
    },
    secondary: {
      main: "#1E40AF",
      light: "#3B82F6",
      dark: "#1E3A8A",
    },
    info: { main: "#06B6D4" },
    success: { main: "#10B981" },
    warning: { main: "#F59E0B" },
    error: { main: "#EF4444" },
    background: {
      default: "#F8FAFC", 
      paper: "#FFFFFF", 
    },
    text: {
      primary: "#0F172A",
      secondary: "#475569",
    },
    divider: "#E2E8F0", 
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    fontSize: 13,
    h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: "-0.01em" },
    h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: "-0.01em" },
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: "-0.01em" },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 500, fontFamily: '"Inter", sans-serif' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F1F5F9",
          backgroundImage: "none",
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          background: "#FFFFFF", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
          border: "1px solid #E2E8F0",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px -8px rgba(37, 99, 235, 0.15)",
            borderColor: "rgba(37, 99, 235, 0.3)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          transition: "box-shadow 0.3s ease",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "#020617", // Keep Sidebar Blue-Black
          color: "#F8FAFC",
          borderRight: "none",
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          paddingInline: 16,
          paddingTop: 6,
          paddingBottom: 6,
          transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, box-shadow 0.2s ease",
          "&:active": {
            transform: "scale(0.96)",
          }
        },
        contained: {
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          color: "#ffffff",
          fontWeight: 600,
          "&:hover": {
            background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
            transform: "translateY(-1px)",
          },
          "&.Mui-disabled": {
            background: "#F1F5F9",
            color: "#94A3B8",
            boxShadow: "none",
          }
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          color: "#ffffff",
          "&:hover": {
            background: "linear-gradient(135deg, #1E40AF 0%, #0F172A 100%)",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
            transform: "translateY(-1px)",
          },
          "&.Mui-disabled": {
            background: "#F1F5F9",
            color: "#94A3B8",
            boxShadow: "none",
          }
        }
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: "#FFFFFF",
          transition: "all 0.2s ease",
          "& fieldset": {
            borderColor: "#E2E8F0",
            transition: "border-color 0.2s ease",
          },
          "&:hover fieldset": {
            borderColor: "#CBD5E1",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#2563EB",
            borderWidth: "1px",
            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
          }
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          paddingTop: 12,
          paddingBottom: 12,
          borderColor: "#E2E8F0",
        },
        head: {
          fontWeight: 600,
          color: "#475569",
          backgroundColor: "#F8FAFC",
        }
      }
    }
  },
});
