import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/appStore";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAppStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
