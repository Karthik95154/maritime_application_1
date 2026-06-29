import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import { AdminShell } from "./layouts/AdminShell";
import { InternalReviewShell } from "./layouts/InternalReviewShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { InternalReviewRoute } from "./components/InternalReviewRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { DefectProgressionPage } from "./pages/DefectProgressionPage";
import { DefectReviewPage } from "./pages/DefectReviewPage";
import { InspectionCenterPage } from "./pages/InspectionCenterPage";
import { InspectionProgressPage } from "./pages/InspectionProgressPage";
import { LoginPage } from "./pages/LoginPage";
import { LandingPage } from "./pages/LandingPage";
import { InternalReviewLoginPage } from "./pages/InternalReviewLoginPage";
import { ReportPage } from "./pages/ReportPage";
import { VesselVisualizationPage } from "./pages/VesselVisualizationPage";
import { PortfolioInsightsPage } from "./pages/PortfolioInsightsPage";

import { AdminSettingsPage } from "./pages/AdminSettingsPage";
import { HumanInLoopPage } from "./pages/HumanInLoopPage";

import { VesselsPage } from "./pages/VesselsPage";
import { VesselProfilePage } from "./pages/VesselProfilePage";
import { ReportsCenterPage } from "./pages/ReportsCenterPage";

// Admin Pages
import { OwnerDashboardPage } from "./pages/admin/OwnerDashboardPage";
import { FleetOverviewPage } from "./pages/admin/FleetOverviewPage";
import { RiskCompliancePage } from "./pages/admin/RiskCompliancePage";
import { MaintenancePlanningPage } from "./pages/admin/MaintenancePlanningPage";
import { FinancialIntelligencePage } from "./pages/admin/FinancialIntelligencePage";
import { ExecutiveReportsPage } from "./pages/admin/ExecutiveReportsPage";
import { OrgManagementPage } from "./pages/admin/OrgManagementPage";
export const appRouter = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/internal/login", element: <InternalReviewLoginPage /> },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/inspections", element: <InspectionCenterPage /> },
      { path: "/inspections/progress", element: <InspectionProgressPage /> },
      { path: "/inspections/:sessionId/progress", element: <InspectionProgressPage /> },
      { path: "/defects", element: <DefectReviewPage /> },
      { path: "/inspections/:sessionId/defects", element: <DefectReviewPage /> },
      { path: "/fleet", element: <VesselsPage /> },
      { path: "/fleet/:imoNumber", element: <VesselProfilePage /> },
      { path: "/inspections/:sessionId/visualization", element: <VesselVisualizationPage /> },
      { path: "/reports", element: <ReportsCenterPage /> },
      { path: "/batches/:batchId/report", element: <ReportPage /> },
      { path: "/inspections/:sessionId/report", element: <ReportPage /> },
      { path: "/portfolio", element: <PortfolioInsightsPage /> },
      { path: "/defect-progression", element: <DefectProgressionPage /> },
      { path: "/inspections/:sessionId/progression", element: <DefectProgressionPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminShell />
      </AdminRoute>
    ),
    children: [
      { path: "dashboard", element: <OwnerDashboardPage /> },
      { path: "fleet", element: <FleetOverviewPage /> },
      { path: "risk", element: <RiskCompliancePage /> },
      { path: "maintenance", element: <MaintenancePlanningPage /> },
      { path: "finance", element: <FinancialIntelligencePage /> },
      { path: "reports", element: <ExecutiveReportsPage /> },
      { path: "org", element: <OrgManagementPage /> },
      { path: "settings", element: <AdminSettingsPage /> },
    ],
  },
  {
    path: "/internal",
    element: (
      <InternalReviewRoute>
        <InternalReviewShell />
      </InternalReviewRoute>
    ),
    children: [
      { path: "review", element: <HumanInLoopPage /> },
      { path: "", element: <Navigate to="/internal/review" replace /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
