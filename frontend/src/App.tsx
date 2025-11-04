import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import AppLayout from "./layout/AppLayout";
import HomePage from "./pages/Home";
import { Leaderboard } from "./pages/Liders";
import { ProfilePage } from "./pages/Profile";
import SettingPage from "./pages/Setting";
import { GameRoom } from "./pages/GameRoom";
import AuthPage from "./pages/Auth";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/leaderboard",
        element: <Leaderboard />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/settings",
        element: <SettingPage />,
      },
    ],
  },
  {
    path: "/room/:roomId",
    element: <GameRoom />,
  },
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "*",
    element: <div>404</div>,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
