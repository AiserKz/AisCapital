import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { RouteProvider } from "../context/RouteContext";

export default function AppLayout() {
  return (
    <RouteProvider>
      <div className="bg-linear-to-br from-base-100 via-base-100 to-base-200 min-h-screen">
        <Header />
        <main className="mt-6">
          <Outlet />
        </main>
        {/* <footer>
        <p>© 2023 AisCapital</p>
        </footer> */}
      </div>
    </RouteProvider>
  );
}
