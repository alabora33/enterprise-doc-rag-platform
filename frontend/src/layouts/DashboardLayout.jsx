import { Link, Outlet, useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white">
        <div className="border-b border-slate-700 p-6">
          <h1 className="text-xl font-bold">Enterprise RAG</h1>
          <p className="mt-1 text-sm text-slate-400">Document Intelligence</p>
        </div>

        <nav className="space-y-2 p-4">
          <Link to="/dashboard" className="block rounded-lg px-4 py-2 hover:bg-slate-800">
            Dashboard
          </Link>

          <Link to="/documents" className="block rounded-lg px-4 py-2 hover:bg-slate-800">
            Documents
          </Link>

          <Link to="/chat" className="block rounded-lg px-4 py-2 hover:bg-slate-800">
            Chat
          </Link>
        </nav>

        <div className="absolute bottom-0 w-full p-4">
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