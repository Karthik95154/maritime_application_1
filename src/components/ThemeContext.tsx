import React, { createContext, useState, useMemo, useContext, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light"); // Default to light to preserve original site color

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: { main: "#0F172A", light: "#334155", dark: "#020617" },
                secondary: { main: "#1E40AF", light: "#3B82F6", dark: "#1E3A8A" },
                background: { default: "#F8FAFC", paper: "#FFFFFF" },
                text: { primary: "#0F172A", secondary: "#475569" },
                divider: "#E2E8F0",
                success: { main: "#10B981" },
                warning: { main: "#F59E0B" },
                error: { main: "#EF4444" },
                info: { main: "#06B6D4" },
              }
            : {
                primary: { main: "#F8FAFC", light: "#E2E8F0", dark: "#CBD5E1" },
                secondary: { main: "#3B82F6", light: "#60A5FA", dark: "#2563EB" },
                background: { default: "#020617", paper: "#0F172A" },
                text: { primary: "#F8FAFC", secondary: "#94A3B8" },
                divider: "#1E293B",
                success: { main: "#10B981" },
                warning: { main: "#F59E0B" },
                error: { main: "#EF4444" },
                info: { main: "#06B6D4" },
              }),
        },
        shape: { borderRadius: 8 },
        typography: {
          fontFamily: '"Inter", sans-serif',
          fontSize: 13,
          h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: "-0.01em" },
          h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: "-0.01em" },
          h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: "-0.01em" },
          h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
          h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
          h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
          button: { textTransform: "none", fontWeight: 500 },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: mode === "light" ? "#F8FAFC" : "#020617",
                backgroundImage: "none",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                background: mode === "light" ? "#FFFFFF" : "#0F172A",
                boxShadow: mode === "light" 
                  ? "0 4px 20px rgba(0, 0, 0, 0.03)" 
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: `1px solid ${mode === "light" ? "#F1F5F9" : "#1E293B"}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === "light" 
                    ? "0 8px 30px rgba(0, 0, 0, 0.05)" 
                    : "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                }
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                background: mode === "light" ? "#FFFFFF" : "#0F172A",
                border: `1px solid ${mode === "light" ? "#F1F5F9" : "#1E293B"}`,
                boxShadow: mode === "light" 
                  ? "0 4px 20px rgba(0, 0, 0, 0.03)" 
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              },
            },
          },
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
              root: { borderRadius: 6, paddingInline: 16 },
              contained: {
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                color: "#ffffff",
                fontWeight: 600,
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                backgroundColor: mode === "light" ? "#FFFFFF" : "#0F172A",
                "& fieldset": { borderColor: mode === "light" ? "#E2E8F0" : "#1E293B" },
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
