import type React from "react";
import { useApp } from "../context/AppContext";
import { Navigate } from "react-router-dom";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useApp();

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
