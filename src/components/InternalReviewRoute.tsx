import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/appStore";

function hasInternalReviewAccess(role?: string, isAdmin?: boolean) {
  if (isAdmin) return true;
  if (!role) return false;
  return /(developer|engineer|review|reviewer|qa|ops|analyst)/i.test(role);
}

export function InternalReviewRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAppStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/internal/login" state={{ from: location }} replace />;
  }

  if (!hasInternalReviewAccess(user?.role, user?.isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
