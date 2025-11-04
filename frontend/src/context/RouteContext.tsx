import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const RouteContext = createContext({ page: "home" });

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [page, setPage] = useState("home");

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/leaderboard")) setPage("leaderboard");
    else if (path.startsWith("/settings")) setPage("settings");
    else if (path.startsWith("/profile")) setPage("profile");
    else setPage("home");
  }, [location.pathname]);

  return (
    <RouteContext.Provider value={{ page }}>{children}</RouteContext.Provider>
  );
}

export const useRoutePage = () => useContext(RouteContext);
