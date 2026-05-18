import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axiosClient.get("/users/me");
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const isAdmin = user?.is_superuser;

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white">
        <div className="border-b border-slate-700 p-6">
          <h1 className="text-xl font-bold">
            {isAdmin ? "Admin Panel" : "Enterprise RAG"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isAdmin ? "System Monitoring" : "Document Intelligence"}
          </p>
        </div>

        <nav className="space-y-2 p-4">
          {isAdmin ? (
            <>
              <Link
                to="/admin/usage"
                className="block rounded-lg px-4 py-2 hover:bg-slate-800"
              >
                Admin Usage
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="block rounded-lg px-4 py-2 hover:bg-slate-800"
              >
                Dashboard
              </Link>

              <Link
                to="/documents"
                className="block rounded-lg px-4 py-2 hover:bg-slate-800"
              >
                Documents
              </Link>

              <Link
                to="/chat"
                className="block rounded-lg px-4 py-2 hover:bg-slate-800"
              >
                Chat
              </Link>
            </>
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          {user && (
            <div className="mb-4 rounded-lg bg-slate-800 px-3 py-3 text-xs text-slate-300">
              <p className="truncate">{user.email}</p>
              <p className="mt-1">
                Role: {user.is_superuser ? "Admin" : "User"}
              </p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-64 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  );
}