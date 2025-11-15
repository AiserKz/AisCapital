import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user } = useApp();

  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}
