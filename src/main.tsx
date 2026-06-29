import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { appRouter } from "./router";
import { CustomThemeProvider } from "./components/ThemeContext";
import "./styles.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif', borderRadius: 12 } }} />
        <RouterProvider router={appRouter} />
      </CustomThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
