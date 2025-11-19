import React, { createContext, useContext, useEffect, useState } from "react";
import type {
  UserType,
  AppContextType,
  LeaderboardPlayer,
  RoomType,
} from "../types/types";
import ServerAPI from "../utils/server";

const AppContext = createContext<AppContextType | null>(null);

const server = new ServerAPI();

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserType | null>();
  const [leader, setleader] = useState<LeaderboardPlayer[] | null>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [roomList, setRoomList] = useState<RoomType[]>([]);

  useEffect(() => {
    withLoading(fetchData());
  }, []);

  const withLoading = async (promise: Promise<any>) => {
    setLoading(true);
    return promise.finally(() => setLoading(false));
  };

  const fetchData = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const me = await server.getMe();
    setUser(me);

    const leader = await server.getLeaderboard();
    setleader(leader);

    const roomsResponse = await server.getRooms();
    // если API возвращает объект { rooms: [...] }
    const rooms = Array.isArray(roomsResponse)
      ? roomsResponse
      : roomsResponse.rooms || [];
    setRoomList(rooms);
  };

  const fetchRoomList = async () => {
    const rooms = await server.getRooms();
    setRoomList(rooms);
  };

  const LogOut = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    window.location.href = "/login";
  };

  const value = {
    user,
    loading,
    leader,
    LogOut,
    roomList,
    fetchRoomList,
  } as AppContextType;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("Не зарегистрирован провайдер AppContext");
  }
  return context;
}
